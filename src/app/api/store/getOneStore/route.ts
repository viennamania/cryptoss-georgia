import { NextResponse, type NextRequest } from "next/server";


/*
import {
	getStoreByStorecode ,
} from '@lib/api/store';
*/


export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
  } = body;


  //console.log("getStoreByStorecode", storecode);





  /*
  const result = await getStoreByStorecode({
    storecode,
  });


  //console.log("result", result);




 
  return NextResponse.json({

    result,
    
  });
  */

  // call api
  // https://goodpay.stable.makeup/api/store/getOneStore
  const apiUrl = `https://goodpay.stable.makeup/api/store/getOneStore`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
      }),
    });
    const data = await response.json();

    //console.log("API response:", data);

    return NextResponse.json({
      result: data.result,
    });

  } catch (error) {
    console.error("Error fetching store details:", error);
    return NextResponse.json({ error: "Failed to fetch store details" }, { status: 500 });
  }
  
}
