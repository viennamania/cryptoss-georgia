import clientPromise from "../mongodb";
import type { GetUserResult } from "thirdweb/wallets";
import { logPaymentAuditEvent } from "./paymentAudit";

const DATABASE_NAME = process.env.MONGODB_DB_NAME;

if (!DATABASE_NAME) {
  throw new Error("MONGODB_DB_NAME is not defined");
}
const THIRDWEB_PROFILE_COLLECTION = "thirdweb_wallet_profiles";
const LOGIN_SESSION_COLLECTION = "user_login_sessions";

type SerializableRecord = Record<string, unknown>;

export type ThirdwebWalletLoginInput = {
  lang?: string;
  pageClientId?: string;
  thirdwebClientId?: string;
  storecode: string;
  storeUser?: string;
  memberId?: string;
  requestedUserType?: string;
  orderNumber?: string;
  walletAddress: string;
  smartAccountAddress?: string;
  adminWalletAddress?: string;
  phoneNumber?: string;
  email?: string;
  walletId?: string;
  connectionMethod?: string;
  sponsorGas?: boolean;
  defaultSmsCountryCode?: string;
  pageParams?: SerializableRecord;
  currentUrl?: string;
  browser?: SerializableRecord;
  thirdwebProfiles?: unknown;
  thirdwebClientSnapshot?: SerializableRecord;
  thirdwebServerUser?: GetUserResult | null;
  requestMeta?: SerializableRecord;
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

export async function logThirdwebWalletLogin(input: ThirdwebWalletLoginInput) {
  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);
  const profileCollection = db.collection(THIRDWEB_PROFILE_COLLECTION);
  const sessionCollection = db.collection(LOGIN_SESSION_COLLECTION);

  const loggedAt = new Date().toISOString();
  const phoneNumber = input.phoneNumber || input.thirdwebServerUser?.phone || "";
  const email = input.email || input.thirdwebServerUser?.email || "";
  const smartAccountAddress =
    input.thirdwebServerUser?.smartAccountAddress ||
    input.smartAccountAddress ||
    input.walletAddress;
  const thirdwebUserId = input.thirdwebServerUser?.userId || "";
  const thirdwebWalletAddress = input.thirdwebServerUser?.walletAddress || "";
  const thirdwebUserCreatedAt = input.thirdwebServerUser?.createdAt || "";

  const sanitizedPageParams = sanitizeRecord(input.pageParams);
  const sanitizedCurrentUrl = sanitizeUrl(input.currentUrl);
  const sanitizedBrowser = sanitizeRecord(input.browser);
  const sanitizedRequestMeta = sanitizeRecord(input.requestMeta);
  const sanitizedProfiles = sanitizeValue(input.thirdwebProfiles);
  const sanitizedClientSnapshot = sanitizeRecord(input.thirdwebClientSnapshot);
  const sanitizedServerUser = sanitizeValue(input.thirdwebServerUser);

  const profileDocument = {
    provider: "thirdweb",
    pageClientId: input.pageClientId || "",
    thirdwebClientId: input.thirdwebClientId || "",
    lang: input.lang || "",
    storecode: input.storecode,
    storeUser: input.storeUser || "",
    memberId: input.memberId || "",
    requestedUserType: input.requestedUserType || "",
    orderNumber: input.orderNumber || "",
    walletAddress: input.walletAddress,
    smartAccountAddress,
    adminWalletAddress: input.adminWalletAddress || "",
    phoneNumber,
    email,
    thirdwebUserId,
    thirdwebWalletAddress,
    thirdwebUserCreatedAt,
    walletId: input.walletId || "",
    connectionMethod: input.connectionMethod || "phone",
    sponsorGas: input.sponsorGas ?? true,
    defaultSmsCountryCode: input.defaultSmsCountryCode || "KR",
    pageParams: sanitizedPageParams,
    currentUrl: sanitizedCurrentUrl,
    browser: sanitizedBrowser,
    thirdwebProfiles: sanitizedProfiles,
    thirdwebClientSnapshot: sanitizedClientSnapshot,
    thirdwebServerUser: sanitizedServerUser,
    updatedAt: loggedAt,
    lastLoginAt: loggedAt,
  };

  const sessionDocument = {
    provider: "thirdweb",
    eventType: "wallet_connect",
    pageClientId: input.pageClientId || "",
    thirdwebClientId: input.thirdwebClientId || "",
    lang: input.lang || "",
    storecode: input.storecode,
    storeUser: input.storeUser || "",
    memberId: input.memberId || "",
    requestedUserType: input.requestedUserType || "",
    orderNumber: input.orderNumber || "",
    walletAddress: input.walletAddress,
    smartAccountAddress,
    adminWalletAddress: input.adminWalletAddress || "",
    phoneNumber,
    email,
    thirdwebUserId,
    thirdwebWalletAddress,
    thirdwebUserCreatedAt,
    walletId: input.walletId || "",
    connectionMethod: input.connectionMethod || "phone",
    sponsorGas: input.sponsorGas ?? true,
    defaultSmsCountryCode: input.defaultSmsCountryCode || "KR",
    loginedAt: loggedAt,
    pageParams: sanitizedPageParams,
    currentUrl: sanitizedCurrentUrl,
    browser: sanitizedBrowser,
    requestMeta: sanitizedRequestMeta,
    thirdwebProfiles: sanitizedProfiles,
    thirdwebClientSnapshot: sanitizedClientSnapshot,
    thirdwebServerUser: sanitizedServerUser,
  };

  const profileResult = await profileCollection.updateOne(
    {
      provider: "thirdweb",
      storecode: input.storecode,
      walletAddress: input.walletAddress,
    },
    {
      $set: profileDocument,
      $setOnInsert: {
        createdAt: loggedAt,
      },
      $inc: {
        loginCount: 1,
      },
    },
    {
      upsert: true,
    },
  );

  const sessionResult = await sessionCollection.insertOne(sessionDocument);
  let paymentAuditResult = null;

  try {
    paymentAuditResult = await logPaymentAuditEvent({
      eventType: "wallet_connect",
      lang: input.lang,
      pageClientId: input.pageClientId,
      thirdwebClientId: input.thirdwebClientId,
      storecode: input.storecode,
      storeUser: input.storeUser,
      memberId: input.memberId,
      requestedUserType: input.requestedUserType,
      orderNumber: input.orderNumber,
      walletAddress: input.walletAddress,
      smartAccountAddress,
      adminWalletAddress: input.adminWalletAddress,
      phoneNumber,
      email,
      walletId: input.walletId,
      connectionMethod: input.connectionMethod || "phone",
      sponsorGas: input.sponsorGas ?? true,
      currentUrl: sanitizedCurrentUrl,
      pageParams: sanitizedPageParams,
      browser: sanitizedBrowser,
      requestMeta: sanitizedRequestMeta,
      eventSource: "thirdweb_wallet_login",
      extra: {
        thirdwebUserId,
        thirdwebWalletAddress,
        thirdwebUserCreatedAt,
        defaultSmsCountryCode: input.defaultSmsCountryCode || "KR",
      },
    });
  } catch (error) {
    console.error("Failed to save payment audit wallet_connect event:", error);
  }

  return {
    profileResult,
    sessionResult,
    paymentAuditResult,
  };
}
