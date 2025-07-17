import { NextResponse, type NextRequest } from "next/server";


import {

  getAllTradesByAdmin,

  getAllClearancesByAdmin,


} from '@lib/api/order';

/*
{
    totalNumberOfBuyers: 0,
    latestBuyers: [],
    totalNumberOfTrades: 0,
    latestTrades: [],
    totalBuyAmountKrw: 0,
    totalUsdtAmount: 0,
  }
*/

export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    limit = 1,
    page = 1,
    startDate = "",
    endDate = "",
    agentcode = "",
    searchNickname = "",
    walletAddress = "",
    storecode = "",
    searchOrderStatusCompleted = true,
    searchBuyer = "",
    searchDepositName = "",
    searchStoreBankAccountNumber = "",
  } = body;



  ////console.log("getStoreSummary body", body);




  const trades = await getAllTradesByAdmin({
    limit : limit,
    page : page,
    startDate: startDate,
    endDate: endDate,
    agentcode: agentcode,
    searchNickname: searchNickname,
    walletAddress: walletAddress,
    storecode: storecode,
    searchOrderStatusCompleted: searchOrderStatusCompleted,
    searchBuyer: searchBuyer,
    searchDepositName: searchDepositName,
    searchStoreBankAccountNumber: searchStoreBankAccountNumber,
    privateSale: false, // false for normal trades
  });


  ////console.log("getStoreSummary trades", trades);



  const totalCount = trades?.totalCount || 0;

  const totalKrwAmount = trades?.totalKrwAmount || 0;
  const totalUsdtAmount = trades?.totalUsdtAmount || 0;


  const totalSettlementCount = trades?.totalSettlementCount || 0;
  const totalSettlementAmount = trades?.totalSettlementAmount || 0;
  const totalSettlementAmountKRW = trades?.totalSettlementAmountKRW || 0;

  const totalFeeAmount = trades?.totalFeeAmount || 0;
  const totalFeeAmountKRW = trades?.totalFeeAmountKRW || 0;


  const latestTrades = trades?.trades || [];



  // clearance
  const clearanceTrades = await getAllClearancesByAdmin({
    limit: 10,
    page: 1,
    startDate: startDate,
    endDate: endDate,
    agentcode: agentcode,
    searchNickname: searchNickname,
    walletAddress: walletAddress,
    storecode: storecode,
    searchOrderStatusCompleted: searchOrderStatusCompleted,
    searchBuyer: searchBuyer,
    searchDepositName: searchDepositName,
    searchStoreBankAccountNumber: searchStoreBankAccountNumber,
  });



  //console.log("getStoreSummary clearanceTrades", clearanceTrades);










  const totalClearanceCount = clearanceTrades?.totalCount || 0;
  const totalClearanceAmount = clearanceTrades?.totalKrwAmount || 0;
  const totalClearanceAmountUSDT = clearanceTrades?.totalUsdtAmount || 0;



  const result = {
    //totalNumberOfBuyers,
    //latestBuyers,

    totalCount  ,
    totalKrwAmount,
    totalUsdtAmount,

    totalSettlementCount,
    totalSettlementAmount,
    totalSettlementAmountKRW,

    totalFeeAmount,
    totalFeeAmountKRW,

    latestTrades,



    totalClearanceCount,
    totalClearanceAmount,
    totalClearanceAmountUSDT,

  };

 
  return NextResponse.json({

    result,
    
  });
  
}
