# 해양수산부 통합 공지사항 크롤러 작업 히스토리

## 프로젝트 개요

- **프로젝트명**: 해양수산부 통합 공지사항 크롤러
- **기술 스택**:
  - 백엔드: Python 3.8+, BeautifulSoup4, Selenium
  - 프론트엔드: Next.js 16, React 19, TypeScript, Tailwind CSS 3
  - 데이터: Google Sheets API
  - 배포: Vercel (프론트), GitHub Actions (크롤러)
- **데이터 소스**: 해양수산부 본부 + 산하기관 16개
- **배포 URL**: Vercel 배포

---

## Phase별 작업 내용

### Phase 1: 프로젝트 초기 설정 및 크롤러 개발
**일시**: 2025-11-18 (초기)

**작업 내용**:
1. Python 기반 웹 크롤러 개발
2. 해양수산부 본부 및 16개 산하기관 크롤링 구현
3. Google Sheets API 통합
4. GitHub Actions 자동화 설정 (하루 4회 실행)

**주요 파일**:
- `marine_ministry_crawler_final.py`: 메인 크롤러
- `upload_to_gsheet.py`: Google Sheets 업로드 스크립트
- `.github/workflows/`: GitHub Actions 워크플로우

---

### Phase 2: Next.js 대시보드 추가
**일시**: 2025-11-18

**작업 내용**:
1. Next.js 16 + React 19 + TypeScript 프로젝트 초기화
2. Google Sheets API 연동
3. 대시보드 페이지 구현 (데이터 테이블, 필터링)
4. Tailwind CSS 디자인 시스템 적용

**커밋**:
- `ab004ac`: feat: Next.js 대시보드 추가
- `a2944c0`: feat: 대시보드 API 통합 완료

**기술적 결정**:
- Next.js 16의 App Router 사용
- Turbopack 빌드 도구 채택
- 서버 컴포넌트 + 클라이언트 컴포넌트 하이브리드 아키텍처

---

### Phase 3: Vercel 배포 설정
**일시**: 2025-11-18

**작업 내용**:
1. Vercel 배포 설정 파일 작성
2. 환경 변수 설정 (Google Sheets API 키)
3. 서브폴더 배포 설정 (dashboard/)
4. TypeScript 컴파일 에러 수정
5. 배포 문서화

**커밋**:
- `f39d990`: chore: Vercel 배포 설정 파일 추가
- `b4f4abc`: fix: Vercel 배포 설정 추가 (dashboard 서브폴더)
- `d3455f1`: fix: TypeScript 컴파일 에러 및 파일 인코딩 수정
- `be16538`: docs: Vercel 배포 작업 완료 최종 요약 보고서

**문제 및 해결**:
- 문제: 서브폴더 배포 설정 미흡
- 해결: `vercel.json`에 `buildCommand` 및 `outputDirectory` 명시

---

### Phase 4: UI/UX 개선 및 기능 추가
**일시**: 2025-11-19

**작업 내용**:
1. 페이지네이션 구현 (페이지 크기 증가)
2. 최근 업데이트 시간 표시
3. 필터 프리셋 추가 (날짜, 게시판)
4. Favicon 404 에러 해결
5. API 응답 캐싱 (ISR 5분)
6. 크롤링 기관 및 게시판 Links 섹션 추가

**커밋**:
- `9dd24e5`: feat: 대시보드 개선 - 최종 크롤링 시간 표시 및 페이지 크기 증가
- `55d9f47`: feat: 페이지네이션 및 UI/UX 개선
- `5072df0`: feat: 필터에 날짜 및 게시판 프리셋 추가
- `523bf21`: fix: favicon 404 에러 해결
- `8ff9a38`: feat: API 응답 캐싱 추가 (ISR 5분)
- `b90dfb6`: feat: 크롤링 기관 및 게시판 Links 섹션 추가

**성능 개선**:
- ISR(Incremental Static Regeneration) 적용으로 응답 속도 향상
- 페이지네이션으로 초기 렌더링 성능 개선

---

### Phase 5: Google Sheets 업로드 문제 해결
**일시**: 2025-11-19

**작업 내용**:
1. GitHub Actions 환경에서 Google Sheets 업로드 실패 문제 해결
2. CSV 파일명 하드코딩 문제 수정
3. 시트 이름 수정 및 gitignore 수정

**커밋**:
- `d0b82d1`: fix: GitHub Actions 환경에서 Google Sheets 업로드 실패 문제 해결
- `4bbad40`: fix: CSV 파일명 하드코딩 문제 해결
- `4e28c60`: fix: Google Sheets 시트 이름 수정 및 lib 폴더 gitignore 수정

**문제 및 해결**:
- 문제: GitHub Actions에서 Google API 인증 실패
- 해결: 환경 변수 설정 및 권한 확인 스크립트 추가

---

### Phase 6: 대시보드 레이아웃 개선 - 사용자 친화적 UI
**일시**: 2025-11-19

**작업 내용**:
1. 반응형 디자인 개선
2. 접근성 향상 (Semantic HTML, ARIA 속성)
3. 성능 최적화 (useMemo, useCallback)

**커밋**:
- `5902871`: feat: 대시보드 레이아웃 개선 - 사용자 친화적 UI

**접근성 개선**:
- `<section>`, `<main>`, `<aside>` 시맨틱 태그 사용
- `aria-label`, `role` 속성 추가
- 키보드 네비게이션 지원

---

### Phase 7: 2-Column 레이아웃 및 필터 칩 UI 구현
**일시**: 2025-11-19

**작업 내용**:
1. 2-Column 그리드 레이아웃 구현 (메인 75% + 사이드바 25%)
2. 필터 칩 UI 추가 (활성 필터 표시 및 제거)
3. FilterBar 무한 루프 문제 해결

**커밋**:
- `c200208`: feat: 2-Column 레이아웃 및 필터 칩 UI 구현
- `81943ee`: fix: FilterBar 무한 루프 문제 해결

**기술적 세부사항**:
- CSS Grid로 반응형 레이아웃 구현
- `lg:col-span-3`, `lg:col-span-1` Tailwind 유틸리티 사용
- `useCallback`으로 무한 루프 방지

---

### Phase 8: Tailwind CSS v4 호환성 문제 해결 ⚠️ 중요
**일시**: 2025-11-19 ~ 2025-11-20

**문제 발견**:
- 2-Column 레이아웃과 필터 칩 UI가 브라우저에 표시되지 않음
- 캐시 삭제, 시크릿 모드, 서버 재시작 모두 실패

**근본 원인 분석**:
- Tailwind CSS v4.1.17이 v3 스타일 설정 파일(`tailwind.config.ts`)을 읽지 못함
- v4는 CSS-first 설정 또는 `@config` 디렉티브 필요
- 결과: `lg:col-span-3`, `lg:grid-cols-4` 등 반응형 CSS가 생성되지 않음

**해결 프로세스**:
1. **병렬 조사** (3개 에이전트):
   - Explore 에이전트: Git diff, CSS 파일 분석
   - error-detective: 빌드 로그, 브라우저 에러 분석
   - frontend-developer: Tailwind 설정 파일 검증 → **근본 원인 발견**

2. **통합 분석**:
   - general-purpose 에이전트: 해결 방안 제안 (다운그레이드)
   - plan-reviewer 에이전트: 계획 검토 및 승인

3. **실행**:
   - Tailwind CSS v4.1.17 → v3.4.18 다운그레이드
   - PostCSS 설정 파일 2개 모두 v3 호환 플러그인으로 수정
   - 빌드 캐시 초기화 (`.next` 폴더 삭제)

4. **검증**:
   - code-tester-debugger: 500 에러 발견 → PostCSS 중복 설정 문제 해결
   - 최종 검증: CSS 정상 생성, 브라우저 표시 확인

**커밋**:
- `b38ac96`: backup: Tailwind v4 상태 백업 (다운그레이드 직전)
- `fbd33d9`: feat: Tailwind CSS v4 → v3.4.18 다운그레이드
- `29e771d`: fix: postcss.config.js를 Tailwind v3 호환 설정으로 수정

**배운 점**:
- Tailwind v4는 완전히 다른 설정 시스템 사용
- 메이저 버전 업그레이드 시 마이그레이션 가이드 필수 확인
- CSS 생성 여부를 컴파일된 파일에서 직접 확인하는 것이 중요

---

### Phase 9: 프로젝트 정리
**일시**: 2025-11-20

**작업 내용**:
1. 불필요한 테스트 파일 삭제
2. 폴더 정리
3. HISTORY.md 문서 작성

**커밋**:
- `2e7e0fa`: chore: 불필요한 테스트 파일 삭제

---

---

### Phase 10: 대시보드 필터 옵션 개선
**일시**: 2025-11-25

**작업 내용**:
1. 게시판 빠른 선택 필터에서 중복된 '인사발령' 옵션 제거
2. '인사' 옵션만 유지하여 UI 간소화

**수정 파일**:
- `dashboard/components/FilterBar.tsx`

---

---

### Phase 11: 모바일 뷰 최적화
**일시**: 2025-11-25

**작업 내용**:
1. 모바일 환경에서 날짜 표시 형식 변경 (연도와 월/일 분리)
2. 테이블 패딩 및 컬럼 너비 조정으로 가독성 개선
3. 모바일에서 '열기' 텍스트를 아이콘으로 대체하여 공간 절약

**수정 파일**:
- `dashboard/components/DataTable.tsx`

---

---

### Phase 12: 푸터 연락처 정보 수정
**일시**: 2025-11-26

**작업 내용**:
1. 푸터의 Contact 정보를 'Ministry of Oceans and Fisheries'에서 'jaejunya@naver.com'으로 변경

**수정 파일**:
- `dashboard/components/Footer.tsx`

---

---

### Phase 13: UI 텍스트 및 브랜딩 업데이트
**일시**: 2025-11-26

**작업 내용**:
1. 헤더: '해양수산부' → '경영지원', '크롤링 대시보드' → 'v1.0'으로 변경
2. 푸터: 서비스 설명 문구 수정
3. CrawlingLinks: 섹션 제목을 '모니터링 중인 게시판'으로 변경

**수정 파일**:
- `dashboard/components/Header.tsx`
- `dashboard/components/Footer.tsx`
- `dashboard/components/CrawlingLinks.tsx`

---

---

### Phase 14: 게시글 제목 링크 기능 추가
**일시**: 2025-11-26

**작업 내용**:
1. 데이터 테이블의 제목 텍스트를 클릭 가능하도록 변경
2. 제목 클릭 시 새 탭에서 해당 링크가 열리도록 구현
3. 마우스 호버 시 밑줄 및 색상 변경 효과 추가

**수정 파일**:
- `dashboard/components/DataTable.tsx`

---

---

### Phase 15: 울산항만공사 링크 오류 수정
**일시**: 2025-11-26

**작업 내용**:
1. 울산항만공사 게시글 링크가 자바스크립트 함수(`yhLib.inline.post`)로 되어 있어 크롤링 시 올바른 URL을 가져오지 못하는 문제 해결
2. `data-req-get-p-idx` 속성에서 게시글 ID를 추출하여 직접 `view.do` URL을 생성하도록 로직 수정

**수정 파일**:
- `marine_ministry_crawler_final.py`

---

---

### Phase 16: 데이터 테이블 링크 컬럼 제거
**일시**: 2025-11-26

**작업 내용**:
1. 제목 클릭 시 링크 이동 기능이 추가됨에 따라 중복되는 '링크' 컬럼 제거
2. 확보된 공간을 다른 컬럼(게시판, 제목, 작성일)에 배분하여 모바일 가독성 개선

**수정 파일**:
- `dashboard/components/DataTable.tsx`

---

## 현재 상태

### ✅ 완료된 기능

**크롤러**:
- ✅ 16개 기관 공지사항 크롤링
- ✅ Google Sheets 자동 업로드
- ✅ GitHub Actions 자동화 (하루 4회)

**대시보드**:
- ✅ Google Sheets 데이터 표시
- ✅ 필터링 (제목, 기관, 게시판, 날짜)
- ✅ 필터 칩 UI (활성 필터 표시 및 제거)
- ✅ 페이지네이션 (20개씩)
- ✅ 2-Column 반응형 레이아웃
- ✅ 크롤링 기관 및 게시판 Links 섹션
- ✅ 최근 업데이트 시간 표시
- ✅ 접근성 개선 (Semantic HTML, ARIA)
- ✅ API 캐싱 (ISR 5분)
- ✅ Vercel 배포

### ⚠️ 알려진 이슈

없음

### 📊 데이터 구조

**Google Sheets 컬럼**:
- 제목
- 링크
- 기관
- 게시판
- 날짜

**크롤링 대상 기관** (16개):
- 해양수산부 본부
- 지방청 11개: 부산, 인천, 동해, 평택, 목포, 군산, 포항, 울산, 여수, 마산, 제주
- 어업관리단 2개: 서해, 남해
- 공단 1개: 한국해양수산연수원
- 항만공사 3개: 부산항, 인천항, 울산항

---

## 환경 설정

### 로컬 개발

```bash
# 크롤러 실행
python marine_ministry_crawler_final.py

# 대시보드 실행
cd dashboard
npm install
npm run dev
```

### 환경 변수

**필수 환경 변수** (`.env.local`):
```
GOOGLE_APPLICATION_CREDENTIALS_JSON=<Google API JSON>
SPREADSHEET_ID=<Google Sheets ID>
```

### 배포

**Vercel**:
- URL: https://[your-vercel-url].vercel.app/dashboard
- 자동 배포: main 브랜치 푸시 시

**GitHub Actions**:
- 크롤링 주기: 하루 4회 (0시, 6시, 12시, 18시)
- Secrets: `GOOGLE_CREDENTIALS`, `SPREADSHEET_ID`

---

## 파일 구조

```
.
├── marine_ministry_crawler_final.py  # 메인 크롤러
├── upload_to_gsheet.py                # Google Sheets 업로드
├── requirements.txt                   # Python 의존성
├── dashboard/                         # Next.js 대시보드
│   ├── app/                          # App Router 페이지
│   │   ├── dashboard/page.tsx       # 대시보드 메인 페이지
│   │   └── api/sheets/route.ts      # Google Sheets API
│   ├── components/                   # React 컴포넌트
│   │   ├── DataTable.tsx            # 데이터 테이블
│   │   ├── FilterBar.tsx            # 필터 바 (칩 UI 포함)
│   │   ├── StatCards.tsx            # 통계 카드
│   │   └── CrawlingLinks.tsx        # 크롤링 기관 링크
│   ├── lib/                          # 유틸리티
│   │   └── sheets.ts                # Google Sheets 클라이언트
│   ├── package.json                  # Node.js 의존성
│   ├── tailwind.config.ts           # Tailwind 설정
│   └── tsconfig.json                # TypeScript 설정
├── .github/workflows/                # GitHub Actions
├── docs/                             # 문서
└── HISTORY.md                        # 이 파일
```

---

## Git 커밋 히스토리

| 커밋 해시 | 날짜 | 메시지 | 작업자 |
|----------|------|--------|--------|
| 2e7e0fa | 2025-11-20 | chore: 불필요한 테스트 파일 삭제 | JSfa9586 |
| 29e771d | 2025-11-20 | fix: postcss.config.js를 Tailwind v3 호환 설정으로 수정 | JSfa9586 |
| fbd33d9 | 2025-11-19 | feat: Tailwind CSS v4 → v3.4.18 다운그레이드 | JSfa9586 |
| b38ac96 | 2025-11-19 | backup: Tailwind v4 상태 백업 (다운그레이드 직전) | JSfa9586 |
| 81943ee | 2025-11-19 | fix: FilterBar 무한 루프 문제 해결 | JSfa9586 |
| c200208 | 2025-11-19 | feat: 2-Column 레이아웃 및 필터 칩 UI 구현 | JSfa9586 |
| 5902871 | 2025-11-19 | feat: 대시보드 레이아웃 개선 - 사용자 친화적 UI | JSfa9586 |
| b90dfb6 | 2025-11-19 | feat: 크롤링 기관 및 게시판 Links 섹션 추가 | JSfa9586 |
| 4bbad40 | 2025-11-19 | fix: CSV 파일명 하드코딩 문제 해결 | JSfa9586 |
| d0b82d1 | 2025-11-19 | fix: GitHub Actions 환경에서 Google Sheets 업로드 실패 문제 해결 | JSfa9586 |
| b4d73f3 | 2025-11-19 | fix: 최근 업데이트 시간 표시 문제 완전 해결 | JSfa9586 |
| 523bf21 | 2025-11-19 | fix: favicon 404 에러 해결 | JSfa9586 |
| 653ccf4 | 2025-11-19 | fix: 최근 업데이트 시간 로딩 문제 및 페이지네이션 UX 개선 | JSfa9586 |
| 55d9f47 | 2025-11-19 | feat: 페이지네이션 및 UI/UX 개선 | JSfa9586 |
| 9dd24e5 | 2025-11-19 | feat: 대시보드 개선 - 최종 크롤링 시간 표시 및 페이지 크기 증가 | JSfa9586 |
| 4e6902c | 2025-11-19 | chore: 프로젝트 구조 정리 및 히스토리 문서화 | JSfa9586 |
| 70fec46 | 2025-11-19 | chore: Vercel 재배포 트리거 | JSfa9586 |
| 5072df0 | 2025-11-19 | feat: 필터에 날짜 및 게시판 프리셋 추가 | JSfa9586 |
| ce73769 | 2025-11-18 | fix: vercel.json 잘못된 속성 제거 | JSfa9586 |
| b4f4abc | 2025-11-18 | fix: Vercel 배포 설정 추가 (dashboard 서브폴더) | JSfa9586 |

---

## 다음 단계 (TODO)

### 긴급 (P0)
없음

### 중요 (P1)
- [ ] 크롤링 에러 알림 시스템 (이메일/Slack)
- [ ] 대시보드 다크 모드 지원
- [ ] 모바일 UI 최적화

### 개선 (P2)
- [ ] 크롤링 통계 대시보드 추가
- [ ] 즐겨찾기 기능
- [ ] 키워드 알림 설정
- [ ] Excel/CSV 다운로드 기능

---

### Phase 17: EIAA 크롤러 날짜 추출 수정 및 자동화 구축
**일시**: 2025-11-26

**작업 내용**:
1. EIAA 크롤러 날짜 추출 로직 전면 수정 (Regex 기반)
   - DIV 기반 레이아웃 대응
   - 행 전체 텍스트 스캔으로 날짜(`YYYY.MM.DD`) 추출
   - '작성일' → '등록일'로 컬럼명 변경
2. 크롤링 페이지 수 최적화 (기본 2페이지, 필요 시 5페이지 확장 가능)
3. 윈도우 작업 스케줄러 자동화 구축
   - `run_crawler_auto.bat`: 무인 실행 배치 파일
   - `setup_scheduler.ps1`: 스케줄 등록 스크립트 (매일 08, 11, 15, 20시)

**수정 파일**:
- `eiaa_crawler.py`
- `run_crawler_auto.bat` (신규)
- `setup_scheduler.ps1` (신규)

---

### Phase 18: 모바일 햄버거 메뉴 구현
**일시**: 2025-11-27

**작업 내용**:
1. 헤더 컴포넌트(`Header.tsx`)를 클라이언트 컴포넌트로 전환 (`use client`)
2. 모바일 화면(`md:hidden`)에서만 보이는 햄버거 버튼 추가
3. 버튼 클릭 시 드롭다운 메뉴가 열리도록 상태 관리(`useState`) 구현
4. 모바일 메뉴에서 '관련협회' 등으로 이동 가능하도록 링크 연결

---

---

### Phase 16: 데이터 테이블 링크 컬럼 제거
**일시**: 2025-11-26

**작업 내용**:
1. 제목 클릭 시 링크 이동 기능이 추가됨에 따라 중복되는 '링크' 컬럼 제거
2. 확보된 공간을 다른 컬럼(게시판, 제목, 작성일)에 배분하여 모바일 가독성 개선

**수정 파일**:
- `dashboard/components/DataTable.tsx`

---

## 현재 상태

### ✅ 완료된 기능

**크롤러**:
- ✅ 16개 기관 공지사항 크롤링
- ✅ Google Sheets 자동 업로드
- ✅ GitHub Actions 자동화 (하루 4회)

**대시보드**:
- ✅ Google Sheets 데이터 표시
- ✅ 필터링 (제목, 기관, 게시판, 날짜)
- ✅ 필터 칩 UI (활성 필터 표시 및 제거)
- ✅ 페이지네이션 (20개씩)
- ✅ 2-Column 반응형 레이아웃
- ✅ 크롤링 기관 및 게시판 Links 섹션
- ✅ 최근 업데이트 시간 표시
- ✅ 접근성 개선 (Semantic HTML, ARIA)
- ✅ API 캐싱 (ISR 5분)
- ✅ Vercel 배포

### ⚠️ 알려진 이슈

없음

### 📊 데이터 구조

**Google Sheets 컬럼**:
- 제목
- 링크
- 기관
- 게시판
- 날짜

**크롤링 대상 기관** (16개):
- 해양수산부 본부
- 지방청 11개: 부산, 인천, 동해, 평택, 목포, 군산, 포항, 울산, 여수, 마산, 제주
- 어업관리단 2개: 서해, 남해
- 공단 1개: 한국해양수산연수원
- 항만공사 3개: 부산항, 인천항, 울산항

---

## 환경 설정

### 로컬 개발

```bash
# 크롤러 실행
python marine_ministry_crawler_final.py

# 대시보드 실행
cd dashboard
npm install
npm run dev
```

### 환경 변수

**필수 환경 변수** (`.env.local`):
```
GOOGLE_APPLICATION_CREDENTIALS_JSON=<Google API JSON>
SPREADSHEET_ID=<Google Sheets ID>
```

### 배포

**Vercel**:
- URL: https://[your-vercel-url].vercel.app/dashboard
- 자동 배포: main 브랜치 푸시 시

**GitHub Actions**:
- 크롤링 주기: 하루 4회 (0시, 6시, 12시, 18시)
- Secrets: `GOOGLE_CREDENTIALS`, `SPREADSHEET_ID`

---

## 파일 구조

```
.
├── marine_ministry_crawler_final.py  # 메인 크롤러
├── upload_to_gsheet.py                # Google Sheets 업로드
├── requirements.txt                   # Python 의존성
├── dashboard/                         # Next.js 대시보드
│   ├── app/                          # App Router 페이지
│   │   ├── dashboard/page.tsx       # 대시보드 메인 페이지
│   │   └── api/sheets/route.ts      # Google Sheets API
│   ├── components/                   # React 컴포넌트
│   │   ├── DataTable.tsx            # 데이터 테이블
│   │   ├── FilterBar.tsx            # 필터 바 (칩 UI 포함)
│   │   ├── StatCards.tsx            # 통계 카드
│   │   └── CrawlingLinks.tsx        # 크롤링 기관 링크
│   ├── lib/                          # 유틸리티
│   │   └── sheets.ts                # Google Sheets 클라이언트
│   ├── package.json                  # Node.js 의존성
│   ├── tailwind.config.ts           # Tailwind 설정
│   └── tsconfig.json                # TypeScript 설정
├── .github/workflows/                # GitHub Actions
├── docs/                             # 문서
└── HISTORY.md                        # 이 파일
```

---

## Git 커밋 히스토리

| 커밋 해시 | 날짜 | 메시지 | 작업자 |
|----------|------|--------|--------|
| 2e7e0fa | 2025-11-20 | chore: 불필요한 테스트 파일 삭제 | JSfa9586 |
| 29e771d | 2025-11-20 | fix: postcss.config.js를 Tailwind v3 호환 설정으로 수정 | JSfa9586 |
| fbd33d9 | 2025-11-19 | feat: Tailwind CSS v4 → v3.4.18 다운그레이드 | JSfa9586 |
| b38ac96 | 2025-11-19 | backup: Tailwind v4 상태 백업 (다운그레이드 직전) | JSfa9586 |
| 81943ee | 2025-11-19 | fix: FilterBar 무한 루프 문제 해결 | JSfa9586 |
| c200208 | 2025-11-19 | feat: 2-Column 레이아웃 및 필터 칩 UI 구현 | JSfa9586 |
| 5902871 | 2025-11-19 | feat: 대시보드 레이아웃 개선 - 사용자 친화적 UI | JSfa9586 |
| b90dfb6 | 2025-11-19 | feat: 크롤링 기관 및 게시판 Links 섹션 추가 | JSfa9586 |
| 4bbad40 | 2025-11-19 | fix: CSV 파일명 하드코딩 문제 해결 | JSfa9586 |
| d0b82d1 | 2025-11-19 | fix: GitHub Actions 환경에서 Google Sheets 업로드 실패 문제 해결 | JSfa9586 |
| b4d73f3 | 2025-11-19 | fix: 최근 업데이트 시간 표시 문제 완전 해결 | JSfa9586 |
| 523bf21 | 2025-11-19 | fix: favicon 404 에러 해결 | JSfa9586 |
| 653ccf4 | 2025-11-19 | fix: 최근 업데이트 시간 로딩 문제 및 페이지네이션 UX 개선 | JSfa9586 |
| 55d9f47 | 2025-11-19 | feat: 페이지네이션 및 UI/UX 개선 | JSfa9586 |
| 9dd24e5 | 2025-11-19 | feat: 대시보드 개선 - 최종 크롤링 시간 표시 및 페이지 크기 증가 | JSfa9586 |
| 4e6902c | 2025-11-19 | chore: 프로젝트 구조 정리 및 히스토리 문서화 | JSfa9586 |
| 70fec46 | 2025-11-19 | chore: Vercel 재배포 트리거 | JSfa9586 |
| 5072df0 | 2025-11-19 | feat: 필터에 날짜 및 게시판 프리셋 추가 | JSfa9586 |
| ce73769 | 2025-11-18 | fix: vercel.json 잘못된 속성 제거 | JSfa9586 |
| b4f4abc | 2025-11-18 | fix: Vercel 배포 설정 추가 (dashboard 서브폴더) | JSfa9586 |

---

## 다음 단계 (TODO)

### 긴급 (P0)
없음

### 중요 (P1)
- [ ] 크롤링 에러 알림 시스템 (이메일/Slack)
- [ ] 대시보드 다크 모드 지원
- [ ] 모바일 UI 최적화

### 개선 (P2)
- [ ] 크롤링 통계 대시보드 추가
- [ ] 즐겨찾기 기능
- [ ] 키워드 알림 설정
- [ ] Excel/CSV 다운로드 기능

---

### Phase 17: EIAA 크롤러 날짜 추출 수정 및 자동화 구축
**일시**: 2025-11-26

**작업 내용**:
1. EIAA 크롤러 날짜 추출 로직 전면 수정 (Regex 기반)
   - DIV 기반 레이아웃 대응
   - 행 전체 텍스트 스캔으로 날짜(`YYYY.MM.DD`) 추출
   - '작성일' → '등록일'로 컬럼명 변경
2. 크롤링 페이지 수 최적화 (기본 2페이지, 필요 시 5페이지 확장 가능)
3. 윈도우 작업 스케줄러 자동화 구축
   - `run_crawler_auto.bat`: 무인 실행 배치 파일
   - `setup_scheduler.ps1`: 스케줄 등록 스크립트 (매일 08, 11, 15, 20시)

**수정 파일**:
- `eiaa_crawler.py`
- `run_crawler_auto.bat` (신규)
- `setup_scheduler.ps1` (신규)

---

### Phase 18: 모바일 햄버거 메뉴 구현
**일시**: 2025-11-27

**작업 내용**:
1. 헤더 컴포넌트(`Header.tsx`)를 클라이언트 컴포넌트로 전환 (`use client`)
2. 모바일 화면(`md:hidden`)에서만 보이는 햄버거 버튼 추가
3. 버튼 클릭 시 드롭다운 메뉴가 열리도록 상태 관리(`useState`) 구현
4. 모바일 메뉴에서 '관련협회' 등으로 이동 가능하도록 링크 연결

**수정 파일**:
- `dashboard/components/Header.tsx`

---

### Phase 19: Dashboard UI Fix (Time Display) (2025-11-27)
- **Problem**: Time display in dashboard showed trailing colon (e.g., "8:39:") for single-digit hours.
- **Solution**: Updated `formatDateTime` function to use `time.split(':').slice(0, 2).join(':')` for robust HH:MM formatting.
- **Files Modified**: `dashboard/app/dashboard/page.tsx`, `dashboard/app/dashboard/associations/page.tsx`.

## Phase 20: Related Laws Feature & Automation (2025-11-27)
- **Goal**: Add "Related Laws" section to dashboard with data from MOLEG (Ministry of Government Legislation).
- **Implementation**:
    - Created `moleg_crawler.py` to crawl 3 boards: (Ministry) Legislative Notice, Administrative Notice, (Local) Legislative Notice.
    - Updated `upload_to_gsheet.py` to upload MOLEG data to '관련법령' sheet.
    - Created `dashboard/app/dashboard/laws/page.tsx` and `dashboard/components/LawsTable.tsx` to display the data.
    - Updated `Header.tsx` to add navigation link.
    - Updated `run_crawler.bat` and `run_crawler_auto.bat` to include MOLEG crawler in the execution flow.
- **Files Created/Modified**: `moleg_crawler.py`, `dashboard/app/dashboard/laws/page.tsx`, `dashboard/components/LawsTable.tsx`, `Header.tsx`, `run_crawler.bat`, `run_crawler_auto.bat`, `types/index.ts`.

## Phase 21: Fix Upload Error (NaN handling) (2025-11-27)
- **Problem**: Upload to Google Sheets failed for MOLEG data with "Out of range float values are not JSON compliant" error.
- **Cause**: Empty fields in `moleg_data.csv` were read as `NaN` (Not a Number) by Pandas, which `gspread` cannot serialize to JSON.
- **Solution**: Updated `upload_to_gsheet.py` to replace all `NaN` values with empty strings (`df.fillna('')`) before uploading.
- **Files Modified**: `upload_to_gsheet.py`.

## Phase 22: GitHub Actions Integration & Deployment (2025-11-27)
- **Goal**: Automate the new crawlers (EIAA, MOLEG) using GitHub Actions and deploy the changes.
- **Implementation**:
    - Updated `.github/workflows/daily-crawling.yml` to include `eiaa_crawler.py` and `moleg_crawler.py`.
    - Added `EIAA_USER_ID` and `EIAA_PASSWORD` secrets mapping to the workflow.
    - Updated artifact upload path to include `eiaa_boards_*.csv` and `moleg_data.csv`.
    - Committed and pushed all changes to the `main` branch.
- **Files Modified**: `.github/workflows/daily-crawling.yml`.

## Phase 23: Fix Dashboard Data Mapping (2025-11-27)
- **Problem**: "Related Laws" section in dashboard displayed empty or incorrect data because the column names in `moleg_data.csv` (`구분`, `기관`, `내용`, `기간`) did not match the hardcoded mapping in `transformRowToData`.
- **Solution**: Updated `dashboard/lib/googleSheets.ts` to implement dynamic column mapping in `transformRowsToData`. It now reads the header row (first row) of the spreadsheet and maps columns to the `CrawlingData` interface based on their names.
- **Files Modified**: `dashboard/lib/googleSheets.ts`.

## Phase 24: Status Badge Implementation (2025-11-27)
- **Problem**: Titles in "Related Laws" were prefixed with "진행" (e.g., "진행보훈병원..."), making them hard to read.
- **Solution**:
    - Modified `moleg_crawler.py` to extract the status text (from `span` tag) into a separate '상태' field and remove it from the '제목'.
    - Updated `dashboard/types/index.ts` to include the optional `상태` field.
    - Updated `dashboard/components/LawsTable.tsx` to display the '상태' as a badge (e.g., blue "진행" tag) next to the title.
- **Files Modified**: `moleg_crawler.py`, `dashboard/types/index.ts`, `dashboard/components/LawsTable.tsx`.

## Phase 25: Crawler Optimization (2025-11-27)
- **Goal**: Reduce server load and execution time given the frequent schedule (4 times/day).
- **Change**: Reduced the maximum number of pages crawled per board from 10 pages to 5 pages in `marine_ministry_crawler_final.py`.
- **Files Modified**: `marine_ministry_crawler_final.py`.

## Phase 26: GitHub Actions Adjustment (2025-11-27)
- **Problem**: EIAA crawler failing with 403 Forbidden in GitHub Actions (IP blocking/login issue). Marine Ministry crawler timing out after 15 minutes.
- **Solution**:
    - Removed EIAA crawler step from `.github/workflows/daily-crawling.yml` (user will run locally).
    - Increased Marine Ministry crawler timeout to 45 minutes (job timeout to 60 minutes).
- **Files Modified**: `.github/workflows/daily-crawling.yml`.

## Phase 27: Fix EIAA Date Display (2025-11-27)
- **Problem**: Association (EIAA) posts showed "1970.01.01." as the date.
- **Cause**: `eiaa_crawler.py` outputs a '등록일' column, but `dashboard/lib/googleSheets.ts` was only looking for '작성일', resulting in null values.
- **Solution**: Updated `dashboard/lib/googleSheets.ts` to map '등록일' to '작성일' if '작성일' is not found.
- **Files Modified**: `dashboard/lib/googleSheets.ts`.

## Phase 28: Related Laws Stats Update (2025-11-27)
- **Problem**: "Related Laws" section was missing "Crawling Execution Time" and "New Post Time" stats, unlike the main dashboard.
- **Solution**:
    - Updated `dashboard/types/index.ts` to include `lastExecutionTime` in `DashboardStats`.
    - Updated `dashboard/app/dashboard/laws/page.tsx` to fetch stats via API (`/api/sheets?type=stats&sheet=관련법령`) and display 4 stat cards (Total, Organizations, Execution Time, New Post Time).
- **Files Modified**: `dashboard/types/index.ts`, `dashboard/app/dashboard/laws/page.tsx`.

## Phase 29: UI Improvement - Organization Name Formatting (2025-11-28)
- **Problem**: Long organization names with parentheses (e.g., "Ministry of Oceans and Fisheries (Department...)") were being truncated in the "Related Laws" table.
- **Solution**: Modified `dashboard/components/LawsTable.tsx` to display content within parentheses on a new line with a smaller font size, improving readability.
- **Files Modified**: `dashboard/components/LawsTable.tsx`.

## Phase 30: Dashboard Header Text Update (2025-11-28)
- **Problem**: User requested specific text changes for the dashboard header.
- **Solution**:
    - Changed main title from "대시보드" to "해양수산부".
    - Changed description from "해양수산부 크롤링 데이터 분석" to "해수부 및 관련기관 게시물 모음".
- **Files Modified**: `dashboard/app/dashboard/page.tsx`.

## Phase 31: Sidebar Text Update (2025-11-28)
- **Problem**: User requested specific text change in the sidebar footer.
- **Solution**: Changed "게시판을 크롤링하고 있습니다" to "게시판을 모니터링하고 있습니다" in `CrawlingLinks` component.
- **Files Modified**: `dashboard/components/CrawlingLinks.tsx`.

## Phase 32: Dashboard Home Restructuring (2025-11-28)
- **Problem**: User requested a unified view of recent posts from all sections on the home screen.
- **Solution**:
    - Moved existing Ministry page to `/dashboard/ministry`.
    - Created new `/dashboard` home page displaying recent posts from Ministry, Associations, and Laws.
    - Added `RecentPosts` component for consistent display.
    - Updated navigation menu to reflect the new structure.
- **Files Modified**: `dashboard/app/dashboard/page.tsx`, `dashboard/app/dashboard/ministry/page.tsx`, `dashboard/components/RecentPosts.tsx`, `dashboard/components/Header.tsx`.

## Phase 33: Dashboard Sidebar Removal (2025-11-28)
- **Problem**: User requested to remove the "Monitoring Boards" sidebar from the unified dashboard home.
- **Solution**:
    - Removed `<aside>` element containing `CrawlingLinks` from `dashboard/app/dashboard/page.tsx`.
    - Adjusted grid layout to full width.
    - Updated "Tips" section text.
- **Files Modified**: `dashboard/app/dashboard/page.tsx`.

## Phase 34: Laws Page Title Update (2025-11-28)
- **Problem**: User requested to change the title of the "Related Laws" page.
- **Solution**: Changed `h1` title from "관련법령" to "관련법령 예고" in `dashboard/app/dashboard/laws/page.tsx`.
- **Files Modified**: `dashboard/app/dashboard/laws/page.tsx`.

## Phase 35: Rename Related Laws to Legislative Notice (2025-11-28)
- **Problem**: User requested to rename "Related Laws" to "Legislative Notice" throughout the web app.
- **Solution**:
    - Replaced "관련법령" with "법령예고" in `Header.tsx` (navigation menu).
    - Replaced "관련법령" with "법령예고" in `dashboard/app/dashboard/page.tsx` (home page description and section title).
    - Replaced "관련법령 예고" with "법령예고" in `dashboard/app/dashboard/laws/page.tsx` (page title).
- **Files Modified**: `dashboard/components/Header.tsx`, `dashboard/app/dashboard/page.tsx`, `dashboard/app/dashboard/laws/page.tsx`.

## Phase 36: Rename Crawling to Monitoring (2025-11-28)
- **Problem**: User requested to rename "Crawling" to "Monitoring" in the UI to sound more professional.
- **Solution**:
    - Replaced "크롤링 기관" with "모니터링 기관" in `dashboard/app/dashboard/ministry/page.tsx` and `dashboard/app/dashboard/associations/page.tsx`.
    - Replaced "크롤링 실행" with "모니터링 실행" in `dashboard/app/dashboard/ministry/page.tsx` and `dashboard/app/dashboard/laws/page.tsx`.
- **Files Modified**: `dashboard/app/dashboard/ministry/page.tsx`, `dashboard/app/dashboard/laws/page.tsx`, `dashboard/app/dashboard/associations/page.tsx`.

## Phase 37: Rename Collection Agency to Monitoring Agency (2025-11-28)
- **Problem**: User requested to unify terminology by renaming "Collection Agency" to "Monitoring Agency" in the Laws Dashboard.
- **Solution**: Replaced "수집 기관" with "모니터링 기관" in `dashboard/app/dashboard/laws/page.tsx`.
- **Files Modified**: `dashboard/app/dashboard/laws/page.tsx`.

## Phase 38: Update Footer Content (2025-11-28)
- **Problem**: User requested to update the footer description and remove a section (interpreted as the redundant Links section).
- **Solution**:
    - Updated footer description to "경영지원을 위한 정보 취합 및 분석을 위한 사이트 입니다.".
    - Removed the "Links" section from the footer.
    - Adjusted footer grid layout from 3 columns to 2 columns.
- **Files Modified**: `dashboard/components/Footer.tsx`.

## Phase 39: Google Drive Integration (Test Section) (2025-11-28)
- **Problem**: User requested a feature to upload and view files/photos using Google Drive, integrated as a "Test" section.
- **Solution**:
    - Implemented Google Drive API integration (`lib/googleDrive.ts`, `app/api/drive/route.ts`).
    - Created UI components: `FileUploader`, `DriveFileList`, `DrivePhotoGallery`.
    - Added "Test" section pages:
        - Main: `dashboard/app/dashboard/test/page.tsx`
        - Reference Room: `dashboard/app/dashboard/test/reference/page.tsx` (Folder ID: `1gTw...`)
        - Photo Album: `dashboard/app/dashboard/test/photos/page.tsx` (Folder ID: `1Lj2...`)
    - Updated navigation in `dashboard/components/Header.tsx`.
- **Files Modified**: `dashboard/lib/googleDrive.ts`, `dashboard/app/api/drive/route.ts`, `dashboard/components/FileUploader.tsx`, `dashboard/components/DriveFileList.tsx`, `dashboard/components/DrivePhotoGallery.tsx`, `dashboard/app/dashboard/test/**/*`, `dashboard/components/Header.tsx`.

## Phase 40: Fix Upload Limit and CSV Path (2025-11-29)
- **Problem**:
    - File upload failed with 413 Payload Too Large error.
    - `eiaa_boards` CSV files were cluttering the root directory.
- **Solution**:
    - Implemented Server Action `uploadFileAction` for file uploads to support larger files.
    - Configured `experimental.serverActions.bodySizeLimit` to '10mb' in `next.config.js`.
    - Updated `FileUploader` to use the Server Action.
    - Modified `eiaa_crawler.py` to save CSV files in a `data` subdirectory.
- **Files Modified**: `dashboard/app/actions.ts`, `dashboard/next.config.js`, `dashboard/components/FileUploader.tsx`, `eiaa_crawler.py`.

---

**마지막 업데이트**: 2025-11-27
**작성자**: Claude Code (직접 작성)
