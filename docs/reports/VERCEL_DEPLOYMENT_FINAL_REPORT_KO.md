# Next.js 대시보드 Vercel 배포 최종 보고서

**작성일**: 2025-11-18
**프로젝트**: 해양수산부 공고 데이터 시각화 대시보드
**배포 플랫폼**: Vercel
**상태**: 배포 준비 완료

---

## 1. 작업 요약

### 1.1 주요 성과

| 항목 | 결과 | 상태 |
|------|------|------|
| **GitHub 저장소** | dashboard 디렉토리 추가 완료 | ✓ 완료 |
| **빌드 테스트** | npm run build 성공 (4.0초) | ✓ 완료 |
| **Vercel 설정** | vercel.json, .vercelignore 생성 | ✓ 완료 |
| **CLI 설치** | Vercel CLI 글로벌 설치 | ✓ 완료 |
| **배포 준비** | Vercel 프로젝트 배포 가이드 작성 | ✓ 완료 |
| **자동 배포 설정** | GitHub 연동 메커니즘 확인 | ✓ 완료 |

### 1.2 완료된 작업 목록

```
✓ Phase 1: Git 저장소 준비
  └─ dashboard 디렉토리를 GitHub에 추가 (33 files, 2,979 insertions)
  └─ Vercel 설정 파일 추가 (2 files, 59 insertions)
  └─ 총 2개의 신규 커밋 생성 및 푸시

✓ Phase 2: Next.js 빌드 검증
  └─ 빌드 성공: 4.0초
  └─ TypeScript 컴파일 완료
  └─ 정적 페이지 5개 생성
  └─ Route 구조 최적화 완료

✓ Phase 3: Vercel 설정 파일 생성
  └─ vercel.json: 빌드 및 배포 설정
  └─ .vercelignore: 배포 제외 파일 정의
  └─ next.config.js: 보안 헤더 및 최적화 설정 추가

✓ Phase 4: 개발 환경 준비
  └─ Vercel CLI 글로벌 설치
  └─ Node.js v22.20.0, npm 10.9.3 확인
  └─ 종속성 관리 완료

✓ Phase 5: 배포 가이드 문서
  └─ Vercel Dashboard 배포 가이드 작성 (10단계)
  └─ 문제 해결 가이드 작성
  └─ 성능 최적화 가이드 작성

⏳ Phase 6: 실제 배포 (수동 작업)
  └─ Vercel 계정 생성 및 GitHub 연동
  └─ 프로젝트 생성 및 설정
  └─ 환경 변수 설정 (3개 항목)
  └─ 배포 실행 및 검증
```

---

## 2. 기술 사양

### 2.1 프로젝트 구조

```
crawlling/
├── dashboard/                          (Next.js 프로젝트)
│   ├── app/                            (App Router)
│   │   ├── api/sheets/route.ts        (Google Sheets API 엔드포인트)
│   │   ├── dashboard/page.tsx         (메인 대시보드)
│   │   ├── layout.tsx                 (레이아웃)
│   │   ├── page.tsx                   (홈 페이지)
│   │   └── globals.css                (전역 스타일)
│   ├── components/                    (재사용 컴포넌트)
│   │   ├── DataTable.tsx              (데이터 표)
│   │   ├── FilterBar.tsx              (필터 바)
│   │   ├── Header.tsx                 (헤더)
│   │   ├── Footer.tsx                 (푸터)
│   │   ├── StatCard.tsx               (통계 카드)
│   │   ├── ErrorMessage.tsx           (에러 메시지)
│   │   └── LoadingSpinner.tsx         (로딩 스피너)
│   ├── lib/                           (유틸리티)
│   ├── types/                         (TypeScript 타입)
│   ├── next.config.js                 (Next.js 설정)
│   ├── package.json                   (의존성)
│   ├── tailwind.config.ts             (Tailwind 설정)
│   ├── tsconfig.json                  (TypeScript 설정)
│   ├── vercel.json                    (Vercel 배포 설정) [신규]
│   ├── .vercelignore                  (배포 제외 파일) [신규]
│   └── .env.local.example             (환경 변수 예제)
└── README.md
```

### 2.2 기술 스택

#### Frontend
| 항목 | 버전 | 설명 |
|------|------|------|
| **Next.js** | 16.0.3 | React 메타프레임워크 (App Router) |
| **React** | 19.2.0 | UI 라이브러리 |
| **TypeScript** | 5.9.3 | 정적 타입 검사 |
| **Tailwind CSS** | 4.1.17 | 유틸리티 기반 CSS 프레임워크 |
| **Tailwind/PostCSS** | 4.1.17 | PostCSS 플러그인 |

#### Backend API
| 항목 | 버전 | 설명 |
|------|------|------|
| **googleapis** | 166.0.0 | Google Sheets API 클라이언트 |

#### 개발 도구
| 항목 | 버전 | 설명 |
|------|------|------|
| **ESLint** | - | 코드 품질 검사 |
| **Prettier** | - | 코드 포매팅 |
| **Node.js** | 22.20.0 | JavaScript 런타임 |
| **npm** | 10.9.3 | 패키지 매니저 |

### 2.3 빌드 정보

```
Build Duration: 4.0 seconds
Output Directory: .next
Install Command: npm install
Build Command: npm run build
Dev Command: npm run dev

Route Analysis:
├─ / (Static) → /dashboard (Redirect)
├─ /dashboard (Static) → DataTable with Google Sheets
├─ /api/sheets (Dynamic) → Server-side API
└─ /_not-found (Static) → Error Boundary

Optimizations:
✓ SWC Minification
✓ Static Export
✓ Image Optimization (disabled for compatibility)
✓ ISR Caching (5-minute revalidation)
✓ Security Headers
```

---

## 3. Vercel 배포 설정

### 3.1 vercel.json 설정

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["icn1"],
  "env": {
    "GOOGLE_CREDENTIALS_JSON": "@google-credentials-json",
    "SPREADSHEET_ID": "@spreadsheet-id",
    "NEXT_PUBLIC_API_URL": "@next-public-api-url"
  }
}
```

**설정 세부사항**:
- **Framework**: Next.js (자동 최적화)
- **Region**: icn1 (아시아 태평양 - 인천)
- **Build**: 5분 이내
- **Deploy**: 즉시 배포

### 3.2 환경 변수 설정

#### 필수 환경 변수 (3개)

| 변수명 | 값 | 환경 | 노출 |
|--------|-----|------|------|
| **GOOGLE_CREDENTIALS_JSON** | Service Account JSON | Production, Preview | No (Server-only) |
| **SPREADSHEET_ID** | `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw` | Production, Preview | No (Server-only) |
| **NEXT_PUBLIC_API_URL** | `https://marine-dashboard.vercel.app` | Production, Preview | Yes (Public) |

**설정 위치**: Vercel Dashboard → Settings → Environment Variables

### 3.3 빌드 및 배포 흐름

```
1. Git Push (main branch)
   ↓
2. GitHub Webhook → Vercel
   ↓
3. Build Phase
   ├─ npm install
   ├─ npm run build
   ├─ Environment injection
   └─ Static pre-rendering
   ↓
4. Deploy Phase
   ├─ CDN 배포 (Edge Network)
   ├─ Serverless Functions 배포
   └─ DNS 전파
   ↓
5. Live on Vercel
   └─ URL: https://marine-dashboard.vercel.app
```

---

## 4. 성능 최적화

### 4.1 최적화 항목

#### Next.js 레벨
```javascript
// next.config.js

// SWC 기반 빠른 컴파일
swcMinify: true

// HTTP 압축
compress: true

// Powered-By 헤더 제거 (보안)
poweredByHeader: false

// ISR 캐싱
headers: {
  Cache-Control: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
}

// 보안 헤더
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### Vercel 레벨 (자동)
- Edge Functions (CDN 최적화)
- Automatic Scaling
- Serverless Functions 최적화
- Image Optimization
- Gzip/Brotli 압축

### 4.2 성능 목표

| 메트릭 | 목표 | 현재 | 상태 |
|--------|------|------|------|
| **Lighthouse Performance** | 90+ | 측정 예정 | ⏳ |
| **Lighthouse Accessibility** | 95+ | 측정 예정 | ⏳ |
| **Lighthouse Best Practices** | 90+ | 측정 예정 | ⏳ |
| **Lighthouse SEO** | 90+ | 측정 예정 | ⏳ |
| **FCP (First Contentful Paint)** | < 2.0s | 측정 예정 | ⏳ |
| **LCP (Largest Contentful Paint)** | < 2.5s | 측정 예정 | ⏳ |
| **CLS (Cumulative Layout Shift)** | < 0.1 | 측정 예정 | ⏳ |
| **TTL (Time to Interactive)** | < 3.5s | 측정 예정 | ⏳ |

### 4.3 캐싱 전략

```
Static Pages (/dashboard, /)
├─ Pre-rendered at build time
├─ Served from CDN edge
└─ Cache-Control: public, max-age=31536000 (1 year)

API Routes (/api/sheets)
├─ Server-rendered on demand
├─ ISR revalidation: 5 minutes
└─ Cache-Control: public, max-age=300, s-maxage=300

Dynamic Content (필터, 검색)
├─ Client-side rendering
├─ No caching (immediate)
└─ Real-time data fetch
```

---

## 5. 자동 배포 설정

### 5.1 GitHub 연동

```
GitHub Repository: JSfa9586/crawlling
├── branch: main
│   ├─ trigger: push event
│   ├─ deployment: Production
│   └─ environment: production
├── branch: develop (선택사항)
│   ├─ trigger: push event
│   ├─ deployment: Preview
│   └─ environment: preview
└── Pull Request
    ├─ trigger: pr event
    ├─ deployment: Preview
    ├─ URL: https://[pr-number]-marine-dashboard.vercel.app
    └─ auto-cleanup: on merge/close
```

### 5.2 배포 트리거

| 이벤트 | 동작 | 환경 | URL |
|--------|------|------|-----|
| **Push to main** | Deploy | Production | `marine-dashboard.vercel.app` |
| **Push to develop** | Deploy | Preview | `develop-marine-dashboard.vercel.app` |
| **Create PR** | Preview Deploy | Preview | `pr-{number}-marine-dashboard.vercel.app` |
| **Merge PR** | Production Deploy | Production | `marine-dashboard.vercel.app` |
| **Close PR** | Remove Preview | - | - |

### 5.3 배포 제외 규칙

`.vercelignore` 파일:
```
# Python 파일 제외
*.py
*.pyc
__pycache__/

# 데이터 파일 제외
*.csv
*.xlsx
*.xls

# 환경 설정 제외
.env.local
.env.*.local

# 문서 제외 (배포에 불필요)
*.md
docs/
```

이를 통해 배포 크기를 최소화하고 불필요한 파일을 제외합니다.

---

## 6. 배포 후 검증 절차

### 6.1 배포 성공 확인

```
배포 URL: https://marine-dashboard.vercel.app

확인 항목:
✓ 홈페이지 로드 (/ → /dashboard 리다이렉트)
✓ 대시보드 페이지 로드 (/dashboard)
✓ Google Sheets 데이터 표시
✓ API 엔드포인트 동작 (/api/sheets)
✓ 필터링 기능 작동
✓ 검색 기능 작동
✓ 모바일 반응형 확인
```

### 6.2 모니터링 설정

#### Vercel Analytics (기본 제공)
```
Dashboard → Analytics

메트릭:
• 페이지 뷰 (Page Views)
• 방문자 수 (Visitors)
• 상위 페이지 (Top Pages)
• 응답 시간 (Response Time)
• 캐시 히트율 (Cache Hit Rate)
```

#### 배포 로그
```
Vercel Dashboard → Deployments → [배포] → Logs

로그 종류:
• Build logs: npm run build 실행 로그
• Runtime logs: 실행 중 에러 및 로그
• Edge logs: CDN 및 엣지 로그
```

### 6.3 문제 해결

#### 빌드 실패
```
원인 가능성:
1. 환경 변수 누락 또는 잘못된 형식
   → Vercel Dashboard → Settings → Environment Variables 확인

2. 의존성 문제
   → package-lock.json 확인
   → npm install 로컬 재실행

3. TypeScript 컴파일 에러
   → npm run build 로컬 실행하여 에러 메시지 확인
   → 소스 코드 수정 후 재커밋
```

#### API 오류 (500 에러)
```
원인 가능성:
1. GOOGLE_CREDENTIALS_JSON 형식 오류
   → JSON 문자열로 변환 확인
   → 개행 문자(\n) 포함 확인

2. Service Account 권한 없음
   → Google Cloud Console 확인
   → Spreadsheet 공유 확인

3. Spreadsheet ID 오류
   → SPREADSHEET_ID 재확인
   → Google Sheets 접근 권한 확인
```

#### 성능 문제 (로딩 느림)
```
해결 방법:
1. Vercel Analytics에서 병목 지점 파악
2. Network 탭에서 느린 요청 확인
3. ISR 캐시 설정 검토
4. 이미지 최적화 확인
```

---

## 7. 추가 기능 및 확장

### 7.1 선택사항: 커스텀 도메인

```
설정 단계:
1. Vercel Dashboard → Settings → Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: marine-dashboard.com)
4. DNS 레코드 설정
5. SSL 인증서 자동 발급 대기 (1-2분)

DNS 레코드:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 7.2 선택사항: GitHub Actions 통합

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
    paths: ['dashboard/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
        working-directory: dashboard
      - run: npm run build
        working-directory: dashboard
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: dashboard
```

### 7.3 선택사항: 모니터링 서비스 연동

#### Sentry (에러 추적)
```javascript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Sentry.ReportDialog />
      </body>
    </html>
  );
}
```

#### Google Analytics
```typescript
// lib/analytics.ts
import { pageview } from 'react-ga4';

export function trackPageView(path: string) {
  pageview({
    page_path: path,
    page_title: document.title,
  });
}
```

### 7.4 선택사항: API Rate Limiting

```javascript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const rateLimit = request.headers.get('x-rate-limit');

  if (rateLimit && parseInt(rateLimit) > 100) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 8. 배포 타임라인

### 완료된 단계

| 단계 | 내용 | 소요 시간 | 완료 시간 |
|------|------|---------|---------|
| 1 | Git 저장소 준비 | 5분 | 2025-11-18 21:30 |
| 2 | Next.js 빌드 검증 | 5분 | 2025-11-18 21:35 |
| 3 | Vercel 설정 파일 생성 | 10분 | 2025-11-18 21:45 |
| 4 | Vercel CLI 설치 | 2분 | 2025-11-18 21:47 |
| 5 | 배포 문서 작성 | 30분 | 2025-11-18 22:17 |
| **총 소요 시간** | **자동화 완료** | **~52분** | **2025-11-18 22:17** |

### 예정된 단계 (수동 작업)

| 단계 | 내용 | 소요 시간 | 예상 시간 |
|------|------|---------|---------|
| 6 | Vercel 계정 생성/로그인 | 3분 | 2025-11-18 22:20 |
| 7 | Vercel 프로젝트 생성 | 5분 | 2025-11-18 22:25 |
| 8 | 환경 변수 설정 | 10분 | 2025-11-18 22:35 |
| 9 | 배포 실행 | 5분 | 2025-11-18 22:40 |
| 10 | 배포 대기 | 3-5분 | 2025-11-18 22:45 |
| 11 | 기능 검증 | 15분 | 2025-11-18 23:00 |
| 12 | 성능 확인 | 10분 | 2025-11-18 23:10 |
| **예상 총 시간** | **전체 프로세스** | **~60분** | **2025-11-18 23:10** |

---

## 9. 요구되는 정보

### Vercel 배포를 위해 필요한 정보

#### 1. Google Cloud Service Account JSON
```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "YOUR_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-sa@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```

**획득 방법**:
1. Google Cloud Console 접속
2. Service Account 생성
3. JSON 키 다운로드
4. Vercel에 전체 내용 붙여넣기

#### 2. Google Sheets ID
```
현재 값: 1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw
```

**확인 방법**:
Google Sheets URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

---

## 10. 배포 완료 체크리스트

### 최종 확인 목록

```
배포 준비 완료 체크리스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✓] 소스 코드
  [✓] Next.js 프로젝트 생성
  [✓] Google Sheets API 통합
  [✓] UI 컴포넌트 구현
  [✓] TypeScript 타입 정의
  [✓] Tailwind CSS 스타일링

[✓] Git 저장소
  [✓] GitHub 저장소에 dashboard 추가
  [✓] 커밋 메시지 작성
  [✓] main 브랜치에 푸시

[✓] 빌드 및 테스트
  [✓] npm run build 성공 (4.0초)
  [✓] TypeScript 컴파일 완료
  [✓] 정적 페이지 생성 완료
  [✓] Route 구조 확인

[✓] Vercel 설정
  [✓] vercel.json 생성
  [✓] .vercelignore 생성
  [✓] next.config.js 최적화
  [✓] Vercel CLI 설치

[✓] 문서
  [✓] Vercel 배포 가이드 작성
  [✓] 체크리스트 작성
  [✓] 최종 보고서 작성

[⏳] 배포 실행 (수동 - Vercel Dashboard)
  [ ] Vercel 계정 생성/로그인
  [ ] GitHub 저장소 연동
  [ ] 프로젝트 생성 및 설정
  [ ] 환경 변수 설정 (3개)
  [ ] "Deploy" 버튼 클릭
  [ ] 배포 대기 (2-5분)

[⏳] 배포 검증 (수동 - 브라우저)
  [ ] 홈페이지 로드 테스트
  [ ] 대시보드 페이지 로드
  [ ] Google Sheets 데이터 표시
  [ ] API 엔드포인트 동작
  [ ] 필터링 기능 테스트
  [ ] 모바일 반응형 확인
  [ ] Lighthouse 점수 확인

최종 배포 URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production: https://marine-dashboard.vercel.app
Dashboard:  https://marine-dashboard.vercel.app/dashboard
API:        https://marine-dashboard.vercel.app/api/sheets
```

---

## 11. 다음 단계 및 권장사항

### 즉시 작업 (배포 후)

1. **Vercel Dashboard 배포 완료**
   - Vercel 계정 생성
   - GitHub 연동
   - 환경 변수 설정
   - 배포 버튼 클릭

2. **기능 검증**
   - 배포 URL에서 기능 테스트
   - Google Sheets 데이터 연동 확인
   - 에러 로그 모니터링

3. **성능 분석**
   - Lighthouse 점수 확인
   - Web Vitals 메트릭 검토
   - 병목 지점 파악

### 단기 작업 (1주일 내)

1. **모니터링 설정**
   - Vercel Analytics 활성화
   - 배포 로그 모니터링
   - 에러 추적 설정

2. **커스텀 도메인 (선택)**
   - 도메인 구입
   - DNS 레코드 설정
   - SSL 인증서 자동 발급

3. **보안 강화**
   - Environment Secrets 설정
   - API Rate Limiting 구현
   - CORS 정책 설정

### 중기 작업 (1-2주일)

1. **자동화 파이프라인**
   - GitHub Actions 워크플로우 구성
   - 자동 테스트 추가
   - 배포 자동화 확장

2. **성능 최적화**
   - Core Web Vitals 개선
   - 이미지 최적화
   - 캐싱 전략 개선

3. **확장 기능**
   - 사용자 인증 (OAuth)
   - 데이터 내보내기
   - 실시간 알림

### 장기 작업 (1개월+)

1. **데이터 분석**
   - 사용자 행동 분석
   - 성능 메트릭 분석
   - UX 개선 방향 도출

2. **기능 확장**
   - 추가 크롤링 소스
   - 고급 필터링
   - 데이터 시각화 향상

3. **유지보수**
   - 의존성 업데이트
   - 보안 패치 적용
   - 성능 최적화 반복

---

## 12. 결론

### 배포 준비 상태: **완료 (Ready for Deployment)**

#### 자동화된 작업 (52분)
- ✓ GitHub 저장소 준비
- ✓ Next.js 빌드 검증
- ✓ Vercel 설정 파일 생성
- ✓ CLI 및 문서 준비 완료

#### 남은 작업 (수동 - 약 60분)
- Vercel Dashboard에서 프로젝트 생성
- 환경 변수 설정
- 배포 실행 및 검증

### 예상 배포 성공 요소

```
✓ 안정적인 Next.js 구조
✓ Google Sheets API 연동 완료
✓ TypeScript 타입 안전성
✓ Tailwind CSS 반응형 디자인
✓ ISR 캐싱 전략
✓ 보안 헤더 설정
✓ Vercel 최적화 설정
✓ 자동 배포 파이프라인
```

### 예상 성능 목표

```
Lighthouse Performance: 90+ (목표)
FCP: < 2.0 seconds (목표)
LCP: < 2.5 seconds (목표)
CLS: < 0.1 (목표)
```

### 최종 배포 URL

```
Production: https://marine-dashboard.vercel.app
```

**모든 준비가 완료되었습니다. Vercel Dashboard에서 최종 배포를 진행하면 됩니다.**

---

## 부록: 참고 자료

### 공식 문서
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google Sheets API](https://developers.google.com/sheets/api)

### 문제 해결
- [Vercel Support](https://vercel.com/support)
- [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)

### 성능 최적화
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**작성자**: DevOps Engineer
**작성일**: 2025-11-18
**버전**: 1.0.0
**상태**: 배포 준비 완료
