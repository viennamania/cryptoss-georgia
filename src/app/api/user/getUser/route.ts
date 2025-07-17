import { NextResponse, type NextRequest } from "next/server";

import { stableUrl } from "../../../config/stable";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    walletAddress
  } = body;

  //console.log("storecode", storecode);
  //console.log("walletAddress", walletAddress);

  /*
  console.log("getUser storecode", storecode);
  console.log("getUser walletAddress", walletAddress);


  const result = await getOneByWalletAddress(
    storecode,
    walletAddress
  );


 
  return NextResponse.json({

    result,
    
  });
  */


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
