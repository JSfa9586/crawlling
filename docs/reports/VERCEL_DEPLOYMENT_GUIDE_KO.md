# Next.js 대시보드 Vercel 배포 가이드

## 개요
이 가이드는 Next.js 대시보드를 Vercel에 배포하는 단계별 과정을 설명합니다.

---

## 1단계: 사전 준비사항

### 필수 항목
- GitHub 계정 (이미 보유 중)
- Vercel 계정 (https://vercel.com)
- Google Cloud Service Account 자격증명
- Google Sheets ID

### 현재 상태 확인
```bash
# Git 상태 확인
cd C:\AI\251118
git status
git log --oneline -5

# 배포 가능 확인
cd dashboard
npm run build
```

---

## 2단계: Vercel Dashboard를 통한 배포 (권장)

### 2.1 Vercel 계정 생성/로그인
1. https://vercel.com 접속
2. GitHub 계정으로 로그인 또는 회원가입
3. GitHub 계정 연동 승인

### 2.2 새 프로젝트 생성
1. Vercel Dashboard에서 **"New Project"** 클릭
2. **"Import Git Repository"** 선택
3. GitHub 저장소 검색: `JSfa9586/crawlling`
4. 저장소 선택

### 2.3 프로젝트 설정
| 항목 | 값 | 설명 |
|------|-----|------|
| **Project Name** | `marine-dashboard` | 프로젝트 이름 |
| **Root Directory** | `dashboard` | 루트 디렉토리 위치 |
| **Framework Preset** | `Next.js` | 자동 감지됨 |
| **Build Command** | `npm run build` | 자동 설정 |
| **Output Directory** | `.next` | 자동 설정 |
| **Install Command** | `npm install` | 자동 설정 |

**설정 화면:**
```
Project Name: [marine-dashboard]
Root Directory: [dashboard] ✓

Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2.4 환경 변수 설정

**Vercel Dashboard → Settings → Environment Variables**

다음 환경 변수들을 추가하세요:

#### 1) GOOGLE_CREDENTIALS_JSON
- **값**: Google Cloud Service Account JSON 전체
- **형식**: JSON 문자열
- **예시**:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-sa@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```
- **환경**: Production, Preview
- **노출**: 아니오 (Server-side only)

#### 2) SPREADSHEET_ID
- **값**: `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw`
- **환경**: Production, Preview

#### 3) NEXT_PUBLIC_API_URL
- **값 (Production)**: `https://marine-dashboard.vercel.app`
- **값 (Preview)**: `https://[branch-name]-marine-dashboard.vercel.app`
- **환경**: Production, Preview

### 2.5 배포 실행
1. 환경 변수 설정 완료 후 **"Deploy"** 클릭
2. 배포 진행 상황 모니터링 (2-5분 소요)
3. 배포 완료 시 프로젝트 URL 확인

**배포 URL 형식**:
- Production: `https://marine-dashboard.vercel.app`
- Preview: `https://[pr-number]-marine-dashboard.vercel.app`

---

## 3단계: 자동 배포 설정

### 3.1 GitHub 연동 확인
Vercel은 자동으로 GitHub과 연동됩니다:

| 이벤트 | 동작 | 환경 |
|--------|------|------|
| `main` 브랜치 푸시 | 자동 배포 | Production |
| Pull Request 생성 | Preview 배포 | Preview |
| Pull Request 병합 | Production 배포 | Production |
| Pull Request 닫기 | Preview 배포 제거 | - |

### 3.2 배포 트리거 설정 (선택사항)
**Settings → Git → Deploy on Push**

```
Enabled: ✓
Auto-deploy on main branch: ✓
Ignore Build Step:
  (배포 대상 변경 시만 배포)
```

### 3.3 .vercelignore 확인
파일 위치: `dashboard/.vercelignore`

이미 배포되어 있습니다. 다음 항목들을 제외합니다:
- Python 파일 (`*.py`)
- CSV/Excel 데이터 (`*.csv`, `*.xlsx`)
- 로컬 환경 변수 (`.env.local`)
- 문서 파일 (`*.md`)

---

## 4단계: 배포 검증

### 4.1 배포 상태 확인
Vercel Dashboard에서:
1. **Deployments** 탭 확인
2. 최신 배포의 상태 확인
3. "Building" → "Ready"로 변경 대기

### 4.2 성능 메트릭 확인
Vercel Dashboard → **Analytics**

목표 점수:
- **Lighthouse Performance**: 85+
- **Core Web Vitals**: 녹색
- **Build Duration**: < 3분
- **First Contentful Paint**: < 2초

### 4.3 기능 테스트
배포된 URL에서:

```
https://marine-dashboard.vercel.app
```

**체크리스트:**
- [ ] 홈페이지 (`/`) 로드
  - 리다이렉트되어 `/dashboard` 표시
- [ ] 대시보드 페이지 로드
  - 표 데이터 표시 여부 확인
  - Google Sheets 연동 동작 확인
- [ ] API Route 테스트
  - `/api/sheets` 호출
  - JSON 데이터 반환 확인
- [ ] 필터 기능 테스트
  - 카테고리 필터 동작
  - 텍스트 검색 동작
  - 날짜 범위 필터 동작
- [ ] 모바일 반응형 확인
  - 개발자 도구에서 모바일 크기로 조정
  - 레이아웃 및 기능 동작 확인

### 4.4 링크 테스트
```
GET https://marine-dashboard.vercel.app/api/sheets?category=공고
GET https://marine-dashboard.vercel.app/dashboard
```

---

## 5단계: 커스텀 도메인 설정 (선택사항)

### 5.1 도메인 추가
1. Vercel Dashboard → **Settings** → **Domains**
2. **"Add Domain"** 클릭
3. 도메인 입력 (예: `marine-dashboard.com`)

### 5.2 DNS 레코드 설정
제공된 DNS 레코드 추가:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

또는

```
Type: A
Name: @
Value: 76.76.19.165
```

### 5.3 SSL 인증서
- 자동 발급됨 (1-2분 소요)
- "SSL Certificate Active" 표시 확인

---

## 6단계: 모니터링 및 로깅

### 6.1 Vercel Analytics
**Settings → Integrations** 또는 Dashboard에서:

메트릭:
- 페이지 뷰
- 방문자 수
- 상위 페이지
- 응답 시간

### 6.2 배포 로그 확인
Vercel Dashboard → **Deployments** → 배포 선택 → **Logs**

에러 추적:
- Build logs: 빌드 과정 로그
- Runtime logs: 실행 중 에러
- Edge logs: CDN 로그

### 6.3 환경 변수 검증

배포 후 환경 변수 확인:
```
Vercel Dashboard → Settings → Environment Variables

변수 확인:
- GOOGLE_CREDENTIALS_JSON: 설정됨 (값 마스킹됨)
- SPREADSHEET_ID: 표시
- NEXT_PUBLIC_API_URL: 표시
```

---

## 7단계: 문제 해결

### 빌드 실패

**증상**: "Build failed" 표시

**해결 방법**:
1. Vercel Dashboard의 빌드 로그 확인
2. 환경 변수 재확인
3. 로컬에서 `npm run build` 테스트
4. 의존성 버전 확인

**일반적인 원인**:
```
Error: GOOGLE_CREDENTIALS_JSON is undefined
→ 환경 변수 설정 확인

Error: SPREADSHEET_ID not found
→ Spreadsheet ID 확인

Error: googleapis not installed
→ package.json 의존성 확인 (package-lock.json과 동기화)
```

### API 오류

**증상**: `/api/sheets` 호출 시 500 에러

**해결 방법**:
1. GOOGLE_CREDENTIALS_JSON 형식 확인 (JSON 문자열)
2. Service Account 권한 확인
3. Spreadsheet 공유 설정 확인
4. Vercel 런타임 로그 확인

### 성능 문제

**증상**: 로딩 시간 > 3초

**해결 방법**:
1. Vercel Analytics에서 메트릭 확인
2. Network 탭에서 느린 요청 확인
3. ISR 캐시 전략 검토
4. 이미지 최적화 확인

---

## 8단계: 배포 후 관리

### 8.1 자동 재배포
```
main 브랜치에 푸시
    ↓
Vercel 자동 감지
    ↓
빌드 시작
    ↓
배포 완료
    ↓
Preview/Production 업데이트
```

### 8.2 환경 변수 업데이트
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. 변수 수정 및 저장
3. 새로운 배포 트리거 (Git 푸시 또는 수동 재배포)

### 8.3 롤백 및 복구
Vercel Dashboard → **Deployments**에서:
1. 이전 배포 선택
2. **"Promote to Production"** 클릭
3. 이전 버전으로 복구됨

---

## 9단계: 성능 최적화

### Next.js 최적화
파일: `dashboard/next.config.js`

- SWC 압축 활성화: `swcMinify: true`
- 보안 헤더 설정
- ISR 캐싱: `/api/sheets` → 5분
- 이미지 최적화

### Vercel 최적화 자동 적용
- Edge Middleware (선택사항)
- Serverless Functions 최적화
- CDN 캐싱
- 자동 스케일링

---

## 10단계: 배포 완료

### 최종 확인 목록

```
배포 완료 체크리스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✓] GitHub 저장소에 dashboard 추가
[✓] Vercel 계정 생성/로그인
[✓] Vercel 프로젝트 생성 및 설정
[✓] 환경 변수 설정 (3개 항목)
[✓] 자동 배포 설정 (GitHub 연동)
[✓] 빌드 성공 및 배포 완료
[✓] 기능 테스트 통과
[✓] 모니터링 설정 (선택사항)

배포 URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production: https://marine-dashboard.vercel.app
Dashboard: https://marine-dashboard.vercel.app/dashboard
API: https://marine-dashboard.vercel.app/api/sheets
```

---

## 추가 리소스

### 공식 문서
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

### 문제 해결
- [Vercel Support](https://vercel.com/support)
- [GitHub Issues](https://github.com/JSfa9586/crawlling/issues)

### 모니터링 및 분석
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)

---

## 다음 단계

배포 후 권장사항:

1. **커스텀 도메인 설정**
   - DNS 레코드 설정
   - SSL 인증서 자동 발급

2. **모니터링 강화**
   - Sentry 또는 LogRocket 연동
   - 성능 모니터링 설정

3. **CI/CD 파이프라인 구성**
   - GitHub Actions 활용
   - 자동 테스트 (Unit, Integration)
   - 자동 배포 검증

4. **보안 강화**
   - Environment Secret 설정
   - API Rate Limiting
   - CORS 정책 설정

5. **분석 및 최적화**
   - Google Analytics 연동
   - 사용자 행동 분석
   - 성능 개선 반복

---

**문서 작성일**: 2025-11-18
**버전**: 1.0.0
**상태**: 초기 배포 완료
