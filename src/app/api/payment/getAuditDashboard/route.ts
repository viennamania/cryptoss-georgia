import { NextResponse, type NextRequest } from "next/server";

import { getStoreByStorecode } from "@lib/api/order";
import { getPaymentAuditDashboard } from "@lib/api/paymentAudit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storecode = "",
      accessToken = "",
      page = 1,
      limit = 30,
      eventType = "",
      memberId = "",
      walletAddress = "",
      phoneNumber = "",
      orderNumber = "",
      startDate = "",
      endDate = "",
    } = body;

    if (!storecode) {
      return NextResponse.json(
        {
          result: "error",
          error: "storecode is required",
        },
        {
          status: 400,
        },
      );
    }

    const store = await getStoreByStorecode({
      storecode,
    });

    if (!store) {
      return NextResponse.json(
        {
          result: "error",
          error: "store not found",
        },
        {
          status: 404,
        },
      );
    }

    if (store?.accessToken && store.accessToken !== accessToken) {
      return NextResponse.json(
        {
          result: "error",
          error: "invalid access token",
        },
        {
          status: 403,
        },
      );
    }

    const result = await getPaymentAuditDashboard({
      storecode,
      page,
      limit,
      eventType,
      memberId,
      walletAddress,
      phoneNumber,
      orderNumber,
      startDate,
      endDate,
    });

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error("getAuditDashboard error:", error);

    return NextResponse.json(
      {
        result: "error",
        error: "failed to fetch payment audit dashboard",
      },
      {
        status: 500,
      },
    );
  }
}
