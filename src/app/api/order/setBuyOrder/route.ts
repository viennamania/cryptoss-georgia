import { NextResponse, type NextRequest } from "next/server";

import {
  stableUrl1,
  stableUrl2,
  stableUrl3,
  stableUrl4,
  stableUrl5,
  stableUrl6,
} from "../../../config/stable";

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    clientid,
    storecode,
    walletAddress,
    nickname,
    usdtAmount,
    krwAmount,
    rate,
    privateSale,
    buyer
  } = body;




  // api call

  try {

    const stableUrl = clientid === "9ed089930921bfaa1bf65aff9a75fc41" ? stableUrl1
      : clientid === "e44dd15d66fc317d1cc7e3f71975373d" ? stableUrl2
      : clientid === "421a733ddd491ddc0c2a7a8c4040d782" ? stableUrl3
      : clientid === "213e1813510d42bf66a4136dcc90b032" ? stableUrl4
      : clientid === "150b53f165222304af7c45dc45c73863" ? stableUrl5
      : clientid === "48c74c35d9afd606ea0329c61898fa00" ? stableUrl6
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
        buyer
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
