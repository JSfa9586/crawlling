# 해양수산부_환경영향평가정보 서비스 API 개발 가이드

## 목차
1. 개요
2. 인증 및 공통 사항
3. API 분류별 상세
    3.1. 환경영향평가정보 목록 조회 (getEnvImpactInfo)
4. 에러 코드 및 트러블슈팅
5. 개발 체크리스트

## 1. 개요

본 문서는 **해양수산부_환경영향평가정보 서비스** API를 활용하여 개발을 진행하는 개발자를 위한 가이드라인입니다. 이 API는 환경영향평가와 관련한 정보를 조회하는 기능을 제공합니다.

*   **API 서비스명:** 해양수산부_환경영향평가정보 서비스
*   **설명:** 접수연도, 사업명 등을 파라미터로 사업번호, 접수일, 결과명, 진행단계명, 사업시행자, 주소, 사업 시작/종료일, 사업비, 사업규모, 사업목적, 처분기관, 협의 상태, 위도, 경도 등 상세정보를 조회하는 서비스입니다.
*   **API 유형:** REST
*   **데이터 포맷:** JSON, XML
*   **키워드:** 해역, 해역이용, 협의정보, 해양환경, 평가결과정보

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

### 3.1. 환경영향평가정보 목록 조회 (getEnvImpactInfo)

환경영향평가 정보를 목록 형태로 조회합니다.

*   **분류/카테고리:** 환경영향평가정보 조회
*   **기능 설명:** 접수연도, 사업명 등의 검색 조건을 이용하여 환경영향평가 정보를 조회합니다.
*   **요청 주소 (Endpoint URL):** `http://apis.data.go.kr/1192000/service/EnvImpactService/getEnvImpactInfo`
*   **서비스 URL:** `http://apis.data.go.kr/1192000/service/EnvImpactService`

#### 3.1.1. 요청 파라미터 상세 (Request Parameters)

| 항목명(국문) | 항목명(영문) | 필수/선택 | 타입 | 항목크기 | 샘플데이터 | 항목설명 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 서비스키 | ServiceKey | **필수** | String | 100 | 인증키 (URL-Encode) | 공공데이터포털에서 받은 인증키 |
| 페이지 번호 | pageNo | 선택 | Integer | 100 | 1 | 페이지번호 |
| 한 페이지 결과 수 | numOfRows | 선택 | Integer | 100 | 10 | 한 페이지 결과 수 |
| 결과형식 | resultType | 선택 | String | 4 | xml/json | 결과형식 (값이 없으면 XML로 자동설정됨) |
| 접수연도 | ACP\_YEAR | **필수** | String | 4 | 2012 | 접수연도 |
| 사업명 | BIZ\_NAM | 선택 | String | 100 | 부산항 신항 서 [컨] (1단계) 항만배후단지 및 송도 준설토투기장 건설사업 | 사업명 |

#### 3.1.2. 응답 필드 상세 (Response Fields)

| 항목명(국문) | 항목명(영문) | 필수/선택 | 타입 | 항목크기 | 샘플데이터 | 항목설명 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 일련번호 | num | 필수 | Integer | 10 | 1 | 일련번호 |
| SEQUENCE | seq | 선택 | Integer | 10 | 29 | SEQUENCE |
| 사업번호 | bizNum | 선택 | String | 30 | 3120106003 | 사업번호 |
| 접수연도 | acpYear | 필수 | String | 4 | 2012 | 접수연도 |
| 접수일 | acpDat | 선택 | String | 30 | 2012-01-04 | 접수일 |
| 결과명 | rstNm | 선택 | String | 20 | 조건부동의 | 결과명 |
| 진행단계명 | stpNm | 선택 | String | 20 | 협의완료 | 진행단계명 |
| 사업명 | bizNam | 선택 | String | 30 | 부산항 신항 서 [컨] (1단계) 항만배후단지 및 송도 준설토투기장 건설사업 | 사업명 |
| 사업시행자 | bizActNam | 선택 | String | 100 | 부산지방해양항만청 부산항건설사무소 | 사업시행자 |
| 사업유형명 | bizTypNm | 선택 | String | 30 | 항만시설의 설치 | 사업유형명 |
| 사업유형 기타 | bizTypEtc | 선택 | String | 1000 | 사업유형 기타 |
| 주소시도 | adrSido | **필수** | String | 30 | 부산 | 주소시도 |
| 주소구군 | adrGugun | 선택 | String | 30 | 강서구 | 주소구군 |
| 주소읍면동 | adrDong | 선택 | String | 30 | 주소읍면동 |
| 사업 소재지 상세주소 | adrDtl | 선택 | String | 100 | 부산항 신항 수역내 | 사업 소재지 상세주소 |
| 사업 시작일 | bldDat | 선택 | String | 30 | 2012-01-01 | 사업 시작일 |
| 사업 종료일 | endDat | 선택 | String | 30 | 2016-12-31 | 사업 종료일 |
| 사업비 | cst | 선택 | String | 12 | 약 534억원 | 사업비(원) |
| 사업규모 | bizSiz | 선택 | String | 1000 | 준설면적 3,374,321㎡(준설량 15,731,540㎥) | 사업규모 |
| 사업목적 | bizAim | 선택 | String | 1000 | 사업목적 |
| 처분기관 | prcIst | 선택 | String | 30 | 부산지방해양수산청 | 처분기관 |
| 비고 | etcDes | 선택 | String | 1000 | 부산광역시 강서구 및 경상남도 창원시 관내 부산항 신항 수역내 | 비고 |
| 협의 상태 | dsSts | 선택 | String | 30 | 조건부동의 | 협의 상태 |
| 협의서종류명 | atrTypNm | 선택 | String | 1000 | 환경영향평가 | 협의서종류명 |
| 위도 | lat | 선택 | Float | 16 | 위도 |
| 경도 | lon | 선택 | Float | 16 | 경도 |

#### 3.1.3. 예제 요청/응답 (Example Request/Response)

**요청 예시 (cURL)**

```bash
# 요청 변수: ServiceKey (인증키), ACP_YEAR=2012, BIZ_NAM=부산항 신항 서 [컨] (1단계) 항만배후단지 및 송도 준설토투기장 건설사업
# ServiceKey, ACP_YEAR는 필수 파라미터입니다.
# BIZ_NAM은 URL 인코딩이 필요합니다.

curl -X GET "http://apis.data.go.kr/1192000/service/EnvImpactService/getEnvImpactInfo?ServiceKey={YOUR_SERVICE_KEY_URL_ENCODED}&pageNo=1&numOfRows=10&ACP_YEAR=2012&BIZ_NAM=%EB%B6%80%EC%82%B0%ED%95%AD%20%EC%8B%A0%ED%95%AD%20%EC%84%9C%20%5B%EC%BB%A8%5D%20(1%EB%8B%A8%EA%B3%84)%20%ED%95%AD%EB%A7%8C%EB%B0%B0%ED%9B%84%EB%8B%A8%EC%A7%80%20%EB%B0%8F%20%EC%86%A1%EB%8F%84%20%EC%A4%80%EC%84%A4%ED%86%A0%ED%88%AC%EA%B8%B0%EC%9E%A5%20%EA%B1%B4%EC%84%A4%EC%82%AC%EC%97%85&resultType=json"
```

**응답 예시 (JSON)**

```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "OK"
    },
    "body": {
      "items": [
        {
          "num": 1,
          "seq": 29,
          "bizNum": "3120106003",
          "acpYear": "2012",
          "acpDat": "2012-01-04",
          "rstNm": "조건부동의",
          "stpNm": "협의완료",
          "bizNam": "부산항 신항 서 [컨] (1단계) 항만배후단지 및 송도 준설토투기장 건설사업",
          "bizActNam": "부산지방해양항만청 부산항건설사무소",
          "bizTypNm": "항만시설의 설치",
          "bizTypEtc": "사업유형 기타",
          "adrSido": "부산",
          "adrGugun": "강서구",
          "adrDong": "주소읍면동",
          "adrDtl": "부산항 신항 수역내",
          "bldDat": "2012-01-01",
          "endDat": "2016-12-31",
          "cst": "약 534억원",
          "bizSiz": "준설면적 3,374,321㎡(준설량 15,731,540㎥)",
          "bizAim": "사업목적",
          "prcIst": "부산지방해양수산청",
          "etcDes": "부산광역시 강서구 및 경상남도 창원시 관내 부산항 신항 수역내",
          "dsSts": "조건부동의",
          "atrTypNm": "환경영향평가",
          "lat": "위도",
          "lon": "경도"
        }
      ],
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 3
    }
  }
}
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
| **필수 파라미터 포함** | 완료 | `ServiceKey`, `ACP_YEAR`가 누락되지 않았는지 확인 |
| **요청 트래픽 관리** | 진행 중 | 일일 요청 제한 횟수 (10,000건)를 초과하지 않도록 호출 로직 구현 |
| **오류 처리 로직 구현** | 진행 중 | 섹션 4의 에러 코드에 대한 적절한 예외 처리 로직을 구현했는지 확인 |
| **페이지네이션 처리** | 진행 중 | `pageNo`와 `numOfRows`를 사용하여 전체 데이터를 조회하는 로직을 구현했는지 확인 |
| **응답 데이터 타입 처리** | 진행 중 | JSON 또는 XML 응답을 파싱하고, 각 필드의 데이터 타입에 맞게 처리했는지 확인 |
| **한글 인코딩 확인** | 완료 | `BIZ_NAM`과 같은 한글 파라미터는 URL 인코딩을 통해 전달했는지 확인 |
| **참고 문서 확인** | 확인 필요 | 참고 문서 `(복구중)_5.환경영향_평가정보_서비스_가이드 (3).docx`를 추가로 확인하여 누락된 정보가 없는지 검토 |
