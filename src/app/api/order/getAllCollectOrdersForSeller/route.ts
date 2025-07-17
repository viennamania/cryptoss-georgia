import { NextResponse, type NextRequest } from "next/server";

import {
	getCollectOrdersForSeller,
} from '@lib/api/order';



export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    storecode,
    limit,
    page,
    walletAddress,
    searchMyOrders,
  } = body;



  const result = await getCollectOrdersForSeller({
    storecode,
    limit: limit || 10,
    page: page || 1,
    walletAddress,
    searchMyOrders,
  });

 
  return NextResponse.json({

    result,
    
  });
  
}
