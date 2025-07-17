import { NextResponse, type NextRequest } from "next/server";

/*
import {
	insertOneVerified,
} from '@lib/api/user';
*/


export async function POST(request: NextRequest) {

  const body = await request.json();

  const { storecode, walletAddress, nickname, mobile, email } = body;


  ///console.log("setUserVerified =====  body", body);

  /*
    setUserVerified =====  body {
    lang: 'ko',
    storecode: 'admin',
    walletAddress: '0x98773aF65AE660Be4751ddd09C4350906e9D88F3',
    nickname: 'georgia',
    mobile: ''
  }
  */
  // 최초에 storecode가 admin 인 Document 를 추가해야한다.



  /*
  const result = await insertOneVerified({
    storecode: storecode,
    walletAddress: walletAddress,
    nickname: nickname,
    mobile: mobile,
    email: email,
  });


 
  return NextResponse.json({
    
    result,
    
  });
  */
  // call api
  // api url is 'https://goodpay.stable.makeup/api/user/setUserVerified'
  const apiUrl = `https://goodpay.stable.makeup/api/user/setUserVerified`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        walletAddress,
        nickname,
        mobile,
        email
      }),
    });
    const data = await response.json();

    //console.log("API response:", data);

    return NextResponse.json({
      result: data,
    });

  } catch (error) {
    console.error("Error calling API:", error);
    return NextResponse.json({
      error: "Failed to set user verified",
    }, { status: 500 });
  }
  
}
