'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { derivePaymentBrandTheme } from "@/lib/payment-branding";

type OverviewSummary = {
  totalCount: number;
  walletConnectCount: number;
  buyOrderCreatedCount: number;
  sellOrderAcceptedCount: number;
  totalKrwAmount: number;
  totalUsdtAmount: number;
  uniqueWalletCount: number;
  uniqueMemberCount: number;
  uniquePhoneCount: number;
  uniqueClientCount: number;
  uniqueStoreCount: number;
  latestEventAt: string | null;
};

type DailyAuditRow = {
  _id: string;
  count: number;
  walletConnectCount: number;
  buyOrderCreatedCount: number;
  sellOrderAcceptedCount: number;
  totalKrwAmount: number;
};

type TopClientRow = {
  clientid: string;
  count: number;
  latestEventAt: string | null;
  totalKrwAmount: number;
  storeCount: number;
};

type CenterBreakdownRow = {
  clientid: string;
  storecode: string;
  count: number;
  walletConnectCount: number;
  buyOrderCreatedCount: number;
  sellOrderAcceptedCount: number;
  latestEventAt: string | null;
  totalKrwAmount: number;
  totalUsdtAmount: number;
  uniqueWalletCount: number;
  uniqueMemberCount: number;
};

type OverviewResult = {
  summary: OverviewSummary;
  daily: DailyAuditRow[];
  topClients: TopClientRow[];
  centerBreakdown: CenterBreakdownRow[];
};

type FilterState = {
  clientid: string;
  storecode: string;
  startDate: string;
  endDate: string;
};

const EMPTY_OVERVIEW: OverviewResult = {
  summary: {
    totalCount: 0,
    walletConnectCount: 0,
    buyOrderCreatedCount: 0,
    sellOrderAcceptedCount: 0,
    totalKrwAmount: 0,
    totalUsdtAmount: 0,
    uniqueWalletCount: 0,
    uniqueMemberCount: 0,
    uniquePhoneCount: 0,
    uniqueClientCount: 0,
    uniqueStoreCount: 0,
    latestEventAt: null,
  },
  daily: [],
  topClients: [],
  centerBreakdown: [],
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function formatKrw(value?: number) {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value || 0));
}

function formatUsdt(value?: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function StatCard({
  label,
  value,
  help,
  shadow,
}: {
  label: string;
  value: string;
  help: string;
  shadow: string;
}) {
  return (
    <div
      className="rounded-[26px] border px-5 py-5"
      style={{
        background: "rgba(255,255,255,0.82)",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: `0 20px 45px ${shadow}`,
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{help}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[30px] border px-6 py-6"
      style={{
        background: "rgba(255,255,255,0.84)",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: "0 22px 60px rgba(15,23,42,0.08)",
      }}
    >
      <div className="mb-5">
        <div className="text-lg font-semibold text-slate-950">{title}</div>
        <div className="mt-1 text-sm text-slate-500">{description}</div>
      </div>
      {children}
    </section>
  );
}

export default function PaymentAuditOverviewPage({ params }: any) {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken") || "";
  const initialFilters: FilterState = {
    clientid: searchParams.get("clientid") || "",
    storecode: searchParams.get("center") || searchParams.get("storecode") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  };

  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [overview, setOverview] = useState<OverviewResult>(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/payment/getAuditOverview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            lang: params.lang,
            ...filters,
            breakdownLimit: 40,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "대시보드 데이터를 불러오지 못했습니다.");
        }

        if (mounted) {
          setOverview(data?.result || EMPTY_OVERVIEW);
        }
      } catch (fetchError) {
        console.error("Failed to load payment audit overview:", fetchError);

        if (mounted) {
          setOverview(EMPTY_OVERVIEW);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "대시보드 데이터를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      mounted = false;
    };
  }, [accessToken, filters, params.lang]);

  const theme = derivePaymentBrandTheme({
    seed: `${params.lang}:payment-audit-overview`,
    backgroundColor: "#0F766E",
  });
  const maxDailyCount = overview.daily.reduce(
    (maxValue, item) => Math.max(maxValue, item.count),
    1,
  );
  const baseQuery = new URLSearchParams();

  if (accessToken) {
    baseQuery.set("accessToken", accessToken);
  }

  return (
    <main
      className="min-h-screen px-4 py-6 md:px-8"
      style={{
        background: `linear-gradient(160deg, ${theme.pageBg} 0%, ${theme.pageBgAlt} 52%, ${theme.pageTint} 100%)`,
      }}
    >
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border px-6 py-6 md:px-8 md:py-8"
        style={{
          background: `linear-gradient(135deg, ${theme.shellFrom} 0%, ${theme.shellVia} 45%, ${theme.shellTo} 100%)`,
          borderColor: theme.shellBorder,
          boxShadow: `0 30px 90px ${theme.panelShadow}`,
        }}
      >
        <div className="relative overflow-hidden rounded-[30px] border px-6 py-7 text-white md:px-8">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              background: `linear-gradient(135deg, ${theme.base} 0%, ${theme.baseDark} 100%)`,
            }}
          />
          <div
            className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full blur-3xl"
            style={{ background: theme.glowA }}
          />
          <div
            className="pointer-events-none absolute right-0 top-8 h-52 w-52 rounded-full blur-3xl"
            style={{ background: theme.glowB }}
          />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                Global Payment Audit
              </div>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
                Client / Center Overview
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-white/80 md:text-base">
                `{params.lang}` 언어 기준으로 결제 페이지에서 발생한 지갑 연결, 주문 생성, 주문 매칭 로그를 `clientid`와 `center` 조합 단위로 집계합니다.
              </p>
            </div>
            <Link
              href={`/${params.lang}/payment-audit/logs${baseQuery.toString() ? `?${baseQuery.toString()}` : ""}`}
              className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
            >
              로그 상세 보기
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <SectionCard
            title="Overview filters"
            description="특정 clientid 또는 center만 좁혀서 전체 집계를 볼 수 있습니다."
          >
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
              onSubmit={(event) => {
                event.preventDefault();
                setFilters(draftFilters);
              }}
            >
              <label className="grid gap-2 text-sm text-slate-600">
                <span>Client ID</span>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.clientid}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      clientid: event.target.value,
                    }))
                  }
                  placeholder="clientid"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>Center</span>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.storecode}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      storecode: event.target.value,
                    }))
                  }
                  placeholder="center"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>From</span>
                <input
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.startDate}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>To</span>
                <input
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.endDate}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                  style={{
                    background: theme.base,
                    boxShadow: `0 18px 35px ${theme.buttonShadow}`,
                  }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => {
                    const cleared = {
                      clientid: "",
                      storecode: "",
                      startDate: "",
                      endDate: "",
                    };
                    setDraftFilters(cleared);
                    setFilters(cleared);
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </SectionCard>

          {error ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total events"
              value={formatKrw(overview.summary.totalCount)}
              help={`최근 이벤트 ${formatDateTime(overview.summary.latestEventAt)}`}
              shadow={theme.buttonShadow}
            />
            <StatCard
              label="Clients / Centers"
              value={`${formatKrw(overview.summary.uniqueClientCount)} / ${formatKrw(overview.summary.uniqueStoreCount)}`}
              help="고유 clientid 와 center 수"
              shadow={theme.panelShadow}
            />
            <StatCard
              label="Wallet / Members"
              value={`${formatKrw(overview.summary.uniqueWalletCount)} / ${formatKrw(overview.summary.uniqueMemberCount)}`}
              help={`전화번호 ${formatKrw(overview.summary.uniquePhoneCount)}개`}
              shadow={theme.buttonShadow}
            />
            <StatCard
              label="Wallet connects"
              value={formatKrw(overview.summary.walletConnectCount)}
              help={`주문 생성 ${formatKrw(overview.summary.buyOrderCreatedCount)}건`}
              shadow={theme.panelShadow}
            />
            <StatCard
              label="Tracked KRW"
              value={`${formatKrw(overview.summary.totalKrwAmount)} KRW`}
              help={`매칭 ${formatKrw(overview.summary.sellOrderAcceptedCount)}건`}
              shadow={theme.buttonShadow}
            />
            <StatCard
              label="Tracked USDT"
              value={`${formatUsdt(overview.summary.totalUsdtAmount)} USDT`}
              help="전체 집계 기준 USDT"
              shadow={theme.panelShadow}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <SectionCard
              title="Daily activity"
              description="최근 30일의 전체 이벤트 흐름입니다."
            >
              {loading ? (
                <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  데이터를 불러오는 중입니다.
                </div>
              ) : overview.daily.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  집계할 로그가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {overview.daily.map((item) => (
                    <div key={item._id} className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item._id}</span>
                        <span className="text-slate-500">
                          {item.count} events / {formatKrw(item.totalKrwAmount)} KRW
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(8, (item.count / maxDailyCount) * 100)}%`,
                            background: `linear-gradient(90deg, ${theme.base} 0%, ${theme.baseDark} 100%)`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Connect {item.walletConnectCount}</span>
                        <span>Create {item.buyOrderCreatedCount}</span>
                        <span>Match {item.sellOrderAcceptedCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Top client IDs"
              description="로그가 많이 쌓인 clientid 기준입니다."
            >
              <div className="space-y-3">
                {overview.topClients.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    clientid 집계가 없습니다.
                  </div>
                ) : (
                  overview.topClients.map((item) => {
                    const nextQuery = new URLSearchParams(baseQuery.toString());
                    nextQuery.set("clientid", item.clientid);

                    return (
                      <Link
                        key={item.clientid}
                        href={`/${params.lang}/payment-audit/logs?${nextQuery.toString()}`}
                        className="block rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-slate-200 hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-slate-900">{item.clientid || "-"}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              최근 {formatDateTime(item.latestEventAt)}
                            </div>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div>{item.count} events</div>
                            <div>{item.storeCount} centers</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Client / Center breakdown"
            description="각 clientid 와 center 조합 단위의 요약입니다. 행을 누르면 상세 로그 페이지로 이동합니다."
          >
            {loading ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                데이터를 불러오는 중입니다.
              </div>
            ) : overview.centerBreakdown.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                표시할 조합 집계가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Client ID</th>
                      <th className="px-3 py-3 font-medium">Center</th>
                      <th className="px-3 py-3 font-medium">Events</th>
                      <th className="px-3 py-3 font-medium">Wallets / Members</th>
                      <th className="px-3 py-3 font-medium">KRW / USDT</th>
                      <th className="px-3 py-3 font-medium">Last event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.centerBreakdown.map((item) => {
                      const nextQuery = new URLSearchParams(baseQuery.toString());

                      if (item.clientid) {
                        nextQuery.set("clientid", item.clientid);
                      }

                      if (item.storecode) {
                        nextQuery.set("center", item.storecode);
                      }

                      if (filters.startDate) {
                        nextQuery.set("startDate", filters.startDate);
                      }

                      if (filters.endDate) {
                        nextQuery.set("endDate", filters.endDate);
                      }

                      return (
                        <tr
                          key={`${item.clientid}:${item.storecode}`}
                          className="border-b border-slate-100 text-slate-700"
                        >
                          <td className="px-3 py-4">
                            <Link
                              href={`/${params.lang}/payment-audit/logs?${nextQuery.toString()}`}
                              className="font-medium text-slate-950 underline-offset-4 hover:underline"
                            >
                              {item.clientid || "-"}
                            </Link>
                          </td>
                          <td className="px-3 py-4">{item.storecode || "-"}</td>
                          <td className="px-3 py-4">
                            <div>{item.count} total</div>
                            <div className="mt-1 text-xs text-slate-500">
                              C {item.walletConnectCount} / O {item.buyOrderCreatedCount} / M {item.sellOrderAcceptedCount}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div>{item.uniqueWalletCount} wallets</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {item.uniqueMemberCount} members
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div>{formatKrw(item.totalKrwAmount)} KRW</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatUsdt(item.totalUsdtAmount)} USDT
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            {formatDateTime(item.latestEventAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
