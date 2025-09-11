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


  const stableUrl = clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1
    : clientid === "e44dd15d66fc317d1cc7e3f71975373d" ? stableUrl2
    : clientid === "421a733ddd491ddc0c2a7a8c4040d782" ? stableUrl3
    : clientid === "213e1813510d42bf66a4136dcc90b032" ? stableUrl4
    : clientid === "150b53f165222304af7c45dc45c73863" ? stableUrl5
    : clientid === "48c74c35d9afd606ea0329c61898fa00" ? stableUrl6
    : clientid === "a2d871c8cf6b804dc6a910216ce45d6f" ? stableUrl7
    : clientid === "460d9a972e783b0d2607a4a4457abf44" ? stableUrl8
    : stableUrl1; // default to stableUrl1 if no match


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
