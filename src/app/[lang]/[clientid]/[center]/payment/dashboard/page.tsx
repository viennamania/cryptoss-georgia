'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { derivePaymentBrandTheme } from "@/lib/payment-branding";

type DashboardSummary = {
  totalCount: number;
  walletConnectCount: number;
  buyOrderCreatedCount: number;
  sellOrderAcceptedCount: number;
  totalKrwAmount: number;
  totalUsdtAmount: number;
  uniqueWalletCount: number;
  uniqueMemberCount: number;
  uniquePhoneCount: number;
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

type TopMemberRow = {
  memberId: string;
  count: number;
  latestEventAt: string | null;
  totalKrwAmount: number;
  walletCount: number;
  phoneCount: number;
};

type TopWalletRow = {
  walletAddress: string;
  count: number;
  latestEventAt: string | null;
  totalKrwAmount: number;
  memberCount: number;
  phoneCount: number;
};

type RecentEventRow = {
  eventType: string;
  createdAt?: string;
  createdAtIso?: string;
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
  krwAmountValue?: number;
  usdtAmountValue?: number;
  rateValue?: number;
  eventSource?: string;
  pathname?: string;
};

type DashboardResult = {
  summary: DashboardSummary;
  daily: DailyAuditRow[];
  topMembers: TopMemberRow[];
  topWallets: TopWalletRow[];
  recentEvents: RecentEventRow[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

type FilterState = {
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

const INITIAL_FILTERS: FilterState = {
  eventType: "",
  memberId: "",
  walletAddress: "",
  phoneNumber: "",
  orderNumber: "",
  startDate: "",
  endDate: "",
};

const EMPTY_DASHBOARD: DashboardResult = {
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
    latestEventAt: null,
  },
  daily: [],
  topMembers: [],
  topWallets: [],
  recentEvents: [],
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

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Seoul",
    }).format(new Date(value));
  } catch (error) {
    console.error("Failed to format date:", error);
    return value;
  }
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
  tone,
}: {
  label: string;
  value: string;
  help: string;
  tone: string;
}) {
  return (
    <div
      className="rounded-[28px] border px-5 py-5 shadow-sm"
      style={{
        background: "rgba(255,255,255,0.82)",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: `0 18px 40px ${tone}20`,
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
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
      className="rounded-[32px] border px-6 py-6 shadow-sm"
      style={{
        background: "rgba(255,255,255,0.84)",
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: "0 22px 60px rgba(15,23,42,0.08)",
      }}
    >
      <div className="mb-5">
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-500">{description}</div>
      </div>
      {children}
    </section>
  );
}

export default function PaymentAuditDashboardPage({ params }: any) {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken") || "";

  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loadingStoreInfo, setLoadingStoreInfo] = useState(true);
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [dashboard, setDashboard] = useState<DashboardResult>(EMPTY_DASHBOARD);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchStoreInfo = async () => {
      setLoadingStoreInfo(true);

      try {
        const response = await fetch("/api/store/getOneStore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientid: params.clientid,
            storecode: params.center,
          }),
        });
        const data = await response.json();

        if (mounted) {
          setStoreInfo(data?.result || null);
        }
      } catch (fetchError) {
        console.error("Failed to load store info:", fetchError);

        if (mounted) {
          setError("가맹점 정보를 불러오지 못했습니다.");
          setStoreInfo(null);
        }
      } finally {
        if (mounted) {
          setLoadingStoreInfo(false);
        }
      }
    };

    fetchStoreInfo();

    return () => {
      mounted = false;
    };
  }, [params.center, params.clientid]);

  useEffect(() => {
    if (loadingStoreInfo) {
      return;
    }

    if (storeInfo?.accessToken && storeInfo.accessToken !== accessToken) {
      setLoadingDashboard(false);
      setDashboard(EMPTY_DASHBOARD);
      setError("대시보드 접근 토큰이 올바르지 않습니다.");
      return;
    }

    let mounted = true;

    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      setError("");

      try {
        const response = await fetch("/api/payment/getAuditDashboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storecode: params.center,
            accessToken,
            page,
            limit: 30,
            ...filters,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "대시보드 데이터를 불러오지 못했습니다.");
        }

        if (mounted) {
          setDashboard(data?.result || EMPTY_DASHBOARD);
        }
      } catch (fetchError) {
        console.error("Failed to load payment audit dashboard:", fetchError);

        if (mounted) {
          setDashboard(EMPTY_DASHBOARD);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "대시보드 데이터를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingDashboard(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, [accessToken, filters, loadingStoreInfo, page, params.center, storeInfo?.accessToken]);

  const providerName = storeInfo?.storeName || "Payment Audit";
  const theme = derivePaymentBrandTheme({
    backgroundColor: storeInfo?.backgroundColor,
    seed: `${params.clientid}:${params.center}:payment-dashboard`,
  });
  const maxDailyCount = dashboard.daily.reduce(
    (maxValue, item) => Math.max(maxValue, item.count),
    1,
  );
  const accessDenied = Boolean(storeInfo?.accessToken && storeInfo.accessToken !== accessToken);

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
          background: `linear-gradient(135deg, ${theme.shellFrom} 0%, ${theme.shellVia} 40%, ${theme.shellTo} 100%)`,
          borderColor: theme.shellBorder,
          boxShadow: `0 30px 90px ${theme.panelShadow}`,
        }}
      >
        <div className="relative overflow-hidden rounded-[30px] border px-6 py-6 text-white md:px-8">
          <div
            className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full blur-3xl"
            style={{ background: theme.glowA }}
          />
          <div
            className="pointer-events-none absolute right-0 top-8 h-48 w-48 rounded-full blur-3xl"
            style={{ background: theme.glowB }}
          />
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `linear-gradient(135deg, ${theme.base} 0%, ${theme.baseDark} 100%)`,
            }}
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="relative h-16 w-16 overflow-hidden rounded-3xl border"
                style={{
                  background: theme.accentSoft,
                  borderColor: "rgba(255,255,255,0.24)",
                }}
              >
                <Image
                  src={storeInfo?.storeLogo || "/logo.png"}
                  alt={providerName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Payment Audit Dashboard
                </div>
                <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
                  {providerName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                  결제 페이지에서 연결된 지갑, 전화번호, 회원 아이디, 주문 생성 및 매칭 이벤트를 한 화면에서 추적합니다.
                </p>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-white/80 md:text-right">
              <div>
                <div className="text-white/60">Store code</div>
                <div className="font-medium text-white">{params.center}</div>
              </div>
              <div>
                <div className="text-white/60">Last event</div>
                <div className="font-medium text-white">
                  {formatDateTime(dashboard.summary.latestEventAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loadingStoreInfo ? (
          <div className="py-16 text-center text-sm text-white/80">
            가맹점 정보를 불러오는 중입니다.
          </div>
        ) : accessDenied ? (
          <div className="mt-6 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700">
            유효한 `accessToken`이 필요합니다.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <SectionCard
              title="Filters"
              description="회원, 지갑, 전화번호, 주문번호, 기간 단위로 로그를 좁혀볼 수 있습니다."
            >
              <form
                className="grid gap-3 md:grid-cols-3 xl:grid-cols-7"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPage(1);
                  setFilters(draftFilters);
                }}
              >
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
                <div className="flex items-end gap-2 md:col-span-3 xl:col-span-7">
                  <button
                    type="submit"
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                    style={{
                      background: theme.base,
                      boxShadow: `0 18px 35px ${theme.buttonShadow}`,
                    }}
                  >
                    Apply filters
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    onClick={() => {
                      setDraftFilters(INITIAL_FILTERS);
                      setFilters(INITIAL_FILTERS);
                      setPage(1);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </SectionCard>

            {error ? (
              <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Total events"
                value={formatKrw(dashboard.summary.totalCount)}
                help="지갑 연결과 주문 이벤트 전체 건수"
                tone={theme.base}
              />
              <StatCard
                label="Wallet connects"
                value={formatKrw(dashboard.summary.walletConnectCount)}
                help={`고유 지갑 ${formatKrw(dashboard.summary.uniqueWalletCount)}개`}
                tone={theme.baseDark}
              />
              <StatCard
                label="Orders created"
                value={formatKrw(dashboard.summary.buyOrderCreatedCount)}
                help={`매칭 주문 ${formatKrw(dashboard.summary.sellOrderAcceptedCount)}건`}
                tone={theme.base}
              />
              <StatCard
                label="Unique members"
                value={formatKrw(dashboard.summary.uniqueMemberCount)}
                help={`전화번호 ${formatKrw(dashboard.summary.uniquePhoneCount)}개`}
                tone={theme.baseDark}
              />
              <StatCard
                label="Tracked KRW"
                value={`${formatKrw(dashboard.summary.totalKrwAmount)} KRW`}
                help="로그에 기록된 주문 금액 합계"
                tone={theme.base}
              />
              <StatCard
                label="Tracked USDT"
                value={`${formatUsdt(dashboard.summary.totalUsdtAmount)} USDT`}
                help="로그에 기록된 USDT 수량 합계"
                tone={theme.baseDark}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <SectionCard
                title="Daily activity"
                description="최근 30일 기준 일별 이벤트 흐름입니다."
              >
                {dashboard.daily.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    표시할 일별 로그가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard.daily.map((item) => (
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

              <div className="grid gap-6">
                <SectionCard
                  title="Top members"
                  description="로그 발생 건수가 많은 회원 아이디입니다."
                >
                  <div className="space-y-3">
                    {dashboard.topMembers.length === 0 ? (
                      <div className="rounded-3xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        회원 집계가 없습니다.
                      </div>
                    ) : (
                      dashboard.topMembers.map((item) => (
                        <div
                          key={item.memberId}
                          className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium text-slate-900">{item.memberId}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                최근 {formatDateTime(item.latestEventAt)}
                              </div>
                            </div>
                            <div className="text-right text-sm text-slate-600">
                              <div>{item.count} events</div>
                              <div>{item.walletCount} wallets</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Top wallets"
                  description="가장 많이 등장한 지갑 주소입니다."
                >
                  <div className="space-y-3">
                    {dashboard.topWallets.length === 0 ? (
                      <div className="rounded-3xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        지갑 집계가 없습니다.
                      </div>
                    ) : (
                      dashboard.topWallets.map((item) => (
                        <div
                          key={item.walletAddress}
                          className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium text-slate-900">
                                {shortWallet(item.walletAddress)}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                최근 {formatDateTime(item.latestEventAt)}
                              </div>
                            </div>
                            <div className="text-right text-sm text-slate-600">
                              <div>{item.count} events</div>
                              <div>{item.memberCount} members</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>

            <SectionCard
              title="Recent events"
              description="최신 로그 상세입니다. 회원, 지갑, 전화번호, 주문 정보를 함께 확인할 수 있습니다."
            >
              {loadingDashboard ? (
                <div className="rounded-3xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  대시보드 데이터를 불러오는 중입니다.
                </div>
              ) : dashboard.recentEvents.length === 0 ? (
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
                          <th className="px-3 py-3 font-medium">Event</th>
                          <th className="px-3 py-3 font-medium">Member</th>
                          <th className="px-3 py-3 font-medium">Wallet</th>
                          <th className="px-3 py-3 font-medium">Phone</th>
                          <th className="px-3 py-3 font-medium">Order</th>
                          <th className="px-3 py-3 font-medium">Amount</th>
                          <th className="px-3 py-3 font-medium">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recentEvents.map((event, index) => (
                          <tr
                            key={`${event.orderId || event.walletAddress || "row"}-${index}`}
                            className="border-b border-slate-100 align-top text-slate-700"
                          >
                            <td className="px-3 py-4 whitespace-nowrap">
                              {formatDateTime(event.createdAt || event.createdAtIso)}
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
                              <div className="font-medium text-slate-900">
                                {event.memberId || event.storeUser || "-"}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {event.requestedUserType || event.buyerNickname || "-"}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="font-medium text-slate-900">
                                {shortWallet(event.walletAddress)}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {shortWallet(event.smartAccountAddress)}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {event.phoneNumber || "-"}
                            </td>
                            <td className="px-3 py-4">
                              <div className="font-medium text-slate-900">
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
                              <div className="font-medium text-slate-900">
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
                      Page {dashboard.pagination.page} / {dashboard.pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={dashboard.pagination.page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={dashboard.pagination.page >= dashboard.pagination.totalPages}
                        onClick={() =>
                          setPage((current) =>
                            Math.min(dashboard.pagination.totalPages, current + 1),
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
        )}
      </div>
    </main>
  );
}
