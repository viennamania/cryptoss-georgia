'use client';

import { useState, useEffect, use, type CSSProperties } from "react";


import { toast } from 'react-hot-toast';

import { client } from "../../../../../client";

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
    ConnectButton,
    useActiveAccount,
    useActiveWallet,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";


import { getUserPhoneNumber } from "thirdweb/wallets/in-app";


import Image from 'next/image';

import GearSetupIcon from "@/components/gearSetupIcon";


import Uploader from '@/components/uploader';

import { balanceOf, transfer } from "thirdweb/extensions/erc20";
 






// open modal

import Modal from '@/components/modal';

import { useRouter }from "next//navigation";

import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../../../dictionaries";


//import Chat from "@/components/Chat";


// dynamic import for chat
// chat parameters is orderId and address
import dynamic from "next/dynamic";

/*
const Chat = dynamic(() => import('@/components/Chat'), {
    ssr: false,
});
*/

import { useSearchParams } from "next/navigation";
import { on } from "events";
import { derivePaymentBrandTheme } from "@/lib/payment-branding";



interface SellOrder {
  _id: string;
  createdAt: string;
  nickname: string;
  storecode: string;
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

  store: any;

  paymentMethod: string; // 'bank' or 'crypto'
}



const APP_ID = "CCD67D05-55A6-4CA2-A6B1-187A5B62EC9D";



let Chat = dynamic(() => import('@/components/Chat'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading...</div>,
});




const wallets = [
  inAppWallet({
    auth: {
      options: ["phone", "email"],
    },
  }),
];



const contractAddressEthereum = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT on Ethereum
const contractAddressPolygon = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT on Polygon
const contractAddressArbitrum = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDT on Arbitrum
const contractAddressBSC = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC

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

    const orderNumber = searchParams.get('orderNumber');
    const requestedUserType = normalizeUserType(
      searchParams.get('userType')
      || searchParams.get('memberGrade')
      || searchParams.get('memberType')
      || searchParams.get('grade')
      || searchParams.get('gradeCode')
      || searchParams.get('user_type')
    );

    //const storeUser = searchParams.get('storeUser');

    //console.log('storeUser', storeUser);


    //const storecode = storeUser?.split('@').slice(-1)[0];
    //const memberid = storeUser?.split('@').slice(0, -1).join('@');

  

    //const paramDepositName = searchParams.get('depositName');
    //const paramDepositBankName = searchParams.get('depositBankName');



  


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
    

  const orderId = params.orderId as string;

  
  console.log('orderId', orderId);


 

    // get the active wallet
    const activeWallet = useActiveWallet();




  const smartAccount = useActiveAccount();


  //const address = smartAccount?.address || "";

  const [address, setAddress] = useState(
    smartAccount?.address || ""
  );

  const [oneBuyOrder, setOneBuyOrder] = useState<any>(null);









    // get User by wallet address

    const [user, setUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    useEffect(() => {
        if (!address) {
            return;
        }

        let mounted = true;

        const fetchUser = async () => {
          setLoadingUser(true);

          try {
            const response = await fetch('/api/user/getUser', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                clientid: params.clientid,
                storecode: params.center,
                walletAddress: address,
              }),
            });

            const data = await response.json().catch(() => null);
            const fetchedUser = data?.result || null;
            const resolvedFetchedUserType = normalizeUserType(fetchedUser?.userType);

            if (mounted && fetchedUser && resolvedFetchedUserType) {
              setUser(fetchedUser);
              return;
            }

            if (!oneBuyOrder?.nickname) {
              if (mounted) {
                setUser(fetchedUser);
              }
              return;
            }

            const fallbackResponse = await fetch('/api/user/setBuyerWithoutWalletAddressByStorecode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                clientid: params.clientid,
                storecode: params.center,
                walletAddress: address,
                userCode: oneBuyOrder.nickname,
                userName: oneBuyOrder?.buyer?.depositName || '',
                userBankName: oneBuyOrder?.buyer?.depositBankName || '',
                userBankAccountNumber: oneBuyOrder?.buyer?.depositBankAccountNumber || '',
              }),
            });

            const fallbackData = await fallbackResponse.json().catch(() => null);

            if (!mounted) {
              return;
            }

            if (fallbackData?.walletAddress) {
              setUser({
                ...fetchedUser,
                walletAddress: fallbackData.walletAddress,
                nickname: oneBuyOrder.nickname,
                userType: fallbackData.userType || fetchedUser?.userType || requestedUserType,
                buyOrderStatus: fallbackData.buyOrderStatus || fetchedUser?.buyOrderStatus,
                liveOnAndOff: fallbackData.liveOnAndOff ?? fetchedUser?.liveOnAndOff,
              });
              return;
            }

            setUser(fetchedUser);
          } catch (error) {
            console.error('Error fetching user:', error);

            if (mounted) {
              setUser(null);
            }
          } finally {
            if (mounted) {
              setLoadingUser(false);
            }
          }
        };

        fetchUser();

        return () => {
          mounted = false;
        };

    } , [
      address,
      oneBuyOrder?.nickname,
      oneBuyOrder?.buyer?.depositName,
      oneBuyOrder?.buyer?.depositBankName,
      oneBuyOrder?.buyer?.depositBankAccountNumber,
      params.clientid,
      params.center,
      requestedUserType,
    ]);



    // nickname




    const [nickname, setNickname] = useState("");

    const [inputNickname, setInputNickname] = useState('');









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
          clientid: params.clientid,
          storecode: params.center,
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

      setAddress(walletAddress);

      setNickname(paramNickname);


    }

 

    useEffect(() => {



      const fetchWalletAddress = async ( ) => {
  
        if (!nickname) {
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
            storecode: params.center,
            nickname: nickname,
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

        console.log('walletAddress', walletAddress);


  
        setAddress(walletAddress);
  
  
      }
  



      fetchWalletAddress();


    } , [nickname, params.clientid, params.center]);









    // select krw amount (10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000)

    const [krwAmounts, setKrwAmounts] = useState([10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000]);
    // select one of krw amount

    const [selectedKrwAmount, setSelectedKrwAmount] = useState(0);


    const [depositName, setDepositName] = useState("");

    const [depositBankName, setDepositBankName] = useState("");



    //const [buyOrders, setBuyOrders] = useState<SellOrder[]>([]);


    /*
    useEffect(() => {

      const fetchSellOrders = async () => {

        if (orderId !== '0') {
          return;
        }
        

        if (!selectedKrwAmount) {
          return;
        }





        // api call
        const responseGetAllSellOrders = await fetch('/api/order/getAllSellOrders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            chain: params.center,
          })
        });

        const dataGetAllSellOrders = await responseGetAllSellOrders.json();

        
        //console.log('data', data);



        if (dataGetAllSellOrders.result) {

          // find one of sell order which is krwAmount is selectedKrwAmount and status is ordered
          

          const order = dataGetAllSellOrders.result.orders.find((item: any) => {
            return item.krwAmount === selectedKrwAmount && item.status === 'ordered';
          });

          if (order) {
            setBuyOrders([order]);
          } else {
            toast.error('Sell order not found');
          }

        }

      }

      fetchSellOrders();

    } , [selectedKrwAmount, params.lang, params.center, orderId]);
    */
    

    

  
    

    

    const [seller, setSeller] = useState<any>(null);


    /*
    useEffect(() => {

        if (!orderId) {
          return;
        }
        
        const fetchBuyOrders = async () => {





          // api call
          const response = await fetch('/api/order/getOneBuyOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              clientid: params.clientid,
              orderId: orderId,
            })
          });
  
          const data = await response?.json();
  
          ///console.log('getOneBuyOrder data.result', data.result);

  
          if (data.result) {

            if (data.result.orders.length > 0) {

              setBuyOrders(data.result.orders);

              setAddress(data.result.orders[0]?.walletAddress);

              ////setNickname(data.result.orders[0].buyer.nickname);

              setSeller(data.result.orders[0].seller);
            }


          }
  
        };
  
        fetchBuyOrders();



        
        const interval = setInterval(() => {

          fetchBuyOrders();
        }, 10000);
        
        return () => clearInterval(interval);
        
  
    }, [orderId, params.clientid]);


    //console.log('buyOrders', buyOrders);
    */

  const [orderChain, setOrderChain] = useState('ethereum');

  useEffect(() => {
    // /api/order/getOneBuyOrderByOrderId

    const fetchOneBuyOrder = async () => {
      if (!orderId) {
        return;
      }
      const response = await fetch('/api/order/getOneBuyOrderByOrderId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientid: params.clientid,
          orderId: orderId,
        })
      });
      const data = await response.json();

      ////console.log('getOneBuyOrderByOrderId data', data);

      if (data.result) {
        setOneBuyOrder(data.result);

        setAddress(data.result.walletAddress);
        setSeller(data.result.seller);

        setOrderChain(data.result.chain);
      }
    }
    fetchOneBuyOrder();


    // interval to fetch every 10 seconds
    const interval = setInterval(() => {
      fetchOneBuyOrder();
    } , 10000);

    return () => clearInterval(interval);

  } , [params.clientid, orderId]);

    

  //console.log('oneBuyOrder chain', orderChain);

  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    const getUSDTContract = async () => {
      const contract = getContract({
        // the client you have created via `createThirdwebClient()`
        client,
        // the chain the contract is deployed on
        chain: orderChain === 'ethereum' ? ethereum
          : orderChain === 'polygon' ? polygon
          : orderChain === 'arbitrum' ? arbitrum
          : orderChain === 'bsc' ? bsc
          : ethereum,
        // the contract's address
        address: orderChain === 'ethereum' ? contractAddressEthereum
          : orderChain === 'polygon' ? contractAddressPolygon
          : orderChain === 'arbitrum' ? contractAddressArbitrum
          : orderChain === 'bsc' ? contractAddressBSC
          : contractAddressEthereum,
        // OPTIONAL: the contract's abi
        //abi: [...],
      });
      setContract(contract);
    };
    getUSDTContract();
  }, [orderChain]);



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
  
      if (orderChain === 'bsc') {
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

  } , [address, contract, orderChain]);


  


    // array of escrowing
    /*
    const [escrowing, setEscrowing] = useState([] as boolean[]);

    useEffect(() => {
        
        setEscrowing(
          new Array(buyOrders.length).fill(false)
        );
  
    } , [buyOrders]);
    */




    // array of requestingPayment
    /*
    const [requestingPayment, setRequestingPayment] = useState([] as boolean[]);

    useEffect(() => {

      setRequestingPayment(
        
        buyOrders.map((item) => {
          
          if (item.status === 'paymentRequested') {
            return true;
          }
          return false;
        } )

      );

    } , [buyOrders]);
    */







    {/*
    const [isModalOpen, setModalOpen] = useState(false);

    const closeModal = () => setModalOpen(false);
    const openModal = () => setModalOpen(true);
    */}


    /*
    useEffect(() => {


      if (buyOrders.length === 0) {
        return;
      }

 

        const  goChat = async ( ) => {
    
    
          const url = 'https://api-CC1B09FC-0FEF-4C9C-96D0-E5D464ADF155.sendbird.com/v3/open_channels';
    
    
          const result = await fetch(url, {
            method: 'POST',
    
            headers: {
              'Content-Type': 'application/json',
              'Api-Token': 'd5e9911aa317c4ee9a3be4fce38b878941f11c68',
            },
    
            body: JSON.stringify({
              name: buyOrders[0].tradeId,
              channel_url: buyOrders[0]._id,
              cover_url: 'https://gold.goodtether.com/icon-trade.png',
              custom_type: 'trade',
    
            }),
          });
    
          const data = await result.json();
    
          ////console.log('data', data);
              
    
          ///console.log('Go Chat');
    
          //router.push(`/chat?channel=${orderId}`);
    
          //router.push(`/${params.lang}/chat/${orderId}`);
    
    
    
        }

        
        ///goChat();
        


    } , [ buyOrders ]);
    */



    const [usdtAmount, setUsdtAmount] = useState(0);

    const [defaultKrWAmount, setDefaultKrwAmount] = useState(0);

    const [krwAmount, setKrwAmount] = useState(
      krwAmounts[0]
    );

    console.log('usdtAmount', usdtAmount);



 

    const [rate, setRate] = useState(1400);
    const [clientChain, setClientChain] = useState('ethereum');



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
            buyOrders.map((item, idx) => {
                return false;
            })
        );
    } , [buyOrders]);
    */

    /*
    const [acceptingSellOrder, setAcceptingSellOrder] = useState([] as boolean[]);
    useEffect(() => {
        setAcceptingSellOrder (
            buyOrders.map((item, idx) => {
                return false;
            })
        );
    } , [buyOrders]);
    */

    /*
    // request payment check box
    const [requestPaymentCheck, setRequestPaymentCheck] = useState([] as boolean[]);
    useEffect(() => {
        
        setRequestPaymentCheck(
          new Array(buyOrders.length).fill(false)
        );
  
    } , [buyOrders]);
    */




    /*
    const acceptSellOrder = (index: number, orderId: string) => {

        if (!user) {
            return;
        }

        setAcceptingSellOrder (
            buyOrders.map((item, idx) => {
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
                chain: params.center,
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

            //setBuyOrders(data.result.orders);
            //openModal();

            toast.success(Order_accepted_successfully);


            // reouter to

            router.push('/' + params.lang + '/' + params.center + '/pay-usdt/' + orderId);




        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            setAcceptingSellOrder (
                buyOrders.map((item, idx) => {
                    return false;
                })
            );
        } );


    }
    */







    const [privateSale, setprivateSale] = useState(false);




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
        storecode: params.center,
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

      setAddress(data.walletAddress);


    } else {
      toast.error('User registration has been failed');
    }


  }
  */


  /*
  const [acceptingSellOrderRandom, setAcceptingSellOrderRandom] = useState(false);
  const acceptSellOrderRandom = async (
    krwAmount: number,
    depositName: string,
    depositBankName: string,
  ) => {

    
    console.log('acceptSellOrderRandom depositName', depositName);

    if (acceptingSellOrderRandom) {
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
        chain: params.center,
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

        // accept sell order

        const response = await fetch('/api/order/acceptSellOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lang: params.lang,
            chain: params.center,
            orderId: order._id,
            buyerWalletAddress: address,
            buyerNickname: nickname,
            buyerAvatar: '',
            buyerMobile: '010-1234-5678',
            depositName: depositName,
            depositBankName: depositBankName,
          }),
        });

        const data = await response?.json();

        if (data.result) {
          toast.success(Order_accepted_successfully);

          router.push('/' + params.lang + '/' + params.center + '/pay-usdt/' + order._id);

        } else {
          toast.error('Sell order has been failed');
        }



        //setBuyOrders([order]);
      } else {

        
        ///toast.error('Sell order not found');

        // if sell order not found, create buy order


        const response = await fetch('/api/order/setBuyOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: params.lang,
            storecode: params.center,
            walletAddress: address,
            usdtAmount: usdtAmount,
            krwAmount: krwAmount,
            rate: rate,
            privateSale: false,
          })
        });

        const data = await response.json();

        if (data.result) {
          toast.success(Order_accepted_successfully);

          //router.push('/' + params.lang + '/' + params.center + '/pay-usdt/' + order._id);


        } else {
          toast.error('Buy order has been failed');
        }



      }

    } else {
      toast.error('Sell order not found');
    }

    setAcceptingSellOrderRandom(false);

  }
  */


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







  // fetch store info by storecode
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loadingStoreInfo, setLoadingStoreInfo] = useState(false);
  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!params.center) {
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
          storecode: params.center,
        }),
      });

      if (!response) {
        setLoadingStoreInfo(false);
        toast.error('가맹점 정보를 가져오는 데 실패했습니다.');
        return;
      }

      const data = await response?.json();

      //console.log('getOneStore data', data);

      if (data.result) {
        setStoreInfo(data.result);
      }

      setLoadingStoreInfo(false);
    };

    fetchStoreInfo();

  }, [params.clientid, params.center]);


  const storeName = storeInfo?.storeName || clientInfo?.clientInfo?.name || 'CrypToss';
  const storeDescription =
    storeInfo?.storeDescription ||
    '거래 상태, 입금 정보, 정산 진행 상황을 한 화면에서 안전하게 확인합니다.';
  const brandTheme = derivePaymentBrandTheme({
    backgroundColor: storeInfo?.backgroundColor,
    seed: [params.clientid, params.center, storeName].filter(Boolean).join(':'),
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
  const formattedBalance = Number(balance).toFixed(2);
  const maskedWalletAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '자동 연결 대기';
  const paymentMethodLabel =
    oneBuyOrder?.paymentMethod === 'bank'
      ? '계좌이체'
      : oneBuyOrder?.paymentMethod === 'card'
      ? '신용카드'
      : oneBuyOrder?.paymentMethod || '기타';
  const formattedUsdtAmount = oneBuyOrder
    ? Number(oneBuyOrder.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '0.000';
  const formattedKrwAmount = oneBuyOrder?.krwAmount
    ? `${Number(oneBuyOrder.krwAmount).toLocaleString('ko-KR')}원`
    : '0원';
  const orderStatusLabel =
    oneBuyOrder?.status === 'ordered'
      ? '판매자 매칭 중'
      : oneBuyOrder?.status === 'accepted'
      ? '거래 진행 중'
      : oneBuyOrder?.status === 'paymentRequested'
      ? '입금 대기'
      : oneBuyOrder?.status === 'paymentConfirmed'
      ? '정산 완료'
      : oneBuyOrder?.status === 'cancelled'
      ? '거래 취소'
      : '주문 확인 중';
  const orderStatusTone =
    oneBuyOrder?.status === 'paymentConfirmed'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : oneBuyOrder?.status === 'paymentRequested'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : oneBuyOrder?.status === 'accepted'
      ? 'text-sky-700 bg-sky-50 border-sky-200'
      : oneBuyOrder?.status === 'ordered'
      ? 'text-violet-700 bg-violet-50 border-violet-200'
      : 'text-slate-700 bg-slate-50 border-slate-200';
  const resolvedUserType = normalizeUserType(user?.userType || requestedUserType);
  const selectedStoreBankInfo =
    resolvedUserType === 'AAA'
      ? oneBuyOrder?.store?.bankInfoAAA
      : resolvedUserType === 'BBB'
      ? oneBuyOrder?.store?.bankInfoBBB
      : resolvedUserType === 'CCC'
      ? oneBuyOrder?.store?.bankInfoCCC
      : resolvedUserType === 'DDD'
      ? oneBuyOrder?.store?.bankInfoDDD
      : oneBuyOrder?.store?.bankInfo;
  const depositorName = oneBuyOrder?.buyer?.depositName || oneBuyOrder?.tradeId || '-';
  const paymentDeadlineDate = oneBuyOrder?.paymentRequestedAt
    ? new Date(new Date(oneBuyOrder.paymentRequestedAt).getTime() + 1000 * 60 * 30)
    : null;
  const paymentDeadlineLabel = paymentDeadlineDate
    ? `${paymentDeadlineDate.toLocaleDateString()} ${paymentDeadlineDate.toLocaleTimeString()}`
    : '-';
  const canViewPaymentAccount = Boolean(
    address && oneBuyOrder && (oneBuyOrder.walletAddress === address || oneBuyOrder.buyer?.walletAddress === address)
  );



  /*
  useEffect(() => {

    if (!orderId || !address) {
      return;
    }

    // Dynamically load Chat component
    Chat = dynamic(() => import('@/components/Chat'), {
      ssr: false,
      loading: () => <div className="w-full h-full flex items-center justify-center">Loading...</div>,
    });


  }, [orderId, address]);
  */



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
                    {params.center}
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                    {storeInfo?.backgroundColor || brandTheme.base}
                  </span>
                </div>
              </div>
            </div>

            <div className={`shrink-0 rounded-[18px] border px-2.5 py-2 text-right shadow-sm ${orderStatusTone}`}>
              <div className="text-[10px] uppercase tracking-[0.14em] opacity-70">
                Status
              </div>
              <div className="mt-0.5 text-xs font-semibold">
                {loadingStoreInfo ? 'Loading' : orderStatusLabel}
              </div>
            </div>
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
                className='animate-spin'
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
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Order</div>
                <div className="mt-1.5 text-base font-semibold tracking-tight text-slate-900">
                  #{oneBuyOrder?.tradeId || orderId.slice(-8)}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">{orderStatusLabel}</div>
              </div>
              <div
                className="rounded-[18px] border p-3 shadow-sm"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-bg)',
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Amount</div>
                <div className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
                  {formattedUsdtAmount}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">USDT</div>
              </div>
              <div
                className="rounded-[18px] border p-3 shadow-sm"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-bg)',
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Settlement</div>
                <div className="mt-1.5 text-sm font-semibold tracking-tight text-slate-900">
                  {formattedKrwAmount}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">{paymentMethodLabel}</div>
              </div>
              <div
                className="rounded-[18px] border p-3 shadow-sm"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-bg)',
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Wallet</div>
                <div className="mt-1.5 text-xs font-semibold text-slate-900">
                  {address ? '연결 완료' : '연결 대기'}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">{maskedWalletAddress}</div>
              </div>
            </div>
          )}

          {loadingUser ? (
            <div
              className="mt-4 flex items-center gap-2.5 rounded-[18px] border border-dashed px-3 py-3 text-sm text-slate-500"
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
                className='animate-spin'
              />
              회원정보를 불러오는 중입니다.
            </div>
          ) : (
            user && (
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
                      {user?.nickname}
                    </div>
                    <button
                      onClick={() => {
                        if (!address) {
                          return;
                        }

                        navigator.clipboard.writeText(address);
                        toast.success("USDT지갑주소가 복사되었습니다.");
                      }}
                      className="mt-1.5 text-xs text-slate-600 underline underline-offset-4"
                    >
                      {maskedWalletAddress}
                    </button>
                  </div>

                  <div
                    className="rounded-[18px] px-3 py-2.5 text-right text-white shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-shell-from), var(--brand-shell-via), var(--brand-shell-to))',
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
            )
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

        {/*
        <AppBarComponent />
        */}





          {!loadingUser && address && (
            <div className="mb-3 w-full flex flex-col items-center gap-2"> 

              {       
              orderId
              && oneBuyOrder
              && oneBuyOrder.status === 'paymentConfirmed'
              && !oneBuyOrder?.settlement
              && (

                <div className='w-full rounded-[18px] border border-amber-200 bg-[#fff8eb] px-3 py-3'>
                  <div className='flex flex-row gap-2 items-start justify-start'>
                    <Image
                      src="/icon-payment.png"
                      alt="Payment"
                      width={80}
                      height={80}
                      className="animate-pulse"
                    />
                    <span className="text-sm leading-6 text-slate-700">
                      당신이 구매한 테더 <b>{oneBuyOrder.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b> USDT를 상점으로 전송중입니다.
                    </span>
                  </div>
                </div>

              )}


              {
                /*
              orderId && buyOrders.length > 0
              && buyOrders[0]?.paymentMethod === 'bank'
              && buyOrders[0].status === 'paymentConfirmed'
              && balance === 0
              && (
              */
             
              orderId && oneBuyOrder?.paymentMethod === 'bank'
              && oneBuyOrder.status === 'paymentConfirmed'
              && oneBuyOrder?.settlement
              && (

                <div className='w-full rounded-[18px] border border-emerald-200 bg-emerald-50 px-3 py-3'>
                  <div className='flex flex-row gap-2 items-start justify-start'>
                    <Image
                      src="/icon-payment.png"
                      alt="Payment"
                      width={80}
                      height={80}
                    />
                    <span className="text-sm leading-6 text-slate-700">
                      당신이 구매한 테더 <b>{oneBuyOrder.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b> USDT가 상점으로 전송되었습니다. 상점에서 충전 상태를 확인할 수 있습니다.
                    </span>
                  </div>
                </div>

              )}

              
            </div>

          )}



              
          {oneBuyOrder && (
        


            <div className="w-full flex flex-col items-start justify-center gap-3">


              <div className="
                w-full mb-6 grid grid-cols-1 gap-3 items-start justify-center">

                  <div
                    className="relative flex flex-col items-center justify-center"
                  >

                    {oneBuyOrder.status === 'ordered' && (new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime() > 1000 * 60 * 60 * 24) && (
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



                    {oneBuyOrder.status === 'cancelled' && (
                      <div className="absolute inset-0 flex justify-center items-center z-10 pt-10
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

                    {oneBuyOrder.status === 'cancelled' && (
                      <span className="rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                        판매자가 거래를 취소했습니다.
                      </span>
                    )}

                    <div className="
                      w-full flex flex-col gap-2 items-start justify-center
                      ">


                      {address && oneBuyOrder.buyer && oneBuyOrder?.buyer?.walletAddress === address && (
                        <div className="w-full flex flex-row items-center justify-start">
                          <div className='flex flex-row items-center gap-2'>

                            <Image
                                src={oneBuyOrder.avatar || '/profile-default.png'}
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
                                판매자: {

                                    oneBuyOrder.walletAddress === address ? oneBuyOrder.nickname ? oneBuyOrder.nickname : Anonymous  + ' :' + Me :

                                    oneBuyOrder.nickname ? oneBuyOrder.nickname : Anonymous

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

                      {oneBuyOrder.status === 'ordered' && (
                        <div className="w-full rounded-[18px] border border-violet-200 bg-violet-50 px-3 py-3">
                          <div className="flex flex-row items-start justify-start gap-2">
                          {/* new order icon */}
                          {/* loading icon */}
                          <Image
                            src="/icon-matching.png"
                            alt="Loading"
                            width={32}
                            height={32}
                            className="animate-spin"
                          />
                          <p className="text-sm font-medium leading-6 text-violet-700">
                            최적의 판매자와 매칭중입니다.
                          </p>
                          </div>
                        </div>
                      )}

                      {/* 판매자와 거래가 시작되었습니다. */}
                      {oneBuyOrder.status === 'accepted' && (
                        <div className='
                        w-full flex flex-col items-start justify-start gap-2'>

                          <div className="w-full rounded-[18px] border border-sky-200 bg-sky-50 px-3 py-3">
                            <div className="flex flex-row items-center justify-start gap-2">

                            {/* trade icon */}
                            <Image
                              src="/icon-trade.png"
                              alt="Trade"
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                            <p className="text-sm font-medium leading-6 text-sky-700">
                              판매자와 매칭되어 거래가 시작되었습니다.
                            </p>
                            </div>
                          </div>
                          <div className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                            <div className="flex flex-row items-center justify-start gap-2">
                            {/* loading icon */}
                            <Image
                              src="/icon-searching.gif"
                              alt="Loading"
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                            <p className="text-sm font-medium leading-6 text-slate-700">
                              판매자가 구매자를 확인하는 중입니다.
                            </p>
                            </div>
                          </div>


                        </div>
                      )}




                      {/* seller information */}
                      {address && oneBuyOrder.walletAddress === address && oneBuyOrder?.seller && (
                        <div className="w-full rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className='flex flex-row items-center gap-2'>

                            <Image
                                src="/best-seller.png"
                                alt="Best Seller"
                                width={32}
                                height={32}
                            />

                            <span className="text-lg font-semibold">
                                판매자: {
                                    oneBuyOrder?.seller?.nickname ? oneBuyOrder?.seller?.nickname : Anonymous
                                }
                            </span>

                            <Image
                                src="/verified.png"
                                alt="Verified"
                                width={24}
                                height={24}

                            />
                          </div>


                          <div className="flex flex-row gap-2 items-center justify-center">                   
                            <Image
                              src={clientInfo?.clientInfo?.avatar || '/logo.png'}
                              alt="Client Logo"
                              width={32}
                              height={32}
                              className="rounded-full w-8 h-8"
                            />
                            <span className="text-sm text-zinc-500 font-bold">
                              {clientInfo?.clientInfo?.name} P2P 거래소 제공
                            </span>
                          </div>
                          </div>
                        </div>


                      )}




                      <article
                          className={`w-full rounded-[22px] border bg-[#fcfaf6] p-3 shadow-sm
                            ${oneBuyOrder.status === 'ordered' ? 'border-violet-200' : 'border-slate-200'}
                            ${oneBuyOrder.walletAddress === address ? 'border-sky-200' : ''}
                            ${oneBuyOrder.status === 'paymentConfirmed' ? 'border-emerald-200' : ''}
                          `}
                      >


                          {oneBuyOrder.status === 'ordered' && (
                            <div className=" flex flex-col items-start justify-start
                            bg-white/90 px-3 py-3 rounded-[18px] border border-slate-200
                            ">

                              <p className="text-lg font-semibold text-slate-900">
                                거래번호:{' '}#{oneBuyOrder.tradeId}
                              </p>



                              <div className="flex flex-row items-center gap-2">
                                {
                                  (new Date(oneBuyOrder.createdAt).getTime() - new Date().getTime()) / 1000 / 60 / 60 < 24 && (
                                    <Image
                                      src="/icon-new.png"
                                      alt="New Order"
                                      width={32}
                                      height={32}
                                    />
                                  )
                                } 

                              
                                <p className=" text-sm text-slate-500">
                                  {24 - Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60 / 60)} 시간
                                  {' '}후에 자동 취소됩니다.
                                </p>

                              </div>

                            </div>
                          )}


                          { (oneBuyOrder.status === 'accepted' || oneBuyOrder.status === 'paymentRequested' || oneBuyOrder.status === 'paymentConfirmed') && (

                            <div className='w-full flex flex-row items-center justify-between
                              gap-2 rounded-[18px] border border-slate-200 bg-white/90 px-3 py-3'>

                              <p className="text-lg font-semibold text-slate-900">
                                거래번호:{' '}#{oneBuyOrder.tradeId}
                              </p>

                              {oneBuyOrder.status === 'paymentConfirmed' && (

                                <div className='flex flex-row items-end gap-2'>
                                  <Image
                                    src='/icon-approved.png'
                                    alt='Approved'
                                    width={50}
                                    height={50}
                                  />
                                </div>

                              )}

                              
                            </div>

                          )}

                          {oneBuyOrder.acceptedAt && (

                            <div className='flex flex-col items-start gap-2
                            bg-white/90 px-3 py-3 rounded-[18px] border border-slate-200
                            '>

                              <div className='hidden  flex-row items-center gap-2'>

                                {oneBuyOrder.privateSale ? (
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
                                <p className="text-sm text-zinc-500">
                                  

                                  {params.lang === 'ko' ? (

                                    <p className="text-sm text-zinc-500">


                                      {

                                        new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime() < 1000 * 60 ? (
                                          ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000) + ' ' + '초 전'
                                        ) :
                                        new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime() < 1000 * 60 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60) + ' ' + '분 전'
                                        ) : (
                                          ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 전'
                                        )
                                      }{' '}판매시작

                                    </p>

                                    ) : (

                                      <p className="text-sm text-zinc-500">



                                      판매시작{' '}{

                                        new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime() < 1000 * 60 ? (
                                          ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000) + ' ' + '초 전'
                                        ) :
                                        new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime() < 1000 * 60 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60) + ' ' + '분 전'
                                        ) : (
                                          ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 전'
                                        )
                                      }



                                    </p>


                                  )}


                                </p>

                              </div>


                              <div className='hidden flex-row items-center gap-2'>
                                <div className={
                                  ` ml-4 mr-3 bg-emerald-400 w-1 h-[20px]
                                  rounded-full`
                                }></div>

                                {/* difference minutes between payment confirmed and trade started */}
                                <div className='flex flex-row items-center gap-2'>

                                  <Image
                                    src='/timer.png'
                                    alt='Timer'
                                    width={32}
                                    height={32}
                                  />
                                  <div className="text-sm text-emerald-600">
                                    {
                                      ( (new Date(oneBuyOrder.acceptedAt).getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60 ).toFixed(0)
                                    } 분
                                  </div>
                                </div>

                              </div>


                            


                              <div className='flex flex-row items-center gap-2'>


                                <Image
                                  src='/icon-timer.webp'
                                  alt='Timer'
                                  width={32}
                                  height={32}
                                  className='w-6 h-6'
                                />


                                <p className="text-sm text-zinc-500">


                                {params.lang === 'ko' ? (

                                  <p className="ml-2 text-sm text-zinc-500">


                                    {new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime() < 1000 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000) + ' ' + '초 전'
                                    ) :
                                    new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                    ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000 / 60) + ' ' + '분 전'
                                    ) : (
                                      ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 전'
                                    )
                                    }{' '}거래시작

                                  </p>



                                ) : (

                                  <p className="ml-2 text-sm text-zinc-400">

                                    {Trade_Started} {
                                      new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime() < 1000 * 60 ? (
                                        ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000) + ' ' + '초 전'
                                      ) :
                                      new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime() < 1000 * 60 * 60 ? (
                                      ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000 / 60) + ' ' + '분 전'
                                      ) : (
                                        ' ' + Math.floor((new Date().getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000 / 60 / 60) + ' ' + '시간 전'
                                      )
                                    }

                                  </p>

                                )}
                                
                                
                                </p>
                              </div>

                            </div>

                          )}

                          {oneBuyOrder.status === 'paymentConfirmed' && (

                            <div className='flex flex-col items-start gap-2
                            bg-white/90 px-3 py-3 rounded-[18px] border border-slate-200
                            '>

                              {/* vertical line of height for time between trade started  and payment confirmed */}

                              <div className='flex flex-row items-center gap-2'>
                                <div className={
                                  ` ml-4 mr-3 bg-emerald-400 w-1 h-[20px]
                                  rounded-full`
                                }></div>

                                {/* difference minutes between payment confirmed and trade started */}
                                <div className='flex flex-row items-center gap-2'>

                                  <Image
                                    src='/timer.png'
                                    alt='Timer'
                                    width={24}
                                    height={24}
                                  />
                                  <div className="text-sm text-zinc-500">
                                    { ( (new Date(oneBuyOrder.paymentConfirmedAt).getTime() - new Date(oneBuyOrder.acceptedAt).getTime()) / 1000 / 60 ).toFixed(0) } 분
                                  </div>
                                </div>

                              </div>

                              <div className='flex flex-row items-center gap-2 mb-4'>
                                

                                <Image
                                  src='/icon-completed.png'
                                  alt='Completed'
                                  width={24}
                                  height={24}
                                />
                                <p className="text-sm text-zinc-500">
                                  거래완료: {new Date(oneBuyOrder.paymentConfirmedAt).toLocaleDateString() + ' ' + new Date(oneBuyOrder.paymentConfirmedAt).toLocaleTimeString()}
                                </p>
                              </div>

                            </div>



                          )}


                          <div className="mt-3 flex flex-col items-start gap-2 rounded-[18px] border border-slate-200 bg-white/90 p-3">

                            <div className="flex flex-row items-center gap-2 mb-2">
                              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-sm text-slate-500">
                                테더 구매량(USDT)
                              </span>
                              <Image
                                src="/logo-tether.png"
                                alt="USDT"
                                width={24}
                                height={24}
                                className="rounded-full w-6 h-6"
                              />

                              <div className="text-3xl font-bold text-emerald-600"
                                style={{
                                  fontFamily: 'monospace',
                                }}
                              >
                                {
                                  Number(oneBuyOrder.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                              </div>
                            </div>


                            <div className="w-full h-1 bg-emerald-100 rounded-full mb-3">
                              <div
                                className="h-1 bg-emerald-500 rounded-full animate-pulse"
                                style={{
                                  width: '100%',
                                }}
                              ></div>
                            </div>
                            <div className="w-full flex flex-col items-start gap-2">
                              <p className="text-base text-slate-700">
                                구매금액:{' '}
                                {
                                  // currency

                                  Number(oneBuyOrder.krwAmount)?.toLocaleString() + ' 원'


                                }
                              </p>
                              <p className="text-sm text-slate-500">
                                결제수단:{' '}{paymentMethodLabel}
                              </p>
                            </div>


                          </div>


                        


                          {oneBuyOrder.status === 'paymentConfirmed' && oneBuyOrder?.paymentMethod === 'bank' && (
                            <div className="mt-3 rounded-[18px] border border-emerald-200 bg-emerald-50/70 p-3">
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-white shadow-sm">
                                  <Image
                                    src="/icon-bank.png"
                                    alt="Bank"
                                    width={22}
                                    height={22}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-700">
                                    Settlement Complete
                                  </div>
                                  <div className="mt-1 text-base font-semibold text-slate-900">
                                    판매자가 입금을 확인하고 USDT 전송을 완료했습니다.
                                  </div>
                                  <div className="mt-1 text-sm leading-5 text-slate-600">
                                    계좌이체 정보와 입금 내역을 아래에서 다시 확인할 수 있습니다.
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <div className="rounded-[16px] border border-white/90 bg-white/90 px-3 py-2.5">
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                                    Bank Transfer
                                  </div>
                                  <div className="mt-1 text-sm font-semibold text-slate-900">
                                    {selectedStoreBankInfo?.bankName || '-'}
                                  </div>
                                  <div className="mt-0.5 text-sm text-slate-600">
                                    {selectedStoreBankInfo?.accountNumber || '-'}
                                  </div>
                                  <div className="mt-0.5 text-sm text-slate-500">
                                    {selectedStoreBankInfo?.accountHolder || '-'}
                                  </div>
                                </div>

                                <div className="rounded-[16px] border border-white/90 bg-white/90 px-3 py-2.5">
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                                    Transfer Summary
                                  </div>
                                  <div className="mt-1 text-sm font-semibold text-slate-900">
                                    {oneBuyOrder.krwAmount?.toLocaleString('ko-KR', {
                                      style: 'currency',
                                      currency: 'KRW',
                                    })}
                                  </div>
                                  <div className="mt-0.5 text-sm text-slate-600">
                                    입금자명 {depositorName}
                                  </div>
                                  <div className="mt-0.5 text-sm text-emerald-700">
                                    정산 상태 완료
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          

                          {address && oneBuyOrder.walletAddress !== address && oneBuyOrder.status === 'accepted' && (
                            <div className="mt-3 flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-500">
                              <Image
                                src="/loading.png"
                                alt="Escrow"
                                width={24}
                                height={24}
                                className="animate-spin"
                              />
                              구매자 지갑 확인 및 결제 준비 중입니다.
                            </div>
                          )}
                        

                          {/*
                          {oneBuyOrder.status === 'ordered' && (
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
                                                    buyOrders.map((item, idx) => {
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
                                            거래 조건에 동의합니다.
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
                                          구매 {item.usdtAmount} USDT
                                        </button>



                                      </div>

                                    )}

                                  </div>



                                  )}

                                </>

                              )}

                            </>

                          )}
                          */}


                          {oneBuyOrder.status === 'paymentRequested' && (
                            <div className="mt-3 flex flex-col gap-3 rounded-[18px] border border-slate-200 bg-white/90 p-3">
                              <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-200 bg-[#fff8eb] px-3 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-white shadow-sm">
                                  <Image
                                    src="/icon-bank.png"
                                    alt="Bank"
                                    width={22}
                                    height={22}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] uppercase tracking-[0.14em] text-amber-700">
                                    Deposit Guide
                                  </div>
                                  <div className="mt-1 text-base font-semibold text-slate-900">
                                    판매자가 입금 계좌를 지정했습니다.
                                  </div>
                                  <div className="mt-1 text-sm leading-5 text-slate-600">
                                    입금이 완료되면 USDT가 구매자 지갑으로 전송됩니다. 입금자명과 금액을 정확히 맞춰 진행해 주세요.
                                  </div>
                                </div>
                              </div>

                              {canViewPaymentAccount && (
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                  <div className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-3">
                                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                      Deposit Bank
                                    </div>
                                    <div className="mt-1.5 text-sm font-semibold text-slate-900">
                                      {selectedStoreBankInfo?.bankName || '-'}
                                    </div>
                                    <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                      Account Holder
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                      {selectedStoreBankInfo?.accountHolder || '-'}
                                    </div>
                                  </div>

                                  <div className="rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                          Account Number
                                        </div>
                                        <div className="mt-1.5 text-sm font-semibold tracking-tight text-slate-900">
                                          {selectedStoreBankInfo?.accountNumber || '-'}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(selectedStoreBankInfo?.accountNumber || '');
                                          toast.success('계좌번호가 복사되었습니다.');
                                        }}
                                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                                      >
                                        복사
                                      </button>
                                    </div>
                                  </div>

                                  <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                          Depositor Name
                                        </div>
                                        <div className="mt-1.5 text-sm font-semibold text-slate-900">
                                          {depositorName}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(depositorName);
                                          toast.success('입금자명이 복사되었습니다.');
                                        }}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white"
                                      >
                                        복사
                                      </button>
                                    </div>
                                  </div>

                                  <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                          Deposit Amount
                                        </div>
                                        <div className="mt-1.5 text-sm font-semibold text-slate-900">
                                          {oneBuyOrder.krwAmount?.toLocaleString('ko-KR', {
                                            style: 'currency',
                                            currency: 'KRW',
                                          })}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(oneBuyOrder.krwAmount.toString());
                                          toast.success('입금액이 복사되었습니다.');
                                        }}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white"
                                      >
                                        복사
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="rounded-[18px] border border-amber-200 bg-amber-50/80 px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                  <div className="text-sm font-semibold text-slate-900">
                                    입금 기한 {paymentDeadlineLabel}
                                  </div>
                                </div>
                                <div className="mt-1 text-sm leading-5 text-slate-600">
                                  입금 기한까지 입금하지 않으면 거래가 자동으로 취소됩니다.
                                </div>
                              </div>

                              {!address && (
                                <div className="flex items-center gap-2 rounded-[18px] border border-slate-200 bg-[#faf8f4] px-3 py-3 text-sm text-slate-500">
                                  <Image
                                    src="/loading.png"
                                    alt="Escrow"
                                    width={24}
                                    height={24}
                                    className="animate-spin"
                                  />
                                  판매자 결제 확인을 대기 중입니다.
                                </div>
                              )}
                            </div>
                          )}


                      </article>


                    </div>



                    {/*address && orderId && seller && (

                      <div className=' w-full flex items-center justify-center mt-4
                      bg-white shadow-lg rounded-lg p-4
                      border border-gray-200'>

                    
                          
                          <Chat

                            channel={orderId}

                            userId={ address}

                            nickname={ user?.nickname }

                            profileUrl={ user?.avatar }
                          />
                          
                        
                      </div>

                    )*/}



                  
                  </div>



              </div>




            </div>

          
          )}
          

          </section>

          <section
            className="mt-2 rounded-[24px] border p-4 backdrop-blur-sm"
            style={{
              borderColor: 'var(--brand-card-border)',
              backgroundColor: 'var(--brand-card-bg)',
              boxShadow: `0 14px 40px ${brandTheme.panelShadow}`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[18px] text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-shell-from), var(--brand-shell-via), var(--brand-shell-to))',
                  color: 'var(--brand-base-contrast)',
                }}
              >
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
              <li
                className="rounded-[18px] border px-3 py-2.5"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                }}
              >
                거래 전 유의사항을 반드시 확인해 주세요. 안내 내용을 숙지하지 않아 발생하는 문제는 회원 본인의 책임입니다.
              </li>
              <li
                className="rounded-[18px] border px-3 py-2.5"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                }}
              >
                코인 전송 완료 후에는 취소 및 환불이 어렵습니다. 계좌와 금액, 지갑 주소를 다시 확인한 뒤 진행해 주세요.
              </li>
              <li
                className="rounded-[18px] border px-3 py-2.5"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                }}
              >
                거래 관련 사기를 방지하기 위해 입금자명과 사전 등록된 정보가 일치해야 하며, 필요 시 추가 인증을 요청할 수 있습니다.
              </li>
              <li
                className="rounded-[18px] border px-3 py-2.5"
                style={{
                  borderColor: 'var(--brand-card-border)',
                  backgroundColor: 'var(--brand-card-muted)',
                }}
              >
                영업시간은 연중무휴 24시간 운영입니다. 거래 지연이나 문제가 있으면 고객센터를 통해 문의해 주세요.
              </li>
            </ul>
          </section>

          <footer
            className="mb-8 rounded-[20px] border p-4 text-sm text-slate-500"
            style={{
              borderColor: 'var(--brand-card-border)',
              backgroundColor: 'var(--brand-card-bg)',
              boxShadow: `0 12px 32px ${brandTheme.panelShadow}`,
            }}
          >
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





      {/*
      <Modal isOpen={isModalOpen} onClose={closeModal}>
          <TradeDetail
              closeModal={closeModal}
              //goChat={goChat}
          />
      </Modal>
      */}


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
