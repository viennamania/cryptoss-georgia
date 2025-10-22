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

export async function POST(request: NextRequest) {

  const body = await request.json();

  //console.log("getOneBuyOrderByOrderId body", body);

  const{
    clientid,
    orderId,
  } = body;


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

  //console.log("getOneBuyOrderByOrderId stableUrl", stableUrl);

  // api call to get order details
  const apiUrl = `${stableUrl}/api/order/getOneBuyOrderByOrderId`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId,
      }),
    });
    const data = await response.json();

    return NextResponse.json({
      result: data.result,
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
  
}
