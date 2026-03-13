import { NextResponse, type NextRequest } from "next/server";

import { getPaymentAuditOverview } from "@lib/api/paymentAudit";
import { isValidPaymentAuditDashboardToken } from "@lib/payment-audit-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accessToken = "",
      lang = "",
      clientid = "",
      storecode = "",
      startDate = "",
      endDate = "",
      breakdownLimit = 30,
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

    const result = await getPaymentAuditOverview({
      lang,
      clientid,
      storecode,
      startDate,
      endDate,
      breakdownLimit,
    });

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error("getAuditOverview error:", error);

    return NextResponse.json(
      {
        result: "error",
        error: "failed to fetch payment audit overview",
      },
      {
        status: 500,
      },
    );
  }
}
