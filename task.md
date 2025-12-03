# 작업 목록 (Task List)

## 1. 문제 분석 (Problem Analysis)
- [x] `debug_moleg.py` 실행하여 사이트 접근 가능 여부 확인
- [x] `moleg_crawler.py` 로직 검토 및 문제점 파악
- [x] 실제 웹사이트 구조 변경 여부 확인 (필요시 브라우저 도구 사용)
- [x] 대시보드 정렬 로직 수정 (`LawsTable.tsx`)
- [x] 수정된 크롤러 테스트 및 데이터 추출 확인
- [x] `moleg_data.csv` 업데이트 확인
- [x] **데이터 동기화 문제 분석**: 구글 시트에는 데이터가 있으나 대시보드 미반영
    - [x] API 캐싱 설정 (`revalidate`) 확인 (300초 -> 0초로 변경 예정)
    - [x] `수집일시` 필드 매핑 및 데이터 유효성 확인
- [x] **정렬 기준 변경 (기간 종료일)**
    - [x] `기간` 필드 데이터 포맷 분석 (`YYYY.MM.DD ~ YYYY.MM.DD`)
    - [x] 종료일 추출 및 정렬 로직 구현
- [x] **GitHub Actions 점검**
    - [x] 워크플로우 파일 확인 (`.github/workflows/*.yml`)
    - [x] `moleg_crawler.py` 실행 단계 포함 여부 확인 (포함됨)
- [x] **홈 대시보드 반영**
    - [x] `dashboard/app/page.tsx` (또는 관련 컴포넌트) 분석 (정적 페이지임 확인)
    - [x] 법령예고 데이터 연동 및 정렬 로직 적용 (실제 데이터 연동 완료)
- [x] **정렬 로직 오류 수정**
    - [x] 날짜 포맷(`YYYY. M. D.`)의 문자열 비교 문제 확인 (Zero-padding 미적용)
    - [x] 날짜 파싱 및 정규화 로직 구현

## 2. 수정 및 검증 (Fix & Verify)
- [x] `LawsTable.tsx` 수정: 날짜 파싱 및 Zero-padding 적용
- [ ] 변경 사항 커밋 및 푸시

## 3. 마무리 (Finalization)
- [ ] 사용자에게 수정 내용 설명
