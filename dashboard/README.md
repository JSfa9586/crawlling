# 해양수산부 공지사항 대시보드

Google Sheets API를 활용하여 해양수산부의 공식 웹페이지 및 게시판 정보를 크롤링하는 Next.js 실시간 대시보드입니다.

## 주요 기능

- **Google Sheets 크롤링**: Google Sheets에 수집된 데이터를 실시간으로 가져오기
- **ISR 최적화**: 5분 주기로 자동 업데이트되는 1초 미만의 빠른 로딩
- **데이터 필터링**: 기관, 게시판, 날짜, 검색어 등 다양한 필터 기능 제공
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 모든 기기 최적화
- **접근성 준수**: WCAG 2.1 AA 표준 충족
- **TypeScript**: 완전한 타입 안정성 확보

## 기술 스택

- **Frontend**: Next.js 16+ (App Router), React 19, Tailwind CSS
- **API**: Google Sheets API v4
- **Authentication**: Service Account (JSON 키)
- **Database**: Google Sheets
- **Deployment**: Vercel 클라우드

## 시작 요구사항

- Node.js 18+
- npm 또는 yarn
- Google Cloud 프로젝트 (Service Account 키 필요)

## Google Cloud 설정

### 1. Service Account 키 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새로 프로젝트 생성 또는 기존 프로젝트 선택
3. "서비스 계정" → "서비스 계정 만들기"
4. 계정명 입력 (예: `sheets-api-service`)
5. 역할 → 사용자 지정 역할 → "Google Sheets API 편집"

### 2. Service Account 키 다운로드

1. 생성된 서비스 계정 선택
2. "키" 탭에서 "새 키" → JSON 선택
3. JSON 파일 다운로드 후 안전하게 보관 (본인만 접근 가능)

### 3. Google Sheets API 활성화

1. Cloud Console에서 "API 및 서비스" → "라이브러리"
2. "Google Sheets API" 검색 및 활성화

### 4. Google Sheets 문서

Google Sheets에 다음 구조로 데이터 저장:

```
기관구분 | 기관명 | 게시판 | 제목 | 작성일 | 링크 | 수집일시
청      | 해양수산부 | 보도자료 | 제목... | 2025-11-18 | URL... | 2025-11-18 10:30:00
```

## 프로젝트 설정

### 1. 프로젝트 디렉토리 복제

```bash
cd C:\AI\251118\dashboard

# 의존성 설치
npm install

# 환경 변수 파일 생성
copy .env.local.example .env.local
```

### 2. .env.local 설정

`.env.local` 파일에 다음 환경 변수를 입력하세요:

```
GOOGLE_CREDENTIALS_JSON='{"type": "service_account", ...}'
SPREADSHEET_ID=your_spreadsheet_id
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 로컬 개발 실행

```bash
npm run dev
```

## API 문서

### GET /api/sheets

**Query Parameters:**
- `기관`: 기관명 필터링
- `게시판`: 게시판 필터링
- `시작일`: YYYY-MM-DD
- `종료일`: YYYY-MM-DD
- `검색어`: 제목 검색
- `type`: 'data' | 'stats' | 'filters'

## Vercel 배포

### 배포 전 체크리스트

```bash
# TypeScript 타입 검증
npm run type-check

# 코드 품질 검증
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm start
```

### 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

```
GOOGLE_CREDENTIALS_JSON = <JSON>
SPREADSHEET_ID = <ID>
NEXT_PUBLIC_API_URL = https://your-domain.vercel.app
```

### 배포 명령

```bash
vercel --prod
```

### 배포 URL

https://your-project.vercel.app

## 빌드 최적화

### 프로덕션 빌드 결과

- 정적 페이지: 4개 (/, /_not-found, /dashboard, /sitemap.xml)
- 동적 라우트: 1개 (/api/sheets)
- 빌드 시간: ~6초
- 번들 크기: ~5.5MB (.next 디렉토리)

### 성능 최적화 내역

- Turbopack 기반 빠른 컴파일 (5.6초)
- 정적 사이트 생성 (SSG) 활용
- CSS 압축 (cssnano) 자동 적용
- 이미지 최적화 (Next.js 자동 최적화)
- 불필요한 라이브러리 제거 (Tree shaking)

## 트러블슈팅

### 환경 변수 오류

**오류**: `GOOGLE_CREDENTIALS_JSON` 정의되지 않음

**해결**:
- Service Account 키 JSON 문자열이 올바르게 입력되었는지 확인
- JSON이 한 줄로 입력되어야 함

### 스프레드시트 접근 오류

**오류**: 403 Forbidden

**해결**:
- Service Account 이메일이 Google Sheets 공유 권한을 가지고 있는지 확인
- 스프레드시트 공유 → Service Account 이메일 추가

### 빌드 오류

**오류**: googleapis 패키지 로드 실패

**해결**:
- `npm install` 재실행
- node_modules 폴더 삭제 후 재설치
- Node.js 버전 확인 (18+ 필요)

## 파일 구조

```
dashboard/
├── app/
│   ├── api/sheets/route.ts           # API 라우트
│   ├── dashboard/page.tsx            # 대시보드 페이지
│   ├── dashboard/layout.tsx          # 대시보드 레이아웃 (메타데이터)
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── page.tsx                      # 홈페이지
│   ├── error.tsx                     # 에러 경계
│   ├── loading.tsx                   # 로딩 UI (스켈레톤)
│   ├── globals.css                   # 전역 스타일
│   └── sitemap.ts                    # SEO 사이트맵
├── components/
│   ├── Header.tsx                    # 헤더 컴포넌트
│   ├── Footer.tsx                    # 푸터 컴포넌트
│   ├── DataTable.tsx                 # 데이터 테이블
│   ├── FilterBar.tsx                 # 필터 바
│   ├── StatCard.tsx                  # 통계 카드
│   ├── LoadingSpinner.tsx            # 로딩 스피너
│   └── ErrorMessage.tsx              # 에러 메시지
├── lib/
│   ├── googleSheets.ts               # Google Sheets API 유틸
│   └── filters.ts                    # 데이터 필터링 로직
├── types/
│   └── index.ts                      # TypeScript 타입 정의
├── public/
│   └── robots.txt                    # SEO robots.txt
├── next.config.js                    # Next.js 설정
├── tailwind.config.js                # Tailwind CSS 설정
├── tsconfig.json                     # TypeScript 설정
├── postcss.config.js                 # PostCSS 설정 (CSS 최적화)
└── .vercelignore                     # Vercel 배포 무시 파일

```

## 라이선스

MIT License

## 지원

문제가 발생하면 GitHub Issues를 통해 보고하세요.

---

**마지막 업데이트**: 2025-11-18
**Next.js 버전**: 16.0.3
**React 버전**: 19.2.0
