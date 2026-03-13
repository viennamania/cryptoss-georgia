import clientPromise from "../mongodb";

const DATABASE_NAME = process.env.MONGODB_DB_NAME;
const PAYMENT_AUDIT_COLLECTION = "payment_audit_events";

if (!DATABASE_NAME) {
  throw new Error("MONGODB_DB_NAME is not defined");
}

type SerializableRecord = Record<string, unknown>;

export type PaymentAuditEventType =
  | "wallet_connect"
  | "buy_order_created"
  | "sell_order_accepted";

export type PaymentAuditEventInput = {
  eventType: PaymentAuditEventType;
  lang?: string;
  pageClientId?: string;
  thirdwebClientId?: string;
  storecode: string;
  storeUser?: string;
  memberId?: string;
  requestedUserType?: string;
  orderNumber?: string;
  orderId?: string;
  walletAddress?: string;
  smartAccountAddress?: string;
  adminWalletAddress?: string;
  phoneNumber?: string;
  email?: string;
  walletId?: string;
  connectionMethod?: string;
  sponsorGas?: boolean;
  currentUrl?: string;
  pageParams?: SerializableRecord;
  browser?: SerializableRecord;
  requestMeta?: SerializableRecord;
  eventSource?: string;
  buyerNickname?: string;
  depositName?: string;
  depositBankName?: string;
  depositBankAccountNumber?: string;
  krwAmount?: number | string;
  usdtAmount?: number | string;
  rate?: number | string;
  privateSale?: boolean;
  orderStatus?: string;
  extra?: SerializableRecord;
};

export type PaymentAuditDashboardInput = {
  storecode: string;
  page?: number;
  limit?: number;
  eventType?: string;
  memberId?: string;
  walletAddress?: string;
  phoneNumber?: string;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
};

function isSensitiveKey(key: string) {
  return /(token|secret|password|authorization|cookie|signature|jwt)/i.test(key);
}

function maskSensitiveValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue === "undefined" || trimmedValue === "null") {
    return value;
  }

  return "[REDACTED]";
}

function sanitizeValue(value: unknown, key = ""): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    return isSensitiveKey(key) ? maskSensitiveValue(value) : value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }

  if (typeof value === "object") {
    const nextValue: SerializableRecord = {};

    for (const [entryKey, entryValue] of Object.entries(value as SerializableRecord)) {
      const sanitizedEntry = sanitizeValue(entryValue, entryKey);

      if (sanitizedEntry !== undefined) {
        nextValue[entryKey] = sanitizedEntry;
      }
    }

    return nextValue;
  }

  return String(value);
}

function sanitizeRecord(value: unknown) {
  const sanitizedValue = sanitizeValue(value);

  if (!sanitizedValue || Array.isArray(sanitizedValue) || typeof sanitizedValue !== "object") {
    return {};
  }

  return sanitizedValue as SerializableRecord;
}

function sanitizeUrl(url?: string) {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    for (const [key, value] of parsedUrl.searchParams.entries()) {
      if (isSensitiveKey(key)) {
        parsedUrl.searchParams.set(key, maskSensitiveValue(value));
      }
    }

    return parsedUrl.toString();
  } catch (error) {
    console.error("Failed to sanitize url:", error);
    return url;
  }
}

function normalizeText(value?: string | null) {
  return (value || "").trim();
}

function normalizePhoneDigits(value?: string | null) {
  return normalizeText(value).replace(/\D/g, "");
}

function toNumericValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const numericValue = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  return 0;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDateRange(startDate?: string, endDate?: string) {
  const createdAt: Record<string, Date> = {};

  if (startDate) {
    createdAt.$gte = new Date(`${startDate}T00:00:00.000+09:00`);
  }

  if (endDate) {
    createdAt.$lte = new Date(`${endDate}T23:59:59.999+09:00`);
  }

  return Object.keys(createdAt).length > 0 ? createdAt : null;
}

function getPathname(currentUrl: string) {
  if (!currentUrl) {
    return "";
  }

  try {
    return new URL(currentUrl).pathname;
  } catch (error) {
    console.error("Failed to parse pathname:", error);
    return "";
  }
}

function resolvePageParamString(
  pageParams: SerializableRecord,
  candidates: string[],
) {
  for (const candidate of candidates) {
    const value = pageParams[candidate];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function buildPaymentAuditDocument(input: PaymentAuditEventInput) {
  const createdAt = new Date();
  const sanitizedPageParams = sanitizeRecord(input.pageParams);
  const currentUrl = sanitizeUrl(input.currentUrl);
  const walletAddress = normalizeText(input.walletAddress);
  const smartAccountAddress = normalizeText(input.smartAccountAddress || walletAddress);
  const storeUser = normalizeText(input.storeUser);
  const memberId = normalizeText(
    input.memberId
    || resolvePageParamString(sanitizedPageParams, ["memberId", "memberid", "userId", "user_id"])
    || storeUser,
  );
  const requestedUserType = normalizeText(
    input.requestedUserType
    || resolvePageParamString(
      sanitizedPageParams,
      ["userType", "memberGrade", "memberType", "grade", "gradeCode", "user_type"],
    ),
  );
  const orderNumber = normalizeText(
    input.orderNumber || resolvePageParamString(sanitizedPageParams, ["orderNumber", "order_number"]),
  );
  const phoneNumber = normalizeText(input.phoneNumber);

  return {
    provider: input.thirdwebClientId ? "thirdweb" : "payment",
    eventType: input.eventType,
    lang: normalizeText(input.lang),
    pageClientId: normalizeText(input.pageClientId),
    thirdwebClientId: normalizeText(input.thirdwebClientId),
    storecode: normalizeText(input.storecode),
    storeUser,
    memberId,
    memberIdNormalized: memberId.toLowerCase(),
    requestedUserType,
    orderNumber,
    orderId: normalizeText(input.orderId),
    walletAddress,
    walletAddressNormalized: walletAddress.toLowerCase(),
    smartAccountAddress,
    adminWalletAddress: normalizeText(input.adminWalletAddress),
    phoneNumber,
    phoneNumberDigits: normalizePhoneDigits(phoneNumber),
    email: normalizeText(input.email),
    walletId: normalizeText(input.walletId),
    connectionMethod: normalizeText(input.connectionMethod),
    sponsorGas: input.sponsorGas ?? null,
    currentUrl,
    pathname: getPathname(currentUrl),
    pageParams: sanitizedPageParams,
    browser: sanitizeRecord(input.browser),
    requestMeta: sanitizeRecord(input.requestMeta),
    eventSource: normalizeText(input.eventSource),
    buyerNickname: normalizeText(input.buyerNickname),
    depositName: normalizeText(input.depositName),
    depositBankName: normalizeText(input.depositBankName),
    depositBankAccountNumber: normalizeText(input.depositBankAccountNumber),
    krwAmountValue: toNumericValue(input.krwAmount),
    usdtAmountValue: toNumericValue(input.usdtAmount),
    rateValue: toNumericValue(input.rate),
    privateSale: input.privateSale ?? null,
    orderStatus: normalizeText(input.orderStatus),
    extra: sanitizeRecord(input.extra),
    createdAt,
    createdAtIso: createdAt.toISOString(),
  };
}

let ensureIndexesPromise: Promise<void> | null = null;

async function ensurePaymentAuditIndexes() {
  if (!ensureIndexesPromise) {
    ensureIndexesPromise = (async () => {
      const client = await clientPromise;
      const db = client.db(DATABASE_NAME);
      const collection = db.collection(PAYMENT_AUDIT_COLLECTION);

      await collection.createIndexes([
        { key: { storecode: 1, createdAt: -1 } },
        { key: { storecode: 1, eventType: 1, createdAt: -1 } },
        { key: { storecode: 1, memberIdNormalized: 1, createdAt: -1 } },
        { key: { storecode: 1, walletAddressNormalized: 1, createdAt: -1 } },
        { key: { storecode: 1, phoneNumberDigits: 1, createdAt: -1 } },
        { key: { storecode: 1, orderNumber: 1, createdAt: -1 } },
      ]);
    })().catch((error) => {
      ensureIndexesPromise = null;
      throw error;
    });
  }

  return ensureIndexesPromise;
}

export async function logPaymentAuditEvent(input: PaymentAuditEventInput) {
  await ensurePaymentAuditIndexes();

  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);
  const collection = db.collection(PAYMENT_AUDIT_COLLECTION);

  const auditDocument = buildPaymentAuditDocument(input);
  return collection.insertOne(auditDocument);
}

export async function getPaymentAuditDashboard(input: PaymentAuditDashboardInput) {
  await ensurePaymentAuditIndexes();

  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);
  const collection = db.collection(PAYMENT_AUDIT_COLLECTION);

  const page = Math.max(1, Number(input.page || 1));
  const limit = Math.min(100, Math.max(1, Number(input.limit || 30)));
  const skip = (page - 1) * limit;
  const match: Record<string, unknown> = {
    storecode: normalizeText(input.storecode),
  };

  if (input.eventType) {
    match.eventType = normalizeText(input.eventType);
  }

  if (input.memberId) {
    match.memberIdNormalized = {
      $regex: escapeRegex(normalizeText(input.memberId).toLowerCase()),
      $options: "i",
    };
  }

  if (input.walletAddress) {
    match.walletAddressNormalized = {
      $regex: escapeRegex(normalizeText(input.walletAddress).toLowerCase()),
      $options: "i",
    };
  }

  if (input.phoneNumber) {
    match.phoneNumberDigits = {
      $regex: escapeRegex(normalizePhoneDigits(input.phoneNumber)),
    };
  }

  if (input.orderNumber) {
    match.orderNumber = {
      $regex: escapeRegex(normalizeText(input.orderNumber)),
      $options: "i",
    };
  }

  const createdAt = getDateRange(input.startDate, input.endDate);

  if (createdAt) {
    match.createdAt = createdAt;
  }

  const [dashboard] = await collection.aggregate<any>([
    {
      $match: match,
    },
    {
      $facet: {
        totalCount: [
          {
            $count: "count",
          },
        ],
        countsByEvent: [
          {
            $group: {
              _id: "$eventType",
              count: { $sum: 1 },
            },
          },
        ],
        summary: [
          {
            $group: {
              _id: null,
              totalKrwAmount: { $sum: "$krwAmountValue" },
              totalUsdtAmount: { $sum: "$usdtAmountValue" },
              latestEventAt: { $max: "$createdAt" },
              wallets: { $addToSet: "$walletAddressNormalized" },
              members: { $addToSet: "$memberIdNormalized" },
              phones: { $addToSet: "$phoneNumberDigits" },
            },
          },
          {
            $project: {
              _id: 0,
              totalKrwAmount: 1,
              totalUsdtAmount: 1,
              latestEventAt: 1,
              uniqueWalletCount: {
                $size: {
                  $filter: {
                    input: "$wallets",
                    as: "wallet",
                    cond: { $ne: ["$$wallet", ""] },
                  },
                },
              },
              uniqueMemberCount: {
                $size: {
                  $filter: {
                    input: "$members",
                    as: "member",
                    cond: { $ne: ["$$member", ""] },
                  },
                },
              },
              uniquePhoneCount: {
                $size: {
                  $filter: {
                    input: "$phones",
                    as: "phone",
                    cond: { $ne: ["$$phone", ""] },
                  },
                },
              },
            },
          },
        ],
        daily: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Seoul",
                },
              },
              count: { $sum: 1 },
              walletConnectCount: {
                $sum: {
                  $cond: [{ $eq: ["$eventType", "wallet_connect"] }, 1, 0],
                },
              },
              buyOrderCreatedCount: {
                $sum: {
                  $cond: [{ $eq: ["$eventType", "buy_order_created"] }, 1, 0],
                },
              },
              sellOrderAcceptedCount: {
                $sum: {
                  $cond: [{ $eq: ["$eventType", "sell_order_accepted"] }, 1, 0],
                },
              },
              totalKrwAmount: { $sum: "$krwAmountValue" },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 30,
          },
          {
            $sort: { _id: 1 },
          },
        ],
        topMembers: [
          {
            $match: {
              memberIdNormalized: { $ne: "" },
            },
          },
          {
            $group: {
              _id: "$memberId",
              count: { $sum: 1 },
              latestEventAt: { $max: "$createdAt" },
              totalKrwAmount: { $sum: "$krwAmountValue" },
              walletSet: { $addToSet: "$walletAddressNormalized" },
              phoneSet: { $addToSet: "$phoneNumberDigits" },
            },
          },
          {
            $project: {
              _id: 0,
              memberId: "$_id",
              count: 1,
              latestEventAt: 1,
              totalKrwAmount: 1,
              walletCount: {
                $size: {
                  $filter: {
                    input: "$walletSet",
                    as: "wallet",
                    cond: { $ne: ["$$wallet", ""] },
                  },
                },
              },
              phoneCount: {
                $size: {
                  $filter: {
                    input: "$phoneSet",
                    as: "phone",
                    cond: { $ne: ["$$phone", ""] },
                  },
                },
              },
            },
          },
          {
            $sort: { count: -1, latestEventAt: -1 },
          },
          {
            $limit: 8,
          },
        ],
        topWallets: [
          {
            $match: {
              walletAddressNormalized: { $ne: "" },
            },
          },
          {
            $group: {
              _id: "$walletAddress",
              count: { $sum: 1 },
              latestEventAt: { $max: "$createdAt" },
              totalKrwAmount: { $sum: "$krwAmountValue" },
              memberSet: { $addToSet: "$memberIdNormalized" },
              phoneSet: { $addToSet: "$phoneNumberDigits" },
            },
          },
          {
            $project: {
              _id: 0,
              walletAddress: "$_id",
              count: 1,
              latestEventAt: 1,
              totalKrwAmount: 1,
              memberCount: {
                $size: {
                  $filter: {
                    input: "$memberSet",
                    as: "member",
                    cond: { $ne: ["$$member", ""] },
                  },
                },
              },
              phoneCount: {
                $size: {
                  $filter: {
                    input: "$phoneSet",
                    as: "phone",
                    cond: { $ne: ["$$phone", ""] },
                  },
                },
              },
            },
          },
          {
            $sort: { count: -1, latestEventAt: -1 },
          },
          {
            $limit: 8,
          },
        ],
        recentEvents: [
          {
            $sort: { createdAt: -1 },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              eventType: 1,
              createdAt: 1,
              createdAtIso: 1,
              memberId: 1,
              storeUser: 1,
              requestedUserType: 1,
              orderNumber: 1,
              orderId: 1,
              walletAddress: 1,
              smartAccountAddress: 1,
              phoneNumber: 1,
              buyerNickname: 1,
              depositName: 1,
              depositBankName: 1,
              krwAmountValue: 1,
              usdtAmountValue: 1,
              rateValue: 1,
              eventSource: 1,
              pathname: 1,
            },
          },
        ],
      },
    },
  ]).toArray();

  const totalCount = dashboard?.totalCount?.[0]?.count || 0;
  const summary = dashboard?.summary?.[0] || {
    totalKrwAmount: 0,
    totalUsdtAmount: 0,
    latestEventAt: null,
    uniqueWalletCount: 0,
    uniqueMemberCount: 0,
    uniquePhoneCount: 0,
  };
  const countsByEvent = Object.fromEntries(
    (dashboard?.countsByEvent || []).map((item: { _id: string; count: number }) => [
      item._id,
      item.count,
    ]),
  );
  const recentEvents = (dashboard?.recentEvents || []).map((event: Record<string, unknown>) => ({
    ...event,
    id: String(event._id || ""),
  }));

  return {
    summary: {
      totalCount,
      walletConnectCount: countsByEvent.wallet_connect || 0,
      buyOrderCreatedCount: countsByEvent.buy_order_created || 0,
      sellOrderAcceptedCount: countsByEvent.sell_order_accepted || 0,
      totalKrwAmount: summary.totalKrwAmount || 0,
      totalUsdtAmount: summary.totalUsdtAmount || 0,
      uniqueWalletCount: summary.uniqueWalletCount || 0,
      uniqueMemberCount: summary.uniqueMemberCount || 0,
      uniquePhoneCount: summary.uniquePhoneCount || 0,
      latestEventAt: summary.latestEventAt || null,
    },
    daily: dashboard?.daily || [],
    topMembers: dashboard?.topMembers || [],
    topWallets: dashboard?.topWallets || [],
    recentEvents,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    },
  };
}
