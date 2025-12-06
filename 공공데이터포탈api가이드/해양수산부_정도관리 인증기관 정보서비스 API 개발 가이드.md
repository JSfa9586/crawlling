# 해양수산부_정도관리 인증기관 정보서비스 API 개발 가이드

## 목차
1. 개요
2. 인증 및 공통 사항
3. API 분류별 상세
    3.1. 정도관리 인증기관 정보 조회 (GET /QualityControlCertification)
4. 에러 코드 및 트러블슈팅
5. 개발 체크리스트

## 1. 개요

본 문서는 **해양수산부_정도관리 인증기관 정보서비스** API를 활용하여 개발을 진행하는 개발자를 위한 가이드라인입니다. 이 API는 해양수산 분야의 정도관리(Quality Management) 인증기관 정보를 조회하는 기능을 제공합니다.

*   **API 서비스명:** 해양수산부_정도관리 인증기관 정보서비스
*   **설명:** 인증기관명, 인증항목, 시작일, 종료일, 주소, 인증분야, 인증번호 등으로 구성된 정도관리 인증기관 정보를 제공합니다.
*   **API 유형:** REST
*   **데이터 포맷:** XML (JSON 형식은 지원하지 않음)
*   **키워드:** 해양환경, 정도관리, 정도관리 인증기관, 인증, 이력정보

## 2. 인증 및 공통 사항

### 2.1. 인증 방법 (Authentication)

본 API는 **API Key (ServiceKey)**를 이용한 인증 방식을 사용합니다.

*   **인증키 (ServiceKey):** 공공데이터포털에서 발급받은 인증키를 사용합니다.
*   **인증 방식:** 모든 API 요청 시 필수 요청 변수 `ServiceKey`에 인증키를 포함하여 전달해야 합니다.
*   **주의사항:** `ServiceKey` 값은 반드시 **URL-Encode**하여 전송해야 합니다.

### 2.2. 요청 제한 사항 (Request Limits)

| 구분 | 제한 트래픽 | 비고 |
| :--- | :--- | :--- |
| **개발계정** | 10,000건/일 | |
| **운영계정** | 활용사례 등록 시 신청하면 트래픽 증가 가능 | |
| **심의유형** | 개발단계: 자동승인 / 운영단계: 자동승인 | |

### 2.3. 공통 응답 파라미터 (Common Response Parameters)

모든 응답은 최상위 레벨에 다음과 같은 공통 파라미터를 포함합니다.

| 항목명(국문) | 항목명(영문) | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| 결과코드 | resultCode | 필수 | String | 00: 성공 |
| 결과메시지 | resultMsg | 필수 | String | 정상적인 서비스 응답 메시지 |
| 한 페이지 결과 수 | numOfRows | 필수 | Integer | 한 페이지당 표출 데이터 수 |
| 페이지 번호 | pageNo | 필수 | Integer | 현재 페이지 번호 |
| 데이터 총 개수 | totalCount | 필수 | Integer | 전체 데이터 개수 |

## 3. API 분류별 상세

### 3.1. 정도관리 인증기관 정보 조회 (GET /QualityControlCertification)

정도관리 인증기관 정보를 목록 형태로 조회합니다.

*   **분류/카테고리:** 정도관리 인증기관 정보
*   **기능 설명:** 정도관리 인증기관의 상세 정보를 조회합니다.
*   **Base URL:** `http://apis.data.go.kr/1192000/QualityControlCertificationService`
*   **엔드포인트:** `/QualityControlCertification`
*   **전체 요청 주소:** `http://apis.data.go.kr/1192000/QualityControlCertificationService/getQualityControlCertification`

#### 3.1.1. 요청 파라미터 상세 (Request Parameters)

| 항목명(국문) | 항목명(영문) | 필수/선택 | 타입 | 항목크기 | 샘플데이터 | 항목설명 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 서비스키 | ServiceKey | **필수** | String | 100 | 인증키 (URL-Encode) | 공공데이터포털에서 받은 인증키 |
| 페이지 번호 | pageNo | **필수** | Integer | 4 | 1 | 페이지번호 |
| 한 페이지 결과 수 | numOfRows | **필수** | Integer | 4 | 10 | 한 페이지 결과 수 |
| 인증기관명 | CERT\_INST\_NM | 선택 | String | 100 | 한국해양과학기술원 | 인증기관명 |
| 인증항목 | CERT\_ITEM | 선택 | String | 100 | 수온 | 인증항목 |

#### 3.1.2. 응답 필드 상세 (Response Fields)

| 항목명(국문) | 항목명(영문) | 필수/선택 | 타입 | 항목크기 | 샘플데이터 | 항목설명 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 일련번호 | num | 필수 | Integer | 10 | 1 | 일련번호 |
| 인증기관명 | certInstNm | 선택 | String | 100 | 한국해양과학기술원 | 인증기관명 |
| 인증항목 | certItem | 선택 | String | 100 | 수온 | 인증항목 |
| 인증 시작일 | certStrtDat | 선택 | String | 10 | 2023-01-01 | 인증 시작일 |
| 인증 종료일 | certEndDat | 선택 | String | 10 | 2024-12-31 | 인증 종료일 |
| 주소 | addr | 선택 | String | 100 | 부산광역시 영도구 해양로 385 | 주소 |
| 인증분야 | certFld | 선택 | String | 100 | 해양환경 | 인증분야 |
| 인증번호 | certNum | 선택 | String | 100 | 2023-01 | 인증번호 |

#### 3.1.3. 예제 요청/응답 (Example Request/Response)

**요청 예시 (cURL)**

```bash
# 요청 변수: ServiceKey (인증키), pageNo=1, numOfRows=10, CERT_INST_NM=한국해양과학기술원
# ServiceKey, pageNo, numOfRows는 필수 파라미터입니다.
# CERT_INST_NM은 URL 인코딩이 필요합니다.

curl -X GET "http://apis.data.go.kr/1192000/QualityControlCertificationService/getQualityControlCertification?ServiceKey={YOUR_SERVICE_KEY_URL_ENCODED}&pageNo=1&numOfRows=10&CERT_INST_NM=%ED%95%9C%EA%B5%AD%ED%95%B4%EC%96%91%EA%B3%BC%ED%95%99%EA%B8%B0%EC%88%A0%EC%9B%90"
```

**응답 예시 (XML)**

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<response>
    <header>
        <resultCode>00</resultCode>
        <resultMsg>NORMAL SERVICE</resultMsg>
    </header>
    <body>
        <items>
            <item>
                <num>1</num>
                <certInstNm>한국해양과학기술원</certInstNm>
                <certItem>수온</certItem>
                <certStrtDat>2023-01-01</certStrtDat>
                <certEndDat>2024-12-31</certEndDat>
                <addr>부산광역시 영도구 해양로 385</addr>
                <certFld>해양환경</certFld>
                <certNum>2023-01</certNum>
            </item>
            <!-- ... more items ... -->
        </items>
        <numOfRows>10</numOfRows>
        <pageNo>1</pageNo>
        <totalCount>1</totalCount>
    </body>
</response>
```

## 4. 에러 코드 및 트러블슈팅

API 호출 시 발생할 수 있는 주요 오류 코드와 처리 방법은 다음과 같습니다. 이 오류 코드는 공공데이터포털 게이트웨이에서 공통으로 출력되는 메시지입니다.

| 에러코드 (resultCode) | 에러메시지 (errMsg) | 설명 | 처리 방법 |
| :--- | :--- | :--- | :--- |
| **01** | APPLICATION ERROR | 애플리케이션 에러 | 서비스 제공기관에 문의 |
| **04** | HTTP\_ERROR | HTTP 에러 | 요청 URL 또는 네트워크 상태 확인 |
| **12** | NO\_OPENAPI\_SERVICE\_ERROR | 해당 오픈 API 서비스가 없거나 폐기됨 | 서비스 ID 및 엔드포인트 URL 확인 |
| **20** | SERVICE\_ACCESS\_DENIED\_ERROR | 서비스 접근 거부 | 활용 신청 여부 및 서비스키 권한 확인 |
| **22** | LIMITED\_NUMBER\_OF\_SERVICE\_REQUESTS\_EXCEEDS\_ERROR | 서비스 요청 제한 횟수 초과 에러 | 일일 허용 트래픽 (개발: 10,000건) 확인 및 초과 시 다음 날 재시도 또는 운영계정 신청 |
| **23** | LIMITED\_NUMBER\_OF\_SERVICE\_REQUESTS\_PER\_SECOND\_EXCEEDS\_ERROR | 최대 동시 요청 수 초과 에러 | 요청 간격 조절 (throttle) |
| **30** | SERVICE\_KEY\_IS\_NOT\_REGISTERED\_ERROR | 등록되지 않은 서비스키 | ServiceKey가 올바른지, URL 인코딩되었는지 확인 |
| **31** | DEADLINE\_HAS\_EXPIRED\_ERROR | 활용 기간 만료 | 공공데이터포털에서 활용 기간 연장 신청 |
| **32** | UNREGISTERED\_IP\_ERROR | 등록되지 않은 IP | 공공데이터포털에 등록된 접근 IP 주소 확인 |
| **99** | UNKNOWN\_ERROR | 기타 에러 | 서비스 제공기관에 문의 |

**게이트웨이 오류 응답 형식 (XML 예시)**

```xml
<OpenAPI_ServiceResponse>
    <cmmMsgHeader>
        <errMsg>SERVICE ERROR</errMsg>
        <returnAuthMsg>SERVICE_KEY_IS_NOT_REGISTERED_ERROR</returnAuthMsg>
        <returnReasonCode>30</returnReasonCode>
    </cmmMsgHeader>
</OpenAPI_ServiceResponse>
```

## 5. 개발 체크리스트

| 항목 | 상태 | 비고 |
| :--- | :--- | :--- |
| **인증키 확보** | 완료 | 공공데이터포털에서 ServiceKey를 발급받았는지 확인 |
| **ServiceKey 인코딩** | 완료 | 요청 시 ServiceKey 값을 반드시 URL-Encode 처리했는지 확인 |
| **필수 파라미터 포함** | 완료 | `ServiceKey`, `pageNo`, `numOfRows`가 누락되지 않았는지 확인 |
| **요청 트래픽 관리** | 진행 중 | 일일 요청 제한 횟수 (10,000건)를 초과하지 않도록 호출 로직 구현 |
| **오류 처리 로직 구현** | 진행 중 | 섹션 4의 에러 코드에 대한 적절한 예외 처리 로직을 구현했는지 확인 |
| **페이지네이션 처리** | 진행 중 | `pageNo`와 `numOfRows`를 사용하여 전체 데이터를 조회하는 로직을 구현했는지 확인 |
| **응답 데이터 타입 처리** | 진행 중 | **XML** 응답을 파싱하고, 각 필드의 데이터 타입에 맞게 처리했는지 확인 |
| **한글 인코딩 확인** | 완료 | `CERT_INST_NM`, `CERT_ITEM`과 같은 한글 파라미터는 URL 인코딩을 통해 전달했는지 확인 |
| **참고 문서 확인** | 확인 필요 | 제공된 문서에 참고 문서가 없으므로, 모든 정보는 웹페이지 내용에 의존함 |
