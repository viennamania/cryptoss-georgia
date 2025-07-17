import { NextResponse, type NextRequest } from "next/server";

/*
import {
  getUserByNickname,
	insertOne,
} from '@lib/api/user';

import {
  getStoreByStorecode,
} from '@lib/api/order';



import { ethers } from "ethers";

import {
  createThirdwebClient,
  eth_getTransactionByHash,
  getContract,
  sendAndConfirmTransaction,
  
  sendBatchTransaction,


} from "thirdweb";

//import { polygonAmoy } from "thirdweb/chains";
import {
  polygon,
  arbitrum,
 } from "thirdweb/chains";

import {
  privateKeyToAccount,
  smartWallet,
  getWalletBalance,
  
 } from "thirdweb/wallets";


 if (!process.env.THIRDWEB_ENGINE_URL) {
  throw new Error("THIRDWEB_ENGINE_URL is not defined");
}

if (!process.env.THIRDWEB_ENGINE_ACCESS_TOKEN) {
  throw new Error("THIRDWEB_ENGINE_ACCESS_TOKEN is not defined");
}
*/

export async function POST(request: NextRequest) {

  const body = await request.json();


  const {
    storecode,
    walletAddress,
    userCode,
    userName,
    userBankName,
    userBankAccountNumber,
    userType,
  } = body;

  //const { storecode, nickname, mobile, password } = body;

  //console.log("body", body);


  /*
  const nickname = userCode;

  const mobile = "+821012345678";
  const password = "12345678";

  const buyer = {
    depositBankName: userBankName,
    depositBankAccountNumber: userBankAccountNumber,
    depositName: userName,
  };


  
  try {



    // find user by nickname
    const user = await getUserByNickname(
      storecode,
      nickname
    );


    ///console.log("user", user);

    if (user) {
      return NextResponse.json({
        result: "User already exists",
        walletAddress: user.walletAddress,
        storecode: user?.storecode,
      });
    }


    
    const userWalletPrivateKey = ethers.Wallet.createRandom().privateKey;

    //console.log("escrowWalletPrivateKey", escrowWalletPrivateKey);

    if (!userWalletPrivateKey) {
      return NextResponse.json({
        result: null,
      });
    }



    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY || "",
    });

    if (!client) {
      return NextResponse.json({
        result: null,
      });
    }


    const personalAccount = privateKeyToAccount({
      client,
      privateKey: userWalletPrivateKey,
    });
  

    if (!personalAccount) {
      return NextResponse.json({
        result: null,
      });
    }

    const wallet = smartWallet({
      chain:  polygon ,
      ///factoryAddress: "0x9Bb60d360932171292Ad2b80839080fb6F5aBD97", // your own deployed account factory address
      sponsorGas: true,
    });


    // Connect the smart wallet
    const account = await wallet.connect({
      client: client,
      personalAccount: personalAccount,
    });

    if (!account) {
      return NextResponse.json({
        result: null,
      });
    }


    const userWalletAddress = account.address;










    const result = await insertOne({
      storecode: storecode,
      walletAddress: userWalletAddress,
      walletPrivateKey: userWalletPrivateKey,
      nickname: nickname,
      mobile: mobile,
      password: password,
      buyer: buyer,
    });

    // return wallet address to user

    return NextResponse.json({

      result,
      walletAddress: userWalletAddress,
      
    });


  } catch (error) {
    console.log("error", error);

    return NextResponse.json({
      error,
      
    });
  }

  */







  // call api
  // https://goodpay.stable.makeup/api/user/getUser

  const apiUrl = `https://goodpay.stable.makeup/api/user/setBuyerWithoutWalletAddressByStorecode`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storecode,
        walletAddress,
        userCode,
        userName,
        userBankName,
        userBankAccountNumber,
        userType,
      }),
    });
    const data = await response.json();

    
    console.log("API response:", data);


    return NextResponse.json(data);

  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }

  
}
