import { NextResponse, type NextRequest } from "next/server";

import {
  stableUrl1,
  stableUrl2,
  stableUrl3,
  stableUrl4,
  stableUrl5,
  stableUrl6,
  stableUrl7,
  stableUrl8,
  stableUrl9,
  stableUrl10,
  stableUrl11,
} from "../../../config/stable";
import { logPaymentAuditEvent } from "@lib/api/paymentAudit";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    lang,
    clientid,
    storecode,
    walletAddress,
    nickname,
    usdtAmount,
    krwAmount,
    rate,
    privateSale,
    buyer,
    returnUrl,
    orderNumber,
    auditContext,
  } = body;




  // api call

  try {

    const stableUrl = clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1
      : clientid === "e44dd15d66fc317d1cc7e3f71975373d" ? stableUrl2
      : clientid === "421a733ddd491ddc0c2a7a8c4040d782" ? stableUrl3
      : clientid === "213e1813510d42bf66a4136dcc90b032" ? stableUrl4
      : clientid === "150b53f165222304af7c45dc45c73863" ? stableUrl5
      : clientid === "48c74c35d9afd606ea0329c61898fa00" ? stableUrl6
      : clientid === "a2d871c8cf6b804dc6a910216ce45d6f" ? stableUrl7
      : clientid === "460d9a972e783b0d2607a4a4457abf44" ? stableUrl8
      : clientid === "d140e95d67da87ff62efabf401171aa0" ? stableUrl9
      : clientid === "157d017bd6afab1c0a9e5c933f8d9692" ? stableUrl10
      : clientid === "dcf6512d0b94261df0b172d2e58a5e8b" ? stableUrl11
      : stableUrl1; // default to stableUrl1 if no match

    const apiUrl = `${stableUrl}/api/order/setBuyOrder`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        walletAddress,
        nickname,
        usdtAmount,
        krwAmount,
        rate,
        privateSale,
        buyer,
        returnUrl,
        orderNumber,
      }),
    });



    if (!response.ok) {
      
      console.error("Failed to insert buy order:", response.status, response.statusText);
      console.error("Response body:", await response.text());

      
      //const errorData = await response.json();


      return NextResponse.json({
        result: null,
        error: `Failed to insert buy order: ${response.status} ${response.statusText}`,
      }, { status: response.status });
      

    }

    const result = await response.json();
    console.log("setBuyOrder =====  result", result);

    /*
    {
      result: {
        _id: '6843c74d7861b46551a752f2',
        walletAddress: '0x42bFaD5BC8B3469B57604Ef72b92d0fa218E60dC'
      }
    }
    */

    if (result?.result) {
      const safeAuditContext =
        auditContext && typeof auditContext === "object" ? auditContext : {};

      try {
        await logPaymentAuditEvent({
          eventType: "buy_order_created",
          lang: String(safeAuditContext.lang || lang || ""),
          pageClientId: String(safeAuditContext.pageClientId || clientid || ""),
          storecode: String(safeAuditContext.storecode || storecode || ""),
          storeUser: String(safeAuditContext.storeUser || ""),
          memberId: String(safeAuditContext.memberId || nickname || ""),
          requestedUserType: String(safeAuditContext.requestedUserType || ""),
          orderNumber: String(safeAuditContext.orderNumber || orderNumber || ""),
          orderId: String(result.result?._id || ""),
          walletAddress: String(safeAuditContext.walletAddress || walletAddress || ""),
          smartAccountAddress: String(
            safeAuditContext.smartAccountAddress
            || safeAuditContext.walletAddress
            || walletAddress
            || "",
          ),
          phoneNumber: String(safeAuditContext.phoneNumber || ""),
          currentUrl: String(safeAuditContext.currentUrl || ""),
          pageParams:
            safeAuditContext.pageParams && typeof safeAuditContext.pageParams === "object"
              ? safeAuditContext.pageParams
              : {},
          browser:
            safeAuditContext.browser && typeof safeAuditContext.browser === "object"
              ? safeAuditContext.browser
              : {},
          eventSource: String(safeAuditContext.eventSource || "set_buy_order_route"),
          buyerNickname: nickname || "",
          depositName: buyer?.depositName || "",
          depositBankName: buyer?.depositBankName || "",
          depositBankAccountNumber: buyer?.depositBankAccountNumber || "",
          krwAmount,
          usdtAmount,
          rate,
          privateSale: Boolean(privateSale),
          orderStatus: "ordered",
          extra: {
            returnUrl: returnUrl || "",
            stableUrl,
          },
        });
      } catch (error) {
        console.error("Failed to save buy order payment audit event:", error);
      }
    }


    return NextResponse.json({
      result: result.result,
    });


  } catch (error) {
    console.error("Error in setBuyOrder:", error);
    return NextResponse.json({
      result: null,
      error: "Failed to insert buy order",
    }, { status: 500 });
  }


  
}
