# 배포 전 필수 조치 사항 (Action Plan)

**작성일**: 2025-11-18
**목표**: 배포 승인을 위한 필수 3가지 조치 완료
**예상 소요 시간**: 50분

---

## 개요

배포 승인을 위해서는 다음 3가지 필수 조치를 완료해야 합니다.

| # | 조치 사항 | 우선순위 | 소요시간 | 상태 |
|---|---------|---------|--------|------|
| 1 | 대시보드 API 통합 | 🔴 CRITICAL | 15-20분 | ⏳ 필수 |
| 2 | Vercel 환경 변수 설정 | 🔴 CRITICAL | 5-10분 | ⏳ 필수 |
| 3 | 로컬 통합 테스트 | 🔴 CRITICAL | 10-15분 | ⏳ 필수 |

**예상 완료 시간**: 2025-11-18 자정 전

---

## Action 1: 대시보드 API 통합

### 목표
대시보드가 실제 Google Sheets 데이터를 표시하도록 수정

### 현재 상태
```typescript
// dashboard/app/dashboard/page.tsx (라인 36-62)

const fetchData = async () => {
  try {
    setIsLoading(true);
    setError(null);

    // ❌ 현재: TODO 상태 (API 호출 주석 처리됨)
    // const response = await fetch('/api/sheets');
    // const result = await response.json();

    // ❌ 현재: 샘플 데이터만 표시
    const sampleData: CrawlingData[] = [
      { 기관구분: '청', 기관명: '해양수산부', ... },
      { 기관구분: '청', 기관명: '해양수산부', ... },
    ];

    setData(sampleData);
    setStats({
      총게시물수: sampleData.length,      // 현재: 항상 2
      기관수: 1,                          // 현재: 항상 1
      최근업데이트: new Date().toLocaleString('ko-KR'),
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

### 필요한 수정

#### Step 1: API 호출 활성화

```typescript
// dashboard/app/dashboard/page.tsx (라인 36-73)

const fetchData = async () => {
  try {
    setIsLoading(true);
    setError(null);

    // ✓ API에서 데이터 가져오기
    const response = await fetch('/api/sheets?type=data');

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '데이터 조회 실패');
    }

    // ✓ API 응답에서 데이터 추출
    const data: CrawlingData[] = result.data || [];

    if (data.length === 0) {
      setError('수집된 데이터가 없습니다. 나중에 다시 시도해주세요.');
      setData([]);
      setStats({
        총게시물수: 0,
        기관수: 0,
        최근업데이트: new Date().toLocaleString('ko-KR'),
      });
      return;
    }

    // ✓ 데이터 업데이트
    setData(data);

    // ✓ 통계 계산
    const organizationNames = new Set(data.map(d => d.기관명));
    const latestDate = Math.max(...data.map(d => new Date(d.작성일).getTime()));

    setStats({
      총게시물수: data.length,
      기관수: organizationNames.size,
      최근업데이트: new Date(latestDate).toLocaleString('ko-KR'),
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.';
    console.error('API 오류:', errorMessage);
    setError(errorMessage);
    setData([]);
  } finally {
    setIsLoading(false);
  }
};
```

### 수정 방법

#### Option A: 파일 직접 수정 (권장)

1. **파일 열기**:
   ```bash
   code dashboard/app/dashboard/page.tsx
   ```

2. **36-73줄 교체**:
   - 기존 `fetchData` 함수 전체 제거
   - 위 코드로 교체

3. **저장** (Ctrl+S)

#### Option B: sed 명령어로 수정

```bash
# 현재 디렉토리: C:\AI\251118
cd dashboard

# 변경 사항 확인
git diff app/dashboard/page.tsx

# 변경 사항 커밋
git add app/dashboard/page.tsx
git commit -m "fix: API 통합 (Google Sheets 데이터 실시간 표시)"
```

### 검증

```bash
# 1. 빌드 테스트
npm run build

# 출력:
# ✓ Compiled successfully
# ✓ TypeScript 컴파일 완료

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 확인
# URL: http://localhost:3000/dashboard
# 확인 사항:
# ✓ 페이지 로드됨
# ✓ "로딩 중..." 메시지 표시
# ✓ 약 2-3초 후 데이터 표시 (또는 에러 메시지)
```

### 예상 결과

**성공한 경우**:
```
✓ 페이지 로드
✓ "로딩 중..." → 데이터 표시
✓ 통계 카드 업데이트:
  - 총 게시물: XX (0이 아님)
  - 기관 수: YY (1 이상)
  - 최근 업데이트: 현재 시간
✓ 데이터 테이블 채워짐
✓ 필터링 작동
```

**실패한 경우**:
```
✗ "API 오류" 메시지
→ 원인 분석 (아래 참조)
```

### 문제 해결

#### 문제 1: "TypeError: Cannot read property 'data' of undefined"

**원인**: API 응답 형식 오류

**해결**:
1. 개발자 도구 (F12) → Network 탭
2. `/api/sheets` 요청 확인
3. Response 확인
4. 응답 형식이 `{ success: true, data: [...] }` 형식인지 확인

#### 문제 2: "CORS 오류"

**원인**: API 호스트 오류

**해결**:
```javascript
// app/api/sheets/route.ts에서 확인
// Response에 CORS 헤더 확인
headers: {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}
```

#### 문제 3: "API 타임아웃"

**원인**: Google Sheets API 느림

**해결**:
```typescript
// 타임아웃 증가
const response = await fetch('/api/sheets?type=data', {
  signal: AbortSignal.timeout(10000), // 10초
});
```

---

## Action 2: Vercel 환경 변수 설정

### 목표
Vercel에 Google Sheets 연동을 위한 환경 변수 3개 설정

### 필수 환경 변수

| 변수명 | 값 | 필수여부 | 설명 |
|--------|-----|---------|------|
| **GOOGLE_CREDENTIALS_JSON** | Service Account JSON 전체 내용 | 필수 | Google Sheets API 인증 |
| **SPREADSHEET_ID** | `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw` | 필수 | Google Sheets 문서 ID |
| **NEXT_PUBLIC_API_URL** | `https://marine-dashboard.vercel.app` | 권장 | 대시보드 API URL |

### Step 1: Vercel 로그인

```bash
# Option A: CLI로 로그인
vercel login

# Option B: 브라우저에서 로그인
# https://vercel.com/login
```

### Step 2: Vercel Dashboard에서 설정

#### 2-1. Vercel Dashboard 접속
```
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택: "crawlling" (또는 새로 생성)
```

#### 2-2. Settings로 이동
```
1. 프로젝트 페이지
2. 상단 탭: "Settings" 클릭
```

#### 2-3. Environment Variables 섹션
```
1. 왼쪽 메뉴: "Environment Variables"
2. "Add New" 버튼 클릭
```

#### 2-4. 변수 1 추가: GOOGLE_CREDENTIALS_JSON
```
이름: GOOGLE_CREDENTIALS_JSON
값: gen-lang-client-0556505482-e847371ea87e.json 파일의 전체 내용 (JSON)

예시:
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  ...
}

환경: Production, Preview 모두 선택
```

#### 2-5. 변수 2 추가: SPREADSHEET_ID
```
이름: SPREADSHEET_ID
값: 1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw
환경: Production, Preview 모두 선택
```

#### 2-6. 변수 3 추가: NEXT_PUBLIC_API_URL
```
이름: NEXT_PUBLIC_API_URL
값: https://marine-dashboard.vercel.app
환경: Production, Preview 모두 선택
```

### 검증

```bash
# 1. Vercel CLI에서 확인
vercel env ls

# 출력:
# GOOGLE_CREDENTIALS_JSON ✓ (Production, Preview)
# SPREADSHEET_ID ✓ (Production, Preview)
# NEXT_PUBLIC_API_URL ✓ (Production, Preview)

# 2. 환경 변수 값 확인 (선택사항)
vercel env pull .env.local

# 3. 로컬 .env.local 파일 생성됨
cat .env.local
```

### 주의사항

⚠️ **보안 주의**:
1. JSON 파일을 텍스트로 붙여넣을 때 개행 문자 확인
2. `\n` 문자가 실제 개행으로 표시되어야 함 (이스케이프 불가)
3. 민감한 키는 절대 Git에 커밋하지 말 것
4. .gitignore에 `gen-lang-client-*.json` 포함되어 있는지 확인

---

## Action 3: 로컬 통합 테스트

### 목표
배포 전에 모든 기능이 정상 작동하는지 로컬에서 확인

### 전제 조건

```bash
# 1. Node.js 버전 확인
node --version
# 출력: v22.20.0 (또는 v18+)

# 2. npm 버전 확인
npm --version
# 출력: 10.9.3 (또는 9+)

# 3. 디렉토리 확인
cd "C:\AI\251118\dashboard"
```

### Test 1: 빌드 성공 확인

```bash
# 1. 빌드 실행
npm run build

# 출력 확인:
# ✓ Compiled successfully
# ✓ TypeScript 검증 완료
# ✓ 정적 페이지 생성 (5/5)

# 2. 빌드 결과 확인
ls -la .next/

# 예상 파일:
# .next/server/        (서버 코드)
# .next/static/        (정적 파일)
# .next/package.json
```

### Test 2: 개발 서버 실행

```bash
# 1. 개발 서버 시작
npm run dev

# 출력:
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
# - event compiled client and server successfully
```

### Test 3: 대시보드 페이지 로드

```bash
# 1. 브라우저 열기
# URL: http://localhost:3000/dashboard

# 2. 페이지 로드 확인
# ✓ 페이지가 로드됨
# ✓ Header, Footer 표시됨
# ✓ 통계 카드 표시됨
# ✓ 데이터 테이블 표시됨
```

### Test 4: API 호출 확인

```bash
# 1. 개발자 도구 열기 (F12)

# 2. Network 탭으로 이동

# 3. /api/sheets 요청 확인
# ✓ 요청: GET /api/sheets?type=data
# ✓ 상태: 200 OK
# ✓ Response: { success: true, data: [...] }
```

### Test 5: 필터링 기능 테스트

```bash
# 1. 대시보드 페이지에서

# 2. FilterBar에서 필터 선택
# ✓ 기관 필터링
# ✓ 게시판 필터링
# ✓ 검색어 입력
# ✓ 날짜 범위 지정

# 3. 데이터 테이블 업데이트 확인
# ✓ 필터된 데이터만 표시
```

### Test 6: 모바일 반응형 확인

```bash
# 1. 개발자 도구 (F12) 열기

# 2. 반응형 모드 (Ctrl+Shift+M)

# 3. 다양한 디바이스 테스트
# ✓ iPhone 12 (390x844)
# ✓ iPad (768x1024)
# ✓ Desktop (1920x1080)

# 4. 각 해상도에서
# ✓ 페이지 로드됨
# ✓ 텍스트 가독성 OK
# ✓ 버튼 클릭 가능
```

### Test 7: 에러 처리 확인

```bash
# 1. 콘솔에서 에러 확인 (F12 → Console)
# ✓ 에러 메시지 없음
# ✓ 경고 메시지 최소 (필요한 경고만)

# 2. 네트워크 에러 확인 (Network 탭)
# ✓ 404 에러 없음
# ✓ 500 에러 없음
# ✓ CORS 에러 없음
```

### 테스트 체크리스트

```
Build & Compilation
├─ [ ] npm run build 성공
├─ [ ] TypeScript 에러 없음
├─ [ ] 정적 페이지 5/5 생성
└─ [ ] .next 디렉토리 생성됨

Local Development
├─ [ ] npm run dev 시작
├─ [ ] http://localhost:3000 접속 (리다이렉트: /dashboard)
└─ [ ] 메모리 사용량 정상 (< 500MB)

Page Functionality
├─ [ ] 헤더/푸터 표시
├─ [ ] 통계 카드 표시
├─ [ ] 데이터 테이블 표시
├─ [ ] 로딩 상태 표시
└─ [ ] 에러 메시지 표시

API Integration
├─ [ ] /api/sheets 요청 성공 (200 OK)
├─ [ ] 응답 형식 올바름 (JSON)
├─ [ ] 데이터 필드 완전 (기관명, 제목, 링크 등)
└─ [ ] 응답 시간 < 2초

Filter & Search
├─ [ ] 기관 필터링 작동
├─ [ ] 게시판 필터링 작동
├─ [ ] 검색어 검색 작동
└─ [ ] 날짜 범위 필터링 작동

Responsive Design
├─ [ ] 모바일 (390px) 표시
├─ [ ] 태블릿 (768px) 표시
├─ [ ] 데스크톱 (1920px) 표시
└─ [ ] 터치 요소 클릭 가능

Error Handling
├─ [ ] 콘솔 에러 없음
├─ [ ] 404 에러 없음
├─ [ ] CORS 에러 없음
└─ [ ] 네트워크 에러 처리됨

Performance
├─ [ ] 초기 로딩 < 3초
├─ [ ] API 응답 < 2초
├─ [ ] 필터링 즉시 반응
└─ [ ] 메모리 누수 없음
```

### 예상 결과 (성공)

```
✓ 모든 테스트 통과
✓ 데이터 실시간 표시
✓ 필터링 완벽 작동
✓ 모바일 완벽 지원
✓ 에러 없음
→ 배포 준비 완료!
```

---

## 최종 검증

### 체크리스트: 배포 전 완료 확인

```bash
# 1. API 통합 완료
[ ] dashboard/app/dashboard/page.tsx 수정됨
[ ] npm run build 성공
[ ] API 호출 작동

# 2. 환경 변수 설정
[ ] GOOGLE_CREDENTIALS_JSON 설정됨
[ ] SPREADSHEET_ID 설정됨
[ ] NEXT_PUBLIC_API_URL 설정됨

# 3. 로컬 테스트 완료
[ ] 빌드 성공
[ ] 개발 서버 실행
[ ] 대시보드 페이지 로드
[ ] API 호출 확인
[ ] 필터링 기능 작동
[ ] 모바일 반응형 확인
[ ] 에러 없음

# 4. Git 준비
[ ] 변경 사항 커밋
[ ] main 브랜치 푸시
```

### 완료 확인 명령어

```bash
# 1. Git 상태 확인
git status

# 출력:
# On branch main
# Your branch is ahead of 'origin/main' by 1 commit.
# nothing to commit, working tree clean

# 2. 최근 커밋 확인
git log --oneline -5

# 출력:
# abc1234 fix: API 통합 (Google Sheets 데이터 실시간 표시)
# ...

# 3. 환경 변수 확인
vercel env ls

# 출력:
# GOOGLE_CREDENTIALS_JSON (Production, Preview)
# SPREADSHEET_ID (Production, Preview)
# NEXT_PUBLIC_API_URL (Production, Preview)
```

---

## 배포 실행

### 준비 완료 후 배포

```bash
# Option 1: Git Push (권장)
git push origin main

# Vercel이 자동으로 감지하고 배포 시작
# 예상 시간: 3-5분

# Option 2: Vercel CLI
vercel deploy --prod

# Option 3: Vercel Dashboard
# https://vercel.com/dashboard → "Deploy" 버튼
```

### 배포 모니터링

```bash
# Vercel CLI에서 배포 상태 확인
vercel logs

# 또는 Vercel Dashboard에서 실시간 모니터링
# https://vercel.com/dashboard → Deployments 탭
```

---

## 긴급 대응

### 배포 실패 시

| 문제 | 증상 | 해결 |
|------|------|------|
| 빌드 실패 | "Build failed" | 로컬에서 `npm run build` 실행하여 에러 확인 |
| API 오류 | "500 Internal Server Error" | 환경 변수 설정 확인 |
| 데이터 미표시 | 빈 테이블 | 네트워크 탭에서 API 호출 확인 |
| 배포 취소 | 변경사항 롤백 필요 | `git revert` 또는 이전 커밋으로 복구 |

### 롤백 방법

```bash
# 이전 상태로 복구
git revert HEAD

# 또는 특정 커밋으로 복구
git reset --hard abc1234

# 강제 푸시 (주의!)
git push origin main --force
```

---

## 완료 후 다음 단계

### 배포 직후 (1시간)

- [ ] Vercel Dashboard에서 배포 확인
- [ ] 배포 URL 접속 (https://marine-dashboard.vercel.app)
- [ ] 기본 기능 테스트

### 배포 당일 (몇 시간)

- [ ] 사용자 테스트 실행
- [ ] 성능 메트릭 확인
- [ ] 에러 로그 모니터링

### 배포 후 1주일

- [ ] 테스트 자동화 추가
- [ ] 모니터링 대시보드 설정
- [ ] 성능 최적화 검토

---

**이 문서를 따라 위 3가지 조치를 완료하면 배포 준비가 완료됩니다!**

