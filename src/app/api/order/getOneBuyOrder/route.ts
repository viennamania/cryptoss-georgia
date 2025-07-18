import { NextResponse, type NextRequest } from "next/server";

import {
  stableUrl1,
  stableUrl2
} from "../../../config/stable";

export async function POST(request: NextRequest) {

  const body = await request.json();


  /*
  const result = await getOneBuyOrder({
    orderId: body.orderId,
    limit: 100,
    page: 1,
  });

 
  return NextResponse.json({

    result,
    
  });
  */

  const stableUrl = body.clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1 : stableUrl2;
  
  // api call to get order details
  const apiUrl = `${stableUrl}/api/order/getOneBuyOrder`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: body.orderId,
        limit: 100,
        page: 1,
      }),
    });
    const data = await response.json();

    //console.log("API response:", data);

    return NextResponse.json({
      result: data.result,
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
  
}
