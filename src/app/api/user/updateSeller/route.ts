import { NextResponse, type NextRequest } from "next/server";

/*
import {
	updateSellerStatus,
} from '@lib/api/user';
*/


export async function POST(request: NextRequest) {

  const body = await request.json();

  const { storecode, walletAddress, sellerStatus, bankName, accountNumber, accountHolder } = body;

  //console.log("walletAddress", walletAddress);
  //console.log("sellerStatus", sellerStatus);
  /*
  const result = await updateSellerStatus({
    storecode: storecode,
    walletAddress: walletAddress,
    sellerStatus: sellerStatus,
    bankName: bankName,
    accountNumber: accountNumber,
    accountHolder: accountHolder,
  });


 
  return NextResponse.json({

    result,
    
  });
  */



  // call api
  // api url is 'https://goodpay.stable.makeup/api/user/updateSeller'

  const apiUrl = `https://goodpay.stable.makeup/api/user/updateSeller`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        walletAddress,
        sellerStatus,
        bankName,
        accountNumber,
        accountHolder
      }),
    });
    const data = await response.json();

    //console.log("API response:", data);

    return NextResponse.json({
      result: data.result,
    });

  } catch (error) {
    console.error("Error calling API:", error);
    return NextResponse.json({ error: "Failed to update seller status" }, { status: 500 });
  }





}
