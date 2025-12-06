# 대한민국 조달청 나라장터 API 통합 개발 가이드

## 목차
1. [개요](#1-개요)
2. [인증-및-공통-사항](#2-인증-및-공통-사항)
3. [API-분류별-상세](#3-api-분류별-상세)
    - [3.1 입찰/계약](#31-입찰계약)
    - [3.2 사전공개/계획](#32-사전공개계획)
    - [3.3 기준정보](#33-기준정보)
    - [3.4 민간/누리장터](#34-민간누리장터)
    - [3.5 통계/표준](#35-통계표준)
4. [오류-코드-및-처리-방법](#4-오류-코드-및-처리-방법)
5. [개발-체크리스트](#5-개발-체크리스트)

## 1. 개요
본 문서는 대한민국 조달청 나라장터에서 제공하는 15개의 공공데이터 API를 통합하여 개발자들이 쉽게 이해하고 활용할 수 있도록 제작된 개발 가이드입니다. 각 API의 기능, 요청 파라미터, 응답 형식 등 개발에 필요한 모든 정보를 상세하게 다루고 있습니다. 본 가이드를 통해 나라장터의 방대한 공공데이터를 활용한 다양한 서비스 개발이 용이해질 것으로 기대합니다.

## 2. 인증 및 공통 사항

### 인증
모든 나라장터 API는 **서비스 키(Service Key)** 기반의 인증 방식을 사용합니다. 공공데이터포털에서 회원가입 및 활용신청을 통해 발급받은 서비스 키를 모든 API 요청 시 `serviceKey` 파라미터에 포함하여야 합니다. 서비스 키는 URL 인코딩된 상태로 전달해야 합니다.

### 공통 요청 파라미터
대부분의 API는 다음과 같은 공통 요청 파라미터를 사용합니다.

| 파라미터 | 필수 여부 | 설명 |
|---|---|---|
| `serviceKey` | **필수** | 공공데이터포털에서 발급받은 인증키 (URL 인코딩 필요) |
| `pageNo` | 선택 | 조회할 페이지 번호 |
| `numOfRows` | 선택 | 한 페이지당 표시할 데이터 수 |
| `type` | 선택 | 응답 데이터 형식 (xml 또는 json) |

### 응답 형식
API는 기본적으로 XML과 JSON 두 가지 형식의 응답을 모두 지원합니다. 요청 시 `type` 파라미터를 'xml' 또는 'json'으로 설정하여 원하는 형식을 지정할 수 있습니다. (지정하지 않을 경우 XML이 기본값)

### 요청 제한
- **트래픽**: 각 API는 개발 계정과 운영 계정에 따라 트래픽 제한이 다릅니다. 일반적으로 개발 계정은 일일 1,000 ~ 10,000건의 요청이 가능하며, 활용 사례 등록 및 심사를 통해 운영 계정으로 전환 시 더 많은 트래픽을 할당받을 수 있습니다. 정확한 수치는 각 API 상세 정보에서 확인해야 합니다.

---

## 3. API 분류별 상세

### 3.1 입찰/계약

#### 3.1.1 조달청_나라장터 입찰공고정보서비스
# API 01: 조달청_나라장터 입찰공고정보서비스

## 기본 정보
- **URL**: https://www.data.go.kr/data/15129394/openapi.do
- **Base URL**: apis.data.go.kr/1230000/ad/BidPublicInfoService
- **버전**: 1.0.0
- **제공기관**: 조달청
- **관리부서**: 조달데이터관리팀
- **관리부서 전화번호**: 070-4056-7677
- **API 유형**: REST
- **데이터포맷**: JSON+XML
- **비용부과유무**: 무료
- **신청가능 트래픽**: 
  - 개발계정: 1,000
  - 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능
- **심의유형**: 
  - 개발단계: 자동승인
  - 운영단계: 자동승인
- **공간범위**: 전국
- **시간범위**: 1995년 10월 - 2025년 1월
- **이용허락범위**: 제한 없음
- **등록일**: 2024-07-02
- **수정일**: 2025-08-13
- **키워드**: 나라장터, 입찰, 입찰공고, 물품, 공사, 용역, 외자, 기초금액

## 서비스 설명
조달청의 나라장터에서 제공하는 물품, 용역, 공사, 외자 입찰공고목록, 입찰공고상세정보, 기초금액정보, 면허제한정보, 참가가능지역정보, 입찰공고 변경이력를 제공하며 나라장터 입찰공고 검색조건으로도 업무별 입찰공고 정보를 제공하는 나라장터 입찰공고정보서비스. 조달청의 입찰공고 정보 또한 제공

## API 목록

### 1. GET /getBidPblancListInfoCnstwk
- **설명**: 입찰공고목록 정보에 대한 공사조회
- **파라미터**:
  - serviceKey (필수, string, query): 공공데이터포털에서 받은 인증키
  - pageNo (필수, string, query): 페이지번호
  - numOfRows (필수, string, query): 한 페이지 결과 수
  - inqryDiv (필수, string, query): 조회구분
  - inqryBgnDt (string, query): 조회시작일시(동록일시작)
  - type (string, query): 타입
  - inqryEndDt (string, query): 조회종료일시(동록일끝)
  - bidNtceNo (string, query): 입찰공고번호

### 2. GET /getBidPblancListInfoServc
- **설명**: 입찰공고목록 정보에 대한 용역조회

### 3. GET /getBidPblancListInfoFrgcpt
- **설명**: 입찰공고목록 정보에 대한 외자조회

### 4. GET /getBidPblancListInfoThng
- **설명**: 입찰공고목록 정보에 대한 물품조회

### 5. GET /getBidPblancListInfoThngBsisAmount
- **설명**: 입찰공고목록 정보에 대한 물품기초금액조회

### 6. GET /getBidPblancListInfoEtcPPSSrch
- **설명**: 나라장터검색조건에 의한 입찰공고 기타조회

### 7. GET /getBidPblancListPPIFnlRfpIssAtchFileInfo
- **설명**: 입찰공고목록 정보에 대한 혁신장터 최종제안요청서 교부 첨부파일정보조회

### 8. GET /getBidPblancListBidPrceCalclAInfo
- **설명**: 입찰공고목록 정보에 대한 입찰가격산식A정보조회

### 9. GET /getBidPblancListEvaluationIndstrytyMfrcInfo
- **설명**: 입찰공고목록 정보에 대한 평가대상 주력분야 조회

### 10. GET /getBidPblancListInfoEtc
- **설명**: 입찰공고목록 정보에 대한 기타공고조회

### 11. GET /getBidPblancListInfoEorderAtchFileInfo
- **설명**: 입찰공고목록 정보에 대한 e발주 첨부파일정보조회

### 12. GET /getBidPblancListInfoFrgcptPurchsObjPrdct
- **설명**: 입찰공고목록 정보에 대한 외자 구매대상물품조회

### 13. GET /getBidPblancListInfoServcPurchsObjPrdct
- **설명**: 입찰공고목록 정보에 대한 용역 구매대상물품조회

### 14. GET /getBidPblancListInfoThngPurchsObjPrdct
- **설명**: 입찰공고목록 정보에 대한 물품 구매대상물품조회

### 15. GET /getBidPblancListInfoPrtcptPsblRgn
- **설명**: 입찰공고목록 정보에 대한 참가가능지역정보조회

### 16. GET /getBidPblancListInfoLicenseLimit
- **설명**: 입찰공고목록 정보에 대한 면허제한정보조회

### 17. GET /getBidPblancListInfoCnstwkBsisAmount
- **설명**: 입찰공고목록 정보에 대한 공사기초금액조회

### 18. GET /getBidPblancListInfoThngPPSSrch
- **설명**: 나라장터검색조건에 의한 입찰공고물품조회

### 19. GET /getBidPblancListInfoFrgcptPPSSrch
- **설명**: 나라장터검색조건에 의한 입찰공고외자조회

### 20. GET /getBidPblancListInfoServcPPSSrch
- **설명**: 나라장터검색조건에 의한 입찰공고용역조회

### 21. GET /getBidPblancListInfoCnstwkPPSSrch
- **설명**: 나라장터검색조건에 의한 입찰공고공사조회

### 22. GET /getBidPblancListInfoChgHstryServc
- **설명**: 입찰공고목록 정보에 대한 용역변경이력조회

### 23. GET /getBidPblancListInfoChgHstryCnstwk
- **설명**: 입찰공고목록 정보에 대한 공사변경이력조회

### 24. GET /getBidPblancListInfoChgHstryThng
- **설명**: 입찰공고목록 정보에 대한 물품변경이력조회

### 25. GET /getBidPblancListInfoServcBsisAmount
- **설명**: 입찰공고목록 정보에 대한 용역기초금액조회

## 응답 모델
- getBidPblancListInfoCnstwk_response
- getBidPblancListInfoServc_response
- getBidPblancListInfoFrgcpt_response
- getBidPblancListInfoThng_response
- getBidPblancListInfoThngBsisAmount_response
- getBidPblancListInfoCnstwkBsisAmount_response
- getBidPblancListInfoServcBsisAmount_response
- getBidPblancListInfoCnstwkPPSSrch_response
- getBidPblancListInfoServcPPSSrch_response
- getBidPblancListInfoFrgcptPPSSrch_response
- getBidPblancListInfoThngPPSSrch_response
- getBidPblancListInfoLicenseLimit_response
- getBidPblancListInfoPrtcptPsblRgn_response
- getBidPblancListInfoThngPurchsObjPrdct_response
- getBidPblancListInfoServcPurchsObjPrdct_response
- getBidPblancListInfoFrgcptPurchsObjPrdct_response
- getBidPblancListInfoEorderAtchFileInfo_response
- getBidPblancListInfoEtc_response
- getBidPblancListInfoEtcPPSSrch_response
- getBidPblancListPPIFnlRfpIssAtchFileInfo_response
- getBidPblancListBidPrceCalclAInfo_response
- getBidPblancListEvaluationIndstrytyMfrcInfo_response
- getBidPblancListInfoChgHstryThng_response
- getBidPblancListInfoChgHstryCnstwk_response
- getBidPblancListInfoChgHstryServc_response

## 참고문서
- (복구중)_조달청_OpenAPI참고자료_나라장터_입찰공고정보서비스_1.0.docx


#### 3.1.2 조달청_나라장터 낙찰정보서비스
# API 03: 조달청_나라장터 낙찰정보서비스

## 기본 정보
- **URL**: https://www.data.go.kr/data/15129397/openapi.do
- **Base URL**: apis.data.go.kr/1230000/as/ScsbidInfoService
- **버전**: 1.0.0
- **제공기관**: 조달청
- **관리부서**: 조달데이터관리팀
- **관리부서 전화번호**: 070-4056-7677
- **API 유형**: REST
- **데이터포맷**: JSON+XML
- **비용부과유무**: 무료
- **신청가능 트래픽**: 
  - 개발계정: 1,000
  - 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능
- **심의유형**: 
  - 개발단계: 자동승인
  - 운영단계: 자동승인
- **공간범위**: 전국
- **시간범위**: 1995년 10월 - 2025년 1월
- **이용허락범위**: 제한 없음
- **등록일**: 2024-07-03
- **수정일**: 2025-08-13
- **키워드**: 나라장터, 낙찰, 정보, 순위, 예비가격, 물품, 공사, 용역

## 서비스 설명
나라장터 개찰결과를 물품, 공사, 용역, 외자의 업무별로 제공하는 서비스로 각 업무별로 최종낙찰자, 개찰순위, 복수예비가 및 예비가격 정보를 제공하며 개찰완료목록, 재입찰목록, 유찰목록 또한 제공하는 나라장터 낙찰정보서비스

## API 목록 (총 23개)

### 1. GET /getScsbidListSttusThng
- **설명**: 낙찰된 목록 현황 물품조회

### 2. GET /getOpengResultListInfoFrgcptPPSSrch
- **설명**: 나라장터 검색조건에 의한 개찰결과 외자 목록 조회

### 3. GET /getOpengResultListInfoServcPPSSrch
- **설명**: 나라장터 검색조건에 의한 개찰결과 용역 목록 조회

### 4. GET /getOpengResultListInfoCnstwkPPSSrch
- **설명**: 나라장터 검색조건에 의한 개찰결과 공사 목록 조회

### 5. GET /getOpengResultListInfoThngPPSSrch
- **설명**: 나라장터 검색조건에 의한 개찰결과 물품 목록 조회

### 6. GET /getScsbidListSttusFrgcptPPSSrch
- **설명**: 나라장터 검색조건에 의한 낙찰된 목록 현황 외자조회

### 7. GET /getScsbidListSttusServcPPSSrch
- **설명**: 나라장터 검색조건에 의한 낙찰된 목록 현황 용역조회

### 8. GET /getScsbidListSttusCnstwkPPSSrch
- **설명**: 나라장터 검색조건에 의한 낙찰된 목록 현황 공사조회

### 9. GET /getScsbidListSttusThngPPSSrch
- **설명**: 나라장터 검색조건에 의한 낙찰된 목록 현황 물품조회

### 10. GET /getOpengResultListInfoRebid
- **설명**: 개찰결과 재입찰 목록 조회

### 11. GET /getOpengResultListInfoFailing
- **설명**: 개찰결과 유찰 목록 조회

### 12. GET /getScsbidListSttusCnstwk
- **설명**: 낙찰된 목록 현황 공사조회

### 13. GET /getScsbidListSttusServc
- **설명**: 낙찰된 목록 현황 용역조회

### 14. GET /getScsbidListSttusFrgcpt
- **설명**: 낙찰된 목록 현황 외자조회

### 15. GET /getOpengResultListInfoThng
- **설명**: 개찰결과 물품 목록 조회

### 16. GET /getOpengResultListInfoCnstwk
- **설명**: 개찰결과 공사 목록 조회

### 17. GET /getOpengResultListInfoServc
- **설명**: 개찰결과 용역 목록 조회

### 18. GET /getOpengResultListInfoFrgcpt
- **설명**: 개찰결과 외자 목록 조회

### 19. GET /getOpengResultListInfoThngPreparPcDetail
- **설명**: 개찰결과 물품 예비가격상세 목록 조회

### 20. GET /getOpengResultListInfoCnstwkPreparPcDetail
- **설명**: 개찰결과 공사 예비가격상세 목록 조회

### 21. GET /getOpengResultListInfoServcPreparPcDetail
- **설명**: 개찰결과 용역 예비가격상세 목록 조회

### 22. GET /getOpengResultListInfoFrgcptPreparPcDetail
- **설명**: 개찰결과 외자 예비가격상세 목록 조회

### 23. GET /getOpengResultListInfoOpengCompt
- **설명**: 개찰결과 개찰완료 목록 조회

## 응답 모델
- getScsbidListSttusThng_response
- getScsbidListSttusCnstwk_response
- getScsbidListSttusServc_response
- getScsbidListSttusFrgcpt_response
- getOpengResultListInfoThng_response
- getOpengResultListInfoCnstwk_response
- getOpengResultListInfoServc_response
- getOpengResultListInfoFrgcpt_response
- getOpengResultListInfoThngPreparPcDetail_response
- getOpengResultListInfoCnstwkPreparPcDetail_response
- getOpengResultListInfoServcPreparPcDetail_response
- getOpengResultListInfoFrgcptPreparPcDetail_response
- getOpengResultListInfoOpengCompt_response
- getOpengResultListInfoFailing_response
- getOpengResultListInfoRebid_response
- getScsbidListSttusThngPPSSrch_response
- getScsbidListSttusCnstwkPPSSrch_response
- getScsbidListSttusServcPPSSrch_response
- getScsbidListSttusFrgcptPPSSrch_response
- getOpengResultListInfoThngPPSSrch_response
- getOpengResultListInfoCnstwkPPSSrch_response
- getOpengResultListInfoServcPPSSrch_response
- getOpengResultListInfoFrgcptPPSSrch_response

## 참고문서
- (복구중)_조달청_OpenAPI참고자료_나라장터_낙찰정보서비스_1.0.docx


#### 3.1.3 조달청_나라장터 계약정보서비스
# 조달청_나라장터 계약정보서비스 상세 정보

## 1. 서비스 개요
| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_나라장터 계약정보서비스 |
| **Base URL** | `apis.data.go.kr/1230000/ao/CntrctInfoService` |
| **서비스 설명** | 나라장터에서 체결된 계약정보목록을 물품, 외자, 공사, 용역의 각 업무별로 제공하는 서비스로, 각 업무별 계약상세정보, 계약변경이력정보, 계약삭제이력정보를 제공. 또한, 나라장터 검색조건인 계약체결일자, 확정계약번호, 요청번호, 공고번호, 기관명(계약기관, 수요기관), 품명, 계약방법, 계약참조번호에 따른 계약현황정보를 제공. (변경/삭제된 계약정보이력 조회 및 검색조건에 의한 계약정보 조회 포함) |

## 2. 메타데이터
| 항목 | 내용 |
| :--- | :--- |
| **제공기관** | 조달청 |
| **관리부서명** | 조달데이터관리팀 |
| **관리부서 전화번호** | 070-4056-7677 |
| **API 유형** | REST |
| **데이터포맷** | JSON+XML |
| **키워드** | 나라장터, 계약, 정보, 물품, 용역, 공사, 외자 |
| **비용부과유무** | 무료 |
| **신청가능 트래픽** | 개발계정: 1,000 / 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **심의유형** | 개발단계: 자동승인 / 운영단계: 자동승인 |
| **공간범위** | 전국 |
| **시간범위** | 2004년 7월 - 2025년 1월 |
| **참고문서** | (복구중)_조달청_OpenAPI참고자료_나라장터_계약정보서비스_1.0.docx |

## 3. API 엔드포인트 목록 및 상세 정보 (총 21개 엔드포인트)

### 3.1. 계약현황에 대한 물품조회 (GET /getCntrctInfoListThng)
**설명:** 계약현황에 대한 물품조회
**HTTP Method:** GET
**요청 파라미터:**

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 발급받은 인증키 |
| `pageNo` | 선택 | integer | 페이지 번호 |
| `numOfRows` | 선택 | integer | 한 페이지 결과 수 |
| `inqryDiv` | 선택 | string | 조회구분 (예: 1:계약체결일자, 2:확정계약번호, 3:요청번호, 4:공고번호, 5:기관명, 6:품명, 7:계약방법, 8:계약참조번호) |
| `type` | 선택 | string | 계약구분 (예: 1:물품, 2:외자, 3:공사, 4:용역) |
| `inqryBgnDt` | 선택 | string | 조회 시작일자 (YYYYMMDD) |
| `inqryEndDt` | 선택 | string | 조회 종료일자 (YYYYMMDD) |
| `untyCntrctNo` | 선택 | string | 통합계약번호 |

**응답 모델:** `getCntrctInfoListThng_response`

---

### 3.2. 계약현황에 대한 외자삭제이력조회 (GET /getCntrctInfoListFrgcptDltHstry)
**설명:** 계약현황에 대한 외자삭제이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListFrgcptDltHstry_response`

### 3.3. 계약현황에 대한 외자변경이력조회 (GET /getCntrctInfoListFrgcptChgHstry)
**설명:** 계약현황에 대한 외자변경이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListFrgcptChgHstry_response`

### 3.4. 나라장터검색조건에 의한 계약현황 외자조회 (GET /getCntrctInfoListFrgcptPPSSrch)
**설명:** 나라장터검색조건에 의한 계약현황 외자조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListFrgcptPPSSrch_response`

### 3.5. 계약현황에 대한 외자세부조회 (GET /getCntrctInfoListFrgcptDetail)
**설명:** 계약현황에 대한 외자세부조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListFrgcptDetail_response`

### 3.6. 계약현황에 대한 외자조회 (GET /getCntrctInfoListFrgcpt)
**설명:** 계약현황에 대한 외자조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListFrgcpt_response`

### 3.7. 계약현황에 대한 용역삭제이력조회 (GET /getCntrctInfoListServcDltHstry)
**설명:** 계약현황에 대한 용역삭제이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListServcDltHstry_response`

### 3.8. 계약현황에 대한 용역변경이력조회 (GET /getCntrctInfoListServcChgHstry)
**설명:** 계약현황에 대한 용역변경이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListServcChgHstry_response`

### 3.9. 계약현황에 대한 물품세부조회 (GET /getCntrctInfoListThngDetail)
**설명:** 계약현황에 대한 물품세부조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListThngDetail_response`

### 3.10. 나라장터검색조건에 의한 계약현황 용역조회 (GET /getCntrctInfoListServcPPSSrch)
**설명:** 나라장터검색조건에 의한 계약현황 용역조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListServcPPSSrch_response`

### 3.11. 계약현황 정보에 대한 기술용역서비스정보조회 (GET /getCntrctInfoListTechServcServcInfo)
**설명:** 계약현황 정보에 대한 기술용역서비스정보조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListTechServcServcInfo_response`

### 3.12. 계약현황에 대한 일반용역서비스정보조회 (GET /getCntrctInfoListGnrlServcServcInfo)
**설명:** 계약현황에 대한 일반용역서비스정보조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListGnrlServcServcInfo_response`

### 3.13. 계약현황에 대한 용역조회 (GET /getCntrctInfoListServc)
**설명:** 계약현황에 대한 용역조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListServc_response`

### 3.14. 계약현황에 대한 공사삭제이력조회 (GET /getCntrctInfoListCnstwkDltHstry)
**설명:** 계약현황에 대한 공사삭제이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListCnstwkDltHstry_response`

### 3.15. 계약현황에 대한 공사변경이력조회 (GET /getCntrctInfoListCnstwkChgHstry)
**설명:** 계약현황에 대한 공사변경이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListCnstwkChgHstry_response`

### 3.16. 나라장터검색조건에 의한 계약현황 공사조회 (GET /getCntrctInfoListCnstwkPPSSrch)
**설명:** 나라장터검색조건에 의한 계약현황 공사조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListCnstwkPPSSrch_response`

### 3.17. 계약현황에 대한 공사서비스정보조회 (GET /getCntrctInfoListCnstwkServcInfo)
**설명:** 계약현황에 대한 공사서비스정보조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListCnstwkServcInfo_response`

### 3.18. 계약현황에 대한 공사조회 (GET /getCntrctInfoListCnstwk)
**설명:** 계약현황에 대한 공사조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListCnstwk_response`

### 3.19. 계약현황에 대한 물품삭제이력조회 (GET /getCntrctInfoListThngDltHstry)
**설명:** 계약현황에 대한 물품삭제이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListThngDltHstry_response`

### 3.20. 계약현황에 대한 물품변경이력조회 (GET /getCntrctInfoListThngChgHstry)
**설명:** 계약현황에 대한 물품변경이력조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListThngChgHstry_response`

### 3.21. 나라장터검색조건에 의한 계약현황 물품조회 (GET /getCntrctInfoListThngPPSSrch)
**설명:** 나라장터검색조건에 의한 계약현황 물품조회
**HTTP Method:** GET
**요청 파라미터:** (3.1과 동일한 파라미터 구조를 가질 것으로 추정)
**응답 모델:** `getCntrctInfoListThngPPSSrch_response`

## 4. 응답 모델 목록
- `getCntrctInfoListThng_response`
- `getCntrctInfoListThngDetail_response`
- `getCntrctInfoListThngPPSSrch_response`
- `getCntrctInfoListThngChgHstry_response`
- `getCntrctInfoListThngDltHstry_response`
- `getCntrctInfoListCnstwk_response`
- `getCntrctInfoListCnstwkServcInfo_response`
- `getCntrctInfoListCnstwkPPSSrch_response`
- `getCntrctInfoListCnstwkChgHstry_response`
- `getCntrctInfoListCnstwkDltHstry_response`
- `getCntrctInfoListGnrlServcServcInfo_response`
- `getCntrctInfoListTechServcServcInfo_response`
- `getCntrctInfoListServcPPSSrch_response`
- `getCntrctInfoListServcChgHstry_response`
- `getCntrctInfoListServcDltHstry_response`
- `getCntrctInfoListServc_response`
- `getCntrctInfoListFrgcpt_response`
- `getCntrctInfoListFrgcptDetail_response`
- `getCntrctInfoListFrgcptPPSSrch_response`
- `getCntrctInfoListFrgcptChgHstry_response`
- `getCntrctInfoListFrgcptDltHstry_response`

#### 3.1.4 조달청_나라장터 계약과정통합공개서비스
# 조달청_나라장터 계약과정통합공개서비스 상세 정보

본 문서는 공공데이터포털에서 제공하는 **조달청_나라장터 계약과정통합공개서비스** 오픈 API에 대한 상세 정보를 요약하여 제공합니다.

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_나라장터 계약과정통합공개서비스 |
| **서비스 설명** | 나라장터에서 제공되는 계약과정통합공개를 구현한 서비스로 물품, 외자, 용역, 공사 업무구분에 대하여 사용자가 `[입찰공고번호, 사전규격등록번호, 발주계획번호, 조달요청번호]` 중 한 번호를 알고 있는 경우 해당 입찰공고의 진행과정 정보(사전규격정보, 입찰공고정보, 낙찰정보, 계약정보목록 등)를 조회하는 서비스입니다. |
| **Base URL** | `apis.data.go.kr/1230000/ao/CntrctProcssIntgOpenService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON, XML |
| **키워드** | 계약과정, 통합, 공개, 물품, 외자, 용역, 공사, 입찰 |

## 2. 제공기관 및 운영 정보

| 항목 | 내용 |
| :--- | :--- |
| **제공기관** | 조달청 |
| **관리부서명** | 조달데이터관리팀 |
| **관리부서 전화번호** | 070-4056-7677 |
| **비용 부과 유무** | 무료 |
| **심의 유형** | 개발단계: 자동승인 / 운영단계: 자동승인 |
| **신청 가능 트래픽** | 개발계정: 1,000 / 운영계정: 활용사례 등록 시 트래픽 증가 가능 |
| **참고 문서** | (복구중)_조달청_OpenAPI참고자료_나라장터_계약과정통합공개서비스_1.0.docx |

## 3. API 엔드포인트 목록 (총 4개)

본 서비스는 총 4개의 엔드포인트를 제공하며, 각 엔드포인트는 동일한 요청 파라미터 구조를 가집니다.

| 엔드포인트 이름 | HTTP 메소드 | 경로 | 설명 |
| :--- | :--- | :--- | :--- |
| 외자조회 | GET | `/getCntrctProcssIntgOpenFrgcpt` | 계약과정통합공개정보에 대한 외자조회 |
| 물품조회 | GET | `/getCntrctProcssIntgOpenThng` | 계약과정통합공개정보에 대한 물품조회 |
| 용역조회 | GET | `/getCntrctProcssIntgOpenServc` | 계약과정통합공개정보에 대한 용역조회 |
| 공사조회 | GET | `/getCntrctProcssIntgOpenCnstwk` | 계약과정통합공개정보에 대한 공사조회 |

## 4. 공통 요청 파라미터 상세

모든 엔드포인트는 다음과 같은 공통 요청 파라미터를 사용합니다.

| 파라미터명 | 필수/선택 | 타입 | 위치 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | query | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | query | 페이지번호 |
| `numOfRows` | 필수 | string | query | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | query | 조회구분 |
| `bidNtceNo` | 선택 | string | query | 입찰공고번호 |
| `bidNtceOrd` | 선택 | string | query | 입찰공고차수 |
| `bfSpecRgstNo` | 선택 | string | query | 사전규격등록번호 |
| `orderPlanNo` | 선택 | string | query | 발주계획번호 |
| `prcrmntReqNo` | 선택 | string | query | 조달요청번호 |
| `type` | 선택 | string | query | 타입 |

## 5. 응답 모델 상세

모든 엔드포인트의 응답 모델은 동일한 구조를 가지며, 응답 데이터는 `header`와 `body`로 구성됩니다.

### 응답 모델 (JSON 예시)

```json
{
  "header": {
    "resultMsg": "string",
    "resultCode": "string"
  },
  "body": {
    "items": {
      "item": [
        {
          "orderBizNm": "string",
          "orderPlanNo": "string",
          "orderPlanUntyNo": "string",
          "orderInsttNm": "string",
          "orderYm": "string",
          "prcrmntMethdNm": "string",
          "cntrctCnclsMthdNm": "string",
          "bfSpecRgstNo": "string",
          "bfSpecBizNm": "string",
          "bfSpecDminsttNm": "string",
          "bfSpecRgstDt": "string",
          "bfSpecRgstYm": "string",
          "bidNtceNo": "string",
          "bidNtceOrd": "string",
          "bidNtceNm": "string",
          "bidNtceInsttNm": "string",
          "bidNtceDt": "string",
          "bidNtceYm": "string",
          "opngDt": "string",
          "opngYm": "string",
          "succbidderNm": "string",
          "succbidAmt": "string",
          "cntrctCnclsDt": "string",
          "cntrctCnclsYm": "string",
          "cntrctCnclsNo": "string",
          "cntrctCnclsNm": "string"
        }
      ]
    }
  }
}
```

### 응답 항목 (items/item 내부)

| 항목명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `orderBizNm` | string | 발주 사업명 |
| `orderPlanNo` | string | 발주 계획 번호 |
| `orderPlanUntyNo` | string | 발주 계획 통합 번호 |
| `orderInsttNm` | string | 발주 기관명 |
| `orderYm` | string | 발주 연월 |
| `prcrmntMethdNm` | string | 조달 방법명 |
| `cntrctCnclsMthdNm` | string | 계약 체결 방법명 |
| `bfSpecRgstNo` | string | 사전 규격 등록 번호 |
| `bfSpecBizNm` | string | 사전 규격 사업명 |
| `bfSpecDminsttNm` | string | 사전 규격 발주 기관명 |
| `bfSpecRgstDt` | string | 사전 규격 등록 일자 |
| `bfSpecRgstYm` | string | 사전 규격 등록 연월 |
| `bidNtceNo` | string | 입찰 공고 번호 |
| `bidNtceOrd` | string | 입찰 공고 차수 |
| `bidNtceNm` | string | 입찰 공고명 |
| `bidNtceInsttNm` | string | 입찰 공고 기관명 |
| `bidNtceDt` | string | 입찰 공고 일자 |
| `bidNtceYm` | string | 입찰 공고 연월 |
| `opngDt` | string | 개찰 일자 |
| `opngYm` | string | 개찰 연월 |
| `succbidderNm` | string | 낙찰자명 |
| `succbidderNm` | string | 낙찰자명 |
| `succbidAmt` | string | 낙찰 금액 |
| `cntrctCnclsDt` | string | 계약 체결 일자 |
| `cntrctCnclsYm` | string | 계약 체결 연월 |
| `cntrctCnclsNo` | string | 계약 체결 번호 |
| `cntrctCnclsNm` | string | 계약 체결명 |

### 3.2 사전공개/계획

#### 3.2.1 조달청_나라장터 사전규격정보서비스
# 조달청_나라장터 사전규격정보서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_나라장터 사전규격정보서비스 |
| **서비스 설명** | 물품, 용역, 외자, 공사 업무별로 나라장터에 공개된 사전규격정보를 제공하는 서비스로 업무별 사전규격 전체목록 및 기관별, 품목별로 사전규격을 조회할 수 있으며 사전규격등록번호, 품명(사업명), 배정예산액, 관련규격서파일, 규격서 의견 등을 제공하는 나라장터 사전규격정보서비스 |
| **Base URL** | `apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON+XML |
| **키워드** | 사전,규격,정보,물품,용역,외자,공사,나라장터 |
| **참고문서** | (복구중)\_조달청\_OpenAPI참고자료\_나라장터\_사전규격정보서비스\_1.0.docx |

## 2. 제공 기관 및 관리 정보

| 항목 | 내용 |
| :--- | :--- |
| **제공 기관** | 조달청 |
| **관리 부서명** | 조달데이터관리팀 |
| **관리 부서 전화번호** | 070-4056-7677 |
| **비용 부과 유무** | 무료 |
| **심의 유형** | 개발단계 : 자동승인 / 운영단계 : 자동승인 |
| **신청 가능 트래픽** | 개발계정 : 1,000 / 운영계정 : 활용사례 등록시 신청하면 트래픽 증가 가능 |

## 3. API 엔드포인트 목록 (총 20개)

### 3.1. 사전규격 물품 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoThng`
- **설명:** 검색조건을 조회구분, 등록일시범위, 변경일시범위, 사전규격등록번호로 입력하여 물품에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.2. 나라장터 사전규격 공사 규격서 의견 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngOpinionInfoCnstwk`
- **설명:** 검색조건을 조회구분, 등록일시범위, 사전규격등록번호로 입력하여 사전규격등록번호, 참조번호, 의견제목, 작성업체명, 작성자명, 입력일시, 작성자전화번호, 작성자이메일, 관련 규격서의견파일, 의견내용 등 나라장터 사전규격 공사 규격서의 의견 목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `type` | 선택 | string | 타입 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |

### 3.3. 나라장터 사전규격 용역 규격서 의견 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngOpinionInfoServc`
- **설명:** 검색조건을 조회구분, 등록일시범위, 사전규격등록번호로 입력하여 사전규격등록번호, 참조번호, 의견제목, 작성업체명, 작성자명, 입력일시, 작성자전화번호, 작성자이메일, 관련 규격서의견파일, 의견내용 등 나라장터 사전규격 용역 규격서의 의견 목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `type` | 선택 | string | 타입 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |

### 3.4. 나라장터 사전규격 외자 규격서 의견 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngOpinionInfoFrgcpt`
- **설명:** 검색조건을 조회구분, 등록일시범위, 사전규격등록번호로 입력하여 사전규격등록번호, 참조번호, 의견제목, 작성업체명, 작성자명, 입력일시, 작성자전화번호, 작성자이메일, 관련 규격서의견파일, 의견내용 등 나라장터 사전규격 외자 규격서의 의견 목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | string |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `type` | 선택 | string | 타입 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |

### 3.5. 나라장터 사전규격 물품 규격서 의견 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngOpinionInfoThng`
- **설명:** 검색조건을 조회구분, 등록일시범위, 사전규격등록번호로 입력하여 사전규격등록번호, 참조번호, 의견제목, 작성업체명, 작성자명, 입력일시, 작성자전화번호, 작성자이메일, 관련 규격서의견파일, 의견내용 등 나라장터 사전규격 물품 규격서의 의견 목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `type` | 선택 | string | 타입 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |

### 3.6. 나라장터 검색조건에 의한 사전규격 공사 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoCnstwkPPSSrch`
- **설명:** 검색조건을 조회구분, 등록일시범위, 변경일시범위, 사전규격등록번호, 품명, 발주기관명, 수요기관명, 관련 규격서파일 등으로 입력하여 공사에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.7. 나라장터 검색조건에 의한 사전규격 용역 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoServcPPSSrch`
- **설명:** 검색조건을 조회구분, 등록일시범위, 변경일시범위, 사전규격등록번호, 품명, 발주기관명, 수요기관명, 관련 규격서파일 등으로 입력하여 용역에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.8. 나라장터 검색조건에 의한 사전규격 외자 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoFrgcptPPSSrch`
- **설명:** 검색조건을 조회구분, 등록일시범위, 변경일시범위, 사전규격등록번호, 품명, 발주기관명, 수요기관명, 관련 규격서파일 등으로 입력하여 외자에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.9. 나라장터 검색조건에 의한 사전규격 물품 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoThngPPSSrch`
- **설명:** 검색조건을 조회구분, 등록일시범위, 변경일시범위, 사전규격등록번호, 품명, 발주기관명, 수요기관명, 관련 규격서파일 등으로 입력하여 물품에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.10. 사전규격 공사 품목별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getThngDetailMetaInfoCnstwk`
- **설명:** 품목별로 공사에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.11. 사전규격 공사 기관별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getInsttAcctoThngListInfoCnstwk`
- **설명:** 기관별로 공사에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.12. 사전규격 물품 기관별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getInsttAcctoThngListInfoThng`
- **설명:** 기관별로 물품에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.13. 사전규격 공사 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoCnstwk`
- **설명:** 공사에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.14. 사전규격 용역 품목별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getThngDetailMetaInfoServc`
- **설명:** 품목별로 용역에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.15. 사전규격 용역 기관별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getInsttAcctoThngListInfoServc`
- **설명:** 기관별로 용역에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.16. 사전규격 물품 품목별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getThngDetailMetaInfoThng`
- **설명:** 품목별로 물품에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.17. 사전규격 외자 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoFrgcpt`
- **설명:** 외자에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.18. 사전규격 외자 기관별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getInsttAcctoThngListInfoFrgcpt`
- **설명:** 기관별로 외자에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.19. 사전규격 외자 품목별 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getThngDetailMetaInfoFrgcpt`
- **설명:** 품목별로 외자에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

### 3.20. 사전규격 용역 목록 조회
- **HTTP Method:** `GET`
- **URI:** `/getPublicPrcureThngInfoServc`
- **설명:** 용역에 대한 사전규격정보목록을 조회

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `type` | 선택 | string | 타입 |
| `bfSpecRgstNo` | 선택 | string | 사전규격등록번호 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 필수 | string | 조회종료일시 |

## 4. 응답 모델 목록

API 목록에 따라 다양한 응답 모델이 제공됩니다. 주요 응답 모델은 다음과 같습니다.

- `getPublicPrcureThngInfoThng_response`
- `getInsttAcctoThngListInfoThng_response`
- `getThngDetailMetaInfoThng_response`
- `getPublicPrcureThngInfoFrgcpt_response`
- `getInsttAcctoThngListInfoFrgcpt_response`
- `getThngDetailMetaInfoFrgcpt_response`
- `getPublicPrcureThngInfoServc_response`
- `getInsttAcctoThngListInfoServc_response`
- `getThngDetailMetaInfoServc_response`
- `getPublicPrcureThngInfoCnstwk_response`
- `getInsttAcctoThngListInfoCnstwk_response`
- `getThngDetailMetaInfoCnstwk_response`
- `getPublicPrcureThngInfoThngPPSSrch_response`
- `getPublicPrcureThngInfoFrgcptPPSSrch_response`
- `getPublicPrcureThngInfoServcPPSSrch_response`
- `getPublicPrcureThngInfoCnstwkPPSSrch_response`
- `getPublicPrcureThngOpinionInfoThng_response`
- `getPublicPrcureThngOpinionInfoFrgcpt_response`
- `getPublicPrcureThngOpinionInfoServc_response`
- `getPublicPrcureThngOpinionInfoCnstwk_response`

#### 3.2.2 조달청_나라장터 발주계획현황서비스
# 조달청_나라장터 발주계획현황서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_나라장터 발주계획현황서비스 |
| **서비스 설명** | 발주기관들이 나라장터에 등록한 발주계획정보를 제공하는 서비스로 각 발주기관들이 당해 회계연도에 조달할 공사, 물품, 용역, 외자에 대한 분기별 발주계획(조달대상, 예산액, 발주예정시기, 발주방법, 발주기관 주소, 연락처 등) 공고 내역를 제공하는 나라장터 발주계획현황서비스 |
| **Base URL** | `apis.data.go.kr/1230000/ao/OrderPlanSttusService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON, XML |
| **키워드** | 발주,계획,현황,공사,물품,공사,용역,외자 |

## 2. 제공 기관 정보

| 항목 | 내용 |
| :--- | :--- |
| **제공 기관** | 조달청 |
| **관리 부서명** | 조달데이터관리팀 |
| **관리 부서 전화번호** | 070-4056-7677 |

## 3. 활용 정보

| 항목 | 내용 |
| :--- | :--- |
| **비용 부과 유무** | 무료 |
| **신청 가능 트래픽** | 개발계정 : 1,000 / 운영계정 : 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **심의 유형** | 개발단계 : 자동승인 / 운영단계 : 자동승인 |
| **공간 범위** | 전국 |
| **시간 범위** | 2004년 12월 - 2025년 1월 |
| **참고 문서** | (복구중)_조달청_OpenAPI참고자료_나라장터_발주계획현황서비스_1.0.docx |

## 4. API 엔드포인트 목록 (총 8개)

### 4.1. GET /getOrderPlanSttusListThng (발주계획현황에 대한 물품조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.2. GET /getOrderPlanSttusListCnstwk (발주계획현황에 대한 공사조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.3. GET /getOrderPlanSttusListServc (발주계획현황에 대한 용역조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.4. GET /getOrderPlanSttusListFrgcpt (발주계획현황에 대한 외자조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.5. GET /getOrderPlanSttusListThngPPSSrch (나라장터 검색조건에 의한 발주계획현황에 대한 물품조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.6. GET /getOrderPlanSttusListCnstwkPPSSrch (나라장터 검색조건에 의한 발주계획현황에 대한 공사조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.7. GET /getOrderPlanSttusListServcPPSSrch (나라장터 검색조건에 의한 발주계획현황에 대한 용역조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

### 4.8. GET /getOrderPlanSttusListFrgcptPPSSrch (나라장터 검색조건에 의한 발주계획현황에 대한 외자조회)

| 구분 | 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **필수** | `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| **필수** | `pageNo` | 필수 | string | 페이지번호 |
| **필수** | `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| **필수** | `inqryDiv` | 필수 | string | 조회구분 |
| **선택** | `orderBgnYm` | 선택 | string | 발주 시작년월 |
| **선택** | `orderEndYm` | 선택 | string | 발주 종료년월 |
| **선택** | `inqryBgnDt` | 선택 | string | 조회 시작일시 |
| **선택** | `inqryEndDt` | 선택 | string | 조회 종료일시 |
| **선택** | `orderPlanUntyNo` | 선택 | string | 발주계획 통합번호 |
| **선택** | `orderInsttCd` | 선택 | string | 발주기관 코드 |
| **선택** | `orderInsttNm` | 선택 | string | 발주기관명 |
| **선택** | `type` | 선택 | string | 타입 |

## 5. 응답 모델

모든 API 엔드포인트는 다음 응답 모델을 사용합니다.

\`\`\`json
{
  "header": {
    "resultCode": "string",
    "resultMsg": "string"
  },
  "body": {
    "totalCount": "string",
    "numOfRows": "string",
    "pageNo": "string",
    "items": [
      {
        "orderPlanUntyNo": "string",
        "orderInsttCd": "string",
        "orderInsttNm": "string",
        "orderInsttAddr": "string",
        "orderInsttTelno": "string",
        "orderInsttChargerNm": "string",
        "orderInsttChargerTelno": "string",
        "orderInsttChargerEmail": "string",
        "orderInsttChargerFaxNo": "string",
        "orderInsttChargerDeptNm": "string",
        "orderInsttChargerPositNm": "string",
        "orderInsttChargerDutyNm": "string",
        "orderInsttChargerDutyCd": "string",
        "orderInsttChargerDutyNmCd": "string",
        "orderInsttChargerDutyNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCdNmCdNmCd": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCdNmCdNmCdNm": "string",
        "orderInsttChargerDutyNmCdNmCdNmCdNmCdNmCdNmCdNmCdNmCdNmCd": "string"
      }
    ]
  }
}
\`\`\`

### 3.3 기준정보

#### 3.3.1 조달청_나라장터 사용자정보 서비스
# 조달청_나라장터 사용자정보 서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청\_나라장터 사용자정보 서비스 |
| **서비스 설명** | 나라장터에 등록된 조달업체와 수요기관에 대한 정보를 제공하는 서비스로 조달업체정보에는 사업자등록번호, 업체명, 업체주소, 업체의 등록업종정보, 업체의 공급물품정보가 포함되며 수요기관정보에는 수요기관코드(행자부코드가 기본으로 제공되며 행자부코드가 없을 경우 나라장터 수요기관코드가 제공됨), 소관구분, 주소, 최상위기관코드, 최상위기관명 등이 포함되는 나라장터 사용자정보서비스 |
| **Base URL** | `apis.data.go.kr/1230000/ao/UsrInfoService` |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 |
| **전화번호** | 070-4056-7677 |
| **API 유형** | REST |
| **데이터 포맷** | JSON+XML |
| **키워드** | 나라장터, 사용자, 정보, 기관, 업체, 업종, 물품, 소관 |
| **비용 부과 유무** | 무료 |
| **심의 유형** | 개발단계 : 자동승인 / 운영단계 : 자동승인 |
| **트래픽 정보** | 개발계정 : 10,000 / 운영계정 : 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **시간 범위** | 정보 없음 |
| **공간 범위** | 정보 없음 |
| **참고 문서** | (복구중)\_조달청\_OpenAPI참고자료\_나라장터\_사용자정보서비스\_1.0.docx |

## 2. API 엔드포인트 목록 (총 4개)

### 2.1. GET /getDminsttInfo (수요기관정보조회)

수요기관코드, 사업자등록번호, 수요기관명을 입력하여 수요기관명, 유효기간, 법인등록번호, 사업자등록번호, 기관유형명, 업태명, 업종명, 주소, 등록일시 등 수요기관정보 목록을 조회.

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회기준시작일시 |
| `inqryEndDt` | 선택 | string | 조회기준종료일시 |
| `dminsttCd` | 선택 | string | 수요기관코드 |
| `dminsttNm` | 선택 | string | 수요기관명 |
| `bizno` | 선택 | string | 사업자등록번호 |
| `type` | 선택 | string | 타입 |

#### 응답 모델 (`getDminsttInfo_response`)

```json
{
  "header": {
    "resultMsg": "string",
    "resultCode": "string"
  },
  "body": {
    "items": {
      "item": [
        {
          "rgstDt": "string",
          "chgDt": "string",
          "dminsttCd": "string",
          "vldPrdBgnDt": "string",
          "vldPrdEndDt": "string",
          "dminsttNm": "string",
          "dminsttAbrvNm": "string",
          "dminsttEngNm": "string",
          "corprtRgstNo": "string",
          "bizno": "string",
          "jrsdctnDivNm": "string",
          "insttyCdLrglsfcNm": "string",
          "insttyCdMdlclsfcNm": "string",
          "insttyCdSmclsfcNm": "string",
          "insttyCdMnrclsfcNm": "string",
          "insttyTyNm": "string",
          "bussTyNm": "string",
          "indstryNm": "string",
          "zip": "string",
          "addr": "string",
          "dminsttCdUppr": "string",
          "dminsttNmUppr": "string",
          "dminsttAbrvNmUppr": "string",
          "dminsttEngNmUppr": "string",
          "telno": "string",
          "faxno": "string",
          "email": "string",
          "homepageUrl": "string"
        }
      ]
    },
    "pageNo": "string",
    "numOfRows": "string",
    "totalCount": "string"
  }
}
```

### 2.2. GET /getPrcrmntCorpBasicInfo (조달업체 기본정보 조회)

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회기준시작일시 |
| `inqryEndDt` | 선택 | string | 조회기준종료일시 |
| `bizno` | 선택 | string | 사업자등록번호 |
| `prcrmntCorpNm` | 선택 | string | 조달업체명 |
| `type` | 선택 | string | 타입 |

#### 응답 모델 (`getPrcrmntCorpBasicInfo_response`)

```json
{
  "header": {
    "resultMsg": "string",
    "resultCode": "string"
  },
  "body": {
    "items": {
      "item": [
        {
          "rgstDt": "string",
          "chgDt": "string",
          "bizno": "string",
          "prcrmntCorpNm": "string",
          "prcrmntCorpAbrvNm": "string",
          "prcrmntCorpEngNm": "string",
          "corprtRgstNo": "string",
          "ceoNm": "string",
          "zip": "string",
          "addr": "string",
          "telno": "string",
          "faxno": "string",
          "email": "string",
          "homepageUrl": "string",
          "bussTyNm": "string",
          "indstryNm": "string"
        }
      ]
    },
    "pageNo": "string",
    "numOfRows": "string",
    "totalCount": "string"
  }
}
```

### 2.3. GET /getPrcrmntCorpIndstrytyInfo (조달업체업종정보조회)

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회기준시작일시 |
| `inqryEndDt` | 선택 | string | 조회기준종료일시 |
| `bizno` | 선택 | string | 사업자등록번호 |
| `prcrmntCorpNm` | 선택 | string | 조달업체명 |
| `type` | 선택 | string | 타입 |

#### 응답 모델 (`getPrcrmntCorpIndstrytyInfo_response`)

```json
{
  "header": {
    "resultMsg": "string",
    "resultCode": "string"
  },
  "body": {
    "items": {
      "item": [
        {
          "rgstDt": "string",
          "chgDt": "string",
          "bizno": "string",
          "prcrmntCorpNm": "string",
          "indstrytyCd": "string",
          "indstrytyNm": "string",
          "vldPrdBgnDt": "string",
          "vldPrdEndDt": "string"
        }
      ]
    },
    "pageNo": "string",
    "numOfRows": "string",
    "totalCount": "string"
  }
}
```

### 2.4. GET /getPrcrmntCorpSplyPrdctInfo (조달업체공급물품정보조회)

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `inqryDiv` | 필수 | string | 조회구분 |
| `inqryBgnDt` | 선택 | string | 조회기준시작일시 |
| `inqryEndDt` | 선택 | string | 조회기준종료일시 |
| `bizno` | 선택 | string | 사업자등록번호 |
| `prcrmntCorpNm` | 선택 | string | 조달업체명 |
| `type` | 선택 | string | 타입 |

#### 응답 모델 (`getPrcrmntCorpSplyPrdctInfo_response`)

```json
{
  "header": {
    "resultMsg": "string",
    "resultCode": "string"
  },
  "body": {
    "items": {
      "item": [
        {
          "rgstDt": "string",
          "chgDt": "string",
          "bizno": "string",
          "prcrmntCorpNm": "string",
          "splyPrdctCd": "string",
          "splyPrdctNm": "string",
          "vldPrdBgnDt": "string",
          "vldPrdEndDt": "string"
        }
      ]
    },
    "pageNo": "string",
    "numOfRows": "string",
    "totalCount": "string"
  }
}
```

#### 3.3.2 조달청_나라장터 업종 및 근거법규서비스
# 조달청_나라장터 업종 및 근거법규서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_나라장터 업종 및 근거법규서비스 |
| **서비스 설명** | 나라장터 업종 및 근거법규를 조회합니다. 법제처가 분류하고 있는 법 분야에 따라 업종이 분류되어 있으며 법 분야별로 업종을 코드화하여 제공합니다. 법령의 제정/개정/폐지 등으로 업종이 추가/수정/삭제될 경우 조회시점에 유효한 업종 정보만 제공합니다. |
| **Base URL** | `apis.data.go.kr/1230000/ao/IndstrytyBaseLawrgltInfoService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON, XML |
| **키워드** | 업종, 근거, 법규, 근거법령조항명, 업종분류코드, 포함면허, 업종등록일시 |

## 2. 제공 정보

| 항목 | 내용 |
| :--- | :--- |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 |
| **전화번호** | 070-4056-7677 |
| **트래픽 정보** | 개발계정: 1,000 / 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **비용** | 무료 |
| **심의 유형** | 개발단계: 자동승인 / 운영단계: 자동승인 |
| **시간 범위** | 정보 없음 |
| **공간 범위** | 정보 없음 |
| **참고 문서** | (복구중)\_수정)조달청\_OpenAPI참고자료\_나라장터\_업종및근거법규서비스\_1.0.docx |

## 3. API 엔드포인트 상세 정보 (총 1개)

### 3.1. 업종 및 근거법규 정보 조회

| 항목 | 내용 |
| :--- | :--- |
| **엔드포인트 명** | getIndstrytyBaseLawrgltInfoList |
| **설명** | 업종 및 근거법규 정보 목록을 조회할 수 있습니다. 조건 입력을 하지 않을 경우 전체 조회됩니다. |
| **HTTP 메소드** | GET |
| **URL Path** | `/getIndstrytyBaseLawrgltInfoList` |

#### 요청 파라미터 (Query Parameters)

| 파라미터명 | 필수 여부 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 (required) | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 (required) | string | 페이지번호 |
| `numOfRows` | 필수 (required) | string | 한 페이지 결과 수 |
| `indstrytyClsfcCd` | 선택 | string | 업종분류코드 |
| `indstrytyNm` | 선택 | string | 업종명 |
| `indstrytyCd` | 선택 | string | 업종코드 |
| `inqryBgnDt` | 선택 | string | 조회시작일시 |
| `inqryEndDt` | 선택 | string | 조회종료일시 |
| `type` | 선택 | string | 타입 |
| `indstrytyUseYn` | 선택 | string | 업종사용여부 |

#### 응답 모델 (`getIndstrytyBaseLawrgltInfoList_response`)

응답은 `header`와 `body`로 구성되며, `body`는 다시 `items`, `totalCount`, `numOfRows`, `pageNo`를 포함합니다.

##### body.items.item 상세 필드

| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `indstrytyUseYn` | string | 업종사용여부 |
| `indstrytyClsfcCd` | string | 업종분류코드 |
| `indstrytyClsfcNm` | string | 업종분류명 |
| `indstrytyCd` | string | 업종코드 |
| `indstrytyNm` | string | 업종명 |
| `baseLawordNm` | string | 근거법령명 |
| `baseLawordArtclClauseNm` | string | 근거법령조항명 |
| `baseLawordUrl` | string | 근거법령URL |
| `ritnRglrCntnts` | string | 작성규정내용 |
| `inclsnLcnss` | string | 포함면허 |
| `undefined` | string | (알 수 없음) |
| `indstrytyRgstDt` | string | 업종등록일시 |
| `indstrytyChgDt` | string | 업종변경일시 |
| `indstrytyDelDt` | string | 업종삭제일시 |
| `indstrytyDelResn` | string | 업종삭제사유 |
| `indstrytyRegstId` | string | 업종등록ID |
| `indstrytyChgId` | string | 업종변경ID |
| `indstrytyDelId` | string | 업종삭제ID |
| `indstrytyRegstNm` | string | 업종등록자명 |
| `indstrytyChgNm` | string | 업종변경자명 |
| `indstrytyDelNm` | string | 업종삭제자명 |

##### 응답 코드

| 코드 | 설명 |
| :--- | :--- |
| `10` | OpenAPI 요청시 ServiceKey 파라미터가 없음 |
| `11` | 요청하신 OpenAPI의 필수 파라미터가 누락되었습니다. |
| `200` | 성공 |
| `07` | 요청하신 OpenAPI의 파라미터 입력값 범위가 초과되었습니다. |
| `08` | 요청하신 OpenAPI의 필수 파라미터가 누락되었습니다. |
| `05` | 제공기관 서비스 제공 상태가 원활하지 않습니다. |
| `06` | 날짜 Default, Format Error |
| `02` | 제공기관 서비스 제공 상태가 원활하지 않습니다. |
| `03` | 데이터 없음 에러 |

#### 3.3.3 조달청_나라장터 가격정보현황서비스
# 조달청_나라장터 가격정보현황서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_나라장터 가격정보현황서비스 |
| **서비스 설명** | 조달청에서 조사된 또는 계약된 시설공통자재(토목),시설공통자재(건축),시설공통자재(기계설비),시설공통자재(전기, 정보통신),시장시공가격(토목),시장시공가격(건축),시장시공가격(기계설비),공종분류및세부공종,표준시장단가및시장시공가격,자원분류및순수자원,시설공통자재(종합)의 가격정보를 제공하는 서비스 |
| **Base URL** | `apis.data.go.kr/1230000/ao/PriceInfoService` |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 |
| **전화번호** | 070-4056-7677 |
| **API 유형** | REST |
| **데이터포맷** | JSON+XML |
| **비용부과유무** | 무료 |
| **심의유형** | 개발단계 : 자동승인 / 운영단계 : 자동승인 |
| **시간범위** | 정보 없음 |
| **공간범위** | 정보 없음 |
| **키워드** | 나라장터,가격,정보,물품분류번호,물품식별번호,시설공통자재가격,시장시공가격 |
| **트래픽 정보** | 개발계정 : 1,000 / 운영계정 : 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **참고문서** | (복구중)\_조달청\_OpenAPI참고자료\_나라장터\_가격정보현황서비스\_1.0.docx |

## 2. API 엔드포인트 목록 (총 11개)

| 엔드포인트명 | 설명 | HTTP 메소드 |
| :--- | :--- | :--- |
| `/getPriceInfoListFcltyCmmnMtrilEngrk` | 시설공통자재(토목) 가격정보 | GET |
| `/getPriceInfoListFcltyCmmnMtrilBildng` | 시설공통자재(건축) 가격정보 | GET |
| `/getPriceInfoListFcltyCmmnMtrilMchnEqp` | 시설공통자재(기계설비) 가격정보 | GET |
| `/getPriceInfoListFcltyCmmnMtrilElctyIrmc` | 시설공통자재(전기, 정보통신) 가격정보 | GET |
| `/getPriceInfoListMrktCnstrctPcEngrk` | 시장시공가격(토목) 가격정보 | GET |
| `/getPriceInfoListMrktCnstrctPcBildng` | 시장시공가격(건축) 가격정보 | GET |
| `/getPriceInfoListMrktCnstrctPcMchnEqp` | 시장시공가격(기계설비) 가격정보 | GET |
| `/getCnsttyClsfcInfoList` | 공종분류및세부공종 | GET |
| `/getStdMarkUprcinfoList` | 표준시장단가및시장시공가격 정보 | GET |
| `/getPriceInfoListFcltyCmmnMtrilTotal` | 시설공통자재(종합) 가격정보 | GET |
| `/getNetRsceinfoList` | 자원분류및순수자원 | GET |

## 3. 공통 요청 파라미터

대부분의 엔드포인트는 아래와 같은 공통 파라미터와 개별 검색조건 파라미터를 사용합니다.

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | 필수 | string | 페이지번호 |
| `numOfRows` | 필수 | string | 한 페이지 결과 수 |
| `prdctClsfcNo` | 선택 | string | 물품분류번호 |
| `prdctClsfcNoNm` | 선택 | string | 품명 |
| `prdctIdntNo` | 선택 | string | 물품식별번호 |
| `krnPrdctNm` | 선택 | string | 규격명(한글품목명) |
| `type` | 선택 | string | 응답 데이터 타입 (JSON/XML) |

## 4. 공통 응답 모델 (`{endpoint}_response`)

응답 모델은 `header`와 `body`로 구성되며, `body`는 다시 `items`, `totalCount`, `numOfRows`, `pageNo` 등으로 구성됩니다.

### 4.1. `header` (공통)

| 항목 | 타입 | 설명 |
| :--- | :--- | :--- |
| `resultMsg` | string | 결과 메시지 |
| `resultCode` | string | 결과 코드 |

### 4.2. `body` (공통)

| 항목 | 타입 | 설명 |
| :--- | :--- | :--- |
| `items` | array | 실제 데이터 항목 리스트 |
| `totalCount` | string | 전체 결과 수 |
| `numOfRows` | string | 한 페이지 결과 수 |
| `pageNo` | string | 페이지 번호 |

### 4.3. `items` 상세 구조 (예시: `getPriceInfoListFcltyCmmnMtrilEngrk_response`의 `item`)

각 API의 `items` 배열 내 객체는 API별로 상이하나, 기본적으로 가격정보와 관련된 항목들을 포함합니다. (예시: `specRootDmLen`, `krnPrdctNm`, `prceNticeNo`, `nticeDt`, `bsnsDivCd`, `bsnsDivNm`, `prdctClsfcNo`, `prdctIdntNo`, `invstDeptNm`, `invstDeptTelNo`, `invstOfclNm`, `prdctClsfcNoNm`, `unit` 등)

## 5. 오류 코드

| Code | Description |
| :--- | :--- |
| 10 | OpenAPI 요청 시 ServiceKey 파라미터가 없음 |
| 11 | 요청하신 OpenAPI의 필수 파라미터가 누락되었습니다. |
| 200 | 성공 |
| 07 | 요청하신 OpenAPI의 파라미터 입력값 범위가 초과되었습니다. |
| 08 | 요청하신 OpenAPI의 필수 파라미터가 누락되었습니다. |
| 02 | 제공기관 서비스 제공 상태가 원활하지 않습니다. |
| 05 | 제공기관 서비스 제공 상태가 원활하지 않습니다. |
| 06 | 날짜 Default, Format Error |
| 03 | 데이터 없음 에러 |

#### 3.3.4 조달청_나라장터 조달요청서비스
# 조달청_나라장터 조달요청서비스 API 명세

## 1. API 기본 정보

| 항목 | 내용 |
| --- | --- |
| **API 서비스명** | 조달청_나라장터 조달요청서비스 |
| **서비스 설명** | 수요기관 또는 지방청으로부터 나라장터를 통하여 받은 조달요청 정보를 제공하는 서비스로 물품, 공사, 용역, 외자 등 업무 구분별로 조달요청번호, 계약체결형태명, 대표납품장소, 발주기관 내역 정보를 제공하는 나라장터 조달요청서비스 |
| **Base URL** | `apis.data.go.kr/1230000/ao/PrcrmntReqInfoService` |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 (070-4056-7677) |
| **API 유형** | REST |
| **데이터포맷** | JSON, XML |
| **트래픽 정보** | 개발계정: 1,000 / 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **비용** | 무료 |
| **심의유형** | 개발단계: 자동승인 / 운영단계: 자동승인 |
| **시간범위** | - |
| **공간범위** | - |
| **키워드** | 나라장터, 조달, 요청, 물품, 공사, 용역, 일반용역, 외자 |
| **참고문서** | (복구중)_조달청_OpenAPI참고자료_나라장터_조달요청서비스_1.0.docx |

## 2. API 엔드포인트 목록 (총 12개)

### 2.1. 조달요청에 대한 물품조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListThng`
* **설명:** 검색조건을 조회구분, 입력일시, 접수번호 입력하여 조달요청번호, 계약체결형태명, 대표납품장소, 발주기관, 조달요청명 등 물품에 대한 조달요청 조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListThng_response`

### 2.2. 나라장터검색조건에 의한 조달요청 외자조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListFrgcptPPSSrch`
* **설명:** 나라장터검색조건에 의한 조달요청 외자조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| engRprsntPrdctNm | N | string | 영문대표품명 |
| dminsttCd | N | string | 수요기관코드 |
| dminsttNm | N | string | 수요기관명 |
| cptalDivCd | N | string | 자본구분코드 |
| ofclDeptDivCd | N | string | 관서구분코드 |
| prcrmntReqNo | N | string | 조달요청번호 |
| type | N | string | 타입 |

#### 응답 모델

* `getPrcrmntReqInfoListFrgcptPPSSrch_response`

### 2.3. 조달요청에 대한 외자세부조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListFrgcptDetail`
* **설명:** 조달요청에 대한 외자세부조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListFrgcptDetail_response`

### 2.4. 조달요청에 대한 외자조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListFrgcpt`
* **설명:** 조달요청에 대한 외자조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListFrgcpt_response`

### 2.5. 나라장터검색조건에 의한 조달요청 기술용역조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListTechServcPPSSrch`
* **설명:** 나라장터검색조건에 의한 조달요청 기술용역조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListTechServcPPSSrch_response`

### 2.6. 조달요청에 대한 기술용역조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListTechServc`
* **설명:** 조달요청에 대한 기술용역조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListTechServc_response`

### 2.7. 나라장터검색조건에 의한 조달요청 일반용역조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListGnrlServcPPSSrch`
* **설명:** 나라장터검색조건에 의한 조달요청 일반용역조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListGnrlServcPPSSrch_response`

### 2.8. 조달요청에 대한 일반용역조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListGnrlServc`
* **설명:** 조달요청에 대한 일반용역조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListGnrlServc_response`

### 2.9. 나라장터검색조건에 의한 조달요청 공사조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListCnstwkPPSSrch`
* **설명:** 나라장터검색조건에 의한 조달요청 공사조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListCnstwkPPSSrch_response`

### 2.10. 조달요청에 대한 공사조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListCnstwk`
* **설명:** 조달요청에 대한 공사조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListCnstwk_response`

### 2.11. 나라장터검색조건에 의한 조달요청 물품조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListThngPPSSrch`
* **설명:** 나라장터검색조건에 의한 조달요청 물품조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| inqryDiv | Y | string | 조회구분 |
| inqryBgnDt | N | string | 조회시작일시 |
| inqryEndDt | N | string | 조회종료일시 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListThngPPSSrch_response`

### 2.12. 조달요청에 대한 물품세부조회

* **엔드포인트:** `GET /getPrcrmntReqInfoListThngDetail`
* **설명:** 조달요청에 대한 물품세부조회
* **HTTP Method:** GET

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| --- | --- | --- | --- |
| serviceKey | Y | string | 공공데이터포털에서 받은 인증키 |
| pageNo | Y | string | 페이지번호 |
| numOfRows | Y | string | 한 페이지 결과 수 |
| type | N | string | 타입 |
| prcrmntReqNo | N | string | 조달요청번호 |

#### 응답 모델

* `getPrcrmntReqInfoListThngDetail_response`

## 3. 응답 모델 목록

* getPrcrmntReqInfoListThng_response
* getPrcrmntReqInfoListThngDetail_response
* getPrcrmntReqInfoListThngPPSSrch_response
* getPrcrmntReqInfoListCnstwk_response
* getPrcrmntReqInfoListCnstwkPPSSrch_response
* getPrcrmntReqInfoListGnrlServc_response
* getPrcrmntReqInfoListGnrlServcPPSSrch_response
* getPrcrmntReqInfoListTechServc_response
* getPrcrmntReqInfoListTechServcPPSSrch_response
* getPrcrmntReqInfoListFrgcpt_response
* getPrcrmntReqInfoListFrgcptDetail_response
* getPrcrmntReqInfoListFrgcptPPSSrch_response

### 3.4 민간/누리장터

#### 3.4.1 조달청_누리장터 민간입찰공고서비스
# 조달청_누리장터 민간입찰공고서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청_누리장터 민간입찰공고서비스 |
| **서비스 설명** | 민간입찰공고정보를 제공하는 서비스로 용역, 물품, 공사, 기타 업무로 구분하여 입찰공고목록, 면허제한정보, 참가가능지역정보를 제공하며 다양한 옵션 조건으로 조회할 수 있는 나라장터 검색조건에 민간입찰목록조회로 구성되어 정보를 제공 |
| **Base URL** | `apis.data.go.kr/1230000/ao/PrvtBidNtceService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON, XML |
| **키워드** | 민간, 입찰, 공고, 민간물품, 민간공사, 민간용역, 민간기타, 면허제한 |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 |
| **전화번호** | 070-4056-7677 |
| **등록일/수정일** | 2024-07-03 / 2025-08-13 |
| **비용/심의유형** | 무료 / 개발단계: 자동승인, 운영단계: 자동승인 |
| **트래픽 정보** | 개발계정: 1,000 / 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **참고문서** | (복구중)\_조달청\_OpenAPI참고자료\_누리장터\_민간입찰공고서비스\_1.0.docx |

## 2. API 엔드포인트 목록

총 **10**개의 엔드포인트가 제공됩니다.

### 2.1. GET /getPrvtBidPblancListInfoServc (민간입찰공고정보에 대한 용역조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoServc_response` | | | 용역 입찰 공고 목록 응답 모델 |

### 2.2. GET /getPrvtBidPblancListInfoThng (민간입찰공고정보에 대한 물품조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoThng_response` | | | 물품 입찰 공고 목록 응답 모델 |

### 2.3. GET /getPrvtBidPblancListInfoCnstwk (민간입찰공고정보에 대한 공사조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoCnstwk_response` | | | 공사 입찰 공고 목록 응답 모델 |

### 2.4. GET /getPrvtBidPblancListInfoEtc (민간입찰공고정보에 대한 기타조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoEtc_response` | | | 기타 입찰 공고 목록 응답 모델 |

### 2.5. GET /getPrvtBidPblancListInfoLicenseLimit (민간입찰공고정보에 대한 면허제한정보조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoLicenseLimit_response` | | | 면허제한 정보 응답 모델 |

### 2.6. GET /getPrvtBidPblancListInfoPrtcptPsblRgn (민간입찰공고정보에 대한 참가가능지역정보조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoPrtcptPsblRgn_response` | | | 참가가능지역 정보 응답 모델 |

### 2.7. GET /getPrvtBidPblancListInfoServcPPSSrch (나라장터 검색조건에 의한 민간입찰공고정보에 대한 용역조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoServcPPSSrch_response` | | | 나라장터 검색조건 용역 입찰 공고 목록 응답 모델 |

### 2.8. GET /getPrvtBidPblancListInfoThngPPSSrch (나라장터 검색조건에 의한 민간입찰공고정보에 대한 물품조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoThngPPSSrch_response` | | | 나라장터 검색조건 물품 입찰 공고 목록 응답 모델 |

### 2.9. GET /getPrvtBidPblancListInfoCnstwkPPSSrch (나라장터 검색조건에 의한 민간입찰공고정보에 대한 공사조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoCnstwkPPSSrch_response` | | | 나라장터 검색조건 공사 입찰 공고 목록 응답 모델 |

### 2.10. GET /getPrvtBidPblancListInfoEtcPPSSrch (나라장터 검색조건에 의한 민간입찰공고정보에 대한 기타조회)

| 구분 | 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **요청** | `serviceKey` | 필수 | String | 인증키 |
| | `pageNo` | 선택 | Integer | 페이지 번호 |
| | `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| | `type` | 선택 | String | 결과 타입 (json/xml) |
| | `inqryDiv` | 선택 | String | 조회 구분 (0:금일, 1:전일, 2:기간) |
| | `inqryBgnDt` | 선택 | String | 조회 시작일 (YYYYMMDD) |
| | `inqryEndDt` | 선택 | String | 조회 종료일 (YYYYMMDD) |
| | `bidNtceNo` | 선택 | String | 입찰공고번호 |
| **응답 모델** | `getPrvtBidPblancListInfoEtcPPSSrch_response` | | | 나라장터 검색조건 기타 입찰 공고 목록 응답 모델 |

## 3. 응답 모델 상세 정보

모든 응답 모델은 기본적으로 `header`와 `body`로 구성되며, `body`는 다시 `totalCount`, `numOfRows`, `pageNo`, `items`로 구성됩니다.

### 3.1. getPrvtBidPblancListInfoServc_response (용역 조회 응답 모델)

응답 body의 `items` 배열 내의 개별 `item` 객체는 다음과 같은 필드를 포함합니다. (다른 응답 모델의 `item` 객체도 유사한 구조를 가집니다.)

| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| `refNo` | String | 참조번호 |
| `ntceNm` | String | 공고명 |
| `rgstDt` | String | 등록일시 |
| `bidNtceNo` | String | 입찰공고번호 |
| `bidNtceOrd` | String | 입찰공고차수 |
| `bidNtceClsfc` | String | 입찰공고분류 |
| `nticeDt` | String | 공고일자 |
| `ntceSpecDocNm8` | String | 공고규격서명8 |
| `ntceSpecDocNm9` | String | 공고규격서명9 |
| `ntceSpecDocNm10` | String | 공고규격서명10 |
| `aptHsmNm` | String | 접수담당자명 |
| `aptGeoAdrs` | String | 접수지번주소 |
| `refAntDscrpt` | String | 참조안내설명 |
| `dtchacOpenDt` | String | 개찰일시 |
| `dtchacBgnPrce` | String | 개찰시작가격 |
| `dtchacRmrk` | String | 개찰비고 |
| `bsAntDtIScrnUrl` | String | 사업안내일자화면URL |
| `dtchacMinRdctnRt` | String | 개찰최소절감율 |
| `dtchacBidproLstNum` | String | 개찰입찰자목록번호 |
| `dtchacAutoEltTm` | String | 개찰자동전자시간 |
| `dtchacBeforeBidDocClseDt` | String | 개찰입찰서류마감일시 |
| `dtchacEtBidDocClseDt` | String | 개찰전자입찰서류마감일시 |
| `servcUtiliLst` | String | 용역활용목록 |
| `ntceSpecDocUrl1` | String | 공고규격서URL1 |
| `ntceSpecDocUrl2` | String | 공고규격서URL2 |
| `ntceSpecDocUrl3` | String | 공고규격서URL3 |
| `ntceSpecDocUrl4` | String | 공고규격서URL4 |
| `ntceSpecDocUrl5` | String | 공고규격서URL5 |
| `ntceSpecDocUrl6` | String | 공고규격서URL6 |
| `ntceSpecDocUrl7` | String | 공고규격서URL7 |
| `aptSubactLrgendCmpnl` | String | 접수업종대분류구성 |
| `ntFclty` | String | 공고시설 |
| `aptTotar` | String | 접수총액 |
| `aptMngcstLevyArea` | String | 접수관리비부과지역 |
| `aptRshldNum` | String | 접수가구수 |
| `aptCmplNum` | String | 접수완료수 |
| `ntceSpecDocNm1` | String | 공고규격서명1 |
| `ntceSpecDocNm2` | String | 공고규격서명2 |
| `aptHeatMethdNm` | String | 접수난방방식명 |
| `aptMngOfficeTelNo` | String | 접수관리사무소전화번호 |
| `aptHmpgUrl` | String | 접수홈페이지URL |
| `ntceSpecDocUrl9` | String | 공고규격서URL9 |
| `rgnLstDivNm` | String | 지역목록구분명 |
| `ntceSpecDocUrl10` | String | 공고규격서URL10 |
| `asignBdgtAnt` | String | 배정예산액 |
| `refAnt` | String | 참조안내 |
| `ntceSpecDocUrl8` | String | 공고규격서URL8 |

## 4. 응답 모델 목록

총 10개의 응답 모델이 있으며, 각 엔드포인트에 대응됩니다.

1. `getPrvtBidPblancListInfoServc_response`
2. `getPrvtBidPblancListInfoThng_response`
3. `getPrvtBidPblancListInfoCnstwk_response`
4. `getPrvtBidPblancListInfoEtc_response`
5. `getPrvtBidPblancListInfoLicenseLimit_response`
6. `getPrvtBidPblancListInfoPrtcptPsblRgn_response`
7. `getPrvtBidPblancListInfoServcPPSSrch_response`
8. `getPrvtBidPblancListInfoThngPPSSrch_response`
9. `getPrvtBidPblancListInfoCnstwkPPSSrch_response`
10. `getPrvtBidPblancListInfoEtcPPSSrch_response`

#### 3.4.2 조달청_누리장터 민간낙찰정보_서비스
# 조달청_누리장터 민간낙찰정보_서비스 상세 정보

본 문서는 공공데이터포털에서 제공하는 **조달청_누리장터 민간낙찰정보_서비스**에 대한 상세 정보를 수집하여 마크다운 형식으로 구조화한 내용입니다.

## 1. API 기본 정보

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청\_누리장터 민간낙찰정보\_서비스 |
| **서비스 설명** | 민간낙찰정보를 제공하는 서비스로 개찰완료목록, 재입찰목록, 유찰목록 또한 최종 낙찰자 목록을 단순검색조건(등록일시,공고게시일시,개찰일시 )데이터를 제공하는 현황조회, 다양한 옵션 조건으로 조회할 수 있는 나라장터 검색조건에 목록조회로 구성되어 정보를 제공합니다. |
| **Base URL** | `apis.data.go.kr/1230000/ao/PrvtScsbidInfoService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON+XML |
| **키워드** | 민간,낙찰,정보,누리장터,아파트,개찰,재입찰,유찰 |
| **제공 기관** | 조달청 |
| **관리 부서** | 조달데이터관리팀 |
| **전화 번호** | 070-4056-7677 |
| **비용 부과 유무** | 무료 |
| **심의 유형** | 개발단계 : 자동승인 / 운영단계 : 자동승인 |
| **신청 가능 트래픽** | 개발계정 : 1,000 / 운영계정 : 활용사례 등록시 신청하면 트래픽 증가 가능 |
| **참고 문서** | (복구중)\_조달청\_OpenAPI참고자료\_누리장터\_민간낙찰정보서비스\_1.0.docx |

## 2. API 엔드포인트 목록 및 상세 정보 (총 7개)

| 엔드포인트 수 | 7개 |
| :--- | :--- |

### 2.1. GET /getPrvtScsbidListSttus

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간 낙찰된 목록 현황 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtScsbidListSttus_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `inqryDiv` | O | string | 조회구분 |
| `type` | X | string | 타입 |
| `inqryBgnDt` | X | string | 조회시작일시 |
| `inqryEndDt` | X | string | 조회종료일시 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bsnsDivCd` | X | string | 업무구분코드 |

### 2.2. GET /getPrvtOpengResultListInfo

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간 개찰결과 목록 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtOpengResultListInfo_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `type` | X | string | 타입 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bidNtceOrd` | X | string | 입찰공고차수 |
| `rbidNo` | X | string | 재입찰번호 |

### 2.3. GET /getPrvtScsbidListSttusPPSSrch

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 나라장터 검색조건에 의한 민간 낙찰된 목록 현황 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtScsbidListSttusPPSSrch_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `inqryDiv` | O | string | 조회구분 |
| `type` | X | string | 타입 |
| `inqryBgnDt` | X | string | 조회시작일시 |
| `inqryEndDt` | X | string | 조회종료일시 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bidNtceNm` | X | string | 입찰공고명 |
| `ntceInsttCd` | X | string | 수요기관코드 |
| `ntceInsttNm` | X | string | 수요기관명 |
| `dminsttCd` | X | string | 실개찰기관코드 |
| `dminsttNm` | X | string | 실개찰기관명 |
| `refNo` | X | string | 참조번호 |
| `prtcptLmtRgnCd` | X | string | 참가제한지역코드 |
| `prtcptLmtRgnNm` | X | string | 참가제한지역명 |
| `indstrytyCd` | X | string | 업종코드 |
| `indstrytyNm` | X | string | 업종명 |
| `presmptPrceBgn` | X | string | 추정가격\_시작 |
| `presmptPrceEnd` | X | string | 추정가격\_종료 |
| `dtilPrdctClsfcNo` | X | string | 세부품명분류번호 |
| `masYn` | X | string | MAS 여부 |
| `prcrmntReqNo` | X | string | 구매요청번호 |
| `intrntnlDivCd` | X | string | 국제구분코드 |

### 2.4. GET /getPrvtOpengResultListInfoPPSSrch

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 나라장터 검색조건에 의한 민간 개찰결과 목록 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtOpengResultListInfoPPSSrch_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `inqryDiv` | O | string | 조회구분 |
| `type` | X | string | 타입 |
| `inqryBgnDt` | X | string | 조회시작일시 |
| `inqryEndDt` | X | string | 조회종료일시 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bidNtceNm` | X | string | 입찰공고명 |
| `ntceInsttCd` | X | string | 수요기관코드 |
| `ntceInsttNm` | X | string | 수요기관명 |
| `dminsttCd` | X | string | 실개찰기관코드 |
| `dminsttNm` | X | string | 실개찰기관명 |
| `refNo` | X | string | 참조번호 |
| `prtcptLmtRgnCd` | X | string | 참가제한지역코드 |
| `prtcptLmtRgnNm` | X | string | 참가제한지역명 |
| `indstrytyCd` | X | string | 업종코드 |
| `indstrytyNm` | X | string | 업종명 |
| `presmptPrceBgn` | X | string | 추정가격\_시작 |
| `presmptPrceEnd` | X | string | 추정가격\_종료 |
| `dtilPrdctClsfcNo` | X | string | 세부품명분류번호 |
| `masYn` | X | string | MAS 여부 |
| `prcrmntReqNo` | X | string | 구매요청번호 |
| `intrntnlDivCd` | X | string | 국제구분코드 |

### 2.5. GET /getPrvtOpengResultListInfoOpengCompt

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간 개찰결과 개찰완료 목록 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtOpengResultListInfoOpengCompt_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `type` | X | string | 타입 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bidNtceOrd` | X | string | 입찰공고차수 |
| `rbidNo` | X | string | 재입찰번호 |

### 2.6. GET /getPrvtOpengResultListInfoFailing

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간 개찰결과 유찰 목록 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtOpengResultListInfoFailing_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `type` | X | string | 타입 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bidNtceOrd` | X | string | 입찰공고차수 |
| `rbidNo` | X | string | 재입찰번호 |

### 2.7. GET /getPrvtOpengResultListInfoRebid

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간 개찰결과 재입찰 목록 조회 |
| **HTTP 메소드** | GET |
| **응답 모델** | `getPrvtOpengResultListInfoRebid_response` |

#### 요청 파라미터

| 파라미터명 | 필수 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | O | string | 공공데이터포털에서 받은 인증키 |
| `pageNo` | O | string | 페이지번호 |
| `numOfRows` | O | string | 한 페이지 결과 수 |
| `type` | X | string | 타입 |
| `bidNtceNo` | X | string | 입찰공고번호 |
| `bidNtceOrd` | X | string | 입찰공고차수 |
| `rbidNo` | X | string | 재입찰번호 |

## 3. 응답 모델 목록

| 응답 모델명 | 설명 |
| :--- | :--- |
| `getPrvtScsbidListSttus_response` | 민간 낙찰된 목록 현황 조회 응답 모델 |
| `getPrvtOpengResultListInfo_response` | 민간 개찰결과 목록 조회 응답 모델 |
| `getPrvtScsbidListSttusPPSSrch_response` | 나라장터 검색조건에 의한 민간 낙찰된 목록 현황 조회 응답 모델 |
| `getPrvtOpengResultListInfoPPSSrch_response` | 나라장터 검색조건에 의한 민간 개찰결과 목록 조회 응답 모델 |
| `getPrvtOpengResultListInfoOpengCompt_response` | 민간 개찰결과 개찰완료 목록 조회 응답 모델 |
| `getPrvtOpengResultListInfoFailing_response` | 민간 개찰결과 유찰 목록 조회 응답 모델 |
| `getPrvtOpengResultListInfoRebid_response` | 민간 개찰결과 재입찰 목록 조회 응답 모델 |

#### 3.4.3 조달청_누리장터 민간계약정보 서비스
# 조달청_누리장터 민간계약정보 서비스 상세 정보

## 1. 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청\_누리장터 민간계약정보 서비스 |
| **서비스 설명** | 민간계약정보를 제공하는 서비스로 계약현황조회, 변경이력조회, 삭제이력조회 등 민간계약의 현황정보를 제공. 또한, 나라장터 검색조건인 계약체결일자, 확정계약번호, 요청번호, 공고번호, 기관명(계약기관, 수요기관), 품명, 계약방법, 계약참조번호에 따른 계약현황정보를 제공. |
| **Base URL** | `apis.data.go.kr/1230000/ao/PrvtCntrctInfoService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON+XML |
| **키워드** | 민간,계약,정보,아파트,누리장터,품명,서비스 |

## 2. 제공 및 관리 정보

| 항목 | 내용 |
| :--- | :--- |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 |
| **관리부서 전화번호** | 070-4056-7677 |
| **비용 부과 유무** | 무료 |
| **심의 유형** | 개발단계: 자동승인 / 운영단계: 자동승인 |
| **신청 가능 트래픽** | 개발계정: 1,000 / 운영계정: 활용사례 등록 시 신청하면 트래픽 증가 가능 |
| **시간 범위** | 정보 없음 |
| **공간 범위** | 정보 없음 |
| **참고 문서** | (복구중)\_조달청\_OpenAPI참고자료\_누리장터\_민간계약정보서비스\_1.0.docx |

## 3. API 엔드포인트 목록 (총 4개)

### 3.1. GET /getPrvtCntrctInfoList (계약현황 민간조회)

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간계약정보의 계약현황을 조회합니다. |
| **HTTP 메소드** | GET |

#### 요청 파라미터

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | String | 공공데이터포털에서 발급받은 서비스 키 |
| `pageNo` | 선택 | Integer | 페이지 번호 |
| `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| `type` | 선택 | String | 응답 데이터 타입 (XML/JSON) |
| `inqryDiv` | 선택 | String | 조회구분 (1:전체, 2:계약체결일자, 3:확정계약번호) |
| `inqryBgnDt` | 선택 | String | 조회 시작일자 (YYYYMMDD) |
| `inqryEndDt` | 선택 | String | 조회 종료일자 (YYYYMMDD) |
| `untyCntrctNo` | 선택 | String | 확정계약번호 |

#### 응답 모델

| 모델명 | 설명 |
| :--- | :--- |
| `getPrvtCntrctInfoList_response` | 계약현황 민간조회 응답 모델 |

### 3.2. GET /getPrvtCntrctInfoListPPSSrch (나라장터 검색조건에 의한 계약현황 민간조회)

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 나라장터 검색조건(계약체결일자, 확정계약번호, 요청번호, 공고번호, 기관명(계약기관, 수요기관), 품명, 계약방법, 계약참조번호)에 의한 계약현황 정보를 제공합니다. |
| **HTTP 메소드** | GET |

#### 요청 파라미터

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | String | 공공데이터포털에서 발급받은 서비스 키 |
| `pageNo` | 선택 | Integer | 페이지 번호 |
| `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| `type` | 선택 | String | 응답 데이터 타입 (XML/JSON) |
| `inqryDiv` | 선택 | String | 조회구분 (1:전체, 2:계약체결일자, 3:확정계약번호) |
| `inqryBgnDt` | 선택 | String | 조회 시작일자 (YYYYMMDD) |
| `inqryEndDt` | 선택 | String | 조회 종료일자 (YYYYMMDD) |
| `untyCntrctNo` | 선택 | String | 확정계약번호 |
| `rqstNo` | 선택 | String | 요청번호 |
| `pblancNo` | 선택 | String | 공고번호 |
| `cntrctInsttNm` | 선택 | String | 계약기관명 |
| `dmndInsttNm` | 선택 | String | 수요기관명 |
| `prdctNm` | 선택 | String | 품명 |
| `cntrctMthdNm` | 선택 | String | 계약방법명 |
| `cntrctRefNo` | 선택 | String | 계약참조번호 |

#### 응답 모델

| 모델명 | 설명 |
| :--- | :--- |
| `getPrvtCntrctInfoListPPSSrch_response` | 나라장터 검색조건에 의한 계약현황 민간조회 응답 모델 |

### 3.3. GET /getPrvtCntrctInfoListChgHstry (계약현황에 대한 민간변경이력조회)

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간계약정보의 계약현황에 대한 변경이력 정보를 조회합니다. |
| **HTTP 메소드** | GET |

#### 요청 파라미터

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | String | 공공데이터포털에서 발급받은 서비스 키 |
| `pageNo` | 선택 | Integer | 페이지 번호 |
| `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| `type` | 선택 | String | 응답 데이터 타입 (XML/JSON) |
| `inqryDiv` | 선택 | String | 조회구분 (1:전체, 2:계약체결일자, 3:확정계약번호) |
| `inqryBgnDt` | 선택 | String | 조회 시작일자 (YYYYMMDD) |
| `inqryEndDt` | 선택 | String | 조회 종료일자 (YYYYMMDD) |
| `untyCntrctNo` | 선택 | String | 확정계약번호 |

#### 응답 모델

| 모델명 | 설명 |
| :--- | :--- |
| `getPrvtCntrctInfoListChgHstry_response` | 계약현황에 대한 민간변경이력조회 응답 모델 |

### 3.4. GET /getPrvtCntrctInfoListDltHstry (계약현황에 대한 민간삭제이력조회)

| 항목 | 내용 |
| :--- | :--- |
| **설명** | 민간계약정보의 계약현황에 대한 삭제이력 정보를 조회합니다. |
| **HTTP 메소드** | GET |

#### 요청 파라미터

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | String | 공공데이터포털에서 발급받은 서비스 키 |
| `pageNo` | 선택 | Integer | 페이지 번호 |
| `numOfRows` | 선택 | Integer | 한 페이지 결과 수 |
| `type` | 선택 | String | 응답 데이터 타입 (XML/JSON) |
| `inqryDiv` | 선택 | String | 조회구분 (1:전체, 2:계약체결일자, 3:확정계약번호) |
| `inqryBgnDt` | 선택 | String | 조회 시작일자 (YYYYMMDD) |
| `inqryEndDt` | 선택 | String | 조회 종료일자 (YYYYMMDD) |
| `untyCntrctNo` | 선택 | String | 확정계약번호 |

#### 응답 모델

| 모델명 | 설명 |
| :--- | :--- |
| `getPrvtCntrctInfoListDltHstry_response` | 계약현황에 대한 민간삭제이력조회 응답 모델 |

### 3.5 통계/표준

#### 3.5.1 조달청_나라장터 공공데이터개방표준서비스
# API 02: 조달청_나라장터 공공데이터개방표준서비스

## 기본 정보
- **URL**: https://www.data.go.kr/data/15058815/openapi.do
- **Base URL**: apis.data.go.kr/1230000/ao/PubDataOpnStdService
- **버전**: 1.0.0
- **제공기관**: 조달청
- **관리부서**: 조달데이터관리팀
- **관리부서 전화번호**: 070-4056-7677
- **API 유형**: REST
- **데이터포맷**: JSON+XML
- **비용부과유무**: 무료
- **신청가능 트래픽**: 
  - 개발계정: 10,000
  - 운영계정: 활용사례 등록시 신청하면 트래픽 증가 가능
- **심의유형**: 
  - 개발단계: 자동승인
  - 운영단계: 자동승인
- **이용허락범위**: 제한 없음
- **등록일**: 2018-05-09
- **수정일**: 2025-08-13
- **키워드**: 조달통계, 종합분석, DW, 물품, 공사, 용역, 외자, 공공데이터표준

## 서비스 설명
나라장터 입찰, 낙찰, 계약정보 데이터를 입찰공고일시, 개찰일시, 계약체결일자로 [행안부 고시 공공데이터 개방표준]에 따라 제공하는 공공데이터개방표준서비스

행안부 고시 공공데이터 개방표준이란? 공공데이터 제공 및 이용을 활성화하기 위해 공공데이터 개방시 적용하기 위한 공통 개방 기준을 데이터셋 분야별 개방기준(제공항목, 속성정보, 제공형식 등) 및 기타 데이터 개방표준을 정의

## API 목록

### 1. GET /getDataSetOpnStdBidPblancInfo
- **설명**: 데이터셋 개방표준에 따른 입찰공고정보
- **상세**: 검색조건을 입찰공고일시로 하여 입찰공고번호, 입찰공고차수, 나라장터공고번호, 입찰공고명, 입찰공고상세명, 입찰공고일자, 입무구분명, 국제입찰여부 등 조회

### 2. GET /getDataSetOpnStdScsbidInfo
- **설명**: 데이터셋 개방표준에 따른 낙찰정보

### 3. GET /getDataSetOpnStdCntrctInfo
- **설명**: 데이터셋 개방표준에 따른 계약정보

## 응답 모델
- getDataSetOpnStdBidPblancInfo_response
- getDataSetOpnStdScsbidInfo_response
- getDataSetOpnStdCntrctInfo_response

## 참고문서
- (복구중)_조달청_OpenAPI참고자료_나라장터_공공데이터개방표준서비스_1.1.docx


#### 3.5.2 조달청_공공조달통계정보서비스
# 조달청 공공조달통계정보서비스 상세 정보

본 문서는 공공데이터포털에 등록된 **조달청\_공공조달통계정보서비스** 오픈API에 대한 상세 정보를 수집하여 구조화한 내용입니다.

## 1. API 서비스 개요

| 항목 | 내용 |
| :--- | :--- |
| **API 서비스명** | 조달청\_공공조달통계정보서비스 |
| **서비스 설명** | 나라장터를 포함 24개 전자조달시스템에서 체결한 전자계약정보와 비전자계약정보를 수집하여 전체 공공조달 규모를 파악할 수 있도록 공공조달통계 정보를 제공하는 서비스로 검색조건을 기준년도, 기준년월 범위로 전체 조달실적, 계약방법별 현황, 지역제한 현황, 기관구분별 조달현황, 기업구분별 조달현황, 계약방법별 조달현황, 수요기관별 기업구분별 실적, 수요기관별 업무대상별 실적, 수요기관별 시스템유형별 실적, 조달기업별 계약방법별 실적, 조달기업별 업무대상별 실적, 품목 및 서비스별 실적을 각 유형별로 조회할 수 있음 |
| **Base URL** | `apis.data.go.kr/1230000/at/PubPrcrmntStatInfoService` |
| **API 유형** | REST |
| **데이터 포맷** | JSON+XML |
| **키워드** | 공공조달, 통계, 정보, 기관, 기업, 계약, 전자조달, 품목 |

## 2. 제공 및 운영 정보

| 항목 | 내용 |
| :--- | :--- |
| **제공기관** | 조달청 |
| **관리부서** | 조달데이터관리팀 |
| **전화번호** | 070-4056-7677 |
| **트래픽 정보** | 개발계정: 1,000 / 운영계정: 활용사례 등록 시 트래픽 증가 가능 |
| **비용** | 무료 |
| **심의유형** | 개발단계: 자동승인 / 운영단계: 자동승인 |
| **시간범위** | 정보 없음 |
| **공간범위** | 정보 없음 |
| **참고문서** | (복구중)\_조달청\_OpenAPI참고자료\_공공조달통계정보서비스\_1.0.docx |

## 3. API 엔드포인트 목록 (총 12개)

모든 엔드포인트는 **GET** 메소드를 사용하며, 요청 파라미터는 `serviceKey`, `pageNo`, `numOfRows`, `srchBssYear`, `type`으로 동일하게 구성됩니다.

| 엔드포인트 | 설명 | HTTP 메소드 |
| :--- | :--- | :--- |
| `/getTotlPubPrcrmntSttus` | 전체 공공조달 현황 | GET |
| `/getPrdctIdntNoServcAccotArslt` | 품목 및 서비스별 실적 | GET |
| `/getPrcrmntEntrprsAccotBsnsObjAccotArslt` | 조달기업별 업무대상별 실적 | GET |
| `/getPrcrmntEntrprsAccotCntrctMthdAccotArslt` | 조달기업별 계약방법별 실적 | GET |
| `/getDminsttAccotSystmTyAccotArslt` | 수요기관별 시스템유형별 실적 | GET |
| `/getDminsttAccotBsnsObjAccotArslt` | 수요기관별 업무대상별 실적 | GET |
| `/getDminsttAccotCntrctMthdAccotArslt` | 수요기관별 계약방법별 실적 | GET |
| `/getDminsttAccotEntrprsDivAccotArslt` | 수요기관별 기업구분별 실적 | GET |
| `/getPrcrmntObjectBsnsObjAccotSttus` | 조달목적물(업무대상)별 현황 | GET |
| `/getRgnDutyCmmnCntrctSttus` | 지역의무공동계약 현황 | GET |
| `/getRgnLmtSttus` | 지역제한 현황 | GET |
| `/getCntrctMthdAccotSttus` | 계약방법별 현황 | GET |
| `/getEntrprsDivAccotPrcrmntSttus` | 기업구분별 조달 현황 | GET |
| `/getInsttDivAccotPrcrmntSttus` | 기관구분별 조달 현황 | GET |

## 4. 공통 요청 파라미터 상세

API 문서 페이지의 Swagger UI 섹션을 분석한 결과, 모든 엔드포인트는 다음과 같은 공통 파라미터를 사용합니다.

| 파라미터명 | 필수/선택 | 타입 | 설명 |
| :--- | :--- | :--- | :--- |
| `serviceKey` | 필수 | string | 공공데이터포털에서 발급받은 인증키 |
| `pageNo` | 선택 | integer | 페이지 번호 |
| `numOfRows` | 선택 | integer | 한 페이지 결과 수 |
| `srchBssYear` | 선택 | string | 검색 기준 연도 (예: 2024) |
| `type` | 선택 | string | 응답 데이터 형식 (JSON 또는 XML) |

## 5. 응답 모델 목록

API 응답 모델은 각 엔드포인트별로 정의되어 있으며, 엔드포인트 이름에 `_response`가 붙는 형태입니다. 상세 구조는 Swagger UI를 통해 확인 가능하나, 현재 페이지에서 상세 필드 정보는 제공되지 않아 목록만 추출합니다.

| 응답 모델명 | 관련 엔드포인트 |
| :--- | :--- |
| `getTotlPubPrcrmntSttus_response` | `/getTotlPubPrcrmntSttus` |
| `getInsttDivAccotPrcrmntSttus_response` | `/getInsttDivAccotPrcrmntSttus` |
| `getEntrprsDivAccotPrcrmntSttus_response` | `/getEntrprsDivAccotPrcrmntSttus` |
| `getCntrctMthdAccotSttus_response` | `/getCntrctMthdAccotSttus` |
| `getRgnLmtSttus_response` | `/getRgnLmtSttus` |
| `getRgnDutyCmmnCntrctSttus_response` | `/getRgnDutyCmmnCntrctSttus` |
| `getPrcrmntObjectBsnsObjAccotSttus_response` | `/getPrcrmntObjectBsnsObjAccotSttus` |
| `getDminsttAccotEntrprsDivAccotArslt_response` | `/getDminsttAccotEntrprsDivAccotArslt` |
| `getDminsttAccotCntrctMthdAccotArslt_response` | `/getDminsttAccotCntrctMthdAccotArslt` |
| `getDminsttAccotBsnsObjAccotArslt_response` | `/getDminsttAccotBsnsObjAccotArslt` |
| `getDminsttAccotSystmTyAccotArslt_response` | `/getDminsttAccotSystmTyAccotArslt` |
| `getPrcrmntEntrprsAccotCntrctMthdAccotArslt_response` | `/getPrcrmntEntrprsAccotCntrctMthdAccotArslt` |
| `getPrcrmntEntrprsAccotBsnsObjAccotArslt_response` | `/getPrcrmntEntrprsAccotBsnsObjAccotArslt` |
| `getPrdctIdntNoServcAccotArslt_response` | `/getPrdctIdntNoServcAccotArslt` |

## 4. 오류 코드 및 처리 방법

공공데이터포털의 API는 공통된 오류 코드를 사용합니다. 주요 오류 코드는 다음과 같습니다.

| 오류 코드 | 메시지 | 원인 및 해결 방안 |
|---|---|---|
| `00` | NORMAL_CODE | 정상 처리되었습니다. |
| `01` | APPLICATION_ERROR | 어플리케이션 에러가 발생했습니다. (개발자 문의) |
| `02` | DB_ERROR | 데이터베이스 에러가 발생했습니다. (개발자 문의) |
| `04` | HTTP_ERROR | HTTP 에러가 발생했습니다. (URL 및 네트워크 확인) |
| `05` | SERVICETIMEOUT_ERROR | 서비스 연결에 실패했습니다. (잠시 후 재시도) |
| `10` | INVALID_REQUEST_PARAMETER_ERROR | 요청 파라미터가 잘못되었습니다. (필수 파라미터 및 데이터 타입 확인) |
| `11` | NO_MANDATORY_REQUEST_PARAMETERS_ERROR | 필수 요청 파라미터가 누락되었습니다. (필수 파라미터 확인) |
| `20` | SERVICE_ACCESS_DENIED_ERROR | 서비스 접근이 거부되었습니다. (활용 신청 상태 확인) |
| `22` | LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR | 서비스 요청 제한 횟수를 초과했습니다. (트래픽 확인) |
| `30` | SERVICE_KEY_IS_NOT_REGISTERED_ERROR | 등록되지 않은 서비스 키입니다. (서비스 키 확인) |
| `31` | DEADLINE_HAS_EXPIRED_ERROR | 활용 기간이 만료되었습니다. (활용 기간 확인) |
| `32` | UNREGISTERED_IP_ERROR | 등록되지 않은 IP입니다. (IP 확인) |
| `99` | UNKNOWN_ERROR | 기타 에러가 발생했습니다. (개발자 문의) |

## 5. 개발 체크리스트

- [ ] 공공데이터포털 회원가입 및 로그인
- [ ] 원하는 API 활용신청 및 서비스 키 발급 확인
- [ ] API별 트래픽 제한 확인 및 운영 계정 전환 계획
- [ ] 요청 URL 및 Base URL 확인
- [ ] 필수 요청 파라미터 (`serviceKey` 등) 누락 여부 확인
- [ ] 요청 파라미터의 데이터 타입 및 형식 준수 (날짜 형식: YYYYMMDD 등)
- [ ] `serviceKey`는 반드시 URL 인코딩하여 사용
- [ ] 응답 데이터 형식(JSON/XML)에 맞는 파싱 로직 구현
- [ ] 오류 코드에 따른 예외 처리 로직 구현
- [ ] API 응답 데이터 구조 확인 및 필요한 데이터 추출 로직 구현

