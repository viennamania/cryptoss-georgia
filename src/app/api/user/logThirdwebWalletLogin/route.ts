import { NextResponse, type NextRequest } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { getUser, type GetUserResult } from "thirdweb/wallets";

import {
  logThirdwebWalletLogin,
  type ThirdwebWalletLoginInput,
} from "@lib/api/thirdwebWalletLogin";

type ThirdwebWalletLoginRequestBody = ThirdwebWalletLoginInput & {
  thirdwebUserId?: string;
};

function getRequestMeta(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ipAddress = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";

  return {
    userAgent: request.headers.get("user-agent") || "",
    referer: request.headers.get("referer") || "",
    origin: request.headers.get("origin") || "",
    forwardedFor,
    ipAddress,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ThirdwebWalletLoginRequestBody;

    if (!body?.storecode || !body?.walletAddress) {
      return NextResponse.json(
        {
          result: "error",
          error: "storecode and walletAddress are required",
        },
        {
          status: 400,
        },
      );
    }

    const requestMeta = getRequestMeta(request);
    let thirdwebServerUser: GetUserResult | null = null;

    if (process.env.THIRDWEB_SECRET_KEY) {
      const thirdwebClient = createThirdwebClient({
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      });

      const lookupCandidates = [
        body.thirdwebUserId ? { id: body.thirdwebUserId } : null,
        body.phoneNumber ? { phone: body.phoneNumber } : null,
        body.email ? { email: body.email } : null,
        body.adminWalletAddress ? { walletAddress: body.adminWalletAddress } : null,
        body.walletAddress ? { walletAddress: body.walletAddress } : null,
      ].filter(Boolean) as Array<
        | { id: string }
        | { phone: string }
        | { email: string }
        | { walletAddress: string }
      >;

      for (const lookupCandidate of lookupCandidates) {
        try {
          thirdwebServerUser = await getUser({
            client: thirdwebClient,
            ...lookupCandidate,
          });

          if (thirdwebServerUser) {
            break;
          }
        } catch (error) {
          console.error("Failed to fetch thirdweb user snapshot:", error);
        }
      }
    }

    const result = await logThirdwebWalletLogin({
      ...body,
      requestMeta,
      thirdwebServerUser,
    });

    return NextResponse.json({
      result: "ok",
      profileUpserted: Boolean(result.profileResult.acknowledged),
      loginHistoryInserted: Boolean(result.sessionResult.acknowledged),
      thirdwebUserId: thirdwebServerUser?.userId || null,
    });
  } catch (error) {
    console.error("logThirdwebWalletLogin error:", error);

    return NextResponse.json(
      {
        result: "error",
        error: "failed to save thirdweb wallet login",
      },
      {
        status: 500,
      },
    );
  }
}
