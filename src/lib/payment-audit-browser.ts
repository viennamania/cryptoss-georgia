import { getUserPhoneNumber } from "thirdweb/wallets/in-app";

type BuildPaymentAuditContextInput = {
  lang?: string;
  pageClientId?: string;
  storecode: string;
  storeUser?: string;
  memberId?: string;
  orderNumber?: string | null;
  requestedUserType?: string;
  walletAddress?: string;
  smartAccountAddress?: string;
  phoneNumber?: string;
  eventSource?: string;
  queryString?: string;
};

export async function resolveConnectedPhoneNumber(client: any) {
  try {
    return (await getUserPhoneNumber({ client })) || "";
  } catch (error) {
    console.error("Failed to resolve connected phone number:", error);
    return "";
  }
}

export function buildPaymentAuditContext(input: BuildPaymentAuditContextInput) {
  const queryString =
    input.queryString
    || (typeof window !== "undefined" ? window.location.search.slice(1) : "");

  return {
    lang: input.lang || "",
    pageClientId: input.pageClientId || "",
    storecode: input.storecode,
    storeUser: input.storeUser || "",
    memberId: input.memberId || "",
    orderNumber: input.orderNumber || "",
    requestedUserType: input.requestedUserType || "",
    walletAddress: input.walletAddress || "",
    smartAccountAddress: input.smartAccountAddress || input.walletAddress || "",
    phoneNumber: input.phoneNumber || "",
    eventSource: input.eventSource || "",
    pageParams: Object.fromEntries(new URLSearchParams(queryString).entries()),
    currentUrl: typeof window !== "undefined" ? window.location.href : "",
    browser: {
      language: typeof navigator !== "undefined" ? navigator.language : "",
      languages: typeof navigator !== "undefined" ? navigator.languages : [],
      platform: typeof navigator !== "undefined" ? navigator.platform : "",
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      screenWidth: typeof window !== "undefined" ? window.screen.width : 0,
      screenHeight: typeof window !== "undefined" ? window.screen.height : 0,
      viewportWidth: typeof window !== "undefined" ? window.innerWidth : 0,
      viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    },
  };
}
