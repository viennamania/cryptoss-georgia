# 결제 API 연동 문서

업체 공유용 요약본  
버전: 1.0  
기준 일자: 2026-03-19  
기준 화면: `/[lang]/[clientid]/[center]/payment`

## 1. 문서 목적

이 문서는 외부 연동 업체에 전달하기 위한 결제 API 요약 문서입니다.

현재 운영 구조는 다음과 같습니다.

- 웹 프론트는 Next.js API 를 호출합니다.
- Next.js API 는 Stable 백엔드, Payaction, thirdweb 관련 서버 처리를 중계합니다.
- 외부 업체 연동은 가능하면 Next.js API 기준으로 맞추는 것을 권장합니다.

## 2. 기본 정보

- 웹/API 도메인: `https://{your-domain}`
- Next.js API Base: `https://{your-domain}/api`
- Stable 백엔드 Base: `{STABLE_API_URL5}/api`
- Payaction Base: `https://api.payaction.app`
- 대상 clientid: `150b53f165222304af7c45dc45c73863`

참고:

- 위 `clientid` 는 현재 코드에서 `STABLE_API_URL5` 로 매핑됩니다.
- 현재 결제 페이지에서는 스마트 어카운트 연결 없이도 구매를 진행할 수 있습니다.

## 3. 권장 연동 구조

### 권장 방식

외부 업체 -> Next.js API -> Stable 백엔드 / Payaction / thirdweb

장점:

- 외부 업체는 내부 백엔드 구조를 몰라도 됩니다.
- 서버 비밀키와 외부 서비스 키를 외부에 노출하지 않습니다.
- 내부 구현 변경 시 외부 연동 수정 범위가 작습니다.

### 비권장 방식

외부 업체 -> Stable 백엔드 직접 호출

주의:

- 주문 생성 외 후속 결제요청, 결제확정, 감사로그, thirdweb 처리를 따로 맞춰야 합니다.

## 4. 전체 흐름

현재 `payment` 페이지 기준 구매 흐름은 아래와 같습니다.

1. 클라이언트 정보 조회
2. 가맹점 정보 조회
3. 구매자 생성 또는 조회
4. 기존 진행 주문 확인
5. 같은 금액의 판매 주문이 있으면 즉시 수락
6. 없으면 구매 주문 생성
7. 주문 상세 페이지로 이동
8. 필요 시 결제요청
9. 필요 시 결제확정

## 5. 업체가 직접 알아야 하는 주요 API

아래 API 가 외부 연동 기준 핵심입니다.

| 순서 | API | 목적 | 실제 대상 |
|---|---|---|---|
| 1 | `POST /api/client/getClientInfo` | 클라이언트 환경 조회 | `POST {STABLE_API_URL5}/api/client/getClientInfo` |
| 2 | `POST /api/store/getOneStore` | 가맹점 정보 조회 | `POST {STABLE_API_URL5}/api/store/getOneStore` |
| 3 | `POST /api/user/setBuyerWithoutWalletAddressByStorecode` | 구매자 생성/조회 | `POST {STABLE_API_URL5}/api/user/setBuyerWithoutWalletAddressByStorecode` |
| 4 | `POST /api/order/getOneBuyOrderByNicknameAndStorecode` | 기존 진행 주문 확인 | 로컬 DB |
| 5 | `POST /api/order/getAllSellOrders` | 매칭 가능한 판매 주문 조회 | 로컬 DB |
| 6 | `POST /api/order/acceptSellOrder` | 기존 판매 주문 수락 | 로컬 주문 처리 |
| 7 | `POST /api/order/setBuyOrder` | 신규 구매 주문 생성 | `POST {STABLE_API_URL5}/api/order/setBuyOrder` |
| 8 | `POST /api/order/getOneBuyOrderByOrderId` | 생성된 주문 조회 | `POST {STABLE_API_URL5}/api/order/getOneBuyOrderByOrderId` |

## 6. API 상세

### 6.1 `POST /api/client/getClientInfo`

목적:

- 결제 체인 정보와 USDT 환율 정보를 조회합니다.

요청:

```json
{
  "clientid": "150b53f165222304af7c45dc45c73863"
}
```

응답 예시:

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

### 6.2 `POST /api/store/getOneStore`

목적:

- 가맹점 이름, 상태, 한도 등의 운영 정보를 조회합니다.

요청:

```json
{
  "clientid": "150b53f165222304af7c45dc45c73863",
  "storecode": "wmipqryz"
}
```

응답 예시:

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

### 6.3 `POST /api/user/setBuyerWithoutWalletAddressByStorecode`

목적:

- 구매자 식별 정보와 입금 정보를 기준으로 구매자 지갑 주소를 생성하거나 조회합니다.

요청:

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

핵심 응답 필드:

- `walletAddress`
- `buyOrderStatus`
- `userType`
- `liveOnAndOff`

### 6.4 `POST /api/order/getOneBuyOrderByNicknameAndStorecode`

목적:

- 동일 사용자에게 이미 진행 중인 구매 주문이 있는지 확인합니다.

요청:

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

### 6.5 `POST /api/order/getAllSellOrders`

목적:

- 선택 금액과 매칭 가능한 오픈 판매 주문을 조회합니다.

요청:

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

### 6.6 `POST /api/order/acceptSellOrder`

목적:

- 기존 판매 주문이 있으면 해당 주문을 즉시 수락합니다.

요청:

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

### 6.7 `POST /api/order/setBuyOrder`

목적:

- 매칭 가능한 판매 주문이 없을 때 신규 구매 주문을 생성합니다.

요청:

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

응답 예시:

```json
{
  "result": {
    "_id": "6843c74d7861b46551a752f2",
    "walletAddress": "0x1234...abcd"
  }
}
```

핵심 포인트:

- 현재 활성 구매 흐름의 핵심 주문 생성 API 입니다.
- 성공 시 `result._id` 를 주문 ID 로 사용합니다.
- 연결된 휴대폰 번호가 있으면 `phoneNumber`, `mobile` 로 함께 전달됩니다.

### 6.8 `POST /api/order/getOneBuyOrderByOrderId`

목적:

- 생성된 구매 주문을 주문 ID 기준으로 조회합니다.

요청:

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

## 7. 서버 내부 처리 API

아래 API 는 외부 업체가 직접 호출하는 공개 API 라기보다, 서버 내부 오케스트레이션용으로 보는 것이 맞습니다.

### 7.1 `POST /api/order/requestPayment`

목적:

- 주문을 기준으로 Payaction 결제요청을 서버에서 대신 수행합니다.

실제 외부 대상:

- `POST https://api.payaction.app/order`

서버 요청 예시:

```json
{
  "lang": "kr",
  "storecode": "wmipqryz",
  "orderId": "6843c74d7861b46551a752f2",
  "transactionHash": "0xabc..."
}
```

중요:

- `x-api-key`, `x-mall-id` 는 서버에서만 관리합니다.
- 외부 업체에 Payaction 비밀키를 전달하는 방식은 권장하지 않습니다.

### 7.2 `POST /api/order/confirmPayment`

목적:

- 주문 확정 시 USDT 전송과 상태 반영을 서버에서 처리합니다.

실제 처리:

- `isSmartAccount = true` 이면 thirdweb SDK 직접 전송
- `isSmartAccount = false` 이면 thirdweb engine transfer API 사용

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

## 8. 응답 형식

현재 구현에서 자주 쓰는 응답 패턴은 아래와 같습니다.

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

주의:

- 일부 API 는 `result` 래퍼 없이 `walletAddress`, `buyOrderStatus` 같은 필드를 직접 반환합니다.
- 따라서 실제 연동 시에는 API 별 예시 응답 기준으로 파싱하는 것이 안전합니다.

## 9. 보안 주의사항

- `Payaction API Key`, `Mall ID`, `THIRDWEB_SECRET_KEY`, `THIRDWEB_ENGINE_ACCESS_TOKEN` 은 반드시 서버에서만 보관해야 합니다.
- 외부 업체가 Stable 백엔드를 직접 호출하게 할 경우 별도 인증 체계가 필요합니다.
- 현재 구조상 외부 업체에는 가능하면 Next.js API 만 개방하는 것이 안전합니다.

## 10. 업체 전달용 문구

아래 문구를 메일 또는 메신저에 그대로 사용할 수 있습니다.

> 현재 결제 연동은 웹에서 Next.js API 를 호출하고, 서버가 Stable 백엔드와 Payaction, thirdweb 관련 처리를 순차 수행하는 구조입니다.  
> 외부 연동은 우선 `/api/order/setBuyOrder` 중심으로 맞추고, 결제요청과 결제확정은 서버 내부 처리로 두는 방식을 권장드립니다.  
> 대상 `clientid` 의 Stable 백엔드 Base 는 `STABLE_API_URL5` 입니다.

## 11. 첨부용 파일

- 상세 기술 문서: `docs/payment-api-integration-ko.md`
- 공유용 요약 문서: `docs/payment-api-integration-ko-share.md`
