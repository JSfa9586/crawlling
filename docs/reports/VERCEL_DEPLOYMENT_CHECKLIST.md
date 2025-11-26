# Vercel 배포 체크리스트 및 단계별 작업

## 작업 요약

| 항목 | 상태 | 완료 날짜 |
|------|------|---------|
| 1. Git 저장소 준비 | ✓ 완료 | 2025-11-18 |
| 2. Next.js 빌드 테스트 | ✓ 완료 | 2025-11-18 |
| 3. Vercel 설정 파일 생성 | ✓ 완료 | 2025-11-18 |
| 4. Vercel CLI 설치 | ✓ 완료 | 2025-11-18 |
| 5. Vercel 프로젝트 배포 | ⏳ 대기 | - |
| 6. 환경 변수 설정 | ⏳ 대기 | - |
| 7. 기능 검증 | ⏳ 대기 | - |
| 8. 성능 최적화 | ⏳ 대기 | - |

---

## 1단계: Git 저장소 준비 (완료)

### ✓ 완료된 작업

```bash
# 1. Dashboard 디렉토리 추가
git add dashboard/
git commit -m "feat: Next.js 대시보드 추가"
git push origin main

# 2. Vercel 설정 파일 추가
git add dashboard/vercel.json dashboard/.vercelignore
git commit -m "chore: Vercel 배포 설정 파일 추가"
git push origin main
```

### 결과
- ✓ GitHub 저장소에 dashboard 업로드 완료
- ✓ 모든 파일이 main 브랜치에 푸시됨
- ✓ Git 커밋 히스토리: 2개 신규 커밋

```
Commit 1: feat: Next.js 대시보드 추가 (33 files, 2979 insertions)
Commit 2: chore: Vercel 배포 설정 파일 추가 (2 files, 59 insertions)
```

---

## 2단계: Next.js 빌드 테스트 (완료)

### ✓ 완료된 작업

```bash
npm run build
```

### 빌드 결과
```
✓ Compiled successfully in 4.0s
✓ TypeScript 검증 완료
✓ 정적 페이지 생성 완료 (5/5)
✓ Route 최적화 완료

Route 구조:
├ ○ / (정적, 리다이렉트 → /dashboard)
├ ○ /dashboard (정적, 메인 대시보드)
├ ○ /_not-found (정적, 에러 페이지)
└ ƒ /api/sheets (동적, 서버 렌더링)

○  정적 사전 렌더링됨
ƒ  동적 요청 시 서버 렌더링
```

### 주의사항
- Metadata viewport 경고: 무해함 (Next.js 16.0+ 기능)
- PostCSS 모듈 경고: 성능 영향 없음

---

## 3단계: Vercel 설정 파일 생성 (완료)

### ✓ 생성된 파일

#### 1. `dashboard/vercel.json`
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

**기능**:
- 빌드 명령어 명시
- 한국(인천) 리전 설정
- 환경 변수 참조

#### 2. `dashboard/.vercelignore`
```
# 제외 항목
*.py, *.pyc          # Python 파일
*.csv, *.xlsx        # 데이터 파일
.env.local           # 로컬 환경
*.md                 # 문서 파일
__pycache__, docs/   # 캐시 및 문서
```

**기능**:
- 배포 크기 최소화
- 불필요한 파일 제외

---

## 4단계: Vercel CLI 설치 (완료)

### ✓ 설치 결과

```
✓ Vercel CLI 설치 완료
✓ 글로벌 패키지: 277개 추가
✓ 종속성 해결됨
```

### 설치된 패키지
- vercel (CLI)
- 기타 277개 의존성

---

## 5단계: Vercel 프로젝트 배포 (대기 - 수동 작업 필요)

### 필수 단계

#### Step 5.1: Vercel 계정 생성/로그인

```
웹사이트: https://vercel.com
1. "Log In" 클릭
2. GitHub 계정으로 로그인
3. GitHub 계정 권한 승인
```

#### Step 5.2: 새 프로젝트 생성

```
1. Vercel Dashboard 접속
2. "New Project" 클릭
3. "Import Git Repository" 선택
4. GitHub 저장소 검색: JSfa9586/crawlling
5. 저장소 선택
```

#### Step 5.3: 프로젝트 설정

| 설정 항목 | 값 | 비고 |
|----------|-----|------|
| Project Name | `marine-dashboard` | 원하는 이름 선택 가능 |
| Root Directory | `dashboard` | ✓ 필수 설정 |
| Framework | `Next.js` | 자동 감지 |
| Build Command | `npm run build` | 자동 설정 |
| Install Command | `npm install` | 자동 설정 |
| Output Directory | `.next` | 자동 설정 |

---

## 6단계: 환경 변수 설정 (대기 - 수동 작업 필요)

### 필수 환경 변수 3개

#### 6.1 GOOGLE_CREDENTIALS_JSON

**설명**: Google Cloud Service Account JSON 전체

**값 형식**: JSON 문자열
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

**설정 위치**:
1. Vercel Dashboard → Settings → Environment Variables
2. Variable Name: `GOOGLE_CREDENTIALS_JSON`
3. Value: 전체 JSON 내용 붙여넣기
4. Environment: Production + Preview 선택
5. "Add" 클릭

**주의사항**:
- JSON 개행 문자 유지 필수
- 따옴표 이스케이프 필요 시 처리
- 자동으로 마스킹됨 (보안)

#### 6.2 SPREADSHEET_ID

**설명**: Google Sheets 스프레드시트 ID

**값**: `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw`

**설정 위치**:
1. Environment Variables 페이지
2. Variable Name: `SPREADSHEET_ID`
3. Value: 위 ID 입력
4. Environment: Production + Preview
5. "Add" 클릭

**확인 방법**:
Google Sheets URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

#### 6.3 NEXT_PUBLIC_API_URL

**설명**: Next.js 공개 API URL (클라이언트에서 접근 가능)

**값**:
- Production: `https://marine-dashboard.vercel.app`
- Preview: `https://[branch-name]-marine-dashboard.vercel.app`

**설정 위치**:
1. Environment Variables 페이지
2. Variable Name: `NEXT_PUBLIC_API_URL`
3. Value: 위 URL 입력 (Production의 경우)
4. Environment: Production + Preview
5. "Add" 클릭

**참고**:
- `NEXT_PUBLIC_` 접두사: 클라이언트 측 노출
- 빌드 시점에 값이 고정됨

### 환경 변수 설정 완료 확인

```
Vercel Dashboard → Settings → Environment Variables

[✓] GOOGLE_CREDENTIALS_JSON
    ├ Environment: Production, Preview
    └ Value: (마스킹됨)

[✓] SPREADSHEET_ID
    ├ Environment: Production, Preview
    └ Value: 1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw

[✓] NEXT_PUBLIC_API_URL
    ├ Environment: Production, Preview
    └ Value: https://marine-dashboard.vercel.app
```

---

## 7단계: 기능 검증 (대기)

### 배포 후 확인 절차

#### 7.1 빌드 상태 확인

```
Vercel Dashboard → Deployments

배포 상태:
⏳ Building... → ✓ Ready (2-5분 소요)
```

#### 7.2 기본 기능 테스트

```
배포 URL: https://marine-dashboard.vercel.app

테스트 항목:
□ 홈페이지 접속: GET /
  └ 기대값: /dashboard로 리다이렉트

□ 대시보드 로드: GET /dashboard
  └ 기대값: 데이터 테이블 표시

□ API 호출: GET /api/sheets
  └ 기대값: JSON 데이터 반환

□ 필터링: 카테고리 선택
  └ 기대값: 데이터 필터됨

□ 검색: 텍스트 입력
  └ 기대값: 검색 결과 표시
```

#### 7.3 모바일 반응형 확인

```
디바이스별 테스트:
□ 모바일 (375px)
  └ 레이아웃 깨짐 확인, 터치 반응성

□ 태블릿 (768px)
  └ 2열 레이아웃, 상호작용 동작

□ 데스크톱 (1024px+)
  └ 3열 이상 레이아웃, 전체 기능
```

#### 7.4 브라우저 호환성

```
테스트 브라우저:
□ Chrome (최신)
□ Firefox (최신)
□ Safari (최신)
□ Edge (최신)
```

---

## 8단계: 성능 최적화 (대기)

### 성능 메트릭 목표

| 메트릭 | 목표 | 도구 |
|--------|------|------|
| **Performance** | 90+ | Lighthouse |
| **Accessibility** | 95+ | Lighthouse |
| **Best Practices** | 90+ | Lighthouse |
| **SEO** | 90+ | Lighthouse |
| **First Contentful Paint (FCP)** | < 2초 | Web Vitals |
| **Largest Contentful Paint (LCP)** | < 2.5초 | Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Web Vitals |

### Lighthouse 점수 확인

```
1. Vercel Dashboard → Analytics
2. 최신 배포 선택
3. "View Lighthouse Report" 클릭
4. 점수 확인 및 개선 항목 검토
```

### 최적화 완료 항목

```
next.config.js 설정:
✓ SWC 압축 활성화 (swcMinify: true)
✓ HTTP 압축 활성화 (compress: true)
✓ Powered-By 헤더 제거 (poweredByHeader: false)
✓ ISR 캐싱 설정 (5분)
✓ 보안 헤더 설정

package.json 의존성:
✓ Next.js 16.0.3 (최신)
✓ React 19.2.0 (최신)
✓ TypeScript 5.9.3 (최신)
✓ Tailwind CSS 4.1.17 (최신)
```

---

## 수동 작업 가이드

### 현재 상태
```
✓ 자동 작업: 완료
⏳ 수동 작업: 대기

다음 단계:
1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. Repository: JSfa9586/crawlling 선택
5. Root Directory: dashboard 설정
6. 환경 변수 3개 추가 (GOOGLE_CREDENTIALS_JSON, SPREADSHEET_ID, NEXT_PUBLIC_API_URL)
7. "Deploy" 클릭
8. 배포 완료 대기 (2-5분)
```

---

## 완료 조건

### 배포 성공 시 확인 항목

```
배포 완료 체크리스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✓] GitHub 저장소: dashboard 추가 완료
[✓] 빌드 테스트: npm run build 성공
[✓] Vercel 설정 파일: vercel.json, .vercelignore 생성
[✓] Vercel CLI: 글로벌 설치 완료
[⏳] Vercel 프로젝트: 생성 대기
[⏳] 환경 변수: 설정 대기
[⏳] 배포: 실행 대기
[⏳] 기능 검증: 테스트 대기
[⏳] 성능 최적화: 확인 대기

최종 결과:
• 배포 URL: https://marine-dashboard.vercel.app
• 자동 배포: GitHub main 브랜치 푸시 시 자동 배포
• 환경 변수: Production/Preview 모두 설정됨
• 모니터링: Vercel Analytics 활성화
```

---

## 자동 배포 흐름

```
GitHub main 브랜치에 푸시
    ↓
Vercel 자동 감지 (webhook)
    ↓
빌드 시작 (npm run build)
    ↓
환경 변수 주입
    ↓
테스트 실행 (선택사항)
    ↓
배포 진행
    ↓
새 URL 생성: https://marine-dashboard.vercel.app
    ↓
DNS 전파 (즉시)
    ↓
배포 완료 ✓
```

---

## 예상 일정

| 단계 | 소요 시간 | 상태 |
|------|----------|------|
| 1. Git 준비 | 5분 | ✓ 완료 |
| 2. 빌드 테스트 | 2분 | ✓ 완료 |
| 3. 설정 파일 | 5분 | ✓ 완료 |
| 4. CLI 설치 | 1분 | ✓ 완료 |
| **5. Vercel 배포** | **5분** | **⏳ 대기** |
| **6. 환경 변수 설정** | **5분** | **⏳ 대기** |
| **7. 기능 검증** | **10분** | **⏳ 대기** |
| **8. 성능 최적화** | **10분** | **⏳ 대기** |
| **총 예상 시간** | **~45분** | - |

---

## 다음 단계

### 배포 후 작업

```
1. 커스텀 도메인 설정 (선택)
   - Vercel → Settings → Domains
   - DNS 레코드 설정

2. 모니터링 강화
   - Sentry 연동
   - LogRocket 연동
   - Google Analytics 설정

3. CI/CD 파이프라인
   - GitHub Actions 워크플로우
   - 자동 테스트
   - 배포 자동화

4. 보안 강화
   - Environment Secrets 사용
   - API Rate Limiting
   - CORS 정책 설정

5. 성능 개선
   - Core Web Vitals 최적화
   - 이미지 최적화
   - 캐싱 전략 개선
```

---

**문서 버전**: 1.0.0
**작성일**: 2025-11-18
**상태**: 초기 배포 준비 완료
