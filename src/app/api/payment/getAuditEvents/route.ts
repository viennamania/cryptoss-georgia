import { NextResponse, type NextRequest } from "next/server";

import { getPaymentAuditEvents } from "@lib/api/paymentAudit";
import { isValidPaymentAuditDashboardToken } from "@lib/payment-audit-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken = "",
      lang = "",
      clientid = "",
      storecode = "",
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

    if (!isValidPaymentAuditDashboardToken(accessToken)) {
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

    const result = await getPaymentAuditEvents({
      lang,
      clientid,
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
    console.error("getAuditEvents error:", error);

    return NextResponse.json(
      {
        result: "error",
        error: "failed to fetch payment audit events",
      },
      {
        status: 500,
      },
    );
  }
}
