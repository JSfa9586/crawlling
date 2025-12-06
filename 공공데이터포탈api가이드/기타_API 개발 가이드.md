# API 개발 가이드

## 목차

- [1. 개요](#1-개요)
- [2. 인증 및 공통 사항](#2-인증-및-공통-사항)
- [3. API 분류별 상세](#3-api-분류별-상세)
  - [3.1 과학기술 - 과학기술진흥](#31-과학기술---과학기술진흥)
  - [3.2 문화·관광 - 체육](#32-문화관광---체육)
  - [3.3 산업·통상·중소기업 - 에너지및자원개발](#33-산업통상중소기업---에너지및자원개발)
  - [3.4 일반공공행정 - 일반행정](#34-일반공공행정---일반행정)
  - [3.5 일반공공행정 - 정부조달](#35-일반공공행정---정부조달)
- [4. 에러 코드 및 트러블슈팅](#4-에러-코드-및-트러블슈팅)
- [5. 개발 체크리스트](#5-개발-체크리스트)

---

## 1. 개요

본 문서는 공공데이터포털에서 제공하는 입찰 및 조달 관련 13개 Open API의 통합 개발 가이드입니다. 각 API의 명세, 요청 및 응답 형식, 인증 방법, 제한 사항 등을 상세히 기술하여 개발자가 쉽고 빠르게 관련 기능을 통합하고 구현할 수 있도록 돕는 것을 목표로 합니다.

### 대상 API 목록

| No. | API 서비스명                               | 제공 기관         | 분류                                 |
|:---:|:-------------------------------------------|:------------------|:-------------------------------------|
| 1   | 한국토지주택공사 입찰공고정보              | 한국토지주택공사  | 일반공공행정 - 정부조달              |
| 2   | 한국수자원공사_전자조달 입찰공고           | 한국수자원공사    | 일반공공행정 - 정부조달              |
| 3   | 한국남부발전(주)_입찰공고현황              | 한국남부발전(주)  | 산업·통상·중소기업 - 에너지및자원개발 |
| 4   | 조달청_누리장터 민간입찰공고서비스         | 조달청            | 일반공공행정 - 정부조달              |
| 5   | 한국지역난방공사 입찰 공고 정보            | 한국지역난방공사  | 일반공공행정 - 일반행정              |
| 6   | 서부발전 입찰공고현황                      | 한국서부발전(주)  | 산업·통상·중소기업 - 에너지및자원개발 |
| 7   | 한국과학기술연구원_입찰정보조회서비스      | 한국과학기술연구원| 과학기술 - 과학기술진흥              |
| 8   | 한국마사회 전자입찰 공고정보               | 한국마사회        | 문화·관광 - 체육                     |
| 9   | 한국전력공사_전자입찰계약정보              | 한국전력공사      | 산업·통상·중소기업 - 에너지및자원개발 |
| 10  | 한국중부발전(주)_입찰계획정보 다운로드 서비스 | 한국중부발전(주)  | 산업·통상·중소기업 - 에너지및자원개발 |
| 11  | 한국남부발전(주)_입찰공고현황_GW           | 한국남부발전(주)  | 산업·통상·중소기업 - 에너지및자원개발 |
| 12  | 한국수자원공사_전자조달 사전규격공개       | 한국수자원공사    | 일반공공행정 - 정부조달              |
| 13  | 한국수자원공사_전자조달 발주계획           | 한국수자원공사    | 일반공공행정 - 정부조달              |


## 2. 인증 및 공통 사항

대부분의 API는 공공데이터포털에서 발급받은 **서비스 키(Service Key)**를 이용한 인증이 필요합니다. 

- **인증 방식**: 요청 URL에 `serviceKey` 파라미터를 포함하여 호출합니다.
- **서비스 키 발급**: 공공데이터포털에 로그인 후, 각 API 상세 페이지의 '활용신청'을 통해 발급받을 수 있습니다.
- **요청 제한**: 대부분의 API는 개발 계정과 운영 계정에 따라 트래픽 제한이 다릅니다. 개발 계정은 일반적으로 일일 1,000 ~ 10,000회의 요청 제한이 있으며, 활용 사례 등록 후 운영 계정으로 전환 시 트래픽을 증설할 수 있습니다.
- **응답 형식**: 대부분의 API는 XML과 JSON 형식을 모두 지원합니다. 요청 시 `_type=json` 또는 유사한 파라미터를 추가하여 JSON 형식으로 응답을 받는 것을 권장합니다.

---


## 3. API 분류별 상세

### 3.1 과학기술 - 과학기술진흥

#### [07] 한국과학기술연구원_입찰정보조회서비스

- **URL**: [https://www.data.go.kr/data/15002849/openapi.do](https://www.data.go.kr/data/15002849/openapi.do)
- **제공기관**: 한국과학기술연구원
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://openapi.kist.re.kr/openapi/service/rest/BidService/getBidInfoList`

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입   | 샘플      | 설명         |
|--------------|--------------|-----------|--------|-----------|--------------|
| serviceKey   | 서비스키     | Y         | String | -         | 인증키       |
| numOfRows    | 페이지당항목수 | N         | Number | 10        |              |
| pageNo       | 페이지번호   | N         | Number | 1         |              |
| s_bidproc    | 입찰진행상태 | N         | String |           | 1:입찰중, 2:마감, 3:취소, 4:개찰, 5:계약, 6:기타 |
| s_bidcate    | 입찰구분     | N         | String |           | 1:구매, 2:공사, 3:용역, 4:기타 |
| s_bidtype    | 공고종류     | N         | String |           | 1:일반, 2:긴급, 3:수의, 4:기타 |
| s_text       | 검색어       | N         | String |           | 공고명 검색  |

**응답 필드**

| 항목명(영문) | 항목명(국문) | 타입   | 설명         |
|--------------|--------------|--------|--------------|
| bid_no       | 공고번호     | String |              |
| bid_proc     | 입찰진행상태 | String | 1:입찰중, 2:마감, 3:취소, 4:개찰, 5:계약, 6:기타 |
| bid_cate     | 입찰구분     | String | 1:구매, 2:공사, 3:용역, 4:기타 |
| bid_type     | 공고종류     | String | 1:일반, 2:긴급, 3:수의, 4:기타 |
| bid_title    | 공고명       | String |              |
| bid_organ    | 발주기관     | String |              |
| bid_officer  | 담당자       | String |              |
| bid_regdate  | 등록일       | Date   | yyyy-mm-dd   |
| bid_closedate| 마감일       | Date   | yyyy-mm-dd   |
| bid_explain  | 현장설명일   | Date   | yyyy-mm-dd   |
| resultCode   | 결과코드     | Number | 00:정상, 99:에러 |
| resultMsg    | 결과메시지   | String |              |

---

### 3.2 문화·관광 - 체육

#### [08] 한국마사회 전자입찰 공고정보

- **URL**: [https://www.data.go.kr/data/15058158/openapi.do](https://www.data.go.kr/data/15058158/openapi.do)
- **제공기관**: 한국마사회
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://apis.data.go.kr/B551015/API182/request`

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입   | 샘플      | 설명         |
|--------------|--------------|-----------|--------|-----------|--------------|
| serviceKey   | 서비스키     | Y         | String | -         | 인증키       |
| pageNo       | 페이지 번호  | N         | Number | 1         |              |
| numOfRows    | 한 페이지 결과 수 | N      | Number | 10        |              |
| notice_date  | 공고일자     | N         | String |           | YYYYMMDD     |
| notice_month | 공고월       | N         | String |           | YYYYMM       |
| notice_year  | 공고연도     | N         | String |           | YYYY         |

**응답 필드**

| 항목명(영문) | 항목명(국문) | 타입   | 설명         |
|--------------|--------------|--------|--------------|
| bCode        | 공고번호     | String |              |
| renotifyCnt  | G2B전송 여부 | String | 0:미전송, 1:전송 |
| bidName      | 입찰공고명   | String |              |
| status       | 입찰공고 상태| String | 00:작성중, 10:품의중, 18:품의반송, 19:품의완료, 20:공고중, 30:심사중, 97:완료(재입찰), 98:완료(유찰), 99:(낙찰) |
| noticeDate   | 입찰공고 일자| String | YYYY-MM-DD   |
| noticeTime   | 입찰공고 시각| String | HH:MI:SS     |
| workType     | 업무구분명   | String | 01:시설공사, 02:기술용역, 03:일반용역, 05:매각 |
| contGubun    | 계약체결형태명| String |              |
| contMethod   | 계약체결방법 | String | 1:일반경쟁, 2:지명경쟁, 3:제한경쟁, 4:수의계약 |
| noticeAuth   | 공고기관명   | String |              |
| demandAuth   | 수요기관명   | String |              |
| registEndDate| 입찰참가자격등록마감일자 | String | YYYY-MM-DD |
| registEndTime| 입찰참가자격등록마감시각 | String | HH:MI:SS |
| openDate     | 입찰개시일자 | String | YYYY-MM-DD   |
| openTime     | 입찰개시시각 | String | HH:MI:SS     |
| bidEndDate   | 입찰마감일자 | String | YYYY-MM-DD   |
| bidEndTime   | 입찰마감시각 | String | HH:MI:SS     |
| openPlace    | 개찰장소     | String |              |
| sendDate     | 데이터 기준일자| String | YYYY-MM-DD   |

---

### 3.3 산업·통상·중소기업 - 에너지및자원개발

#### [03] 한국남부발전(주)_입찰공고현황

- **URL**: [https://www.data.go.kr/data/15003666/openapi.do](https://www.data.go.kr/data/15003666/openapi.do)
- **제공기관**: 한국남부발전(주)
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://dataopen.kospo.co.kr/openApi/Coexistence/BidInfoList`

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입   | 샘플      | 설명         |
|--------------|--------------|-----------|--------|-----------|--------------|
| ServiceKey   | 서비스키     | Y         | String | -         | 인증키       |
| strSdate     | 조회 시작월  | Y         | String | 20161218  | YYYYMMDD     |
| strEdate     | 조회 종료월  | Y         | String | 20170117  | YYYYMMDD (최대 1년) |
| numOfRows    | 페이지당항목수 | N         | Number | 10        |              |
| pageNo       | 페이지번호   | N         | Number | 1         |              |

---

#### [06] 서부발전 입찰공고현황

- **URL**: [https://www.data.go.kr/data/15003821/openapi.do](https://www.data.go.kr/data/15003821/openapi.do)
- **제공기관**: 한국서부발전(주)
- **API 유형**: REST
- **응답 형식**: XML

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입   | 설명         |
|--------------|--------------|-----------|--------|--------------|
| serviceKey   | 서비스인증키 | Y         | String | 인증키       |

**응답 필드**

| 항목명(영문) | 항목명(국문) | 타입   | 설명         |
|--------------|--------------|--------|--------------|
| bidno        | 공고번호     | String |              |
| title        | 입찰건명     | String |              |
| sort         | 입찰종류     | String |              |
| regstt       | 입찰신청시작 | String |              |
| bidstt       | 투찰시작일시 | String |              |
| noticeDate   | 공고일자     | String |              |
| vst          | 입찰구분     | String |              |
| dep          | 공고회사/부서| String |              |
| fin          | 낙찰자선정   | String |              |
| regend       | 입찰신청마감 | String |              |
| bidend       | 투찰종료일시 | String |              |
| staus        | 진행상태     | String |              |
| resultCode   | 결과코드     | String |              |
| resultMsg    | 결과메시지   | String |              |

---

#### [09] 한국전력공사_전자입찰계약정보

- **URL**: [https://www.data.go.kr/data/15148223/openapi.do](https://www.data.go.kr/data/15148223/openapi.do)
- **제공기관**: 한국전력공사
- **API 유형**: LINK
- **서비스 URL**: [https://bigdata.kepco.co.kr/cmsmain.do?scode=S01&pcode=000493&pstate=contract&redirect=Y](https://bigdata.kepco.co.kr/cmsmain.do?scode=S01&pcode=000493&pstate=contract&redirect=Y)

**설명**: 이 API는 LINK 타입으로, 별도의 엔드포인트 없이 제공되는 URL을 통해 관련 정보 페이지로 직접 연결됩니다. 해당 페이지에서 입찰 및 계약 정보를 조회할 수 있습니다.

---

#### [10] 한국중부발전(주)_입찰계획정보 다운로드 서비스

- **URL**: [https://www.data.go.kr/data/15084576/openapi.do](https://www.data.go.kr/data/15084576/openapi.do)
- **제공기관**: 한국중부발전(주)
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://www.komipo.co.kr/openapi/bid/plan`

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입   | 설명         |
|--------------|--------------|-----------|--------|--------------|
| serviceKey   | 서비스키     | Y         | String | 인증키       |
| searchType   | 조회구분     | Y         | String | 1: 공사, 2: 구매, 3: 용역 |
| year         | 조회년도     | Y         | String | YYYY         |

---

#### [11] 한국남부발전(주)_입찰공고현황_GW

- **URL**: [https://www.data.go.kr/data/15125329/openapi.do](https://www.data.go.kr/data/15125329/openapi.do)
- **제공기관**: 한국남부발전(주)
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://dataopen.kospo.co.kr/openApi/Coexistence/BidInfoList`

**설명**: 이 API는 API-03 '한국남부발전(주)_입찰공고현황'과 서비스 URL이 동일합니다. 동일한 명세와 파라미터를 사용할 것으로 보이며, 그룹웨어(GW) 시스템 연동을 위한 별도 항목일 수 있습니다. API-03의 명세를 참고하십시오.

---

### 3.4 일반공공행정 - 일반행정

#### [05] 한국지역난방공사 입찰 공고 정보

- **URL**: [https://www.data.go.kr/data/15002733/openapi.do](https://www.data.go.kr/data/15002733/openapi.do)
- **제공기관**: 한국지역난방공사
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://apis.data.go.kr/B552030/kdhcOpenApi/` (참고: 서비스 URL은 문서에 명시되어 있지 않으나, 일반적인 형식을 따를 것으로 예상됩니다.)

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입   | 샘플      | 설명         |
|--------------|--------------|-----------|--------|-----------|--------------|
| serviceKey   | 서비스키     | Y         | String | -         | 인증키       |
| startDate    | 조회시작일   | Y         | String | 20230101  | YYYYMMDD     |
| endDate      | 조회종료일   | Y         | String | 20231231  | YYYYMMDD     |
| pageNo       | 페이지 번호  | N         | Number | 1         |              |
| numOfRows    | 항목 수      | N         | Number | 10        |              |

**응답 필드**

| 항목명(영문) | 항목명(국문) | 타입   | 설명         |
|--------------|--------------|--------|--------------|
| bidAnnoNo    | 입찰공고번호 | String |              |
| bidChasu     | 변경차수     | String |              |
| bidDt        | 개찰일       | String |              |
| bidGbn       | 구분         | String |              |
| caseNm       | 건명         | String |              |
| gdeptNm      | 담당부서     | String |              |
| rnum         | 순번         | Number |              |
| status       | 상태         | String |              |
| resultCode   | 결과코드     | String |              |
| resultMsg    | 결과메시지   | String |              |
| totalCount   | 전체 결과 수 | Number |              |

---
### 3.5 일반공공행정 - 정부조달

#### [01] 한국토지주택공사 입찰공고정보

- **URL**: [https://www.data.go.kr/data/15021183/openapi.do](https://www.data.go.kr/data/15021183/openapi.do)
- **제공기관**: 한국토지주택공사
- **API 유형**: REST
- **응답 형식**: XML
- **서비스 URL**: `http://openapi.ebid.lh.or.kr/ebid.com.openapi.service.OpenBidInfoList.dev`

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입 | 샘플 | 설명 |
|---|---|---|---|---|---|
| serviceKey | 인증키 | Y | String | - | URL-Encode된 인증키 |
| numOfRows | 한 페이지 결과 수 | Y | Number | 10 | |
| pageNo | 페이지 번호 | Y | Number | 1 | |
| tndrbidRegDtStart | 입찰공고일자(시작) | Y | String | 20161122 | YYYYMMDD |
| tndrbidRegDtEnd | 입찰공고일자(끝) | Y | String | 20161123 | YYYYMMDD |

---

#### [02] 한국수자원공사_전자조달 입찰공고

- **URL**: [https://www.data.go.kr/data/15101635/openapi.do](https://www.data.go.kr/data/15101635/openapi.do)
- **제공기관**: 한국수자원공사
- **API 유형**: REST
- **응답 형식**: JSON+XML
- **서비스 URL**: `https://apis.data.go.kr/B500001/ebid/tndr3`

**설명**: 공사, 물품, 용역 등 다양한 입찰공고 정보를 제공합니다. 각 엔드포인트는 유사한 파라미터를 사용합니다.

**엔드포인트 예시: 공사 입찰공고 정보 조회 (`/cntrwkList`)**

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입 | 샘플 | 설명 |
|---|---|---|---|---|---|
| serviceKey | 서비스키 | Y | String | - | 인증키 |
| pageNo | 페이지번호 | Y | Number | 1 | |
| numOfRows | 한 페이지 결과 수 | Y | Number | 10 | |
| _type | 출력형식 | N | String | json | `json` 또는 `xml` |
| searchDt | 검색날짜 | Y | String | YYYYMMDD | |

---

#### [04] 조달청_누리장터 민간입찰공고서비스

- **URL**: [https://www.data.go.kr/data/15129456/openapi.do](https://www.data.go.kr/data/15129456/openapi.do)
- **제공기관**: 조달청
- **API 유형**: REST
- **응답 형식**: JSON+XML
- **서비스 URL**: `https://apis.data.go.kr/1230000/ao/PrvtBidNtceService`

**설명**: 민간 부문의 용역, 물품, 공사 등 다양한 입찰공고 정보를 제공하며, 나라장터 검색 조건과 연동된 상세 검색 기능도 지원합니다.

**엔드포인트 예시: 민간입찰공고 용역 조회 (`/getPrvtBidPblancListInfoServc`)**

---

#### [12] 한국수자원공사_전자조달 사전규격공개

- **URL**: [https://www.data.go.kr/data/15101628/openapi.do](https://www.data.go.kr/data/15101628/openapi.do)
- **제공기관**: 한국수자원공사
- **API 유형**: REST
- **응답 형식**: JSON+XML
- **서비스 URL**: `https://apis.data.go.kr/B500001/ebid/spec3`

**설명**: 사전규격공개 정보를 조회하는 서비스입니다.

**엔드포인트: `/specList`**

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입 | 샘플 | 설명 |
|---|---|---|---|---|---|
| serviceKey | 서비스키 | Y | String | - | 인증키 |
| pageNo | 페이지번호 | Y | Number | 1 | |
| numOfRows | 한 페이지 결과 수 | Y | Number | 10 | |
| _type | 출력형식 | N | String | json | `json` 또는 `xml` |
| searchDt | 검색날짜 | Y | String | YYYYMMDD | |

---

#### [13] 한국수자원공사_전자조달 발주계획

- **URL**: [https://www.data.go.kr/data/15102588/openapi.do](https://www.data.go.kr/data/15102588/openapi.do)
- **제공기관**: 한국수자원공사
- **API 유형**: REST
- **응답 형식**: JSON+XML
- **서비스 URL**: `https://apis.data.go.kr/B500001/ebid/ordrpln3`

**설명**: 발주계획 정보를 조회하는 서비스입니다.

**엔드포인트: `/ordrplnList`**

**요청 파라미터**

| 항목명(영문) | 항목명(국문) | 필수 여부 | 타입 | 샘플 | 설명 |
|---|---|---|---|---|---|
| serviceKey | 서비스키 | Y | String | - | 인증키 |
| pageNo | 페이지번호 | Y | Number | 1 | |
| numOfRows | 한 페이지 결과 수 | Y | Number | 10 | |
| _type | 출력형식 | N | String | json | `json` 또는 `xml` |
| searchDt | 검색날짜 | Y | String | YYYYMMDD | |

---
## 4. 에러 코드 및 트러블슈팅

각 API 호출 시 발생할 수 있는 주요 에러 코드는 다음과 같습니다. 대부분의 API가 유사한 에러 코드 체계를 따릅니다.

| 결과코드 (resultCode) | 의미 | 설명 |
|:---:|:---|:---|
| 00 | NORMAL_SERVICE | 정상적으로 처리되었습니다. |
| 01 | APPLICATION_ERROR | 어플리케이션 에러가 발생했습니다. |
| 02 | DB_ERROR | 데이터베이스 에러가 발생했습니다. |
| 03 | NODATA_ERROR | 데이터가 존재하지 않습니다. |
| 04 | HTTP_ERROR | HTTP 에러가 발생했습니다. |
| 05 | SERVICETIME_OUT | 서비스 연결에 실패하였습니다. |
| 10 | INVALID_REQUEST_PARAMETER_ERROR | 필수 요청 파라미터가 누락되었습니다. |
| 11 | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터가 없습니다. |
| 12 | INCORRECT_QUERY_REQUEST_PARAMETER_ERROR | 요청 파라미터의 데이터 타입이 유효하지 않습니다. |
| 20 | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근이 거부되었습니다. |
| 21 | TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR | 일시적으로 사용할 수 없는 서비스 키입니다. |
| 22 | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수를 초과하였습니다. |
| 30 | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스 키입니다. |
| 31 | DEADLINE_HAS_EXPIRED_ERROR | 기한이 만료된 서비스 키입니다. |
| 32 | UNREGISTERED_IP_ERROR | 등록되지 않은 IP입니다. |

**트러블슈팅**

- **`SERVICE_ACCESS_DENIED_ERROR` 또는 `UNREGISTERED_IP_ERROR`**: API 활용 신청 시 등록한 서버 IP와 실제 요청 IP가 일치하는지 확인하십시오.
- **`LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR`**: 개발 계정의 일일 트래픽을 초과한 경우 발생합니다. 다음 날 다시 시도하거나, 공공데이터포털에서 활용 사례를 등록하고 운영 계정으로 전환하여 트래픽 증설을 신청하십시오.
- **인증키 관련 에러**: `serviceKey` 파라미터가 정확한지, URL 인코딩이 올바르게 적용되었는지 확인하십시오.

## 5. 개발 체크리스트

- [ ] 공공데이터포털 회원가입 및 로그인
- [ ] 각 API별 활용신청 및 서비스 키 발급
- [ ] 개발 환경(서버 IP 등) 등록 및 확인
- [ ] API별 Base URL 및 엔드포인트 확인
- [ ] 필수 요청 파라미터 누락 여부 확인
- [ ] 응답 데이터 형식(JSON/XML) 지정 및 파싱 로직 구현
- [ ] 에러 코드에 따른 예외 처리 로직 구현
- [ ] 트래픽 제한을 고려한 API 호출 주기 설계

---
*본 문서는 Manus AI에 의해 2025년 10월 30일에 작성되었습니다.*
