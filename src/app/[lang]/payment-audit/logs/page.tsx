'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { derivePaymentBrandTheme } from "@/lib/payment-branding";

type EventsSummary = {
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

type EventRow = {
  eventType: string;
  createdAt?: string;
  createdAtIso?: string;
  lang?: string;
  pageClientId?: string;
  storecode?: string;
  memberId?: string;
  storeUser?: string;
  requestedUserType?: string;
  orderNumber?: string;
  orderId?: string;
  walletAddress?: string;
  smartAccountAddress?: string;
  phoneNumber?: string;
  buyerNickname?: string;
  depositName?: string;
  depositBankName?: string;
  depositBankAccountNumber?: string;
  krwAmountValue?: number;
  usdtAmountValue?: number;
  rateValue?: number;
  eventSource?: string;
  pathname?: string;
};

type EventsResult = {
  summary: EventsSummary;
  events: EventRow[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

type FilterState = {
  clientid: string;
  storecode: string;
  eventType: string;
  memberId: string;
  walletAddress: string;
  phoneNumber: string;
  orderNumber: string;
  startDate: string;
  endDate: string;
};

const EVENT_LABELS: Record<string, string> = {
  wallet_connect: "Wallet connect",
  buy_order_created: "Buy order created",
  sell_order_accepted: "Sell order accepted",
};

const EMPTY_EVENTS: EventsResult = {
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
  events: [],
  pagination: {
    page: 1,
    limit: 30,
    totalCount: 0,
    totalPages: 1,
  },
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

function shortWallet(value?: string) {
  if (!value) {
    return "-";
  }

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
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

export default function PaymentAuditLogsPage({ params }: any) {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken") || "";
  const initialFilters: FilterState = {
    clientid: searchParams.get("clientid") || "",
    storecode: searchParams.get("center") || searchParams.get("storecode") || "",
    eventType: searchParams.get("eventType") || "",
    memberId: searchParams.get("memberId") || "",
    walletAddress: searchParams.get("walletAddress") || "",
    phoneNumber: searchParams.get("phoneNumber") || "",
    orderNumber: searchParams.get("orderNumber") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  };

  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilters);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<EventsResult>(EMPTY_EVENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/payment/getAuditEvents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            lang: params.lang,
            page,
            limit: 30,
            ...filters,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "로그 데이터를 불러오지 못했습니다.");
        }

        if (mounted) {
          setResult(data?.result || EMPTY_EVENTS);
        }
      } catch (fetchError) {
        console.error("Failed to load payment audit events:", fetchError);

        if (mounted) {
          setResult(EMPTY_EVENTS);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "로그 데이터를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, [accessToken, filters, page, params.lang]);

  const theme = derivePaymentBrandTheme({
    seed: `${params.lang}:payment-audit-logs`,
    backgroundColor: "#155E75",
  });
  const overviewQuery = new URLSearchParams();

  if (accessToken) {
    overviewQuery.set("accessToken", accessToken);
  }

  if (filters.clientid) {
    overviewQuery.set("clientid", filters.clientid);
  }

  if (filters.storecode) {
    overviewQuery.set("center", filters.storecode);
  }

  if (filters.startDate) {
    overviewQuery.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    overviewQuery.set("endDate", filters.endDate);
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
                Event Logs
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-white/80 md:text-base">
                `clientid`, `center`, 회원 아이디, 지갑, 전화번호, 주문번호 기준으로 검색하고 페이지 단위로 내역을 탐색합니다.
              </p>
            </div>
            <Link
              href={`/${params.lang}/payment-audit${overviewQuery.toString() ? `?${overviewQuery.toString()}` : ""}`}
              className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
            >
              개요로 돌아가기
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <SectionCard
            title="Search filters"
            description="필터를 적용하면 현재 조건에 맞는 이벤트 로그만 페이지네이션해서 보여줍니다."
          >
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
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
                <span>Event</span>
                <select
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.eventType}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      eventType: event.target.value,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="wallet_connect">Wallet connect</option>
                  <option value="buy_order_created">Buy order created</option>
                  <option value="sell_order_accepted">Sell order accepted</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>Member ID</span>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.memberId}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      memberId: event.target.value,
                    }))
                  }
                  placeholder="member id"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>Wallet</span>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.walletAddress}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      walletAddress: event.target.value,
                    }))
                  }
                  placeholder="0x..."
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>Phone</span>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.phoneNumber}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      phoneNumber: event.target.value,
                    }))
                  }
                  placeholder="010 or +82"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span>Order No.</span>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                  value={draftFilters.orderNumber}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      orderNumber: event.target.value,
                    }))
                  }
                  placeholder="order number"
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
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
                <button
                  type="submit"
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                  style={{
                    background: theme.base,
                    boxShadow: `0 18px 35px ${theme.buttonShadow}`,
                  }}
                >
                  Search
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => {
                    const cleared = {
                      clientid: "",
                      storecode: "",
                      eventType: "",
                      memberId: "",
                      walletAddress: "",
                      phoneNumber: "",
                      orderNumber: "",
                      startDate: "",
                      endDate: "",
                    };
                    setDraftFilters(cleared);
                    setFilters(cleared);
                    setPage(1);
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Matched events"
              value={formatKrw(result.summary.totalCount)}
              help={`최근 ${formatDateTime(result.summary.latestEventAt)}`}
              shadow={theme.buttonShadow}
            />
            <StatCard
              label="Client / Center"
              value={`${formatKrw(result.summary.uniqueClientCount)} / ${formatKrw(result.summary.uniqueStoreCount)}`}
              help="현재 검색 결과의 고유 수"
              shadow={theme.panelShadow}
            />
            <StatCard
              label="Wallet / Member"
              value={`${formatKrw(result.summary.uniqueWalletCount)} / ${formatKrw(result.summary.uniqueMemberCount)}`}
              help={`전화번호 ${formatKrw(result.summary.uniquePhoneCount)}개`}
              shadow={theme.buttonShadow}
            />
            <StatCard
              label="KRW / USDT"
              value={`${formatKrw(result.summary.totalKrwAmount)} / ${formatUsdt(result.summary.totalUsdtAmount)}`}
              help={`Connect ${formatKrw(result.summary.walletConnectCount)} / Create ${formatKrw(result.summary.buyOrderCreatedCount)} / Match ${formatKrw(result.summary.sellOrderAcceptedCount)}`}
              shadow={theme.panelShadow}
            />
          </div>

          <SectionCard
            title="Event list"
            description="검색 결과를 최신순으로 정렬해 보여줍니다."
          >
            {loading ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                로그를 불러오는 중입니다.
              </div>
            ) : result.events.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                조건에 맞는 로그가 없습니다.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-3 py-3 font-medium">Time</th>
                        <th className="px-3 py-3 font-medium">Client / Center</th>
                        <th className="px-3 py-3 font-medium">Event</th>
                        <th className="px-3 py-3 font-medium">Member</th>
                        <th className="px-3 py-3 font-medium">Wallet / Phone</th>
                        <th className="px-3 py-3 font-medium">Order</th>
                        <th className="px-3 py-3 font-medium">Amount</th>
                        <th className="px-3 py-3 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.events.map((event, index) => (
                        <tr
                          key={`${event.orderId || event.walletAddress || "event"}-${index}`}
                          className="border-b border-slate-100 align-top text-slate-700"
                        >
                          <td className="px-3 py-4 whitespace-nowrap">
                            {formatDateTime(event.createdAt || event.createdAtIso)}
                          </td>
                          <td className="px-3 py-4">
                            <div className="font-medium text-slate-950">
                              {event.pageClientId || "-"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {event.storecode || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span
                              className="rounded-full px-3 py-1 text-xs font-semibold"
                              style={{
                                background: theme.badgeBg,
                                color: theme.badgeText,
                              }}
                            >
                              {EVENT_LABELS[event.eventType] || event.eventType}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="font-medium text-slate-950">
                              {event.memberId || event.storeUser || "-"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {event.requestedUserType || event.buyerNickname || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="font-medium text-slate-950">
                              {shortWallet(event.walletAddress)}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {event.phoneNumber || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="font-medium text-slate-950">
                              {event.orderNumber || event.orderId || "-"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {event.depositName || "-"} / {event.depositBankName || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div>{formatKrw(event.krwAmountValue)} KRW</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatUsdt(event.usdtAmountValue)} USDT
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="font-medium text-slate-950">
                              {event.eventSource || "-"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {event.pathname || "-"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-600">
                  <div>
                    Page {result.pagination.page} / {result.pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={result.pagination.page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={result.pagination.page >= result.pagination.totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(result.pagination.totalPages, current + 1),
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
