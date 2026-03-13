'use client';

import type { GetStaticProps, InferGetStaticPropsType } from 'next';



import { useState, useEffect, use, useRef, type CSSProperties } from "react";



import { toast } from 'react-hot-toast';

import { client } from "../../../../client";

import {
    getContract,
    sendAndConfirmTransaction,
} from "thirdweb";



import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from "thirdweb/chains";

import {
    useActiveAccount,
    useAutoConnect,
    useConnect,
    useDisconnect,
    useActiveWallet,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";


import {
  getProfiles,
  getUserEmail,
  getUserPhoneNumber,
  preAuthenticate,
} from "thirdweb/wallets/in-app";


import Image from 'next/image';

import GearSetupIcon from "@/components/gearSetupIcon";


import Uploader from '@/components/uploader';

import { balanceOf, deposit, transfer } from "thirdweb/extensions/erc20";
 






// open modal

import Modal from '@/components/modal';

import { useRouter }from "next//navigation";

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../../dictionaries";
import { Pay } from 'twilio/lib/twiml/VoiceResponse';


import Chat from "@/components/Chat";
import { add } from 'thirdweb/extensions/farcaster/keyGateway';


import { useSearchParams } from "next/navigation";
import { parse } from 'path';
import { derivePaymentBrandTheme } from "@/lib/payment-branding";
import {
  buildPaymentAuditContext,
  resolveConnectedPhoneNumber,
} from "@/lib/payment-audit-browser";





interface SellOrder {
  _id: string;
  createdAt: string;
  nickname: string;
  avatar: string;

  trades: number;
  price: number;
  available: number;
  limit: string;
  paymentMethods: string[];

  usdtAmount: number;
  krwAmount: number;
  rate: number;

  walletAddress: string;

  seller: any;


  status: string;

  acceptedAt: string;
  paymentRequestedAt: string;
  paymentConfirmedAt: string;

  tradeId: string;

  buyer: any;

  privateSale: boolean;


  escrowTransactionHash: string;
  transactionHash: string;
}

const thirdwebClientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || "";
const smartAccountConnectConfig = {
  sponsorGas: true,
};

function createPhoneWallet(chain: any) {
  return inAppWallet({
    auth: {
      options: ["phone"],
      defaultSmsCountryCode: "KR",
      allowedSmsCountryCodes: ["KR"],
    },
    executionMode: {
      mode: "EIP4337",
      smartAccount: {
        chain,
        sponsorGas: smartAccountConnectConfig.sponsorGas,
      },
    },
    hidePrivateKeyExport: true,
  });
}

function normalizeKoreanPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("82")) {
    const localNumber = digits.slice(2);
    return `+82${localNumber.startsWith("0") ? localNumber.slice(1) : localNumber}`;
  }

  return `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;
}

function isValidKoreanMobileNumber(value: string) {
  return /^\+821\d{8,9}$/.test(normalizeKoreanPhoneNumber(value));
}

function formatPhoneNumberPreview(value: string) {
  if (!value) {
    return "";
  }

  return value.replace(/^\+82/, "+82 ");
}

function normalizeUserType(value?: string | null) {
  const rawValue = (value || "").trim();
  const normalizedValue = rawValue.toUpperCase();

  if (!rawValue) {
    return "";
  }

  if (/^(AAA|A|1|1등급|LEVEL1|GRADE1|TIER1|MEMBER1|VIP1)$/i.test(rawValue)) {
    return "AAA";
  }

  if (/^(BBB|B|2|2등급|LEVEL2|GRADE2|TIER2|MEMBER2|VIP2)$/i.test(rawValue)) {
    return "BBB";
  }

  if (/^(CCC|C|3|3등급|LEVEL3|GRADE3|TIER3|MEMBER3|VIP3)$/i.test(rawValue)) {
    return "CCC";
  }

  if (/^(DDD|D|4|4등급|LEVEL4|GRADE4|TIER4|MEMBER4|VIP4)$/i.test(rawValue)) {
    return "DDD";
  }

  if (/^(GENERAL|NORMAL|BASIC|DEFAULT|0|일반|일반등급)$/i.test(rawValue)) {
    return "";
  }

  return ["AAA", "BBB", "CCC", "DDD"].includes(normalizedValue)
    ? normalizedValue
    : "";
}

function buildReverseOrderUrl({
  lang,
  clientid,
  storecode,
  orderId,
  orderNumber,
  userType,
}: {
  lang: string;
  clientid: string;
  storecode: string;
  orderId: string;
  orderNumber?: string | null;
  userType?: string;
}) {
  const nextSearchParams = new URLSearchParams();

  if (orderNumber) {
    nextSearchParams.set('orderNumber', orderNumber);
  }

  if (userType) {
    nextSearchParams.set('userType', userType);
  }

  const nextQueryString = nextSearchParams.toString();

  return (
    '/' + lang + '/' + clientid + '/' + storecode + '/pay-usdt-reverse/' + orderId
    + (nextQueryString ? `?${nextQueryString}` : '')
  );
}

function serializeThirdwebValue(
  value: any,
  depth = 0,
  seen = new WeakSet<object>(),
): any {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (depth >= 4) {
    return "[MaxDepth]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeThirdwebValue(item, depth + 1, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    const snapshot: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry === "function" || entry === undefined) {
        continue;
      }

      snapshot[key] = serializeThirdwebValue(entry, depth + 1, seen);
    }

    seen.delete(value);

    return snapshot;
  }

  return String(value);
}


const recipientWalletAddress = "0x2111b6A49CbFf1C8Cc39d13250eF6bd4e1B59cF6";


const contractAddressEthereum = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT on Ethereum
const contractAddressPolygon = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon
const contractAddressArbitrum = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum
const contractAddressBSC = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC







// [orderId].tsx

//function SellUsdt(orderId: string) {


/*
export async function getStaticProps(context: any) {
    const orderId = context.params.orderId;
    return {
      props: {
        orderId,
      },
    };
}


export default function SellUsdt({ orderId }: InferGetStaticPropsType<typeof getStaticProps>) {
*/

///export default function SellUsdt() {



//export default function SellUsdt({ params }: { params: { orderId: string } }) {

 
 
/*
// random deposit name
// korean your name
const randomDepositName = [
  '김철수', 
  '이영희',
  '박영수',
  '정미영',
  '오재원',
  '최지연',
  '강민수',
  '윤지원',
  '서동훈',
  '신미정',
  '조영호',
  '임지은',
  '한상훈',
  '황미정',
  '백성호',
  '전지은',
  '고상훈',
  '권미정',
  '문성호',
  '송지은',
  '류상훈',
  '안미정',
  '손성호',
  '홍지은',
  '이상훈',
  '김미정',
  '박성호',
  '이지은',
  '최상훈',
  '정미정',
  '오성호',
  '윤지은',
];

// random korea bank name
const koreanBankName = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '기업은행',
  '농협은행',
  '외환은행',
  'SC제일은행',
  '씨티은행',
  '대구은행',
  '부산은행',
  '경남은행',
  '광주은행',
  '전북은행',
  '제주은행',
  '새마을금고',
  '신협',
  '우체국',
  '카카오뱅크',
  '케이뱅크',
];

*/
  
 







export default function Index({ params }: any) {

    //console.log('params', params);

    // get params

    const searchParams = useSearchParams();

    const storeUser = searchParams.get('storeUser');

    console.log('storeUser', storeUser);


    //const storecode = storeUser?.split('@').slice(-1)[0];
    //const memberid = storeUser?.split('@').slice(0, -1).join('@');

    
    const storecode = params?.center;

    console.log("storecode", storecode);

    const memberid = storeUser;
  
    console.log("memberid", memberid);

  


  

    const paramDepositName = searchParams.get('depositName');
    const paramDepositBankName = searchParams.get('depositBankName');
    const paramDepositBankAccountNumber = searchParams.get('depositBankAccountNumber');
    

    const paramDepositAmountKrw = searchParams.get('depositAmountKrw');


    const paramAccessToken = searchParams.get('accessToken');
    const requestedUserType = normalizeUserType(
      searchParams.get('userType')
      || searchParams.get('memberGrade')
      || searchParams.get('memberType')
      || searchParams.get('grade')
      || searchParams.get('gradeCode')
      || searchParams.get('user_type')
    );

    const orderNumber = searchParams.get('orderNumber');

    // returnUrl
    const paramReturnUrl = searchParams.get('returnUrl');
    const queryString = searchParams.toString();


    useEffect(() => {
      // Dynamically load the Binance widget script
      const script = document.createElement("script");
      script.src = "https://public.bnbstatic.com/unpkg/growth-widget/cryptoCurrencyWidget@0.0.20.min.js";
      script.async = true;
      document.body.appendChild(script);
  
      return () => {
        // Cleanup the script when the component unmounts
        document.body.removeChild(script);
      };
    }, []);




    /*
      result: {
        chain: 'ethereum',
        clientId: '48c74c35d9afd606ea0329c61898fa00',
        clientInfo: {
          _id: '68d4c39ae74381109dd2c88c',
          clientId: '48c74c35d9afd606ea0329c61898fa00',
          description: '크립토스 포에버',
          exchangeRateUSDT: [Object],
          name: 'CRYPTOSS',
          avatar: 'https://t0gqytzvlsa2lapo.public.blob.vercel-storage.com/cLIugLK-J5jBvxgsktHigbbH9w9Dj9ivyaAhls.png',
          exchangeRateUSDTSell: [Object]
        }
      }
    */


    // /api/client/getClientInfo

    const [rate, setRate] = useState(1400);
    const [clientChain, setClientChain] = useState('ethereum');
    const paymentChain = clientChain === 'ethereum'
      ? ethereum
      : clientChain === 'polygon'
      ? polygon
      : clientChain === 'arbitrum'
      ? arbitrum
      : clientChain === 'bsc'
      ? bsc
      : arbitrum;



    const [clientInfo, setClientInfo] = useState<any>(null);
    useEffect(() => {
      const fetchClientInfo = async () => {
        try {
          const response = await fetch('/api/client/getClientInfo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientid: params.clientid,
            }),
          });
          console.log('getClientInfo response', response);

          const data = await response?.json();
          console.log('getClientInfo data', data);


          if (data.result) {
            setClientInfo(data.result);
            setRate(data.result.clientInfo.exchangeRateUSDT.KRW);
            setClientChain(data.result.chain);
          }
        } catch (error) {
          console.error('Error fetching client info:', error);
        }
      };
      fetchClientInfo();
    }, [params.clientid]);


    ///console.log('clientInfo', clientInfo);




    const contract = getContract({
      // the client you have created via `createThirdwebClient()`
      client,
      // the chain the contract is deployed on
      chain: paymentChain,
    
    
    
      // the contract's address
      ///address: contractAddressArbitrum,
  
      address: clientChain === 'ethereum' ? contractAddressEthereum
        : clientChain === 'polygon' ? contractAddressPolygon
        : clientChain === 'arbitrum' ? contractAddressArbitrum
        : clientChain === 'bsc' ? contractAddressBSC
        : contractAddressArbitrum,

      // OPTIONAL: the contract's abi
      //abi: [...],
    });
  


  
    const [data, setData] = useState({
      title: "",
      description: "",
  
      menu : {
        buy: "",
        sell: "",
        trade: "",
        chat: "",
        history: "",
        settings: "",
      },
  
      Go_Home: "",
      Buy: "",
      Total: "",
      Orders: "",
      Trades: "",
      Search_my_trades: "",
  
      Seller: "",
      Buyer: "",
      Me: "",

      Price: "",
      Amount: "",
      Rate: "",
  
      Go_Buy_USDT: "",
      Go_Sell_USDT: "",

      Disconnect_Wallet: "",

      My_Order: "",

      Payment: "",
      Bank_Transfer: "",


      hours: "",
      minutes: "",
      seconds: "",

      hours_ago: "",
      minutes_ago: "",
      seconds_ago: "",

      Waiting_for_seller_to_deposit: "",
      to_escrow: "",

      If_you_request_payment: "",
      I_agree_to_escrow_USDT: "",


 
      Bank_Name: "",
      Account_Number: "",
      Account_Holder: "",
      Deposit_Name: "",
      Deposit_Amount: "",
      Deposit_Deadline: "",

      Waiting_for_seller_to_confirm_payment: "",

      Confirm_Payment: "",

      Connect_Wallet_Description_For_Buyers: "",

      I_agree_to_the_terms_of_trade: "",

      Requesting_Payment: "",

      Deposit_Information: "",

      Request_Payment: "",

      Checking_the_bank_transfer_from_the_buyer: "",

      I_agree_to_check_the_bank_transfer_of: "",

      Transfering_USDT_to_the_buyer_wallet_address: "",

      Anonymous: "",

      TID: "",

      Escrow: "",

      Profile: "",
      My_Profile_Picture: "",
  
      Edit: "",


      Cancel: "",
      Save: "",
      Enter_your_nickname: "",

      Nickname_should_be_5_10_characters: "",

      You_must_have_a_wallet_address_to_buy_USDT: "",
      Make_Wallet_Address: "",

      My_Wallet_Address: "",

      PRICE_10000_KRW: "",
      PRICE_50000_KRW: "",
      PRICE_100000_KRW: "",
      PRICE_300000_KRW: "",
      PRICE_500000_KRW: "",
      PRICE_1000000_KRW: "",
      PRICE_5000000_KRW: "",
      PRICE_10000000_KRW: "",

      Please_keep_Your_Wallet_address_safe: "",

      Waiting_for_the_USDT_to_be_sent_to_the_store_address: "",
      Successfully_sent_USDT_to_the_store_address: "",

      Order_accepted_successfully: "",

      Order_Opened: "",
      Trade_Started: "",

      When_the_deposit_is_completed: "",

      Completed_at: "",

      Please_enter_deposit_name: "",

      Copy: "",

      Your_wallet_address_is_copied: "",

      Charge: "",

      Deposit_name_description: "",

      Deposit_Confirmed: "",

      Account_number_has_been_copied: "",

      Payment_name_has_been_copied: "",

      Payment_amount_has_been_copied: "",

      My_Balance: "",


    } );
  
    useEffect(() => {
        async function fetchData() {
            const dictionary = await getDictionary(params.lang);
            setData(dictionary);
        }
        fetchData();
    }, [params.lang]);
  
    const {
      title,
      description,
      menu,
      Go_Home,
      Buy,
      Total,
      Orders,
      Trades,
      Price,
      Amount,
      Rate,

      Search_my_trades,
      Seller,
      Buyer,
      Me,
      Go_Buy_USDT,
      Go_Sell_USDT,

      Disconnect_Wallet,

      My_Order,

      Payment,
      Bank_Transfer,

      hours,
      minutes,
      seconds,

      hours_ago,
      minutes_ago,
      seconds_ago,

      Waiting_for_seller_to_deposit,
      to_escrow,

      If_you_request_payment,
      I_agree_to_escrow_USDT,

      Bank_Name,
      Account_Number,
      Account_Holder,
      Deposit_Name,
      Deposit_Amount,
      Deposit_Deadline,

      Waiting_for_seller_to_confirm_payment,

      Confirm_Payment,

      Connect_Wallet_Description_For_Buyers,

      I_agree_to_the_terms_of_trade,

      Requesting_Payment,

      Deposit_Information,

      Request_Payment,

      Checking_the_bank_transfer_from_the_buyer,

      I_agree_to_check_the_bank_transfer_of,

      Transfering_USDT_to_the_buyer_wallet_address,

      Anonymous,

      TID,

      Escrow,

      Profile,
      My_Profile_Picture,

      Edit,

      Cancel,
      Save,
      Enter_your_nickname,

      Nickname_should_be_5_10_characters,

      You_must_have_a_wallet_address_to_buy_USDT,
      Make_Wallet_Address,

      My_Wallet_Address,

      PRICE_10000_KRW,
      PRICE_50000_KRW,
      PRICE_100000_KRW,
      PRICE_300000_KRW,
      PRICE_500000_KRW,
      PRICE_1000000_KRW,
      PRICE_5000000_KRW,
      PRICE_10000000_KRW,

      Please_keep_Your_Wallet_address_safe,

      Waiting_for_the_USDT_to_be_sent_to_the_store_address,
      Successfully_sent_USDT_to_the_store_address,

      Order_accepted_successfully,

      Order_Opened,
      Trade_Started,

      When_the_deposit_is_completed,

      Completed_at,

      Please_enter_deposit_name,

      Copy,

      Your_wallet_address_is_copied,

      Charge,

      Deposit_name_description,

      Deposit_Confirmed,

      Account_number_has_been_copied,

      Payment_name_has_been_copied,

      Payment_amount_has_been_copied,

      My_Balance,

    } = data;
   
 
 
 
 
  const router = useRouter();
    

  //const orderId = params.orderId as string;

  const orderId = "0";
  
  console.log('orderId', orderId);


 

    // get the active wallet
    const { connect, isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const activeWallet = useActiveWallet();
    const phoneWalletRegistryRef = useRef<Record<string, any>>({});




  const smartAccount = useActiveAccount();


  //const address = smartAccount?.address || "";

  const [address, setAddress] = useState('');
  const [connectedPhoneNumber, setConnectedPhoneNumber] = useState('');
  const connectedSmartWalletAddress = smartAccount?.address || '';
  const hasConnectedSmartWallet = Boolean(connectedSmartWalletAddress);
  const walletLoginSyncRef = useRef('');
  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [submittedPhoneNumber, setSubmittedPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneAuthStep, setPhoneAuthStep] = useState<'phone' | 'code'>('phone');
  const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false);
  const [isVerifyingPhoneCode, setIsVerifyingPhoneCode] = useState(false);
  const [phoneAuthError, setPhoneAuthError] = useState('');
  const [isDisconnectConfirmModalOpen, setIsDisconnectConfirmModalOpen] = useState(false);

  const createPaymentAuditContext = async (
    walletAddress: string,
    eventSource: string,
  ) => {
    const phoneNumber = connectedPhoneNumber || await resolveConnectedPhoneNumber(client);

    if (phoneNumber && phoneNumber !== connectedPhoneNumber) {
      setConnectedPhoneNumber(phoneNumber);
    }

    return buildPaymentAuditContext({
      lang: params.lang,
      pageClientId: params.clientid,
      storecode,
      storeUser: storeUser || '',
      memberId: memberid || '',
      orderNumber,
      requestedUserType,
      walletAddress,
      smartAccountAddress: smartAccount?.address || walletAddress,
      phoneNumber,
      eventSource,
      queryString,
    });
  };

  if (!phoneWalletRegistryRef.current[clientChain]) {
    phoneWalletRegistryRef.current[clientChain] = createPhoneWallet(paymentChain);
  }

  const phoneWallet = phoneWalletRegistryRef.current[clientChain];
  const { isLoading: isAutoConnecting } = useAutoConnect({
    client,
    wallets: [phoneWallet],
    chain: paymentChain,
    timeout: 10000,
  });

  const resetPhoneAuthState = () => {
    setPhoneInput('');
    setSubmittedPhoneNumber('');
    setVerificationCode('');
    setPhoneAuthStep('phone');
    setPhoneAuthError('');
    setIsSendingPhoneCode(false);
    setIsVerifyingPhoneCode(false);
  };

  const closePhoneAuthModal = () => {
    setIsPhoneAuthModalOpen(false);
    resetPhoneAuthState();
  };

  const openPhoneAuthModal = () => {
    setPhoneAuthError('');
    setIsPhoneAuthModalOpen(true);
  };

  const closeDisconnectConfirmModal = () => {
    setIsDisconnectConfirmModalOpen(false);
  };

  const openDisconnectConfirmModal = () => {
    setIsDisconnectConfirmModalOpen(true);
  };

  const handleSendPhoneVerificationCode = async (phoneNumberOverride?: string) => {
    const rawPhoneNumber = phoneNumberOverride || phoneInput;
    const normalizedPhoneNumber = normalizeKoreanPhoneNumber(rawPhoneNumber);

    if (!isValidKoreanMobileNumber(rawPhoneNumber)) {
      setPhoneAuthError('휴대폰 번호를 다시 확인해 주세요.');
      return;
    }

    setIsSendingPhoneCode(true);
    setPhoneAuthError('');

    try {
      await preAuthenticate({
        client,
        strategy: 'phone',
        phoneNumber: normalizedPhoneNumber,
      });

      setSubmittedPhoneNumber(normalizedPhoneNumber);
      setPhoneAuthStep('code');
      toast.success('인증 코드를 전송했습니다.');
    } catch (error: any) {
      console.error('Error sending phone verification code:', error);
      setPhoneAuthError('인증 코드 전송에 실패했습니다. 번호를 다시 확인해 주세요.');
    } finally {
      setIsSendingPhoneCode(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!submittedPhoneNumber) {
      setPhoneAuthError('휴대폰 번호를 다시 입력해 주세요.');
      setPhoneAuthStep('phone');
      return;
    }

    if (!verificationCode.trim()) {
      setPhoneAuthError('인증 코드를 입력해 주세요.');
      return;
    }

    setIsVerifyingPhoneCode(true);
    setPhoneAuthError('');

    try {
      await connect(async () => {
        await phoneWallet.connect({
          client,
          chain: paymentChain,
          strategy: 'phone',
          phoneNumber: submittedPhoneNumber,
          verificationCode: verificationCode.trim(),
        });

        return phoneWallet;
      });

      toast.success('휴대폰 확인이 완료되었습니다.');
      closePhoneAuthModal();
    } catch (error: any) {
      console.error('Error verifying phone code:', error);
      setPhoneAuthError('인증 코드가 올바르지 않거나 다시 인증이 필요합니다.');
    } finally {
      setIsVerifyingPhoneCode(false);
    }
  };

  const handleDisconnectPhoneWallet = () => {
    if (activeWallet) {
      disconnect(activeWallet);
    }

    resetPhoneAuthState();
    setConnectedPhoneNumber('');
    walletLoginSyncRef.current = '';
    setPhoneAuthError('');
    setIsDisconnectConfirmModalOpen(false);
    toast.success('지갑 연결을 해제했습니다.');
  };

  useEffect(() => {
    if (!smartAccount?.address) {
      setConnectedPhoneNumber('');
      walletLoginSyncRef.current = '';
      return;
    }

    let mounted = true;

    const syncThirdwebWalletLogin = async () => {
      const [phoneNumberResult, emailResult, profilesResult] = await Promise.allSettled([
        getUserPhoneNumber({ client }),
        getUserEmail({ client }),
        getProfiles({ client }),
      ]);

      const phoneNumber = phoneNumberResult.status === 'fulfilled'
        ? phoneNumberResult.value || ''
        : '';
      const email = emailResult.status === 'fulfilled'
        ? emailResult.value || ''
        : '';
      const linkedProfiles = profilesResult.status === 'fulfilled'
        ? profilesResult.value || []
        : [];

      if (phoneNumberResult.status === 'rejected') {
        console.error('Error fetching connected phone number:', phoneNumberResult.reason);
      }

      if (emailResult.status === 'rejected') {
        console.error('Error fetching connected email:', emailResult.reason);
      }

      if (profilesResult.status === 'rejected') {
        console.error('Error fetching thirdweb linked profiles:', profilesResult.reason);
      }

      if (mounted) {
        setConnectedPhoneNumber(phoneNumber);
      }

      const walletChain = activeWallet?.getChain?.();
      const activeWalletAddress = activeWallet?.getAccount?.()?.address || '';
      const adminWalletAddress = activeWallet?.getAdminAccount?.()?.address || '';
      const pageParams = Object.fromEntries(new URLSearchParams(queryString).entries());
      const loginSignature = JSON.stringify({
        storecode,
        walletAddress: smartAccount.address,
        phoneNumber,
        queryString,
      });

      if (walletLoginSyncRef.current === loginSignature) {
        return;
      }

      try {
        const response = await fetch('/api/user/logThirdwebWalletLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lang: params?.lang || '',
            pageClientId: params?.clientid || '',
            thirdwebClientId,
            storecode,
            storeUser: storeUser || '',
            memberId: memberid || '',
            requestedUserType,
            orderNumber: orderNumber || '',
            walletAddress: smartAccount.address,
            smartAccountAddress: smartAccount.address,
            adminWalletAddress,
            phoneNumber,
            email,
            walletId: activeWallet?.id || '',
            connectionMethod: 'phone',
            sponsorGas: smartAccountConnectConfig.sponsorGas,
            defaultSmsCountryCode: 'KR',
            pageParams,
            currentUrl: typeof window !== 'undefined' ? window.location.href : '',
            browser: {
              language: typeof navigator !== 'undefined' ? navigator.language : '',
              languages: typeof navigator !== 'undefined' ? navigator.languages : [],
              platform: typeof navigator !== 'undefined' ? navigator.platform : '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
              screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
              screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
              viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
              viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
            },
            thirdwebProfiles: serializeThirdwebValue(linkedProfiles),
            thirdwebClientSnapshot: serializeThirdwebValue({
              activeWalletId: activeWallet?.id || '',
              activeWalletAddress,
              adminWalletAddress,
              connectedEmail: email,
              connectedPhoneNumber: phoneNumber,
              linkedProfileCount: linkedProfiles.length,
              linkedProfiles,
              sponsorGas: smartAccountConnectConfig.sponsorGas,
              paymentChain,
              walletChain,
              walletConfig: activeWallet?.getConfig?.(),
              hasAuthToken: Boolean(activeWallet?.getAuthToken?.()),
              clientChain,
              authStrategy: 'phone',
              defaultSmsCountryCode: 'KR',
              hidePrivateKeyExport: true,
              smartAccountEnabled: true,
            }),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to log thirdweb wallet login: ${response.status}`);
        }

        walletLoginSyncRef.current = loginSignature;
      } catch (error) {
        console.error('Error logging thirdweb wallet login:', error);
      }
    };

    syncThirdwebWalletLogin();

    return () => {
      mounted = false;
    };
  }, [
    activeWallet,
    clientChain,
    memberid,
    orderNumber,
    params?.clientid,
    params?.lang,
    paymentChain,
    queryString,
    requestedUserType,
    smartAccount?.address,
    storeUser,
    storecode,
  ]);




    const [balance, setBalance] = useState(0);
    useEffect(() => {

      if (!address) {
        return;
      }
  
      // get the balance
      const getBalance = async () => {
        const result = await balanceOf({
          contract,
          address: address,
        });
    
        //console.log(result);
        if (clientChain === 'bsc') {
          setBalance( Number(result) / 10 ** 18 );
        } else {
          setBalance( Number(result) / 10 ** 6 );
        }
      };

      if (address) getBalance();
  
      const interval = setInterval(() => {
        if (address) getBalance();
      } , 1000);

      return () => clearInterval(interval);
  
    } , [address, contract, clientChain] );



    const [liveOnAndOff, setLiveOnAndOff] = useState(false);

    const [agentcode, setAgentcode] = useState<string>("");


    // fetch store info by storecode
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [loadingStoreInfo, setLoadingStoreInfo] = useState(true);
    useEffect(() => {
      const fetchStoreInfo = async () => {
        if (!storecode) {
          return;
        }

        setLoadingStoreInfo(true);
        const response = await fetch('/api/store/getOneStore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientid: params.clientid,
            storecode: storecode,
          }),
        });

        if (!response) {
          setLoadingStoreInfo(false);
          toast.error('가맹점 정보를 가져오는 데 실패했습니다.');
          return;
        }
  
        const data = await response?.json();
  
        //console.log('data', data);
  
        if (data.result) {
          setStoreInfo(data.result);

          setAgentcode(data.result.agentcode);

          data.result?.maxPaymentAmountKRW && setMaxKrwAmount(data.result?.maxPaymentAmountKRW);

          setLiveOnAndOff(data.result?.liveOnAndOff);
        }
  
        setLoadingStoreInfo(false);
      };
  
      fetchStoreInfo();

    }, [params.clientid, storecode]);





    // api/agent/getAgentUsdtKRWRate
    /*
    useEffect(() => {
      const fetchRate = async () => {
        const response = await fetch('/api/agent/getAgentUsdtKRWRate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientid: params.clientid,
            agentcode: agentcode,
          }),
        });

        const data = await response.json();
        if (data.result) {
          setRate(data.result);
        }
      };

      fetchRate();
    }, [agentcode, params.clientid]);
    */


    /*
    {
    "_id": "681b3cd4b6da3a9ffe0f7831",
    "storecode": "wmipqryz",
    "storeName": "비고비",
    "storeType": "test",
    "storeUrl": "https://test.com",
    "storeDescription": "설명입니다.",
    "storeLogo": "https://stable.makeup/logo.png",
    "storeBanner": "https://stable.makeup/logo.png",
    "createdAt": "2025-05-07T10:58:28.019Z"
    }
    */






    /*
    const [totalSummary, setTotalSummary] = useState<any>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
  
   
  
    useEffect(() => {
  
      const fetchTotalSummary = async () => {
  
        console.log('fetchTotalSummary=======>');
  
        try {
    
          setLoadingSummary(true);
          const response = await fetch('/api/summary/getTotalSummary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                //searchStore: searchStore,
              }
            ),
          });
  
  
  
  
          if (!response.ok) {
            setLoadingSummary(false);
            toast.error('Failed to fetch total summary');
            console.log('Failed to fetch total summary');
            return;
          }
          const data = await response.json();
          
          console.log('getStoreSummary data', data);
      
          setTotalSummary(data.result);
  
        } catch (error) {
          console.error('Error fetching total summary:', error);
          toast.error('Error fetching total summary');
        } finally {
      
          setLoadingSummary(false);
  
        }
    
      }
  
      fetchTotalSummary();
  
      // interval
      const interval = setInterval(() => {
        fetchTotalSummary();
      }, 10000);
      return () => clearInterval(interval);
  
  
      
    }, []);

    */




    const [maxKrwAmount, setMaxKrwAmount] = useState(3000000);

    const [nickname, setNickname] = useState(storeUser);

    const [inputNickname, setInputNickname] = useState('');


   // select krw amount (10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000)

   const [krwAmounts, setKrwAmounts] = useState([10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000]);
   // select one of krw amount

   const [selectedKrwAmount, setSelectedKrwAmount] = useState(0);


   useEffect(() => {
      if (paramDepositAmountKrw) {
        setSelectedKrwAmount(Number(paramDepositAmountKrw));

        // if paramDepositAmountKrw > maxKrwAmount, then setSelectedKrwAmount(maxKrwAmount)
        if (Number(paramDepositAmountKrw) > maxKrwAmount) {
          setSelectedKrwAmount(maxKrwAmount);
        }

      } else {
        setSelectedKrwAmount(0);
      }
   }, [paramDepositAmountKrw, maxKrwAmount]);



 



   const [depositName, setDepositName] = useState(
     ////randomDepositName[Math.floor(Math.random() * randomDepositName.length)]
     paramDepositName
   );

   const [depositBankName, setDepositBankName] = useState(
     //koreanBankName[Math.floor(Math.random() * koreanBankName.length)]
     paramDepositBankName
   );

   const [depositBankAccountNumber, setDepositBankAccountNumber] = useState(
     paramDepositBankAccountNumber
   );

   const [depositAmountKrw, setDepositAmountKrw] = useState(
      paramDepositAmountKrw
    );



    const [loadingUser, setLoadingUser] = useState(false);
    const [user, setUser] = useState<any>(null);


   /*
    const fetchWalletAddress = async (
      paramNickname: string
    ) => {

      if (nickname) {
        return;
      }


      const mobile = '010-1234-5678';


      const response = await fetch('/api/user/setUserWithoutWalletAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storecode: storecode,
          nickname: paramNickname,
          mobile: mobile,
        }),
      });
  
      const data = await response?.json();
  
      console.log('setUserWithoutWalletAddress data', data);

      if (!data.walletAddress) {

        toast.error('User registration has been failed');
        return;
      }

      const walletAddress = data.walletAddress;

      if (!smartAccount?.address && walletAddress) {
        setAddress(walletAddress);
      }

      setNickname(paramNickname);


    }
    */

 

    // user walletAddress is auto generated or not
    const [isMyWalletAddress, setIsMyWalletAddress] = useState(false);
    const [userPassword, setUserPassword] = useState('');

    
    useEffect(() => {

      const fetchWalletAddress = async ( ) => {
        if (
          !storecode ||
          !storeUser ||
          !depositName ||
          !depositBankName ||
          !depositBankAccountNumber
        ) {
          return;
        }

        setLoadingUser(true);
  
        const mobile = '010-1234-5678';
  
        /*
        const response = await fetch('/api/user/setUserWithoutWalletAddress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storecode: storecode,
            nickname: nickname,
            mobile: mobile,
          }),
        });
        */

        try {
          const response = await fetch('/api/user/setBuyerWithoutWalletAddressByStorecode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                clientid: params.clientid,
                storecode: storecode,
                
                userCode: storeUser,
                mobile: mobile,
      
                userName: depositName,
                userBankName: depositBankName,
                userBankAccountNumber: depositBankAccountNumber,
                userType: requestedUserType,
              }
            ),
          });

          const data = await response.json().catch(() => null);

          if (!response.ok || !data?.walletAddress) {
            console.error('setBuyerWithoutWalletAddressByStorecode failed', {
              status: response.status,
              data,
            });
            toast.error('회원등록에 실패했습니다.');
            return;
          }

          if (data.walletAddress) {
            setAddress(data.walletAddress);
          }

          setUser({
            storecode: storecode,
            walletAddress: data.walletAddress,
            nickname: storeUser,
            avatar: '',
            mobile: mobile,

            buyOrderStatus: data.buyOrderStatus,

            userType: data.userType || requestedUserType,

            liveOnAndOff: data.liveOnAndOff,
          });

          const responseGetOneBuyOrder = await fetch('/api/order/getOneBuyOrderByNicknameAndStorecode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lang: params.lang,
              clientid: params.clientid,
              storecode: storecode,
              nickname: storeUser,
            })
          });

          const dataGetBuyOrder = await responseGetOneBuyOrder
            .json()
            .catch(() => null);

          if (!responseGetOneBuyOrder.ok) {
            console.error('getOneBuyOrderByNicknameAndStorecode failed', {
              status: responseGetOneBuyOrder.status,
              data: dataGetBuyOrder,
            });
            return;
          }

          if (dataGetBuyOrder?.result) {
            const order = dataGetBuyOrder.result;

            router.push(buildReverseOrderUrl({
              lang: params.lang,
              clientid: params.clientid,
              storecode,
              orderId: order._id,
              orderNumber,
              userType: requestedUserType,
            }));
            return;
          }
        } catch (error) {
          console.error('fetchWalletAddress failed', error);
          toast.error('회원정보를 불러오는 데 실패했습니다.');
        } finally {
          setLoadingUser(false);
        }
      }
  

      if (isMyWalletAddress === false) {

        fetchWalletAddress();
        
      }


    } , [isMyWalletAddress,
      params.lang,
      params.clientid,
      storecode, storeUser, depositName, depositBankName, depositBankAccountNumber, orderNumber, requestedUserType, router, smartAccount?.address]);
    


    ///console.log('isMyWalletAddress', isMyWalletAddress);









 
    /*
    const [sellOrders, setSellOrders] = useState<SellOrder[]>([]);


    useEffect(() => {

        if (!orderId) {
          return;
        }
        
        const fetchSellOrders = async () => {





          // api call
          const response = await fetch('/api/order/getOneSellOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderId,
            })
          });
  
          const data = await response?.json();
  
          console.log('getOneSellOrder data', data);
  
          if (data.result) {

            if (data.result.orders.length > 0) {

              setSellOrders(data.result.orders);

              if (!smartAccount?.address && data.result.orders[0].buyer.walletAddress) {
                setAddress(data.result.orders[0].buyer.walletAddress);
              }

              ////setNickname(data.result.orders[0].buyer.nickname);
            }


          }
  
        };
  
        fetchSellOrders();



        
        const interval = setInterval(() => {

          fetchSellOrders();
        }, 10000);
        
        return () => clearInterval(interval);
        
  
    }, [orderId]);
    */




      /*
    // array of escrowing
    const [escrowing, setEscrowing] = useState([] as boolean[]);

    useEffect(() => {
        
        setEscrowing(
          new Array(sellOrders.length).fill(false)
        );
  
    } , [sellOrders]);





    // array of requestingPayment
    const [requestingPayment, setRequestingPayment] = useState([] as boolean[]);

    useEffect(() => {

      setRequestingPayment(
        
        sellOrders.map((item) => {
          
          if (item.status === 'paymentRequested') {
            return true;
          }
          return false;
        } )

      );

    } , [sellOrders]);
    */







    const [isModalOpen, setModalOpen] = useState(false);

    const closeModal = () => setModalOpen(false);
    const openModal = () => setModalOpen(true);





    const [usdtAmount, setUsdtAmount] = useState(0);

    const [defaultKrWAmount, setDefaultKrwAmount] = useState(0);

    const [krwAmount, setKrwAmount] = useState(
      krwAmounts[0]
    );

    ///console.log('usdtAmount', usdtAmount);








    useEffect(() => {

      if (usdtAmount === 0) {

        setDefaultKrwAmount(0);

        setKrwAmount(0);

        return;
      }
    
        
      setDefaultKrwAmount( Math.round(usdtAmount * rate) );


      setKrwAmount( Math.round(usdtAmount * rate) );

    } , [usdtAmount, rate]);








    /* agreement for trade */
    /*
    const [agreementForTrade, setAgreementForTrade] = useState([] as boolean[]);
    useEffect(() => {
        setAgreementForTrade (
            sellOrders.map((item, idx) => {
                return false;
            })
        );
    } , [sellOrders]);

    const [acceptingSellOrder, setAcceptingSellOrder] = useState([] as boolean[]);

    useEffect(() => {
        setAcceptingSellOrder (
            sellOrders.map((item, idx) => {
                return false;
            })
        );
    } , [sellOrders]);


    // request payment check box
    const [requestPaymentCheck, setRequestPaymentCheck] = useState([] as boolean[]);
    useEffect(() => {
        
        setRequestPaymentCheck(
          new Array(sellOrders.length).fill(false)
        );
  
    } , [sellOrders]);





    const acceptSellOrder = (index: number, orderId: string) => {

        if (!user) {
            return;
        }

        setAcceptingSellOrder (
            sellOrders.map((item, idx) => {
                if (idx === index) {
                    return true;
                } else {
                    return false;
                }
            })
        );


        fetch('/api/order/acceptSellOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lang: params.lang,
                storecode: storecode,
                orderId: orderId,
                buyerWalletAddress: user.walletAddress,
                buyerNickname: user.nickname,
                buyerAvatar: user.avatar,
                buyerMobile: user.mobile,
            }),
        })
        .then(response => response?.json())
        .then(data => {

            console.log('data', data);

            //setSellOrders(data.result.orders);
            //openModal();

            toast.success(Order_accepted_successfully);


            // reouter to

            router.push('/' + params.lang + '/' + storecode + '/pay-usdt/' + orderId);




        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            setAcceptingSellOrder (
                sellOrders.map((item, idx) => {
                    return false;
                })
            );
        } );


    }

    */


    /*
    const requestPayment = async (
      index: number,
      orderId: string,
      tradeId: string,
      amount: number,
    ) => {
      // check balance
      // send payment request

      if (balance < amount) {
        toast.error('Insufficient balance');
        return;
      }

      if (escrowing[index]) {
        toast.error('Escrowing');
        return;
      }


      if (requestingPayment[index]) {
        toast.error('Requesting payment');
        return;
      }



      setEscrowing(
        escrowing.map((item, idx) => {
          if (idx === index) {
            return true;
          }
          return item;
        })
      );

   


      // send USDT
      // Call the extension function to prepare the transaction
      const transaction = transfer({
        contract,
        to: recipientWalletAddress,
        amount: amount,
      });
      


      try {


        const transactionResult = await sendAndConfirmTransaction({
            transaction: transaction,
            
            account: smartAccount as any,
        });

        console.log("transactionResult===", transactionResult);


        setEscrowing(
          escrowing.map((item, idx) => {
            if (idx === index) {
              return false;
            }
            return item;
          })
        );



        // send payment request

        if (transactionResult) {


        
          const response = await fetch('/api/order/requestPayment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              lang: params.lang,
              storecode: storecode,
              orderId: orderId,
              transactionHash: transactionResult.transactionHash,
            })
          });

          const data = await response?.json();

          console.log('/api/order/requestPayment data====', data);


          if (data.result) {

            const response = await fetch('/api/order/getOneSellOrder', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: orderId,
              })
            });
    
            const data = await response?.json();
    
            ///console.log('data', data);
    
            if (data.result) {
              setSellOrders(data.result.orders);
            }
            


            // refresh balance

            const result = await balanceOf({
              contract,
              address: address,
            });

            //console.log(result);

            setBalance( Number(result) / 10 ** 6 );


            toast.success('Payment request has been sent');
          } else {
            toast.error('Payment request has been failed');
          }

        }


      } catch (error) {
        console.error('Error:', error);

        toast.error('Payment request has been failed');

        setEscrowing(
          escrowing.map((item, idx) => {
            if (idx === index) {
              return false;
            }
            return item;
          })
        );


      }


      

    }
    */









    /*
    const [privateSale, setprivateSale] = useState(false);


    const [sellOrdering, setSellOrdering] = useState(false);

    const sellOrder = async () => {
      // api call
      // set sell order

      if (sellOrdering) {
        return;
      }

      setSellOrdering(true);

      const response = await fetch('/api/order/setSellOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({

          walletAddress: address,
          usdtAmount: usdtAmount,
          krwAmount: krwAmount,
          rate: rate,
          privateSale: privateSale,
        })
      });

      const data = await response?.json();

      //console.log('data', data);

      if (data.result) {
        toast.success('Sell order has been created');

        setUsdtAmount(0);
        setprivateSale(false);
     


        await fetch('/api/order/getOneSellOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            walletAddress: address
          })
        }).then(async (response) => {
          const data = await response?.json();
          //console.log('data', data);
          if (data.result) {
            setSellOrders(data.result.orders);
          }
        });




      } else {
        toast.error('Sell order has been failed');
      }

      setSellOrdering(false);

      

    };

    */





  // array of confirmingPayment
  /*

  const [confirmingPayment, setConfirmingPayment] = useState([] as boolean[]);

  useEffect(() => {
      
      setConfirmingPayment(
        new Array(sellOrders.length).fill(false)
      );

  } , [sellOrders]);



  // confirm payment check box
  const [confirmPaymentCheck, setConfirmPaymentCheck] = useState([] as boolean[]);
  useEffect(() => {
      
      setConfirmPaymentCheck(
        new Array(sellOrders.length).fill(false)
      );

  } , [sellOrders]);



  const confirmPayment = async (

    index: number,
    orderId: string,

  ) => {
    // confirm payment
    // send usdt to buyer wallet address

    if (confirmingPayment[index]) {
      return;
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) => {
        if (idx === index) {
          return true;
        }
        return item;
      })
    );




    const response = await fetch('/api/order/confirmPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: params.lang,
        storecode: storecode,
        orderId: orderId,
      })
    });

    const data = await response?.json();

    //console.log('data', data);

    if (data.result) {

      const response = await fetch('/api/order/getOneSellOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
        })
      });

      const data = await response?.json();

      ///console.log('data', data);

      if (data.result) {
        setSellOrders(data.result.orders);
      }

      toast.success('Payment has been confirmed');
    } else {
      toast.error('Payment has been failed');
    }

    setConfirmingPayment(
      confirmingPayment.map((item, idx) => {
        if (idx === index) {
          return false;
        }
        return item;
      })
    );



  }
  */


  // api setUserWithoutWalletAddress
  /*
  const setUserWithoutWalletAddress = async () => {

    ///////const nickname = prompt('Enter your nickname');

    if (!nickname) {

      toast.error('Please enter your nickname for temporary user');
      return;
    }

    const mobile = '010-1234-5678';
    

    const response = await fetch('/api/user/setUserWithoutWalletAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientid: params.clientid,
        storecode: storecode,
        nickname: nickname,
        mobile: mobile,
      }),
    });

    const data = await response?.json();

    console.log('setUserWithoutWalletAddress data.walletAddress', data.walletAddress);

    if (data.walletAddress) {

      //setAddress(data.result);

      ////setUser(data.result);
      
      //window.location.reload();

      if (!smartAccount?.address && data.walletAddress) {
        setAddress(data.walletAddress);
      }


    } else {
      toast.error('User registration has been failed');
    }


  }
  */



  
  const [acceptingSellOrderRandom, setAcceptingSellOrderRandom] = useState(false);


  const acceptSellOrderRandom = async (
    krwAmount: number,
    depositName: string,
    depositBankName: string,
    depositBankAccountNumber: string,
  ) => {
    const buyerWalletAddress = user?.walletAddress || address;
    const buyerNickname = user?.nickname || nickname || storeUser || '';

    
    //console.log('acceptSellOrderRandom depositName', depositName);
    //console.log('acceptSellOrderRandom depositBankName', depositBankName);

    if (acceptingSellOrderRandom) {
      return;
    }

    if (!buyerWalletAddress) {
      toast.error('회원 지갑 정보를 다시 불러와 주세요.');
      return;
    }

    setAcceptingSellOrderRandom(true);




    // fectch sell order and accept one of them
    
    const responseGetAllSellOrders = await fetch('/api/order/getAllSellOrders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lang: params.lang,
        storecode: storecode,
      })
    });

    const dataGetAllSellOrders = await responseGetAllSellOrders.json();

    ///console.log('acceptSellOrderRandom dataGetAllSellOrders', dataGetAllSellOrders);

    //console.log('acceptSellOrderRandom krwAmount', krwAmount);


    if (dataGetAllSellOrders.result) {

      // find one of sell order which is krwAmount is selectedKrwAmount and status is ordered
      

      const order = dataGetAllSellOrders.result.orders.find((item: any) => {
        return item.krwAmount === krwAmount && item.status === 'ordered';
      });

      if (order) {
        const auditContext = await createPaymentAuditContext(
          buyerWalletAddress,
          'payment_page_match_order',
        );


        // accept sell order

        const response = await fetch('/api/order/acceptSellOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: storecode,
            
            orderId: order._id,

            buyerWalletAddress,
            buyerNickname,
            buyerAvatar: '',
            buyerMobile: '010-1234-5678',
            depositName: depositName,
            depositBankName: depositBankName,
            depositBankAccountNumber: depositBankAccountNumber,
            auditContext,
          }),
        });

        const data = await response?.json();

        if (data.result) {
          toast.success("판매 주문이 수락되었습니다");

          //router.push('/' + params.lang + '/' + storecode + '/pay-usdt/' + order._id);

        } else {
          toast.error('판매 주문 수락에 실패했습니다');
        }



        //setSellOrders([order]);
      } else {

        
        ///toast.error('Sell order not found');

        // if sell order not found, create buy order

        const usdtAmount =  parseFloat((krwAmount / rate).toFixed(2));

        console.log('usdtAmount', usdtAmount);
        const auditContext = await createPaymentAuditContext(
          buyerWalletAddress,
          'payment_page_create_order',
        );


        const response = await fetch('/api/order/setBuyOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            clientid: params.clientid,
            storecode: storecode,
            walletAddress: buyerWalletAddress,
            nickname: buyerNickname,
            usdtAmount: usdtAmount,
            krwAmount: krwAmount,
            rate: rate,
            privateSale: false,
            buyer: {
              depositBankName: depositBankName,
              depositBankAccountNumber: depositBankAccountNumber,
              depositName: depositName,
            },
            returnUrl: paramReturnUrl,
            orderNumber: orderNumber,
            auditContext,
          })
        });

        const data = await response.json();

        ///console.log('setBuyOrder data.result', data.result);



        if (data.result) {
          toast.success('구매 주문이 생성되었습니다');

          const order = data.result;

          router.push(buildReverseOrderUrl({
            lang: params.lang,
            clientid: params.clientid,
            storecode,
            orderId: order._id,
            orderNumber,
            userType: requestedUserType,
          }));

        } else {
          toast.error('구매 주문에 실패했습니다');
        }

      }


    } else {
      toast.error('Sell order not found');
    }

    setAcceptingSellOrderRandom(false);

  }






  /*
  const [storeCodeNumber, setStoreCodeNumber] = useState('');

  useEffect(() => {

    const fetchStoreCode = async () => {

      const response = await fetch('/api/order/getStoreCodeNumber', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      //console.log('data', data);

      setStoreCodeNumber(data?.storeCodeNumber);

    }

    fetchStoreCode();

  } , []);
  */



  /*
  // /api/order/getAllBuyOrders
  // my buyOrders
  const [buyOrders, setBuyOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingBuyOrders, setLoadingBuyOrders] = useState(false);
  useEffect(() => {

    const fetchBuyOrders = async () => {
      setLoadingBuyOrders(true);

      const response = await fetch('/api/order/getAllBuyOrders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            storecode: params.center,
            //limit: Number(limitValue),
            //page: Number(pageValue),
            walletAddress: address,
            searchMyOrders: true,

            //searchOrderStatusCancelled: searchOrderStatusCancelled,
            //searchOrderStatusCompleted: searchOrderStatusCompleted,

            //searchStoreName: searchStoreName,


            //searchBuyer: searchBuyer,
            //searchDepositName: searchDepositName,

            //searchStoreBankAccountNumber: searchStoreBankAccountNumber,


            //fromDate: searchFromDate,
            //toDate: searchToDate,



        })

      });

      if (response.ok) {
        const data = await response.json();

        console.log('getAllBuyOrders data', data);

        setBuyOrders(data.result.orders);

        setTotalCount(data.result.totalCount);
        
      }

      setLoadingBuyOrders(false);
    }

    fetchBuyOrders();


  }, [address, params.center]);

  */

















  



  if (orderId !== '0') {
      
      return (
        <div>
          Order not found
        </div>
      );

    }



  if (orderId === '0' && !storeUser) {
    return (
      <div>
        Store user not found
      </div>
    );
  }


  /*
  if (orderId === '0' && storeCodeNumber && storecode !== storeCodeNumber) {
    return (
      <div>
        Store code is invalid
      </div>
    );
  }
    */
  

  if (orderId === '0' && !paramDepositName) {
    return (
      <div>
        Deposit name is invalid
      </div>
    );
  }

  if (orderId === '0' && !paramDepositBankName) {
    return (
      <div>
        Deposit bank name is invalid
      </div>
    );
  }




  

  // CS: georgia(9ed089930921bfaa1bf65aff9a75fc41), center: 라이징(crluonsn)

  if (orderId === '0'
    && storeInfo?.accessToken
    && storeInfo?.accessToken !== paramAccessToken) {

    return (
      <div className="w-full h-screen flex items-center justify-center
      flex-col
      bg-zinc-50
      text-zinc-500
      ">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Access token is invalid</p>
      </div>
    );

  }

  // liveOnAndOff is not true
  // 차단되었습니다. 고객센터에 문의하세요.
  if (orderId === '0'
    && user?.liveOnAndOff === false ) {

    return (
      <div className="w-full h-screen flex items-center justify-center
      flex-col
      bg-zinc-50
      text-zinc-500
      ">
        <h1 className="text-2xl font-bold mb-4">차단되었습니다.</h1>
        <p>고객센터에 문의하세요.</p>
        <p className="mt-4 text-sm text-zinc-400">
          (liveOnAndOff: {String(user?.liveOnAndOff)})
        </p>
      </div>
    );

  }


    if (orderId === '0'
    && !loadingUser && !user?.nickname ) {

    return (
      <div className="w-full h-screen flex items-center justify-center
      flex-col
      bg-zinc-50
      text-zinc-500
      ">
        <h1 className="text-2xl font-bold mb-4">차단되었습니다.</h1>
        <p>고객센터에 문의하세요.</p>
        <p className="mt-4 text-sm text-zinc-400">
          (user nickname not found)
        </p>
      </div>
    );

  }


  // check storeInfo
  /*
  if (loadingStoreInfo) {
    return (
      <div className="w-full h-screen flex items-center justify-center">

        <div className='flex flex-col items-center justify-center gap-2'>

          <Image
            src="/banner-loading.gif"
            alt="Loading"
            width={200}
            height={200}
            className="w-32 h-32"
          />
          <div className="text-sm text-zinc-500">
            가맹점 정보를 불러오는 중입니다...
          </div>
        </div>
      </div>
    );
  }
  */

  const providerName = clientInfo?.clientInfo?.name || storeInfo?.storeName || 'CrypToss';
  const storeName = storeInfo?.storeName || providerName;
  const storeDescription =
    storeInfo?.storeDescription ||
    '실시간 시세와 사전 등록된 입금자 정보로 안전하게 결제를 진행합니다.';
  const brandTheme = derivePaymentBrandTheme({
    backgroundColor: storeInfo?.backgroundColor,
    seed: [params.clientid, storecode, storeName].filter(Boolean).join(':'),
  });
  const brandStyles = {
    '--brand-base': brandTheme.base,
    '--brand-base-contrast': brandTheme.baseContrast,
    '--brand-base-dark': brandTheme.baseDark,
    '--brand-page-bg': brandTheme.pageBg,
    '--brand-page-bg-alt': brandTheme.pageBgAlt,
    '--brand-page-tint': brandTheme.pageTint,
    '--brand-page-mist': brandTheme.pageMist,
    '--brand-glow-a': brandTheme.glowA,
    '--brand-glow-b': brandTheme.glowB,
    '--brand-shell-from': brandTheme.shellFrom,
    '--brand-shell-via': brandTheme.shellVia,
    '--brand-shell-to': brandTheme.shellTo,
    '--brand-shell-border': brandTheme.shellBorder,
    '--brand-card-bg': brandTheme.cardBg,
    '--brand-card-muted': brandTheme.cardMutedBg,
    '--brand-card-border': brandTheme.cardBorder,
    '--brand-badge-bg': brandTheme.badgeBg,
    '--brand-badge-text': brandTheme.badgeText,
    '--brand-accent-soft': brandTheme.accentSoft,
    '--brand-accent-text': brandTheme.accentText,
    '--brand-button-shadow': brandTheme.buttonShadow,
    '--brand-panel-shadow': brandTheme.panelShadow,
  } as CSSProperties;


  if (!loadingStoreInfo && !storeInfo) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Image
            src="/banner-404.gif"
            alt="Error"
            width={200}
            height={200}
            className="w-32 h-32"
          />
          <div className="text-sm text-zinc-500">
            가맹점 정보를 찾을 수 없습니다.
          </div>
        </div>
      </div>
    );
  }


  {/* banner-under-maintenance.png */}
  if (!loadingStoreInfo && storeInfo && !liveOnAndOff) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center
      flex-col
      text-zinc-600
      "
        style={{ backgroundColor: brandTheme.pageBg }}
      >
        {/* storeInfo.storeName */}
        <div
          className='flex flex-col items-center justify-center gap-2 mb-4 rounded-[24px] border px-6 py-5 shadow-sm'
          style={{
            backgroundColor: brandTheme.cardBg,
            borderColor: brandTheme.cardBorder,
            boxShadow: `0 18px 48px ${brandTheme.panelShadow}`,
          }}
        >
          <Image
            src={storeInfo?.storeLogo || '/logo.png'}
            alt="Store Logo"
            width={64}
            height={64}
            className='rounded-full w-16 h-16 border bg-white object-cover'
            style={{ borderColor: brandTheme.cardBorder }}
          />
          <span
            className="text-lg font-semibold"
            style={{ color: brandTheme.baseDark }}
          >
            {storeName}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{
              backgroundColor: brandTheme.badgeBg,
              color: brandTheme.badgeText,
            }}
          >
            Merchant Maintenance
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-4">시스템 점검중</h1>
        <p>현재 시스템 점검중입니다. 불편을 드려 죄송합니다.</p>
        <Image
          src="/banner-under-maintenance.png"
          alt="Under Maintenance"
          width={400}
          height={400}
          className="mt-4"
        />
      </div>
    );
  }

  const quickAmountOptions = [5000, 10000, 50000, 100000, 500000, 1000000];
  const isOrderInProgress =
    user?.buyOrderStatus === 'ordered' || user?.buyOrderStatus === 'paymentRequested';
  const tradeWalletAddress = user?.walletAddress || address;
  const isPurchaseDisabled =
    !tradeWalletAddress || !user || !selectedKrwAmount || acceptingSellOrderRandom;
  const formattedBalance = Number(balance).toFixed(2);
  const formattedEstimatedUsdt =
    rate > 0
      ? Number(selectedKrwAmount / rate)
          .toFixed(3)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : '0.000';
  const maskedWalletAddress = tradeWalletAddress
    ? `${tradeWalletAddress.slice(0, 6)}...${tradeWalletAddress.slice(-4)}`
    : '자동 연결 대기';
  const maskedDepositAccountNumber = depositBankAccountNumber
    ? depositBankAccountNumber.length > 8
      ? `${depositBankAccountNumber.slice(0, 4)}****${depositBankAccountNumber.slice(-4)}`
      : depositBankAccountNumber
    : '사전 등록 계좌 없음';



  return (
      <main
        className="relative min-h-[100vh] overflow-hidden bg-[var(--brand-page-bg)] text-slate-900"
        style={brandStyles}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[var(--brand-page-tint)] via-[var(--brand-page-mist)] to-transparent" />
        <div className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-[var(--brand-glow-a)] opacity-90 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-40 h-56 w-56 rounded-full bg-[var(--brand-glow-b)] opacity-90 blur-3xl" />

        <div className="relative z-10 mx-auto flex w-full max-w-screen-sm flex-col gap-3 px-3 pb-8 pt-3 sm:px-4">
          <section
            className="overflow-hidden rounded-[24px] border p-4"
            style={{
              borderColor: 'var(--brand-shell-border)',
              background: 'linear-gradient(135deg, var(--brand-page-mist), var(--brand-page-tint), var(--brand-page-bg-alt))',
              boxShadow: `0 18px 56px ${brandTheme.panelShadow}`,
            }}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Image
                  src={storeInfo?.storeLogo || '/logo.png'}
                  alt="Store Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-[18px] border bg-white object-cover shadow-sm"
                  style={{ borderColor: 'var(--brand-card-border)' }}
                />
                <div className="min-w-0">
                  <div
                    className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{
                      borderColor: 'var(--brand-card-border)',
                      backgroundColor: 'var(--brand-card-bg)',
                      color: 'var(--brand-accent-text)',
                    }}
                  >
                    Secure Payment
                  </div>
                  <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                    {storeName}
                  </h1>
                  <p className="mt-0.5 text-[13px] leading-5 text-slate-600">
                    {storeDescription}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{
                        backgroundColor: 'var(--brand-badge-bg)',
                        color: 'var(--brand-badge-text)',
                      }}
                    >
                      {storecode || params.center}
                    </span>
                    <span className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                      {providerName}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="shrink-0 rounded-[18px] border px-2.5 py-2 text-right shadow-sm"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-bg)',
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  Status
                </div>
                <div className="mt-0.5 text-xs font-semibold text-slate-700">
                  {loadingStoreInfo ? 'Loading' : 'Ready'}
                </div>
              </div>
            </div>

            <div
              className="mt-3 rounded-[20px] border p-2.5"
              style={{
                borderColor: 'var(--brand-card-border)',
                backgroundColor: 'var(--brand-card-bg)',
                boxShadow: `0 12px 28px ${brandTheme.panelShadow}`,
              }}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em]"
                    style={{
                      backgroundColor: 'var(--brand-badge-bg)',
                      color: 'var(--brand-badge-text)',
                    }}
                  >
                    <Image
                      src="/icon-shield.png"
                      alt="Shield"
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                    SAFE
                  </div>
                  <div className="mt-2 text-[16px] font-semibold tracking-tight text-slate-900">
                    안전 결제를 위해
                    <br />
                    휴대폰으로 연결해 주세요
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-600">
                    고객 자산 보호를 위한 본인 확인 절차입니다.
                  </div>
                </div>

                <div
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    hasConnectedSmartWallet ? '' : 'bg-[#f1f5f9] text-slate-600'
                  }`}
                  style={hasConnectedSmartWallet
                    ? {
                        backgroundColor: 'var(--brand-badge-bg)',
                        color: 'var(--brand-badge-text)',
                      }
                    : undefined}
                >
                  {hasConnectedSmartWallet ? '확인 완료' : '휴대폰 확인'}
                </div>
              </div>

              <div className="mt-2.5">
                {hasConnectedSmartWallet ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={openDisconnectConfirmModal}
                      className="flex min-h-[52px] w-full items-center justify-center rounded-[18px] border border-rose-200 bg-rose-50 px-4 text-[14px] font-semibold text-rose-600 shadow-[0_8px_16px_rgba(244,63,94,0.10)] transition hover:bg-rose-100"
                    >
                      지갑 연결 해제
                    </button>
                  </div>
                ) : isAutoConnecting ? (
                  <button
                    type="button"
                    disabled
                    className="flex min-h-[52px] w-full items-center justify-center rounded-[18px] border border-slate-200 bg-slate-100 px-4 text-[14px] font-semibold text-slate-500"
                  >
                    지갑 세션 확인 중...
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openPhoneAuthModal}
                    className="flex min-h-[52px] w-full items-center justify-center rounded-[18px] border px-4 text-[14px] font-semibold transition hover:brightness-95"
                    style={{
                      borderColor: 'var(--brand-shell-border)',
                      backgroundColor: 'var(--brand-base)',
                      color: 'var(--brand-base-contrast)',
                      boxShadow: `0 10px 18px ${brandTheme.buttonShadow}`,
                    }}
                  >
                    휴대폰으로 연결
                  </button>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <div
                  className="rounded-full border px-3 py-1.5 text-[11px] font-medium"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-card-muted)',
                    color: 'var(--brand-accent-text)',
                  }}
                >
                  개인 자산 보호
                </div>
                <div
                  className="rounded-full border px-3 py-1.5 text-[11px] font-medium"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-card-muted)',
                    color: 'var(--brand-accent-text)',
                  }}
                >
                  +82 기본 설정
                </div>
              </div>

              {hasConnectedSmartWallet && (
                <div
                  className="mt-2 rounded-[16px] border px-3 py-2.5 text-sm text-slate-700"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-accent-soft)',
                  }}
                >
                  <div className="font-semibold text-slate-900">
                    {connectedPhoneNumber || '휴대폰 본인 확인 완료'}
                  </div>
                  <div className="mt-1 break-all text-[11px] text-slate-500">
                    {connectedSmartWalletAddress}
                  </div>
                </div>
              )}
            </div>

            {loadingStoreInfo ? (
              <div
                className="mt-3 flex items-center gap-2.5 rounded-[18px] border border-dashed px-3 py-3 text-sm text-slate-500"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-bg)',
                }}
              >
                <Image
                  src="/loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="animate-spin"
                />
                가맹점 정보를 불러오는 중입니다.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div
                  className="rounded-[18px] border p-3 shadow-sm"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-card-bg)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Estimated
                  </div>
                  <div className="mt-1.5 flex items-end gap-1">
                    <span className="text-xl font-semibold tracking-tight text-slate-900">
                      {formattedEstimatedUsdt}
                    </span>
                    <span className="pb-0.5 text-[11px] font-medium text-slate-500">USDT</span>
                  </div>
                </div>
                <div
                  className="rounded-[18px] border p-3 shadow-sm"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-card-bg)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Rate
                  </div>
                  <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
                    {rate?.toLocaleString('ko-KR')}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">KRW / USDT</div>
                </div>
                <div
                  className="rounded-[18px] border p-3 shadow-sm"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-card-bg)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Limit
                  </div>
                  <div className="mt-1.5 text-base font-semibold tracking-tight text-slate-900">
                    {maxKrwAmount?.toLocaleString('ko-KR')}원
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">1회 결제 최대 금액</div>
                </div>
                <div
                  className="rounded-[18px] border p-3 shadow-sm"
                  style={{
                    borderColor: 'var(--brand-card-border)',
                    backgroundColor: 'var(--brand-card-bg)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    Wallet
                  </div>
                  <div className="mt-1.5 text-xs font-semibold text-slate-900">
                    {tradeWalletAddress ? '준비 완료' : '준비 대기'}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{maskedWalletAddress}</div>
                </div>
              </div>
            )}

            {!loadingUser && user && (
              <div
                className="mt-4 rounded-[20px] border p-3 shadow-sm backdrop-blur-sm"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-bg)',
                }}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Account
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-900">
                      {memberid ? memberid : user?.nickname}
                    </div>
                    <button
                      onClick={() => {
                        if (!tradeWalletAddress) {
                          return;
                        }

                        navigator.clipboard.writeText(tradeWalletAddress);
                        toast.success("USDT지갑주소가 복사되었습니다.");
                      }}
                      className="mt-1.5 text-xs text-slate-600 underline underline-offset-4"
                    >
                      {maskedWalletAddress}
                    </button>
                  </div>

                  <div
                    className="rounded-[18px] px-3 py-2.5 text-right shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-shell-from), var(--brand-shell-via), var(--brand-shell-to))',
                      color: 'var(--brand-base-contrast)',
                      boxShadow: `0 12px 32px ${brandTheme.buttonShadow}`,
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/70">
                      Balance
                    </div>
                    <div className="mt-0.5 text-xl font-semibold tracking-tight">
                      {formattedBalance}
                    </div>
                    <div className="text-[11px] text-white/70">USDT</div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section
            className="overflow-hidden rounded-[20px] border px-3 py-2.5 backdrop-blur-sm"
            style={{
              borderColor: 'var(--brand-card-border)',
              backgroundColor: 'var(--brand-card-bg)',
              boxShadow: `0 14px 36px ${brandTheme.panelShadow}`,
            }}
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  Market Feed
                </div>
                <div className="text-xs font-semibold text-slate-800">USDT 주요 시세</div>
              </div>
              <a
                href="https://upbit.com/exchange?code=CRIX.UPBIT.KRW-USDT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                  color: 'var(--brand-accent-text)',
                }}
              >
                <Image
                  src="/logo-upbit.jpg"
                  alt="upbit"
                  width={20}
                  height={20}
                  className="h-4 w-4 rounded-full"
                />
                Upbit KRW-USDT
              </a>
            </div>

            <div
              className="binance-widget-marquee min-h-[38px] w-full"
              data-cmc-ids="1,1027,52,5426,3408,74,20947,5994,24478,13502,35336,825"
              data-theme="light"
              data-transparent="true"
              data-locale="ko"
              data-fiat="KRW"
            ></div>
          </section>

          <section
            className="overflow-hidden rounded-[24px] border p-3 backdrop-blur-sm sm:p-4"
            style={{
              borderColor: 'var(--brand-card-border)',
              backgroundColor: 'var(--brand-card-bg)',
              boxShadow: `0 16px 48px ${brandTheme.panelShadow}`,
            }}
          >

  





            {!address && (
              <div
                className="mb-3 rounded-[18px] border px-3 py-3 text-sm leading-5 text-slate-600"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{ color: 'var(--brand-badge-text)' }}
                >
                  Wallet Notice
                </div>
                <div className="mt-2 font-medium text-slate-800">
                  {You_must_have_a_wallet_address_to_buy_USDT}
                </div>
                <div className="mt-1 text-slate-500">
                  지갑 주소가 연결되면 등록된 입금자 정보로 바로 결제를 진행할 수 있습니다.
                </div>
              </div>
            )}

            {loadingUser && (
              <div
                className="rounded-[20px] border border-dashed px-3 py-4 text-sm text-slate-500"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="/loading.png"
                    alt="Loading"
                    width={20}
                    height={20}
                    className="animate-spin"
                  />
                  회원 정보를 불러오는 중입니다.
                </div>
              </div>
            )}

            {!loadingUser && (
              <div className="w-full">
                {orderId === '0' && (
                  <div className="flex w-full flex-col gap-3">
                    {isOrderInProgress ? (
                      <div
                        className="rounded-[20px] border px-3 py-4"
                        style={{
                          borderColor: 'var(--brand-card-border)',
                          backgroundColor: 'var(--brand-accent-soft)',
                        }}
                      >
                        <div
                          className="text-[10px] uppercase tracking-[0.14em]"
                          style={{ color: 'var(--brand-badge-text)' }}
                        >
                          Active Order
                        </div>
                        <div className="mt-1.5 text-base font-semibold text-slate-900">
                          {user?.buyOrderStatus === 'ordered'
                            ? '구매 주문이 진행 중입니다.'
                            : '결제 요청이 진행 중입니다.'}
                        </div>
                        <div className="mt-1 text-sm leading-5 text-slate-600">
                          기존 거래가 완료되면 새 결제를 다시 진행할 수 있습니다.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3 md:grid-cols-[1.05fr_0.95fr]">
                          <div className="flex flex-col gap-3">
                            <div
                              className="rounded-[22px] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.2)]"
                              style={{
                                background: 'linear-gradient(135deg, var(--brand-shell-from), var(--brand-shell-via), var(--brand-shell-to))',
                                color: 'var(--brand-base-contrast)',
                                boxShadow: `0 18px 40px ${brandTheme.buttonShadow}`,
                              }}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div>
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/70">
                                    Payment Preview
                                  </div>
                                  <h2 className="mt-1.5 text-base font-semibold">실시간 결제 금액</h2>
                                </div>
                                <div className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-slate-200">
                                  Mobile Optimized
                                </div>
                              </div>

                              <div className="mt-4.5 flex items-end gap-1.5">
                                <div className="text-3xl font-semibold tracking-tight">
                                  {selectedKrwAmount?.toLocaleString('ko-KR')}
                                </div>
                                <div className="pb-0.5 text-xs text-white/70">KRW</div>
                              </div>

                              <div className="mt-2.5 flex items-center gap-2 text-[13px] text-white/80">
                                <Image
                                  src="/logo-tether.png"
                                  alt="USDT"
                                  width={20}
                                  height={20}
                                  className="h-4 w-4 rounded-full"
                                />
                                예상 수령 {formattedEstimatedUsdt} USDT
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-2.5">
                                <div className="rounded-[18px] border border-white/10 bg-white/10 p-2.5">
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                                    Provider
                                  </div>
                                  <div className="mt-1.5 text-xs font-medium text-white">
                                    {providerName}
                                  </div>
                                </div>
                                <div className="rounded-[18px] border border-white/10 bg-white/10 p-2.5">
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                                    Member
                                  </div>
                                  <div className="mt-1.5 text-xs font-medium text-white">
                                    {memberid || nickname}
                                  </div>
                                </div>
                                <div className="rounded-[18px] border border-white/10 bg-white/10 p-2.5">
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                                    Limit
                                  </div>
                                  <div className="mt-1.5 text-xs font-medium text-white">
                                    {maxKrwAmount?.toLocaleString('ko-KR')}원
                                  </div>
                                </div>
                                <div className="rounded-[18px] border border-white/10 bg-white/10 p-2.5">
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                                    Depositor
                                  </div>
                                  <div className="mt-1.5 text-xs font-medium text-white">
                                    {depositName || '사전 등록 정보 확인'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className="rounded-[22px] border p-3 shadow-sm"
                              style={{
                                borderColor: 'var(--brand-card-border)',
                                backgroundColor: 'var(--brand-card-muted)',
                              }}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div>
                                  <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                    Quick Amount
                                  </div>
                                  <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                                    빠른 금액 선택
                                  </h3>
                                  <p className="mt-1 text-sm leading-5 text-slate-500">
                                    자주 사용하는 금액을 빠르게 추가해 모바일에서 바로 결제할 수 있습니다.
                                  </p>
                                </div>

                                {(!depositAmountKrw || depositAmountKrw === "0") && (
                                  <button
                                    onClick={() => setSelectedKrwAmount(0)}
                                    className="rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition hover:brightness-95"
                                    style={{
                                      borderColor: 'var(--brand-card-border)',
                                      backgroundColor: 'var(--brand-card-bg)',
                                      color: 'var(--brand-accent-text)',
                                    }}
                                    disabled={loadingStoreInfo}
                                  >
                                    초기화
                                  </button>
                                )}
                              </div>

                              {(!depositAmountKrw || depositAmountKrw === "0") && (
                                <div className="mt-3 grid grid-cols-2 gap-2.5">
                                  {quickAmountOptions.map((amount) => {
                                    const exceedsLimit = selectedKrwAmount + amount > maxKrwAmount;

                                    return (
                                      <button
                                        key={amount}
                                        onClick={() => {
                                          if (exceedsLimit) {
                                            toast.error(
                                              `한번에 구매할 수 있는 최대 금액은 ${maxKrwAmount?.toLocaleString('ko-KR')}원 입니다.`
                                            );
                                            return;
                                          }

                                          setSelectedKrwAmount((prev) => prev + amount);
                                        }}
                                        className="flex min-h-[64px] flex-col items-start justify-between rounded-[18px] border px-3 py-2.5 text-left transition active:translate-y-px"
                                        style={loadingStoreInfo || exceedsLimit
                                          ? {
                                              borderColor: 'var(--brand-card-border)',
                                              backgroundColor: '#E2E8F0',
                                              color: '#94A3B8',
                                            }
                                          : {
                                              borderColor: 'var(--brand-card-border)',
                                              backgroundColor: 'var(--brand-card-bg)',
                                              color: '#0F172A',
                                              boxShadow: `0 10px 22px ${brandTheme.panelShadow}`,
                                            }}
                                        disabled={loadingStoreInfo}
                                      >
                                        <span
                                          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                                          style={{
                                            color: loadingStoreInfo || exceedsLimit
                                              ? '#94A3B8'
                                              : 'var(--brand-badge-text)',
                                          }}
                                        >
                                          Quick Add
                                        </span>
                                        <span className="text-base font-semibold tracking-tight">
                                          + {amount.toLocaleString('ko-KR')}원
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              <div
                                className="mt-3 rounded-[18px] border px-3 py-2.5 text-sm leading-5 text-slate-500"
                                style={{
                                  borderColor: 'var(--brand-card-border)',
                                  backgroundColor: 'var(--brand-card-bg)',
                                }}
                              >
                                현재 시세는 <span className="font-semibold text-slate-900">{rate?.toLocaleString('ko-KR')}원</span>이며,
                                구매 수량은 자동으로 가맹점 결제에 반영됩니다.
                              </div>
                            </div>
                          </div>

                          <div
                            className="rounded-[22px] border p-3 shadow-sm"
                            style={{
                              borderColor: 'var(--brand-card-border)',
                              backgroundColor: 'var(--brand-card-bg)',
                            }}
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                  Settlement Profile
                                </div>
                                <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                                  입금자 정보 확인
                                </h3>
                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                  사전 등록된 은행, 계좌번호, 이름으로만 송금됩니다.
                                </p>
                              </div>
                              <div
                                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                  backgroundColor: 'var(--brand-badge-bg)',
                                  color: 'var(--brand-badge-text)',
                                }}
                              >
                                Verified
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2.5">
                              <div
                                className="rounded-[18px] border px-3 py-2.5"
                                style={{
                                  borderColor: 'var(--brand-card-border)',
                                  backgroundColor: 'var(--brand-card-muted)',
                                }}
                              >
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                  Bank
                                </div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">
                                  {depositBankName || '사전 등록 은행 없음'}
                                </div>
                              </div>

                              <div
                                className="rounded-[18px] border px-3 py-2.5"
                                style={{
                                  borderColor: 'var(--brand-card-border)',
                                  backgroundColor: 'var(--brand-card-muted)',
                                }}
                              >
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                  Account Number
                                </div>
                                <div className="mt-1 text-sm font-semibold tracking-tight text-slate-900">
                                  {maskedDepositAccountNumber}
                                </div>
                              </div>

                              <div
                                className="rounded-[18px] border px-3 py-2.5"
                                style={{
                                  borderColor: 'var(--brand-card-border)',
                                  backgroundColor: 'var(--brand-card-muted)',
                                }}
                              >
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                  Depositor Name
                                </div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">
                                  {depositName || '사전 등록 이름 없음'}
                                </div>
                              </div>
                            </div>

                            <button
                              disabled={isPurchaseDisabled}
                              className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] px-3 text-sm font-semibold transition hover:brightness-95"
                              style={isPurchaseDisabled
                                ? {
                                    backgroundColor: '#E2E8F0',
                                    color: '#94A3B8',
                                  }
                                : {
                                    backgroundColor: 'var(--brand-base)',
                                    color: 'var(--brand-base-contrast)',
                                    boxShadow: `0 16px 40px ${brandTheme.buttonShadow}`,
                                  }}
                              onClick={() => {
                                if (!depositName) {
                                  toast.error(Please_enter_deposit_name);
                                  return;
                                }

                                acceptSellOrderRandom(
                                  selectedKrwAmount,
                                  depositName,
                                  depositBankName || '',
                                  depositBankAccountNumber || ''
                                );
                              }}
                            >
                              {acceptingSellOrderRandom ? (
                                <Image
                                  src="/loading.png"
                                  alt="Loading"
                                  width={20}
                                  height={20}
                                  className="animate-spin"
                                />
                              ) : (
                                <Image
                                  src="/icon-buy.webp"
                                  alt="Check"
                                  width={20}
                                  height={20}
                                />
                              )}
                              <span>
                                {acceptingSellOrderRandom ? '구매주문 중입니다.' : '구매하기'}
                              </span>
                            </button>

                            <p className="mt-2.5 text-[11px] leading-5 text-slate-500">
                              결제 직후 구매 수량은 자동으로 가맹점 결제 화면에 반영됩니다.
                            </p>
                          </div>
                        </div>

                        <div
                          className="rounded-[18px] border px-3 py-3 text-sm leading-5 text-slate-600"
                          style={{
                            borderColor: 'var(--brand-card-border)',
                            backgroundColor: 'var(--brand-card-muted)',
                          }}
                        >
                          <div
                            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: 'var(--brand-badge-text)' }}
                          >
                            Transfer Rule
                          </div>
                          <div className="mt-1.5 font-medium text-slate-800">
                            입금 시 반드시 사전 등록한 은행과 이름, 계좌번호로 송금해야 합니다.
                          </div>
                          <div className="mt-1">
                            등록 정보와 다를 경우 입금 확인이 지연되거나 처리되지 않을 수 있습니다.
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}


              
              {/*
              {sellOrders.length > 0 && (
                <div className="mt-4 w-full flex flex-col gap-5 xl:flex-row items-start justify-center ">


                  <div className="w-full mb-10 grid grid-cols-1 gap-4  justify-center  ">

                      {sellOrders.map((item, index) => (




                        <div
                          key={index}
                          className="relative flex flex-col items-center justify-center"
                        >

    




                          {item.status === 'ordered' && (new Date().getTime() - new Date(item.createdAt).getTime() > 1000 * 60 * 60 * 24) && (
                            <div className="absolute inset-0 flex justify-center items-center z-10
                              bg-black bg-opacity-50
                            ">
                              <Image
                                src="/icon-expired.png"
                                alt="Expired"
                                width={100}
                                height={100}
                                className="opacity-20"
                              />
                            </div>
                          )}



                          {item.status === 'cancelled' && (
                            <div className="absolute inset-0 flex justify-center items-center z-10
                              bg-black bg-opacity-50
                            ">
                              <Image
                                src="/icon-cancelled.png"
                                alt="Cancelled"
                                width={100}
                                height={100}
                                className="opacity-20"
                              />
                            </div>
                          )}



                          <div className=" w-full flex flex-col gap-2 items-center justify-start">


                            {address && item.buyer && item?.buyer?.walletAddress === address && (
                              <div className="w-full flex flex-row items-center justify-start">
                                <div className='flex flex-row items-center gap-2'>

                                  <Image
                                      src={item.avatar || '/profile-default.png'}
                                      alt="Avatar"
                                      width={32}
                                      height={32}
                                      priority={true} // Added priority property
                                      className="rounded-full"
                                      style={{
                                          objectFit: 'cover',
                                          width: '32px',
                                          height: '32px',
                                      }}
                                  />      


                                  <h2 className="text-lg font-semibold">
                                      {Seller}: {

                                          item.walletAddress === address ? item.nickname ? item.nickname : Anonymous  + ' :' + Me :
                                          
                                          item.nickname ? item.nickname : Anonymous

                                      }
                                  </h2>

                                  <Image
                                      src="/verified.png"
                                      alt="Verified"
                                      width={24}
                                      height={24}
                                  />

                                  <Image
                                    src='/best-seller.png'
                                    alt='Best Seller'
                                    width={24}
                                    height={24}
                                  />

                                </div>

                              </div>
                            )}

                            {address && item.walletAddress === address && (
                              <div className="w-full flex flex-row items-center justify-start">
                                <div className='flex flex-row items-center gap-2'>

                                  <Image
                                      src={item.buyer?.avatar || '/profile-default.png'}
                                      alt="Avatar"
                                      width={32}
                                      height={32}
                                      priority={true} // Added priority property
                                      className="rounded-full"
                                      style={{
                                          objectFit: 'cover',
                                          width: '32px',
                                          height: '32px',
                                      }}
                                  />

                                  <h2 className="text-lg font-semibold">
                                      {Buyer}: {
                                          item.buyer?.nickname ? item.buyer?.nickname : Anonymous
                                      }
                                  </h2>

                                  <Image
                                      src="/verified.png"
                                      alt="Verified"
                                      width={24}
                                      height={24}

                                  />

                                  <Image
                                    src='/icon-buyer.png'
                                    alt='Best Buyer'
                                    width={24}
                                    height={24}

                                  />

                                </div>
        
                              </div>


                            )}




                            <article
                                className={`w-full bg-black p-4 rounded-md border
                                  
                                  ${item.walletAddress === address ? 'border-green-500' : 'border-gray-200'}

                                  ${item.status === 'paymentConfirmed' ? 'bg-gray-900 border-gray-900' : ''}

                                  w-96 `
                                }
                            >

                                {item.status === 'ordered' && (
                                  <div className=" flex flex-col items-start justify-start gap-1">


                                    <div className="flex flex-row items-center gap-2">

                                      {
                                        (new Date(item.createdAt).getTime() - new Date().getTime()) / 1000 / 60 / 60 < 24 && (
                                          <Image
                                            src="/icon-new.png"
                                            alt="New Order"
                                            width={32}
                                            height={32}
                                          />
                                        )
                                      } 



                                      {item.privateSale ? (
                                          <Image
                                            src="/icon-private-sale.png"
                                            alt="Private Sale"
                                            width={32}
                                            height={32}
                                          />
                                      ) : (
                                          <Image
                                            src="/icon-public-sale.png"
                                            alt="Public Sale"
                                            width={32}
                                            height={32}
                                          />
                                      )}

                                      <p className=" text-sm text-zinc-400">
                                        Expired in {24 - Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60)} {hours}
                                      </p>

                                    </div>

                                    <p className="mb-4 text-sm text-zinc-400">
                                      Opened at {
                                        new Date(item.createdAt).toLocaleDateString() + ' ' + new Date(item.createdAt).toLocaleTimeString()
                                      }
                                    </p>

                                  </div>
                                )}


                                { (item.status === 'accepted' || item.status === 'paymentRequested' || item.status === 'paymentConfirmed') && (

                                  <div className='flex flex-row items-center gap-2 bg-white px-2 py-3 rounded-md mb-4'>

                                    {item.status === 'accepted' || item.status === 'paymentRequested' && (
                                      <Image
                                        src='/icon-trade.png'
                                        alt='Trade'
                                        width={32}
                                        height={32}
                                      />
                                    )}

                                    <p className=" text-xl font-semibold text-green-500 ">
                                      {TID}: {item.tradeId}
                                    </p>



                                    {item.status === 'paymentConfirmed' && (

                                      <div className='flex flex-row items-end gap-2'>
                                        <Image
                                          src='/confirmed.png'
                                          alt='Confirmed'
                                          width={80}
                                          height={12}
                                        />
                                      </div>

                                    )}

                                    
                                  </div>

                                )}

                                {item.acceptedAt && (

                                  <div className='flex flex-col items-start gap-2 mb-2'>



                                    <div className='hidden  flex-row items-center gap-2'>
                                  
                                      {item.privateSale ? (
                                        <Image
                                          src='/icon-private-sale.png'
                                          alt='Private Sale'
                                          width={32}
                                          height={32}
                                        />
                                      ) : (
                                        <Image
                                          src='/icon-public-sale.png'
                                          alt='Public Sale'
                                          width={32}
                                          height={32}
                                        /> 
                                      )}
                                      <p className="text-sm text-zinc-400">
                                        

                                        {params.lang === 'ko' ? (

                                          <p className="text-sm text-zinc-400">


                                            {

                                              new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                                ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                              ) :
                                              new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                              ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                              ) : (
                                                ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                              )
                                            }{' '}{Order_Opened} 

                                          </p>

                                          ) : (

                                            <p className="text-sm text-zinc-400">



                                            {Order_Opened}{' '}{

                                              new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 ? (
                                                ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000) + ' ' + seconds_ago
                                              ) :
                                              new Date().getTime() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 ? (
                                              ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                              ) : (
                                                ' ' + Math.floor((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                              )
                                            }



                                          </p>


                                        )}


                                      </p>

                                    </div>


                                    <div className='hidden flex-row items-center gap-2'>
                                      <div className={
                                        ` ml-4 mr-3 bg-green-500 w-1 h-[20px]
                                        rounded-full`
                                      }></div>

                                      <div className='flex flex-row items-center gap-2'>

                                        <Image
                                          src='/timer.png'
                                          alt='Timer'
                                          width={32}
                                          height={32}
                                        />
                                        <div className="text-sm text-green-500">
                                          {
                                            ( (new Date(item.acceptedAt).getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 ).toFixed(0)
                                          } {minutes}
                                        </div>
                                      </div>

                                    </div>


                                  


                                    <div className='flex flex-row items-center gap-2'>

                                      <Image
                                        src='/icon-trade.png'
                                        alt='Trade'
                                        width={32}
                                        height={32}
                                      />

                                      <p className="text-sm text-zinc-400">


                                      {params.lang === 'ko' ? (

                                        <p className="ml-2 text-sm text-zinc-400">


                                          {new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 ? (
                                            ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000) + ' ' + seconds_ago
                                          ) :
                                          new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                          ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                          ) : (
                                            ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                          )
                                          }{' '}{Trade_Started}

                                        </p>



                                      ) : (

                                        <p className="ml-2 text-sm text-zinc-400">

                                          {Trade_Started} {
                                            new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 ? (
                                              ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000) + ' ' + seconds_ago
                                            ) :
                                            new Date().getTime() - new Date(item.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                            ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60) + ' ' + minutes_ago
                                            ) : (
                                              ' ' + Math.floor((new Date().getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + hours_ago
                                            )
                                          }

                                        </p>

                                      )}
                                      
                                      
                                      </p>
                                    </div>

                                  </div>

                                )}

                                {item.status === 'paymentConfirmed' && (

                                  <div className='flex flex-col items-start gap-2 mb-4'>

                                    <div className='flex flex-row items-center gap-2'>
                                      <div className={
                                        ` ml-4 mr-3 bg-green-500 w-1 h-[20px]
                                        rounded-full`
                                      }></div>

                                      <div className='flex flex-row items-center gap-2'>

                                        <Image
                                          src='/timer.png'
                                          alt='Timer'
                                          width={32}
                                          height={32}
                                        />
                                        <div className="text-sm text-green-500">
                                          { ( (new Date(item.paymentConfirmedAt).getTime() - new Date(item.acceptedAt).getTime()) / 1000 / 60 ).toFixed(0) } {minutes}
                                        </div>
                                      </div>

                                    </div>

                                    <div className='flex flex-row items-center gap-2 mb-4'>
                                      

                                      <Image
                                        src='/icon-completed.png'
                                        alt='Completed'
                                        width={32}
                                        height={32}
                                      />
                                      <p className="text-sm text-green-500">
                                        {Completed_at} {new Date(item.paymentConfirmedAt).toLocaleDateString() + ' ' + new Date(item.paymentConfirmedAt).toLocaleTimeString()}
                                      </p>
                                    </div>

                                  </div>



                                )}


                                <div className="mt-4 flex flex-col items-start">

                                  <p className="text-2xl text-zinc-400">
                                    {Price}: {
                                      // currency
                                    
                                      Number(item.krwAmount)?.toLocaleString('ko-KR', {
                                        style: 'currency',
                                        currency: 'KRW',
                                      })

                                    }
                                  </p>


                                  <div className="mt-2 flex flex-row items-between space-x-2">


                                    <p className="text-lg font-semibold text-zinc-500">{item.usdtAmount} USDT</p>
                                    <p className="text-lg font-semibold text-zinc-500">{Rate}: {

                                      Number(item.krwAmount / item.usdtAmount).toFixed(2)

                                    }</p>
                                  </div>

                                </div>


                              


                                {item.status === 'paymentConfirmed' && (
                                  <div className="mt-4 flex flex-col items-start gap-2">
                                    <p className="mt-4 text-sm text-zinc-400">
                                      {Payment}: {item.seller?.bankInfo.bankName} {item.seller?.bankInfo.accountNumber} {item.seller?.bankInfo.accountHolder}
                                    </p> 
                                    <p className="text-sm text-zinc-400">
                                      {Deposit_Amount}: {item.krwAmount} KRW
                                    </p>
                                    <p className="text-sm text-zinc-400">
                                      {Deposit_Name}: {
                                        item.buyer?.depositName ? item.buyer?.depositName : item.tradeId
                                      }
                                    </p>                        

                                    <p className="mt-4 text-lg text-green-500">
                                      {Deposit_Confirmed}
                                    </p>
                                  </div>
                                )}
                                
                                {address && item.walletAddress !== address && item.status === 'accepted' && (
                                    <div className="mt-10 mb-10 flex flex-row gap-2 items-center justify-start">

                                      <Image
                                        src="/loading.png"
                                        alt="Escrow"
                                        width={32}
                                        height={32}
                                        className="animate-spin"
                                      />

                                      <span>
                                        {Waiting_for_seller_to_deposit}
                                        {' '}{item.usdtAmount} USDT
                                        {' '}{to_escrow}....
                                      </span>




                                    </div>

                                )}





                                {
                                  address && item.walletAddress === address &&  item.status === 'accepted' && (

                                  <div className="w-full mt-2 mb-2 flex flex-col items-start ">


                                  {escrowing[index] && (

                                    <div className="flex flex-col gap-2">
                                      
                                      <div className="flex flex-row items-center gap-2">
                                        <Image
                                            src='/loading.png'
                                            alt='loading'
                                            width={32}
                                            height={32}
                                            className="animate-spin"
                                        />
                                        <div className="text-lg font-semibold text-zinc-500">
                                          Escrowing {item.usdtAmount} USDT...
                                        </div>
                                      </div>

                                    </div>

                                  )}


                                  {escrowing[index] === false && requestingPayment[index] === true && (
                                    <div className="flex flex-col gpa-2">
                                      {Escrow} {item.usdtAmount} USDT to the smart contract has been completed.
                                    </div>
                                  )}


                                  {requestingPayment[index] && (

                                    <div className="p-2 flex flex-col gap-2">
                                      
                                      <div className="flex flex-row items-center gap-2">
                                        <Image
                                            src='/loading.png'
                                            alt='loading'
                                            width={50}
                                            height={50}
                                            className="animate-spin"
                                        />
                                        <div className="text-lg font-semibold text-zinc-500">
                                          {Requesting_Payment}...
                                        </div>
                                      </div>

                                    </div>

                                  )}


                                  <div className="mt-5 flex flex-row items-center gap-2">

                                    <div  className="w-2 h-2 rounded-full bg-green-500"></div>

                                    <div className="text-sm text-zinc-400">

                                      {If_you_request_payment}
                                    </div>
                                  </div>

                                  <div className="mt-5 flex flex-row items-center gap-2">
                                      
                                      <div className="flex flex-row items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={requestPaymentCheck[index]}
                                            onChange={(e) => {
                                              setRequestPaymentCheck(
                                                requestPaymentCheck.map((item, idx) => {
                                                  if (idx === index) {
                                                    return e.target.checked;
                                                  }
                                                  return item;
                                                })
                                              );
                                            }}
                                            className=" w-6 h-6 rounded-md border border-gray-200"
                                        />
                                      </div>
                                      <div className="text-sm text-zinc-400">
   
                                          {I_agree_to_escrow_USDT}

                                      </div>
                                  </div>



                                  <div className="mt-4 flex flex-col gap-2 text-sm text-left text-zinc-500">
                                    <div className='flex flex-row items-center gap-2'>

                                      <div  className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <span>
                                        {Bank_Transfer} {Deposit_Information}
                                      </span>
                                    </div>
                                    <ul>
                                      <li>
                                        {item.seller?.bankInfo.bankName}
                                        {' '}
                                        <button
                                          onClick={() => {
                                              navigator.clipboard.writeText(item.seller?.bankInfo.accountNumber);
                                              toast.success(Account_number_has_been_copied);
                                          } }
                                          className='text-lg font-semibold'
                                        >
                                          {item.seller?.bankInfo.accountNumber}
                                        </button>
                                        {' '}
                                        {item.seller?.bankInfo.accountHolder}
                                      </li>
                                      <li>{Deposit_Amount} : {item.krwAmount} KRW</li>
                                      <li>{Deposit_Name} : {
                                        item.buyer?.depositName ? item.buyer?.depositName : item.tradeId
                                      }</li>
                                    </ul>
                                  </div>


                                  <button
                                      disabled={
                                        balance < item.usdtAmount || requestingPayment[index] || escrowing[index]
                                        || !requestPaymentCheck[index]
                                      }
                                      className={`w-full text-lg
                                        ${balance < item.usdtAmount ? 'bg-red-500' : 'bg-blue-500'}

                                        ${requestPaymentCheck[index] ? 'bg-green-500' : 'bg-gray-500'}
                                        
                                      text-zinc-500 px-4 py-2 rounded-md mt-4`}

                                      onClick={() => {
                                          //console.log('request Payment');
                                          
                                          ///router.push(`/chat?tradeId=12345`);

                                          requstPayment(
                                            index,
                                            item._id,
                                            item.tradeId,
                                            item.usdtAmount,
                                          );

                                      }}
                                    >



                                    {balance < item.usdtAmount ? (

                                      <div className="flex flex-col gap-2">
                                        <div className="flex flex-row items-center gap-2">
                                          <GearSetupIcon />
                                          <div className="text-lg font-semibold">
                                          {Request_Payment}
                                          </div>
                                        </div>

                                        <div className="text-lg text-zinc-500">
                                          Insufficient Balance
                                        </div>
                                        <div className="text-lg text-zinc-500">
                                          You need {item.usdtAmount} USDT
                                        </div>
                                        <div className="text-lg text-zinc-500">
                                          You have {balance} USDT
                                        </div>
                                        <div className="text-lg text-zinc-500">
                                          Please top up your balance by depositing {item.usdtAmount - balance} USDT
                                        </div>
                                        <div className="text-lg text-zinc-500">
                                          Your wallet address is
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                          {address.substring(0, 10)}...{address.substring(address.length - 10, address.length)}
                                          
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                        
                                          <button
                                              onClick={() => {
                                                  navigator.clipboard.writeText(address);
                                                  toast.success('USDT지갑주소가 복사되었습니다.');
                                              }}
                                            className="text-xs bg-green-500 text-zinc-500 px-2 py-1 rounded-md">
                                            복사
                                          </button>
                                        </div>
                                      </div>

                                    ) : (

                                      <div className="flex flex-col gap-2">

                                        <div className="flex flex-row items-center gap-2">
                                          

                                          {requestingPayment[index] || escrowing[index] ? (
                                            <Image
                                              src='/loading.png'
                                              alt='loading'
                                              width={32}
                                              height={32}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <GearSetupIcon />
                                          )}


                                          <div className="text-lg font-semibold">
                                          {Request_Payment}
                                          </div>
                                        </div>


                                      </div>
                                    )}


                                  </button>

                                  </div>


                                )}


                                


                                {item.status === 'ordered' && (
                                  <>

                                  {acceptingSellOrder[index] ? (

                                    <div className="flex flex-row items-center gap-2">
                                      <Image
                                        src='/loading.png'
                                        alt='loading'
                                        width={38}
                                        height={38}
                                        className="animate-spin"
                                      />
                                      <div>Accepting...</div>
                                    </div>


                                  ) : (
                                    <>
                                      
                                      {item.walletAddress === address ? (
                                        <div className="flex flex-col space-y-4">
                                          {My_Order}
                                        </div>
                                      ) : (
                                        <div className="w-full flex items-center justify-center">

                                          {item.status === 'ordered' && (
                                            
                                            // check if the order is expired
                                            new Date().getTime() - new Date(item.createdAt).getTime() > 1000 * 60 * 60 * 24

                                          ) ? (
                                            
                                            <Image
                                              src="/icon-expired.png"
                                              alt="Expired"
                                              width={80}
                                              height={80}
                                            />
                                          
                                          ) : (

                                            <div className='mt-4 flex flex-col items-center gap-2'>


                                              <div className="flex flex-row items-center space-x-2">
                                                <input
                                                  disabled={!address}
                                                  type="checkbox"
                                                  checked={agreementForTrade[index]}
                                                  onChange={(e) => {
                                                      setAgreementForTrade(
                                                          sellOrders.map((item, idx) => {
                                                              if (idx === index) {
                                                                  return e.target.checked;
                                                              } else {
                                                                  return false;
                                                              }
                                                          })
                                                      );
                                                  }}
                                                />
                                                <label className="text-sm text-zinc-400">
                                                  {I_agree_to_the_terms_of_trade}
                                                </label>
                                              </div>



                                            
                                              <button
                                                disabled={!address || !agreementForTrade[index]}
                                                className={`text-lg text-zinc-500 px-4 py-2 rounded-md
                                                ${!user || !agreementForTrade[index] ? 'bg-zinc-800' : 'bg-green-500 hover:bg-green-600'}
                                                `}

                                                onClick={() => {

                                                    acceptSellOrder(index, item._id);
                                              

                                                }}
                                              >
                                                {Buy} {item.usdtAmount} USDT
                                              </button>



                                            </div>

                                          )}

                                        </div>



                                        )}

                                      </>

                                    )}

                                  </>

                                )}


                                {item.status === 'paymentRequested' && (

                                  <div className="mt-4 mb-10 flex flex-col items-start gap-2">

                                    <div className='flex flex-row items-center gap-2'>

                                      <Image
                                        src='/smart-contract.png'
                                        alt='Escrow'
                                        width={32}
                                        height={32}
                                      />

                                      <div className="text-lg font-semibold text-green-500">
                                        {Escrow}: {item.usdtAmount} USDT
                                      </div>


                                      <button
                                        className="text-sm bg-green-500 text-zinc-500 px-2 py-1 rounded-md"
                                        onClick={() => {
                                          {
                                            window.open(`https://arbiscan.io/token/${contractAddress}?a=${item.walletAddress}`, '_blank')
                                          }
                                        }}
                                      >
                                        <Image
                                          src='/logo-arbitrum.png'
                                          alt="Chain"
                                          width={24}
                                          height={24}
                                        /> 
                                      </button>


                                    </div>


                                    <div className='flex flex-row items-center gap-2'>
                                      <Image
                                        src='/icon-bank.png'
                                        alt='Bank'
                                        width={32}
                                        height={32}
                                      />
                                      <div className="text-lg font-semibold text-green-500">
                                        {Bank_Transfer}
                                      </div>
                                      <span className="text-sm text-green-500">
                                        {When_the_deposit_is_completed}
                                      </span>
                                    </div>




                                    {address && (item.walletAddress === address || item.buyer?.walletAddress === address ) && (
                                      <>
                                        <div className='mt-4 text-lg text-green-500 font-semibold'>
                                          입금은행
                                        </div>
                                        <div className='flex flex-row items-center justify-center gap-2'>
                                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                          <div className="text-sm ">
                                          {item.seller?.bankInfo.bankName}
                                          {' '}
                                          <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.seller?.bankInfo.accountNumber);
                                                toast.success("계좌번호가 복사되었습니다.");
                                            } }
                                            className='text-lg font-semibold'
                                          >
                                            {item.seller?.bankInfo.accountNumber}
                                          </button>
                                          {' '}
                                          <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.seller?.bankInfo.accountNumber);
                                                toast.success("계좌번호가 복사되었습니다.");
                                            } }
                                            className="text-xs bg-green-500 text-zinc-500 px-2 py-1 rounded-md"
                                          >
                                            복사
                                          </button>
                                          {' '}
                                          {item.seller?.bankInfo.accountHolder}
                                          </div>
                                        </div>


                                        <div className='flex flex-row items-center gap-2'>
                                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                          <div className="text-sm">
                                            {Deposit_Name}:{' '}
                                            <button
                                              onClick={() => {
                                                  navigator.clipboard.writeText(item.buyer?.depositName ? item.buyer?.depositName : item.tradeId);
                                                  toast.success(Payment_name_has_been_copied);
                                              } }
                                              className="text-lg font-semibold"
                                            >
                                              {item.buyer?.depositName ? item.buyer?.depositName : item.tradeId}
                                            </button>
                                            {' '}
                                            <button
                                              onClick={() => {
                                                  navigator.clipboard.writeText(item.buyer?.depositName ? item.buyer?.depositName : item.tradeId);
                                                  toast.success(Payment_name_has_been_copied);
                                              } }
                                              className="hidden text-xs bg-green-500 text-zinc-500 px-2 py-1 rounded-md"
                                            >
                                              복사
                                            </button>
                                          </div>
                                        </div>

                                        <div className='flex flex-row items-center gap-2'>
                                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                          <div className="text-sm">
                                            {Deposit_Amount}:{' '}

                                            <button
                                              onClick={() => {
                                                  navigator.clipboard.writeText(item.krwAmount.toString());
                                                  toast.success(Payment_amount_has_been_copied);
                                              } }
                                              className="text-lg font-semibold"
                                            >
                                              {item.krwAmount?.toLocaleString('ko-KR', {
                                                  style: 'currency',
                                                  currency: 'KRW'
                                                })
                                              }
                                            </button>
                                            {' '}
                                            <button
                                              onClick={() => {
                                                  navigator.clipboard.writeText(item.krwAmount.toString());
                                                  toast.success(Payment_amount_has_been_copied);
                                              } }
                                              className="hidden text-xs bg-green-500 text-zinc-500 px-2 py-1 rounded-md"
                                            >
                                              복사
                                            </button>
                                          </div>
                                        </div>

                                      </>

                                    )}




                                    <div className='flex flex-row items-center gap-2'>
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <div className="text-sm">
                                        {Deposit_Deadline}: {
                                        
                                          new Date(new Date(item.paymentRequestedAt).getTime() + 1000 * 60 * 60 * 1)?.toLocaleString()
                                        
                                        }
                                      </div>
                                    </div>

                                    {!address && (
                                  
                                      <div className="mt-4 flex flex-row gap-2 items-center justify-start">

                                        <Image
                                          src="/loading.png"
                                          alt="Escrow"
                                          width={32}
                                          height={32}
                                          className="animate-spin"
                                        />

                                        <div>{Waiting_for_seller_to_confirm_payment}...</div>

                                      </div>
                                      
                                    )}  

                                  </div>
                                )}

                                
                                {address && item.walletAddress === address && item.status === 'paymentRequested' && (

                                <div className="w-full mt-4 mb-2 flex flex-col items-start ">


                                  
                                  
                                  <div className="w-full flex flex-col items-start gap-2">

                                  
                                    { 
                                      item.status === 'paymentRequested'
                                      && requestingPayment[index]
                                      && confirmingPayment[index] === false
                                      && (

                                      <div className="flex flex-col gap-2">
                                        
                                        <div className="flex flex-row items-center gap-2">
                                          <Image
                                              src='/loading.png'
                                              alt='loading'
                                              width={32}
                                              height={32}
                                              className="animate-spin"
                                          />
                                          <div className="text-lg font-semibold text-zinc-500">
                                            
                                            {Checking_the_bank_transfer_from_the_buyer} ( {
                                              item?.buyer?.nickname ? item?.buyer?.nickname : Anonymous
                                            } )...


                                          </div>
                                        </div>

                                      </div>

                                    )}


                                    <div className="flex flex-row items-center gap-2">

                                      <div className="flex flex-row items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={confirmPaymentCheck[index]}
                                            onChange={(e) => {
                                              setConfirmPaymentCheck(
                                                confirmPaymentCheck.map((item, idx) => {
                                                  if (idx === index) {
                                                    return e.target.checked;
                                                  }
                                                  return item;
                                                })
                                              );
                                            }}
                                            className=" w-6 h-6 rounded-md border border-gray-200"
                                        />
                                      </div>

                                      <span className="text-sm text-zinc-400">


                                        {I_agree_to_check_the_bank_transfer_of}


                                      </span>

                                    </div>




                                  </div>
                                    


                                  {confirmingPayment[index] ? (

                                    <div className="p-2 flex flex-row items-center gap-2">

                                      <Image
                                          src='/loading.png'
                                          alt='loading'
                                          width={32}
                                          height={32}
                                          className="animate-spin"
                                      />
                                      <div className="text-lg font-semibold text-zinc-500">

                                        {Transfering_USDT_to_the_buyer_wallet_address}...
                                    
                                      </div>
                                    </div>

                                  ) : (

                                      <button
                                          disabled={
                                            confirmingPayment[index]
                                            || !confirmPaymentCheck[index]
                                        }
                                          className={`w-full text-lg
                                            ${confirmPaymentCheck[index] ? 'bg-green-500' : 'bg-gray-500'}
                                            text-zinc-500 px-4 py-2 rounded-md mt-4`}
                                          onClick={() => {
                                              console.log('Canfirm Payment');

                                              //toast.success('Payment has been confirmed');

                                              confirmPayment(index, item._id);
                                              
                                          }}
                                      >
                                        {Confirm_Payment}
                                      </button>
                                    
                                    )}


                                </div>


                                )}

                            </article>


                          </div>


                        
                        </div>


                      ))}

                  </div>

                  {orderId && address && user && user.nickname && sellOrders.length > 0 && sellOrders[0].status !== 'paymentConfirmed' && sellOrders[0].status !== 'ordered' && (
                    <div className=' w-full hidden'>
                      <Chat

                        channel={orderId}

                        userId={ user.nickname }

                        nickname={ user.nickname }

                        profileUrl={ user.avatar }
                      />
                    </div>
                  )}



                </div>
              )}
              */}



            {/*
            📌 필독 안내사항
                1.	대행 신청 전 유의사항을 반드시 확인해 주세요.
              신청 전 안내된 내용을 충분히 숙지하지 않아 발생하는 모든 문제는 회원 본인의 책임이며, 당사는 이에 대해 책임지지 않습니다.
                2.	코인 전송 완료 후에는 취소 및 환불이 불가능합니다.
              대행 신청 완료 후 진행된 코인 거래는 어떤 경우에도 취소나 환불이 불가하오니 신중히 진행해 주세요.
                3.	최근 코인 거래 관련 사기가 빈번하게 발생하고 있습니다.
              구매 및 판매 시 반드시 신원과 거래 내용을 철저히 확인하신 후 진행해 주시기 바랍니다.
              ※ 대행 신청 후 사고 발생 시 당사는 도움을 드릴 수 없습니다.
                4.	불법 자금 거래 및 금융사기 방지를 위해 최선을 다하고 있습니다.
              의심스러운 거래로 판단될 경우, 회원 본인에게 신분증, 통장 사본, 거래 내역, 이체 확인증 등의 추가 인증을 요청드릴 수 있습니다.
                5.	잘못된 정보 입력 시 거래에 문제가 발생할 수 있습니다.
              모든 정보를 정확히 기입해 주시고, 신청 전 다시 한 번 확인 부탁드립니다.
                6.	영업시간: 연중무휴 24시간 운영
              언제든지 문의 및 이용이 가능합니다.
              */}

          </section>

          <section className="mt-5 rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-slate-900 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                Safe
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  Notice
                </div>
                <h2 className="mt-0.5 text-base font-semibold text-slate-900">필독 안내사항</h2>
              </div>
            </div>

            <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-5 text-slate-600">
              <li className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-2.5">
                대행 신청 전 유의사항을 반드시 확인해 주세요. 신청 전 안내된 내용을 충분히 숙지하지 않아 발생하는 모든 문제는 회원 본인의 책임이며, 당사는 이에 대해 책임지지 않습니다.
              </li>
              <li className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-2.5">
                코인 전송 완료 후에는 취소 및 환불이 불가능합니다. 대행 신청 완료 후 진행된 코인 거래는 어떤 경우에도 취소나 환불이 불가하오니 신중히 진행해 주세요.
              </li>
              <li className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-2.5">
                최근 코인 거래 관련 사기가 빈번하게 발생하고 있습니다. 구매 및 판매 시 반드시 신원과 거래 내용을 철저히 확인해 주세요. 대행 신청 후 사고 발생 시 당사는 도움을 드릴 수 없습니다.
              </li>
              <li className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-2.5">
                불법 자금 거래 및 금융사기 방지를 위해 최선을 다하고 있습니다. 의심스러운 거래로 판단될 경우 신분증, 통장 사본, 거래 내역, 이체 확인증 등의 추가 인증을 요청드릴 수 있습니다.
              </li>
              <li className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-2.5">
                잘못된 정보 입력 시 거래에 문제가 발생할 수 있습니다. 모든 정보를 정확히 기입해 주시고 신청 전 다시 한 번 확인해 주세요.
              </li>
              <li className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-2.5">
                영업시간은 연중무휴 24시간 운영입니다. 언제든지 문의 및 이용이 가능합니다.
              </li>
            </ul>
          </section>

          <footer className="mb-8 rounded-[20px] border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-500 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href="#"
                className="transition hover:text-slate-900"
              >
                이용약관
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="#"
                className="transition hover:text-slate-900"
              >
                개인정보처리방침
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="#"
                className="transition hover:text-slate-900"
              >
                고객센터
              </a>
            </div>
            <div className="mt-2 text-center text-[11px]">
              © 2023 Iskan9. All rights reserved.
            </div>
          </footer>
        </div>




          {isDisconnectConfirmModalOpen && (
            <div className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-900/45 px-4 pb-4 pt-10 sm:items-center">
              <div className="w-full max-w-[340px] rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
                <div className="text-[18px] font-semibold text-slate-900">
                  지갑 연결 해제
                </div>
                <div className="mt-2 text-[13px] leading-5 text-slate-600">
                  현재 연결된 지갑을 해제할까요?
                  해제 후 다시 결제하려면 휴대폰 인증이 필요합니다.
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={closeDisconnectConfirmModal}
                    className="flex min-h-[46px] items-center justify-center rounded-[16px] border border-slate-200 bg-slate-50 px-4 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectPhoneWallet}
                    className="flex min-h-[46px] items-center justify-center rounded-[16px] border border-rose-200 bg-rose-500 px-4 text-[14px] font-semibold text-white transition hover:bg-rose-600"
                  >
                    연결 해제
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPhoneAuthModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-900/45 px-4 pb-4 pt-10 sm:items-center">
              <div className="w-full max-w-[360px] rounded-[28px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (phoneAuthStep === 'code') {
                        setPhoneAuthStep('phone');
                        setVerificationCode('');
                        setPhoneAuthError('');
                        return;
                      }

                      closePhoneAuthModal();
                    }}
                    className="text-sm font-medium text-slate-500"
                  >
                    {phoneAuthStep === 'code' ? '이전' : '닫기'}
                  </button>
                  <div className="text-[18px] font-semibold text-slate-900">
                    휴대폰 확인
                  </div>
                  <button
                    type="button"
                    onClick={closePhoneAuthModal}
                    className="text-sm font-medium text-slate-500"
                  >
                    닫기
                  </button>
                </div>

                {phoneAuthStep === 'phone' ? (
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-slate-900">
                      휴대폰 번호를 입력해 주세요
                    </div>
                    <div className="mt-1 text-[12px] leading-5 text-slate-500">
                      +82가 기본이며, 앞자리 0은 자동으로 제외됩니다.
                    </div>

                    <div className="mt-4 flex items-center rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="pr-3 text-[15px] font-semibold text-slate-900">
                        +82
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoFocus
                        value={phoneInput}
                        onChange={(event) => {
                          setPhoneInput(event.target.value.replace(/[^\d+\-\s]/g, ''));
                          if (phoneAuthError) {
                            setPhoneAuthError('');
                          }
                        }}
                        placeholder="10 1234 5678"
                        className="w-full border-0 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {phoneAuthError && (
                      <div className="mt-2 text-[12px] font-medium text-rose-500">
                        {phoneAuthError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSendPhoneVerificationCode()}
                      disabled={isSendingPhoneCode}
                      className="mt-4 flex min-h-[50px] w-full items-center justify-center rounded-[18px] border border-[#1d4ed8]/30 bg-[#1d4ed8] px-4 text-[14px] font-semibold text-white shadow-[0_10px_18px_rgba(29,78,216,0.24)] transition hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {isSendingPhoneCode ? '전송 중...' : '인증 코드 받기'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-slate-900">
                      인증 코드를 입력해 주세요
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-slate-600">
                      {formatPhoneNumberPreview(submittedPhoneNumber)}
                    </div>

                    <input
                      type="tel"
                      inputMode="numeric"
                      autoFocus
                      maxLength={6}
                      value={verificationCode}
                      onChange={(event) => {
                        setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                        if (phoneAuthError) {
                          setPhoneAuthError('');
                        }
                      }}
                      placeholder="6자리 인증 코드"
                      className="mt-4 h-[52px] w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-center text-[18px] font-semibold tracking-[0.3em] text-slate-900 outline-none placeholder:tracking-normal placeholder:text-[15px] placeholder:font-medium placeholder:text-slate-400"
                    />

                    {phoneAuthError && (
                      <div className="mt-2 text-[12px] font-medium text-rose-500">
                        {phoneAuthError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyPhoneCode}
                      disabled={isVerifyingPhoneCode || isConnecting}
                      className="mt-4 flex min-h-[50px] w-full items-center justify-center rounded-[18px] border border-[#1d4ed8]/30 bg-[#1d4ed8] px-4 text-[14px] font-semibold text-white shadow-[0_10px_18px_rgba(29,78,216,0.24)] transition hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {isVerifyingPhoneCode || isConnecting ? '확인 중...' : '확인'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendPhoneVerificationCode(submittedPhoneNumber)}
                      disabled={isSendingPhoneCode}
                      className="mt-3 w-full text-center text-[12px] font-medium text-[#1d4ed8] transition hover:text-[#1e40af] disabled:text-slate-400"
                    >
                      인증 코드 다시 보내기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <Modal isOpen={isModalOpen} onClose={closeModal}>
              <TradeDetail
                  closeModal={closeModal}
                  //goChat={goChat}
              />
          </Modal>

              

      </main>

    );




};






// close modal

const TradeDetail = (
    {
        closeModal = () => {},
        goChat = () => {},
        
    }
) => {


    const [amount, setAmount] = useState(1000);
    const price = 91.17; // example price
    const receiveAmount = (amount / price).toFixed(2);
    const commission = 0.01; // example commission
  
    return (

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
          <h2 className="text-lg font-semibold text-black ">Iskan9</h2>
          <span className="ml-2 text-blue-500 text-sm">318 trades</span>
        </div>
        <p className="text-gray-600 mt-2">The offer is taken from another source. You can only use chat if the trade is open.</p>
        
        <div className="mt-4">
          <div className="flex justify-between text-gray-700">
            <span>Price</span>
            <span>{price} KRW</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Limit</span>
            <span>40680.00 KRW - 99002.9 KRW</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Available</span>
            <span>1085.91 USDT</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Seller&apos;s payment method</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 rounded-full">Tinkoff</span>
          </div>
          <div className="mt-4 text-gray-700">
            <p>24/7</p>
          </div>
        </div>
  
        <div className="mt-6 border-t pt-4 text-gray-700">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-gray-700">I want to pay</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                ) }

                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700">I will receive</label>
              <input 
                type="text"
                value={`${receiveAmount} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700">Commission</label>
              <input 
                type="text"
                value={`${commission} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
                className="bg-green-500 text-zinc-500 px-4 py-2 rounded-lg"
                onClick={() => {
                    console.log('Buy USDT');
                    // go to chat
                    // close modal
                    closeModal();
                    goChat();

                }}
            >
                Buy USDT
            </button>
            <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                onClick={() => {
                    console.log('Cancel');
                    // close modal
                    closeModal();
                }}
            >
                Cancel
            </button>
          </div>

        </div>


      </div>
    );
  };
