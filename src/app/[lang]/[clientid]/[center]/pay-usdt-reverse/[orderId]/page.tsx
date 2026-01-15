'use client';

import { useState, useEffect, use } from "react";


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









    // get User by wallet address

    const [user, setUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    useEffect(() => {

        if (!address) {
            return;
        }

        setLoadingUser(true);

        fetch('/api/user/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientid: params.clientid,
                storecode: params.center,
                walletAddress: address,
            }),
        })
        .then(response => response?.json())
        .then(data => {
            
          //console.log('getUser data', data);



          setUser(data.result);

        })
        .catch((error) => {
            console.error('Error:', error);
        });

        setLoadingUser(false);

    } , [address, params.clientid, params.center]);



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

  const [oneBuyOrder, setOneBuyOrder] = useState<any>(null);
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

    <main className="
      pl-2 pr-2
      pb-10 min-h-[100vh] flex flex-col items-center justify-start container
      max-w-screen-sm
      mx-auto
      bg-zinc-50
      text-zinc-500
      ">

      <div className="
        h-32

        w-full flex flex-col gap-2 justify-center items-center
        p-4
        bg-gradient-to-r from-[#f9a8d4] to-[#f472b6]
        rounded-b-2xl
        shadow-lg
        shadow-[#f472b6]
        border-b-2 border-[#f472b6]
        border-opacity-50
        ">


          <div className="w-full flex flex-row items-center justify-between gap-2">


            {loadingStoreInfo ? (
              <div className="w-full flex flex-row items-center justify-start gap-2">
                <Image
                  src="/loading.png"
                  alt="Loading"
                  width={24}
                  height={24}
                  className='animate-spin'
                />
                <div className="text-sm text-zinc-50">
                  가맹점 정보를 불러오는 중입니다.
                </div>
              </div>
            ) : (

                <div className='flex flex-col gap-2 items-center justify-start'>
                  <Image
                    src={'/logo.png'}
                    alt="Store Logo"
                    width={38}
                    height={38}
                    className='
                    w-10 h-10
                      rounded-full'
                  />
                  <span className="text-sm text-zinc-100 font-semibold">
                    {storeInfo?.storeName}
                  </span>
                </div>
            )}

            {loadingUser && (
              <div className="flex flex-row items-center justify-center gap-2">
                <Image
                  src="/loading.png"
                  alt="Loading"
                  width={24}
                  height={24}
                  className='animate-spin'
                />
                <div className="text-sm text-zinc-50">
                  회원정보를 불러오는 중입니다.
                </div>
              </div>
            )}

            {!loadingUser && user && (

              <div className="flex flex-col items-start justify-center gap-2">

                <div className='flex flex-row gap-2 items-center justify-center'>
                  <span className="text-sm text-zinc-100">

                    아이디:{' '}{
                      user?.nickname
                    }
                  </span>


                  {/*
                  {user?.userType === '' && (
                    <span className="text-xs text-white bg-gray-500 px-2 py-1 rounded-full">
                      일반
                    </span>
                  )}

                  {user?.userType === 'AAA' && (
                    <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                      1등급
                    </span>
                  )}
                  {user?.userType === 'BBB' && (
                    <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                      2등급
                    </span>
                  )}
                  {user?.userType === 'CCC' && (
                    <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                      3등급
                    </span>
                  )}
                  {user?.userType === 'DDD' && (
                    <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                      4등급
                    </span>
                  )}
                  */}
                    


                </div>

                <div className='flex flex-row gap-2 items-center justify-center'>
                  <span className="text-sm text-zinc-100">
                    USDT지갑:{' '}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(address);
                      toast.success("USDT지갑주소가 복사되었습니다.");
                    }}
                    className="text-sm underline text-zinc-100 hover:text-zinc-200"
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </button>
                </div>

                {/* balance */}
                <div className="flex flex-row gap-2 items-center justify-center">
                  <span className="text-sm text-zinc-100">
                    잔액:{' '}
                  </span>

                  <div className="flex flex-row items-center justify-center gap-2">
                    <span className="text-xl font-semibold text-zinc-100">
                      {Number(balance).toFixed(2)}
                    </span>
                    {' '}
                    <span className="text-sm text-zinc-100">
                      USDT
                    </span>
                  </div>
                </div>

                
              </div>

            )}

          </div>
      

      </div>



      {/* USDT 가격 binance market price */}
      <div
        className="binance-widget-marquee
        w-full flex flex-row items-center justify-center gap-2
        p-2
        "


        data-cmc-ids="1,1027,52,5426,3408,74,20947,5994,24478,13502,35336,825"
        data-theme="dark"
        data-transparent="true"
        data-locale="ko"
        data-fiat="KRW"
        //data-powered-by="Powered by OneClick USDT"
        //data-disclaimer="Disclaimer"
      ></div>


      <div className="
        mt-5
        p-4  w-full
        flex flex-col gap-2 justify-start items-center
        bg-zinc-50
        rounded-2xl
        shadow-lg
        shadow-zinc-200
        border-2 border-zinc-200
        border-opacity-50
        ">

        {/*
        <AppBarComponent />
        */}





          {!loadingUser && address && (
            <div className="mt-5 w-full flex flex-col items-center gap-2 mb-4"> 

              {       
              orderId
              && oneBuyOrder
              && oneBuyOrder.status === 'paymentConfirmed'
              && !oneBuyOrder?.settlement
              && (

                <div className='w-full flex flex-row gap-2 items-start justify-start
                border-b border-zinc-200 pb-2 mb-2
                '>
                  <Image
                    src="/icon-payment.png"
                    alt="Payment"
                    width={80}
                    height={80}
                    className="animate-pulse"
                  />
                  <span className="text-lg text-zinc-500">
                    당신이 구매한 테더 <b>{oneBuyOrder.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b> USDT를 상점으로 전송중입니다.
                  </span>
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

                <div className='w-full flex flex-row gap-2 items-start justify-start
                border-b border-zinc-200 pb-2 mb-2
                '>
                  <Image
                    src="/icon-payment.png"
                    alt="Payment"
                    width={80}
                    height={80}
                  />
                  <span className="text-lg text-zinc-500">
                    당신이 구매한 테더 <b>{oneBuyOrder.usdtAmount.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b> USDT가 상점으로 전송되었습니다. 상점에서 충전 상태를 확인할 수 있습니다.
                  </span>
                </div>

              )}

              
            </div>

          )}



              
          {oneBuyOrder && (
        


            <div className="w-full flex flex-col xl:flex-row items-start justify-center gap-2">


              <div className="
                w-full mb-10 grid grid-cols-1 gap-4 items-start justify-center">

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
                      <span className="text-lg text-red-500">
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
                        <div className="w-full flex flex-row items-start justify-start gap-2
                          border-b border-zinc-200 pb-2 mb-2">
                          {/* new order icon */}
                          {/* loading icon */}
                          <Image
                            src="/icon-matching.png"
                            alt="Loading"
                            width={32}
                            height={32}
                            className="animate-spin"
                          />
                          <p className=" text-lg text-[#f472b6]">
                            최적의 판매자와 매칭중입니다.
                          </p>
                        </div>
                      )}

                      {/* 판매자와 거래가 시작되었습니다. */}
                      {oneBuyOrder.status === 'accepted' && (
                        <div className='
                        w-full flex flex-col items-start justify-start gap-2'>

                          <div className="w-full flex flex-row items-center justify-start gap-2
                            border-b border-zinc-200 pb-2 mb-2">

                            {/* trade icon */}
                            <Image
                              src="/icon-trade.png"
                              alt="Trade"
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                            <p className=" text-lg text-[#f472b6]">
                              판매자와 매칭되어 거래가 시작되었습니다.
                            </p>
                          </div>
                          <div className="w-full flex flex-row items-center justify-start gap-2
                            border-b border-zinc-200 pb-2 mb-2">
                            {/* loading icon */}
                            <Image
                              src="/icon-searching.gif"
                              alt="Loading"
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                            <p className=" text-lg text-[#f472b6]">
                              판매자가 구매자를 확인하는 중입니다.
                            </p>
                          </div>


                        </div>
                      )}




                      {/* seller information */}
                      {address && oneBuyOrder.walletAddress === address && oneBuyOrder?.seller && (
                        <div className="w-full flex flex-row items-center justify-between
                          gap-2 border-b border-zinc-200 pb-2 mb-2
                          ">
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


                      )}




                      <article
                          className={`w-full bg-white rounded-lg shadow-md shadow-zinc-200 border-2 border-opacity-50
                            ${oneBuyOrder.status === 'ordered' ? 'border-yellow-500' : ''}

                            ${oneBuyOrder.walletAddress === address ? 'border-blue-500' : ''}

                            ${oneBuyOrder.status === 'paymentConfirmed' ? 'border-green-500' : ''}

                            w-96 `
                          }
                      >


                          {oneBuyOrder.status === 'ordered' && (
                            <div className=" flex flex-col items-start justify-start
                            bg-white px-2 py-3 rounded-md  border border-zinc-100
                            ">

                              <p className=" text-xl font-semibold text-[#f472b6] ">
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

                              
                                <p className=" text-sm text-zinc-500">
                                  {24 - Math.floor((new Date().getTime() - new Date(oneBuyOrder.createdAt).getTime()) / 1000 / 60 / 60)} 시간
                                  {' '}후에 자동 취소됩니다.
                                </p>

                              </div>

                            </div>
                          )}


                          { (oneBuyOrder.status === 'accepted' || oneBuyOrder.status === 'paymentRequested' || oneBuyOrder.status === 'paymentConfirmed') && (

                            <div className='w-full flex flex-row items-center justify-between
                              gap-2 bg-white px-2 py-3 rounded-md'>

                              <p className=" text-xl font-semibold text-[#f472b6] ">
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
                            bg-white px-2 py-3 rounded-md  border border-zinc-100
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
                                  ` ml-4 mr-3 bg-green-500 w-1 h-[20px]
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
                                  <div className="text-sm text-green-500">
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
                            bg-white px-2 py-3 rounded-md  border border-zinc-100
                            '>

                              {/* vertical line of height for time between trade started  and payment confirmed */}

                              <div className='flex flex-row items-center gap-2'>
                                <div className={
                                  ` ml-4 mr-3 bg-green-500 w-1 h-[20px]
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


                          <div className="mt-4 flex flex-col items-start gap-2 p-2">

                            <div className="flex flex-row items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-sm text-zinc-500">
                                테더 구매량(USDT)
                              </span>
                              <Image
                                src="/logo-tether.png"
                                alt="USDT"
                                width={24}
                                height={24}
                                className="rounded-full w-6 h-6"
                              />

                              <div className="text-4xl font-bold text-green-600"
                                style={{
                                  fontFamily: 'monospace',
                                }}
                              >
                                {
                                  Number(oneBuyOrder.usdtAmount).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                              </div>
                            </div>


                            <div className="w-full h-1 bg-green-200 rounded-full mb-4">
                              <div
                                className="h-1 bg-green-500 rounded-full animate-pulse"
                                style={{
                                  width: '100%',
                                }}
                              ></div>
                            </div>
                            <div className="w-full flex flex-col items-start gap-2">
                              <p className="text-lg text-zinc-500">
                                구매금액:{' '}
                                {
                                  // currency

                                  Number(oneBuyOrder.krwAmount)?.toLocaleString() + ' 원'


                                }
                              </p>
                              <p className="text-sm text-zinc-500">
                                결제수단:{' '}{oneBuyOrder.paymentMethod === 'bank' ? '계좌이체' : oneBuyOrder.paymentMethod === 'card' ? '신용카드' : '기타'}
                              </p>
                            </div>


                          </div>


                        


                          {oneBuyOrder.status === 'paymentConfirmed' && (
                            <>
                            {oneBuyOrder?.paymentMethod === 'bank' && (

                              <div className="mt-4 flex flex-col items-start gap-2
                              bg-white px-2 py-3 rounded-md  border border-zinc-100
                              
                              ">

                                <p className="mt-4 text-sm text-zinc-500">
                                  계좌이체:{' '}
                                  {/*item.seller?.bankInfo.bankName} {item.seller?.bankInfo.accountNumber} {item.seller?.bankInfo.accountHolder*/}

                                  
                                  {
                                    user?.userType === 'AAA'
                                    ? oneBuyOrder.store?.bankInfoAAA?.bankName
                                    : user?.userType === 'BBB'
                                    ? oneBuyOrder.store?.bankInfoBBB?.bankName
                                    : user?.userType === 'CCC'
                                    ? oneBuyOrder.store?.bankInfoCCC?.bankName
                                    : user?.userType === 'DDD'
                                    ? oneBuyOrder.store?.bankInfoDDD?.bankName
                                    : oneBuyOrder.store?.bankInfo?.bankName
                                  }
                                  {' '}
                                  {
                                    user?.userType === 'AAA'
                                    ? oneBuyOrder.store?.bankInfoAAA?.accountNumber
                                    : user?.userType === 'BBB'
                                    ? oneBuyOrder.store?.bankInfoBBB?.accountNumber
                                    : user?.userType === 'CCC'
                                    ? oneBuyOrder.store?.bankInfoCCC?.accountNumber
                                    : user?.userType === 'DDD'
                                    ? oneBuyOrder.store?.bankInfoDDD?.accountNumber
                                    : oneBuyOrder.store?.bankInfo?.accountNumber
                                  }
                                  {' '}
                                  {
                                    user?.userType === 'AAA'
                                    ? oneBuyOrder.store?.bankInfoAAA?.accountHolder
                                    : user?.userType === 'BBB'
                                    ? oneBuyOrder.store?.bankInfoBBB?.accountHolder
                                    : user?.userType === 'CCC'
                                    ? oneBuyOrder.store?.bankInfoCCC?.accountHolder
                                    : user?.userType === 'DDD'
                                    ? oneBuyOrder.store?.bankInfoDDD?.accountHolder
                                    : oneBuyOrder.store?.bankInfo?.accountHolder
                                  }

                                </p> 
                                <p className="text-sm text-zinc-500">
                                  이체금액: {
                                  oneBuyOrder.krwAmount?.toLocaleString('ko-KR', {
                                    style: 'currency',
                                    currency: 'KRW',
                                  })
                                  }
                                </p>
                                <p className="text-sm text-zinc-500">
                                  입금자명: {
                                    oneBuyOrder.buyer?.depositName ? oneBuyOrder.buyer?.depositName : oneBuyOrder.tradeId
                                  }
                                </p>                        

                                {/* 판매자가 입급을 확인였습니다. */}
                                <div className="flex flex-row items-center gap-2">
                                  <Image
                                    src="/icon-info.png"
                                    alt="Info"
                                    width={32}
                                    height={32}
                                  />
                                  <p className="text-lg text-green-500">
                                    판매자가 입금을 확인하고 USDT를 전송했습니다.
                                  </p>
                                </div>

                              </div>
                              
                            )}

                            </>
                          )}
                          

                          {address && oneBuyOrder.walletAddress !== address && oneBuyOrder.status === 'accepted' && (

                              <div className="mt-10 mb-10 flex flex-row gap-2 items-center justify-start">


                                <Image
                                  src="/loading.png"
                                  alt="Escrow"
                                  width={32}
                                  height={32}
                                  className="animate-spin"
                                />

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

                            <div className="mt-4 mb-10 flex flex-col items-start gap-2
                            bg-white px-2 py-3 rounded-md  border border-zinc-100
                            ">

                              {
                              address && (oneBuyOrder.walletAddress === address || oneBuyOrder.buyer?.walletAddress === address ) && (
                                <>


                                  <div className='flex flex-row items-center gap-2'>
                                    <Image
                                      src='/icon-bank.png'
                                      alt='Bank'
                                      width={24}
                                      height={24}
                                    />
                                    <div className="text-lg font-semibold text-green-500">
                                      입금은행
                                    </div>
                                  </div>

                                  
                                  <div className='flex flex-row items-center gap-2'>
                                    <Image
                                      src='/icon-info.png'
                                      alt='Info'
                                      width={24}
                                      height={24}
                                    />
                                    <span className="text-sm text-zinc-500">
                                      판매자가 입금은행을 선택했습니다.
                                      {' '}
                                      입금이 완료되면 USDT가 구매자 USDT지갑으로 이체됩니다.
                                      {' '}
                                      입금자명을 정확하게 입력하고 입금을 완료해주세요.
                                    </span>
                                  </div>
                                    
                          


                                  <div className='w-full flex flex-col items-start gap-4 mt-4 mb-4
                                    border-b border-zinc-200 pb-2
                                  '>

                                    <div className="flex flex-row items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <span className="text-sm">은행명:</span>
                                      <div className="text-lg font-semibold">
                                      {/*item.seller?.bankInfo.bankName*/}
                                      {
                                        user?.userType === 'AAA'
                                        ? oneBuyOrder.store?.bankInfoAAA?.bankName
                                        : user?.userType === 'BBB'
                                        ? oneBuyOrder.store?.bankInfoBBB?.bankName
                                        : user?.userType === 'CCC'
                                        ? oneBuyOrder.store?.bankInfoCCC?.bankName
                                        : user?.userType === 'DDD'
                                        ? oneBuyOrder.store?.bankInfoDDD?.bankName
                                        : oneBuyOrder.store?.bankInfo?.bankName
                                      }
                                      </div>
                                    </div>



                                    <div className="flex flex-row items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <span className="text-sm">계좌번호:</span>
                                      <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                              user?.userType === 'AAA'
                                              ? oneBuyOrder.store?.bankInfoAAA?.accountNumber
                                              : user?.userType === 'BBB'
                                              ? oneBuyOrder.store?.bankInfoBBB?.accountNumber
                                              : user?.userType === 'CCC'
                                              ? oneBuyOrder.store?.bankInfoCCC?.accountNumber
                                              : user?.userType === 'DDD'
                                              ? oneBuyOrder.store?.bankInfoDDD?.accountNumber
                                              : oneBuyOrder.store?.bankInfo?.accountNumber
                                            );
                                            toast.success("계좌번호가 복사되었습니다.");
                                        } }
                                        className='text-lg font-semibold'
                                      >
                                        {/*item.seller?.bankInfo.accountNumber*/}
                                        {
                                          user?.userType === 'AAA'
                                          ? oneBuyOrder.store?.bankInfoAAA?.accountNumber
                                          : user?.userType === 'BBB'
                                          ? oneBuyOrder.store?.bankInfoBBB?.accountNumber
                                          : user?.userType === 'CCC'
                                          ? oneBuyOrder.store?.bankInfoCCC?.accountNumber
                                          : user?.userType === 'DDD'
                                          ? oneBuyOrder.store?.bankInfoDDD?.accountNumber
                                          : oneBuyOrder.store?.bankInfo?.accountNumber
                                        }
                                      </button>
                                      {' '}
                                      <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                              //item.seller?.bankInfo.accountNumber
                                              user?.userType === 'AAA'
                                              ? oneBuyOrder.store?.bankInfoAAA?.accountNumber
                                              : user?.userType === 'BBB'
                                              ? oneBuyOrder.store?.bankInfoBBB?.accountNumber
                                              : user?.userType === 'CCC'
                                              ? oneBuyOrder.store?.bankInfoCCC?.accountNumber
                                              : user?.userType === 'DDD'
                                              ? oneBuyOrder.store?.bankInfoDDD?.accountNumber
                                              : oneBuyOrder.store?.bankInfo?.accountNumber
                                            );
                                            toast.success("계좌번호가 복사되었습니다.");
                                        } }
                                        className="text-sm xl:text-lg text-zinc-500 bg-zinc-200 px-2 py-1 rounded-md
                                        hover:bg-zinc-300 transition duration-200 ease-in-out"
                                      >
                                        복사
                                      </button>
                                    </div>
                                    
                                    <div className="flex flex-row items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      <span className="text-sm">예금주:</span>
                                      <span className="text-lg font-semibold">
                                      {
                                        user?.userType === 'AAA'
                                        ? oneBuyOrder.store?.bankInfoAAA?.accountHolder
                                        : user?.userType === 'BBB'
                                        ? oneBuyOrder.store?.bankInfoBBB?.accountHolder
                                        : user?.userType === 'CCC'
                                        ? oneBuyOrder.store?.bankInfoCCC?.accountHolder
                                        : user?.userType === 'DDD'
                                        ? oneBuyOrder.store?.bankInfoDDD?.accountHolder
                                        : oneBuyOrder.store?.bankInfo?.accountHolder
                                      }
                                      </span>
                                    </div>

                                  </div>

                                  

                                  <div className='flex flex-row items-center gap-2'>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <div className="text-sm">
                                      입금자명:{' '}
                                      <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(oneBuyOrder.buyer?.depositName ? oneBuyOrder.buyer?.depositName : oneBuyOrder.tradeId);
                                            toast.success("입금자명이 복사되었습니다.");
                                        } }
                                        className="text-lg font-semibold"
                                      >
                                        {oneBuyOrder.buyer?.depositName ? oneBuyOrder.buyer?.depositName : oneBuyOrder.tradeId}
                                      </button>
                                      {' '}
                                      <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(oneBuyOrder.buyer?.depositName ? oneBuyOrder.buyer?.depositName : oneBuyOrder.tradeId);
                                            toast.success("입금자명이 복사되었습니다.");
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
                                      입금액:{' '}

                                      <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(oneBuyOrder.krwAmount.toString());
                                            toast.success("입금액이 복사되었습니다.");
                                        } }
                                        className="text-lg font-semibold"
                                      >
                                        {oneBuyOrder.krwAmount?.toLocaleString('ko-KR', {
                                            style: 'currency',
                                            currency: 'KRW'
                                          })
                                        }
                                      </button>
                                      {' '}
                                      <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(oneBuyOrder.krwAmount.toString());
                                            toast.success("입금액이 복사되었습니다.");
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
                                  입금 기한: {

                                    // 30 minutes after payment requested

                                    new Date(new Date(oneBuyOrder.paymentRequestedAt).getTime() + 1000 * 60 * 30).toLocaleDateString() + ' ' + new Date(new Date(oneBuyOrder.paymentRequestedAt).getTime() + 1000 * 60 * 30).toLocaleTimeString()

                                  }
                                </div>

                              </div>

                              <div className="mt-4 flex flex-row items-center gap-2">
                                <Image
                                  src="/icon-info.png"
                                  alt="Info"
                                  width={24}
                                  height={24}
                                />
                                <span className="text-lg text-green-500">
                                  입금 기한까지 입금하지 않으면 거래가 취소됩니다.
                                </span>
                              </div>

                              {!address && (
                            
                                <div className="mt-4 flex flex-row gap-2 items-center justify-start">

                                  {/* rotate loading icon */}
                                
                                  <Image
                                    src="/loading.png"
                                    alt="Escrow"
                                    width={32}
                                    height={32}
                                    className="animate-spin"
                                  />

                                  <div>판매자 결제 확인 대기 중...</div>

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
          

        
      </div>




      {/* footer */}
      {/* 이용약관 / 개인정보처리방침 / 고객센터 */}
      <div className="
        w-full
        flex flex-col items-center justify-center mt-10 mb-10
        bg-white shadow-lg rounded-lg p-6
        border border-gray-200
        ">
        <div className="flex flex-row items-center justify-center gap-2">
          <a
            href="#"
            className="text-sm text-zinc-500 hover:text-blue-500"
          >
            이용약관
          </a>
          <span className="text-sm text-zinc-500">|</span>
          <a
            href="#"
            className="text-sm text-zinc-500 hover:text-blue-500"
          >
            개인정보처리방침
          </a>
          <span className="text-sm text-zinc-500">|</span>
          <a
            href="#"
            className="text-sm text-zinc-500 hover:text-blue-500"
          >
            고객센터
          </a>
        </div>
        <div className="text-sm text-zinc-500 mt-2">
          © 2023 Iskan9. All rights reserved.
        </div>

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


