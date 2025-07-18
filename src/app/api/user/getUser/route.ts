import { NextResponse, type NextRequest } from "next/server";

import {
  stableUrl1,
  stableUrl2
} from "../../../config/stable";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    walletAddress
  } = body;


  const stableUrl = body.clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1 : stableUrl2;

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
