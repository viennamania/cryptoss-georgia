import { NextResponse, type NextRequest } from "next/server";

import {
  stableUrl1,
  stableUrl2,
  stableUrl3,
  stableUrl4,
} from "../../../config/stable";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    clientid,
    storecode,
    walletAddress
  } = body;


   const stableUrl = clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1
    : clientid === "e44dd15d66fc317d1cc7e3f71975373d" ? stableUrl2
    : clientid === "421a733ddd491ddc0c2a7a8c4040d782" ? stableUrl3
    : clientid === "213e1813510d42bf66a4136dcc90b032" ? stableUrl4
    : stableUrl1; // default to stableUrl1 if no match

    
  // call api

  const apiUrl = `${stableUrl}/api/user/getUser`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        walletAddress
      }),
    });
    const data = await response.json();

    //console.log("API response:", data);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }




  
}
