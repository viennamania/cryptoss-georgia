# 결제 API 연동 문서

문서 버전: 1.0  
기준 일자: 2026-03-19  
기준 구현: `src/app/[lang]/[clientid]/[center]/payment` 기준 현재 코드

## 1. 문서 범위

이 문서는 현재 활성 결제 페이지인 `/[lang]/[clientid]/[center]/payment` 및 후속 상세 흐름에서 사용하는 API를 업체 연동용으로 정리한 문서입니다.

이 문서는 3가지를 구분해서 설명합니다.

- 브라우저 또는 외부 클라이언트가 직접 호출하는 Next.js API
- Next.js API가 내부적으로 호출하는 백엔드 API
- 서버 내부에서만 호출해야 하는 외부 서비스 API

## 2. 핵심 요약

- 현재 결제 페이지에서는 `thirdweb` 스마트 어카운트 연결 없이도 구매 진행이 가능합니다.
- `clientid = 150b53f165222304af7c45dc45c73863` 인 경우, Stable 백엔드 대상은 `STABLE_API_URL5` 입니다.
- 실제 결제 주문 생성의 핵심 백엔드 API는 `POST {STABLE_API_URL5}/api/order/setBuyOrder` 입니다.
- 결제요청은 Next.js 서버를 통해 `POST https://api.payaction.app/order` 로 전달됩니다.
- 결제확정은 Next.js 서버에서 `thirdweb SDK` 또는 `THIRDWEB_ENGINE_URL` 을 통해 처리됩니다.

## 3. 기본 URL

업체 전달 시에는 실제 도메인 값만 바꿔서 사용하면 됩니다.

- 웹/API 게이트웨이: `https://{your-domain}`
- Next.js API Base: `https://{your-domain}/api`
- Stable 백엔드 Base: `{STABLE_API_URL5}/api`
- Payaction: `https://api.payaction.app`

## 4. 권장 연동 방식

외부 업체에는 아래 2가지 방식 중 하나를 안내하는 것이 좋습니다.

### A. 권장: Next.js API 기준 연동

장점:

- 클라이언트는 `/api/...` 만 알면 됩니다.
- Payaction, thirdweb, 감사로그, 후처리가 서버에 캡슐화됩니다.
- 추후 내부 백엔드 주소 변경 시 외부 업체 수정 범위가 줄어듭니다.

### B. 직접 연동: Stable 백엔드 기준 연동

장점:

- 중간 프록시 없이 핵심 주문 생성 API를 바로 호출할 수 있습니다.

주의:

- 이 경우 Payaction, thirdweb, 감사로그, 운영 예외처리 로직은 별도로 맞춰야 합니다.

## 5. 결제 흐름 요약

현재 `payment` 페이지 기준 일반적인 흐름은 아래와 같습니다.

1. `clientid`, `storecode` 로 가맹점/클라이언트 정보를 조회합니다.
2. 사용자 정보를 기준으로 구매자 지갑 주소를 생성하거나 조회합니다.
3. 동일 사용자에 이미 진행 중인 구매 주문이 있는지 확인합니다.
4. 같은 KRW 금액의 오픈 판매 주문이 있으면 판매 주문을 즉시 수락합니다.
5. 없으면 신규 구매 주문을 생성합니다.
6. 주문 생성 후 `pay-usdt-reverse/[orderId]` 페이지로 이동합니다.
7. 상세 흐름에서 필요 시 결제요청과 결제확정을 진행합니다.

## 6. 외부 업체가 알아야 하는 주요 API

아래는 업체가 실제로 참고하거나 직접 연동할 가능성이 높은 API입니다.

### 6.1 클라이언트 정보 조회

- Method: `POST`
- Endpoint: `/api/client/getClientInfo`
- 내부 대상: `POST {STABLE_API_URL5}/api/client/getClientInfo`

요청 예시:

```json
{
  "clientid": "150b53f165222304af7c45dc45c73863"
}
```

성공 응답 예시:

```json
{
  "result": {
    "chain": "arbitrum",
    "clientInfo": {
      "exchangeRateUSDT": {
        "KRW": 1400
      }
    }
  }
}
```

비고:

- 프론트는 이 응답에서 `chain`, `clientInfo.exchangeRateUSDT.KRW` 값을 사용합니다.

### 6.2 가맹점 정보 조회

- Method: `POST`
- Endpoint: `/api/store/getOneStore`
- 내부 대상: `POST {STABLE_API_URL5}/api/store/getOneStore`

요청 예시:

```json
{
  "clientid": "150b53f165222304af7c45dc45c73863",
  "storecode": "wmipqryz"
}
```

성공 응답 예시:

```json
{
  "result": {
    "storecode": "wmipqryz",
    "storeName": "가맹점명",
    "agentcode": "agent001",
    "liveOnAndOff": true,
    "maxPaymentAmountKRW": 3000000
  }
}
```

비고:

- 현재 프론트는 `agentcode`, `liveOnAndOff`, `maxPaymentAmountKRW` 등을 사용합니다.

### 6.3 구매자 생성 또는 조회

- Method: `POST`
- Endpoint: `/api/user/setBuyerWithoutWalletAddressByStorecode`
- 내부 대상: `POST {STABLE_API_URL5}/api/user/setBuyerWithoutWalletAddressByStorecode`

요청 예시:

```json
{
  "clientid": "150b53f165222304af7c45dc45c73863",
  "storecode": "wmipqryz",
  "userCode": "merchant-user-001",
  "userName": "홍길동",
  "userBankName": "국민은행",
  "userBankAccountNumber": "12345678901234",
  "userType": "buyer"
}
```

응답 예시:

```json
{
  "walletAddress": "0x1234...abcd",
  "buyOrderStatus": "none",
  "userType": "buyer",
  "liveOnAndOff": true
}
```

비고:

- 현재 프론트는 이 응답에서 `walletAddress`, `buyOrderStatus`, `userType`, `liveOnAndOff` 를 기대합니다.
- 이 단계에서 발급되거나 조회된 `walletAddress` 가 이후 주문 생성 시 구매자 지갑 주소로 사용됩니다.

### 6.4 기존 구매 주문 확인

- Method: `POST`
- Endpoint: `/api/order/getOneBuyOrderByNicknameAndStorecode`
- 내부 대상: 로컬 MongoDB 조회

요청 예시:

```json
{
  "lang": "kr",
  "clientid": "150b53f165222304af7c45dc45c73863",
  "storecode": "wmipqryz",
  "nickname": "merchant-user-001"
}
```

응답 예시:

```json
{
  "result": {
    "_id": "6843c74d7861b46551a752f2",
    "status": "ordered"
  }
}
```

비고:

- 진행 중 주문이 있으면 프론트는 새 주문을 만들지 않고 상세 페이지로 이동합니다.

### 6.5 판매 주문 조회

- Method: `POST`
- Endpoint: `/api/order/getAllSellOrders`
- 내부 대상: 로컬 MongoDB 조회

요청 예시:

```json
{
  "lang": "kr",
  "storecode": "wmipqryz"
}
```

응답 예시:

```json
{
  "result": {
    "orders": [
      {
        "_id": "sell-order-id",
        "krwAmount": 50000,
        "status": "ordered"
      }
    ]
  }
}
```

비고:

- 현재 프론트는 `선택한 KRW 금액` 과 같은 `ordered` 상태 판매 주문이 있으면 이를 우선 매칭합니다.

### 6.6 판매 주문 수락

- Method: `POST`
- Endpoint: `/api/order/acceptSellOrder`
- 내부 대상: 로컬 주문 처리 + Twilio SMS 발송

요청 예시:

```json
{
  "lang": "kr",
  "storecode": "wmipqryz",
  "orderId": "sell-order-id",
  "buyerWalletAddress": "0x1234...abcd",
  "buyerNickname": "merchant-user-001",
  "buyerAvatar": "",
  "buyerMobile": "01012345678",
  "depositName": "홍길동",
  "depositBankName": "국민은행",
  "depositBankAccountNumber": "12345678901234",
  "auditContext": {
    "eventSource": "payment_page_match_order"
  }
}
```

응답 예시:

```json
{
  "result": {
    "_id": "sell-order-id",
    "status": "accepted",
    "tradeId": "T123456"
  }
}
```

비고:

- 구매 측에서 같은 금액의 판매 주문을 즉시 수락하는 흐름일 때 사용됩니다.

### 6.7 구매 주문 생성

- Method: `POST`
- Endpoint: `/api/order/setBuyOrder`
- 내부 대상: `POST {STABLE_API_URL5}/api/order/setBuyOrder`

요청 예시:

```json
{
  "lang": "kr",
  "clientid": "150b53f165222304af7c45dc45c73863",
  "storecode": "wmipqryz",
  "walletAddress": "0x1234...abcd",
  "nickname": "merchant-user-001",
  "usdtAmount": 35.71,
  "krwAmount": 50000,
  "rate": 1400,
  "privateSale": false,
  "buyer": {
    "depositBankName": "국민은행",
    "depositBankAccountNumber": "12345678901234",
    "depositName": "홍길동"
  },
  "returnUrl": "https://merchant.example.com/payment/result",
  "orderNumber": "ORDER-20260319-0001",
  "phoneNumber": "01012345678",
  "mobile": "01012345678",
  "auditContext": {
    "eventSource": "payment_page_create_order"
  }
}
```

성공 응답 예시:

```json
{
  "result": {
    "_id": "6843c74d7861b46551a752f2",
    "walletAddress": "0x1234...abcd"
  }
}
```

비고:

- 현재 활성 구매 흐름에서 가장 중요한 주문 생성 API입니다.
- 프론트는 성공 시 `result._id` 를 받아 `pay-usdt-reverse/[orderId]` 로 이동합니다.
- 현재 구현에서는 연결된 휴대폰 번호가 있으면 `phoneNumber`, `mobile` 로 함께 전달합니다.

### 6.8 구매 주문 단건 조회

- Method: `POST`
- Endpoint: `/api/order/getOneBuyOrderByOrderId`
- 내부 대상: `POST {STABLE_API_URL5}/api/order/getOneBuyOrderByOrderId`

요청 예시:

```json
{
  "clientid": "150b53f165222304af7c45dc45c73863",
  "orderId": "6843c74d7861b46551a752f2"
}
```

응답 예시:

```json
{
  "result": {
    "orders": [
      {
        "_id": "6843c74d7861b46551a752f2",
        "status": "ordered"
      }
    ]
  }
}
```

비고:

- 후속 상세 페이지에서 주문 상태 확인에 사용됩니다.

## 7. 서버 내부 전용 API

아래 API는 외부 업체가 직접 호출하기보다는, 서버 내부 오케스트레이션용으로 보는 것이 맞습니다.

### 7.1 결제요청

- Method: `POST`
- Endpoint: `/api/order/requestPayment`
- 실제 외부 대상: `POST https://api.payaction.app/order`

Next.js 요청 예시:

```json
{
  "lang": "kr",
  "storecode": "wmipqryz",
  "orderId": "6843c74d7861b46551a752f2",
  "transactionHash": "0xabc..."
}
```

서버가 Payaction 으로 전달하는 주요 필드:

```json
{
  "order_number": "tradeId",
  "order_amount": 50000,
  "order_date": "2026-03-19T12:00:00.000Z",
  "billing_name": "홍길동",
  "orderer_name": "홍길동",
  "orderer_phone_number": "01012345678",
  "orderer_email": "buyer@example.com",
  "trade_usage": "USDT구매",
  "identity_number": "홍길동"
}
```

주의:

- Payaction API Key 와 Mall ID 는 서버에서 storecode 기준으로 조회합니다.
- `x-api-key`, `x-mall-id` 헤더는 서버에서만 관리해야 합니다.

### 7.2 결제확정

- Method: `POST`
- Endpoint: `/api/order/confirmPayment`
- 실제 처리:
  - `isSmartAccount = true` 이면 thirdweb SDK 로 온체인 전송
  - `isSmartAccount = false` 이면 `POST {THIRDWEB_ENGINE_URL}/backend-wallet/{chainId}/transfer`

요청 예시:

```json
{
  "lang": "kr",
  "storecode": "wmipqryz",
  "orderId": "6843c74d7861b46551a752f2",
  "paymentAmount": 50000,
  "isSmartAccount": false
}
```

주의:

- 이 API 는 서버 비밀키, 에스크로 지갑, thirdweb engine access token 이 필요하므로 클라이언트 직접 호출용 공개 API로 보는 것은 적절하지 않습니다.

### 7.3 thirdweb 연결 로그

- Method: `POST`
- Endpoint: `/api/user/logThirdwebWalletLogin`
- 실제 처리:
  - `THIRDWEB_SECRET_KEY` 가 있으면 thirdweb 서버에서 사용자 스냅샷 조회
  - 로컬 MongoDB 에 프로필, 로그인 세션, 감사로그 저장

비고:

- 현재 결제 페이지에서 스마트 어카운트 연결은 선택사항이지만, 연결 시 이 로그 API 가 호출될 수 있습니다.

## 8. 인증과 보안 주의사항

- 현재 코드 기준 다수의 Next.js API 호출에는 별도 `Authorization` 헤더가 사용되지 않습니다.
- 외부 업체가 직접 Stable 백엔드를 호출하게 할 경우, IP 제한, 별도 서명, 전용 키 발급 등 추가 보안 설계가 필요합니다.
- `Payaction API Key`, `x-mall-id`, `THIRDWEB_SECRET_KEY`, `THIRDWEB_ENGINE_ACCESS_TOKEN`, DB 접속 정보는 반드시 서버에서만 보관해야 합니다.
- 클라이언트나 제3자 업체 문서에는 비밀키 값을 포함하면 안 됩니다.

## 9. 응답 형식 규칙

현재 코드에서 클라이언트가 기대하는 기본 패턴은 아래와 같습니다.

성공:

```json
{
  "result": {}
}
```

실패:

```json
{
  "result": null,
  "error": "에러 메시지"
}
```

또는 일부 API 는 아래처럼 필드를 직접 반환합니다.

```json
{
  "walletAddress": "0x1234...abcd",
  "buyOrderStatus": "none"
}
```

즉, 응답 포맷은 완전히 단일화되어 있지 않으므로 업체 전달 시 API별 예시를 함께 주는 것이 좋습니다.

## 10. 업체 전달 시 권장 안내 문구

아래 문구를 그대로 전달해도 됩니다.

> 현재 결제 연동은 Next.js API 게이트웨이를 통해 Stable 백엔드, Payaction, thirdweb 엔진을 순차 호출하는 구조입니다.  
> 외부 업체 연동은 우선 `/api/order/setBuyOrder` 중심으로 맞추고, 결제요청과 결제확정은 서버 내부 오케스트레이션으로 처리하는 방식을 권장합니다.  
> `clientid = 150b53f165222304af7c45dc45c73863` 의 Stable 백엔드 대상은 `STABLE_API_URL5` 입니다.

## 11. 확인이 필요한 항목

업체와 실제 연동 전에 아래는 별도 확인이 필요합니다.

- Stable 백엔드가 `phoneNumber`, `mobile` 필드를 실제 저장하는지
- 외부 업체가 직접 호출할 기준이 Next.js API 인지, Stable 백엔드 직접 호출인지
- `returnUrl`, `orderNumber` 의 필수 여부와 포맷 규칙
- Payaction 응답값 중 업체에 콜백으로 내려야 하는 필드가 있는지
- 주문 상태값의 전체 enum 목록

## 12. 코드 기준 파일

- `src/app/[lang]/[clientid]/[center]/payment/page.tsx`
- `src/app/api/client/getClientInfo/route.ts`
- `src/app/api/store/getOneStore/route.ts`
- `src/app/api/user/setBuyerWithoutWalletAddressByStorecode/route.ts`
- `src/app/api/order/setBuyOrder/route.ts`
- `src/app/api/order/requestPayment/route.ts`
- `src/app/api/order/confirmPayment/route.ts`
- `src/app/config/stable.ts`
