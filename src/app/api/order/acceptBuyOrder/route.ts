import { NextResponse, type NextRequest } from "next/server";

import {
  UserProps,
	acceptBuyOrder,
} from '@lib/api/order';

// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import { idCounter } from "thirdweb/extensions/farcaster/idRegistry";


export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    lang,
    storecode,
    orderId,
    sellerWalletAddress,
    sellerStorecode,
    sellerMemo,
    //sellerNickname, sellerAvatar, sellerMobile, seller
  } = body;

  console.log("acceptBuyOrder body", body);


  /*
  {
    lang: 'ko',
    storecode: 'suroggyc',
    orderId: new ObjectId('6827479e460e1b9e73417ebc'),
    sellerWalletAddress: '0x98773aF65AE660Be4751ddd09C4350906e9D88F3',
    sellerStorecode: 'admin'
  }
  */

  

  const result = await acceptBuyOrder({
    lang: lang,
    storecode: storecode,
    orderId: orderId,
    sellerWalletAddress: sellerWalletAddress,
    sellerStorecode: sellerStorecode || "admin",
    sellerMemo: sellerMemo,

    /*
    sellerNickname: sellerNickname,
    sellerAvatar: sellerAvatar,
    sellerMobile: sellerMobile,
    seller: seller,
    */

  });

  //console.log("result", result);


  /*
  const {
    mobile: mobile,
    buyer: buyer,
    tradeId: tradeId,
  } = result as UserProps;
  */

  // if mobile number is not prefix with country code don't send sms
  /*
  if (!mobile || !mobile.startsWith('+')) {
    return NextResponse.json({
      result,
    });
  }
    */


    // send sms
    /*
    const to = mobile;


    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);



    let message = null;

   

    try {

      let msgBody = '';

      if (lang === 'en') {
        msgBody = `[GTETHER] TID[${tradeId}] Your buy order has been accepted by ${seller?.nickname}! You must escrow USDT to proceed with the trade in 10 minutes!`;
      } else if (lang === 'kr') {
        msgBody = `[GTETHER] TID[${tradeId}] ${seller?.nickname}님이 구매 주문을 수락했습니다! 거래를 계속하기 위해 USDT를 에스크로해야 합니다!`;
      } else {
        msgBody = `[GTETHER] TID[${tradeId}] Your buy order has been accepted by ${seller?.nickname}! You must escrow USDT to proceed with the trade in 10 minutes!`;
      }



      message = await client.messages.create({
        body: msgBody,
        from: "+17622254217",
        to: to,
      });

      console.log(message.sid);



    } catch (e) {
      console.error('error', e);
    }

    */





 
  return NextResponse.json({

    result,
    
  });
  
}
