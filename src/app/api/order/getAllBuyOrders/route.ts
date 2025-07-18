import { NextResponse, type NextRequest } from "next/server";


import {
  stableUrl1,
  stableUrl2
} from "../../../config/stable";


export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    clientid,
    agentcode,
    storecode,
    limit,
    page,
    walletAddress,
    searchMyOrders,
    searchOrderStatusCancelled,
    searchOrderStatusCompleted,

    searchStoreName,

    privateSale,

    searchBuyer,
    searchDepositName,

    searchStoreBankAccountNumber,

    fromDate,
    toDate,


  } = body;


  console.log("getAllBuyOrders fromDate", fromDate);
  console.log("getAllBuyOrders toDate", toDate);



  

  ///console.log("getAllBuyOrders body", body);



  // when fromDate is "" or undefined, set it to 30 days ago
  if (!fromDate || fromDate === "") {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    body.fromDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
  }

  // when toDate is "" or undefined, set it to today
  if (!toDate || toDate === "") {
    const date = new Date();
    body.toDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
  }

  // if clientid is "9ed089930921bfaa1bf65aff9a75fc41", use stableUrl1, otherwise use stableUrl2
  const stableUrl = clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1 : stableUrl2;

  // call api
  const apiUrl = `${stableUrl}/api/order/getAllBuyOrders`;


  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching buy orders:", error);
    return NextResponse.json({ error: "Failed to fetch buy orders" }, { status: 500 });
  }
  
}
