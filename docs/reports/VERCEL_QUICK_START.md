# Vercel 배포 빠른 시작 (5분 안내)

**상태**: 배포 준비 완료 ✓
**소요 시간**: 약 5분 (Vercel 계정 있는 경우)

---

## 1단계: Vercel 접속 (1분)

```
1. 웹브라우저 열기
2. https://vercel.com 접속
3. "Log In" 클릭
4. GitHub 계정으로 로그인
```

---

## 2단계: 새 프로젝트 생성 (2분)

```
1. Vercel Dashboard 페이지에서 "New Project" 버튼 클릭
2. "Import Git Repository" 선택
3. GitHub 검색창에 "JSfa9586/crawlling" 입력
4. 저장소 선택 후 "Import" 클릭
```

**프로젝트 설정:**
```
Project Name: marine-dashboard (또는 선택한 이름)
Root Directory: dashboard ✓ (중요!)
Framework: Next.js (자동 감지)
Build Settings: (모두 자동 설정)
```

"Deploy" 버튼은 **아직 누르지 마세요!**

---

## 3단계: 환경 변수 설정 (2분)

### 매우 중요: 배포 전에 반드시 설정해야 합니다!

#### 방법 A: 배포 전 설정 (권장)

Vercel 프로젝트 생성 페이지에서:
```
1. "Environment Variables" 섹션 찾기
2. 아래 3개 항목을 모두 추가
3. 그 후 "Deploy" 버튼 클릭
```

#### 방법 B: 배포 후 설정

배포 후 Vercel Dashboard에서:
```
1. 프로젝트 선택
2. Settings → Environment Variables
3. 아래 3개 항목 추가
4. 재배포 (Redeploy)
```

### 환경 변수 3개

#### 1️⃣ GOOGLE_CREDENTIALS_JSON

**변수명**: `GOOGLE_CREDENTIALS_JSON`

**값**: Google Cloud Service Account JSON 전체

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**환경**: Production, Preview 모두 선택

**팁**:
- Google Cloud Console에서 Service Account JSON 다운로드
- 전체 내용을 복사해서 붙여넣기
- 개행 문자(\n)는 그대로 유지

#### 2️⃣ SPREADSHEET_ID

**변수명**: `SPREADSHEET_ID`

**값**: `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw`

**환경**: Production, Preview 모두 선택

#### 3️⃣ NEXT_PUBLIC_API_URL

**변수명**: `NEXT_PUBLIC_API_URL`

**값**: `https://marine-dashboard.vercel.app`

**환경**: Production, Preview 모두 선택

**참고**: 프로젝트 이름을 다르게 설정했다면 URL도 변경 필요
```
https://[your-project-name].vercel.app
```

---

## 4단계: 배포! (클릭 1번)

```
"Deploy" 버튼 클릭
```

배포 진행:
```
Building...     (1-2분)
   ↓
Ready          (배포 완료!)
   ↓
Live at: https://marine-dashboard.vercel.app
```

---

## 5단계: 확인 (30초)

배포 완료 후:

```
1. 제공된 URL 클릭
   https://marine-dashboard.vercel.app

2. 페이지 로드 확인
   - 홈페이지 → 대시보드로 자동 리다이렉트
   - 데이터 테이블 표시 확인

3. 기능 테스트
   □ 필터링 작동 확인
   □ 검색 기능 작동 확인
   □ 모바일 화면 확인
```

---

## 완료!

```
배포 URL: https://marine-dashboard.vercel.app

자동 배포 설정됨:
✓ main 브랜치 푸시 → 자동 배포
✓ Pull Request → Preview 자동 생성
✓ GitHub과 자동 동기화
```

---

## 문제 해결 (TroubleShooting)

### ❌ 빌드 실패 (Build Error)

**증상**: "Build failed" 표시

**해결**:
```
1. Vercel Dashboard → Deployments
2. 실패한 배포 클릭 → "Logs" 확인
3. 에러 메시지 읽기
4. 보통 환경 변수 문제
   → Settings → Environment Variables 다시 확인
5. "Redeploy" 클릭하여 재배포
```

### ❌ API 오류 (API Error)

**증상**: 데이터가 표시되지 않거나 500 에러

**해결**:
```
1. GOOGLE_CREDENTIALS_JSON 재확인
   - JSON 형식 정확한지 확인
   - 따옴표 이스케이프 확인

2. SPREADSHEET_ID 확인
   - Google Sheets URL에서 ID 추출
   - 공백 없이 정확히 입력

3. Google Cloud Service Account 권한 확인
   - Google Sheets 공유 설정 확인
   - Service Account 이메일에 권한 있는지 확인
```

### ❌ 배포 후에도 환경 변수를 설정하지 않음

**증상**: "Cannot find module" 또는 undefined 에러

**해결**:
```
1. Settings → Environment Variables에서 3개 항목 모두 설정
2. "Redeploy" 버튼 클릭
3. 배포 대기 (2-3분)
```

---

## 자동 배포 (이미 설정됨)

```
GitHub에서 코드 변경 후:

$ git add .
$ git commit -m "fix: 버그 수정"
$ git push origin main

   ↓ (자동 감지)

Vercel이 자동으로:
1. 코드 가져오기
2. npm run build 실행
3. 배포
4. https://marine-dashboard.vercel.app 업데이트

완료! 🎉
```

---

## 다음 단계

### 배포 후 10분 내 추천 작업

```
□ Vercel Analytics 활성화
  Settings → Analytics → Enable Web Analytics

□ 배포 URL 테스트
  https://marine-dashboard.vercel.app/dashboard

□ 모바일 반응형 확인
  브라우저 개발자 도구 (F12) → 반응형 모드

□ 성능 측정
  Lighthouse 점수 확인 (F12 → Lighthouse)
```

### 선택사항

```
□ 커스텀 도메인 추가
  Settings → Domains → Add Domain

□ 모니터링 설정
  Settings → Integrations (Sentry, LogRocket 등)

□ GitHub Actions 자동화
  .github/workflows/deploy.yml 추가
```

---

## 주요 URL

| 항목 | URL |
|------|-----|
| **배포 사이트** | https://marine-dashboard.vercel.app |
| **대시보드** | https://marine-dashboard.vercel.app/dashboard |
| **API 엔드포인트** | https://marine-dashboard.vercel.app/api/sheets |
| **GitHub 저장소** | https://github.com/JSfa9586/crawlling |
| **Vercel 대시보드** | https://vercel.com/dashboard |

---

## 도움말

### 자세한 문서

- `VERCEL_DEPLOYMENT_GUIDE_KO.md`: 10단계 상세 가이드
- `VERCEL_DEPLOYMENT_CHECKLIST.md`: 체크리스트 및 설정
- `VERCEL_DEPLOYMENT_FINAL_REPORT_KO.md`: 최종 보고서

### 문제 해결

문제 발생 시:
1. Vercel 대시보드의 로그 확인
2. 환경 변수 재확인
3. 로컬에서 `npm run build` 실행하여 테스트
4. GitHub Issue 검색

---

**준비 완료! 이제 Vercel에서 배포하면 됩니다.** 🚀
