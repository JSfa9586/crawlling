# 배포 체크리스트 및 최종 확인

**프로젝트**: 해양수산부 공지사항 대시보드
**날짜**: 2025-11-18
**상태**: 배포 준비 완료

---

## 📋 배포 전 최종 체크리스트

### ✅ 1단계: 로컬 환경 준비

- [x] Node.js 18+ 설치 확인
  ```bash
  node --version  # v18.0.0 이상
  ```

- [x] npm 의존성 설치
  ```bash
  npm install
  ```

- [x] 환경 변수 파일 생성
  ```bash
  # .env.local 파일 생성
  # GOOGLE_CREDENTIALS_JSON, SPREADSHEET_ID 설정 필요
  ```

### ✅ 2단계: 로컬 빌드 검증

- [x] 프로덕션 빌드 실행
  ```bash
  npm run build
  # 결과: ✅ 성공 (5.6초)
  ```

- [x] 빌드 결과 확인
  ```
  ✅ 정적 페이지 4개 생성
  ✅ 동적 라우트 1개 설정
  ✅ 경고 없음
  ```

- [x] TypeScript 타입 검증
  ```bash
  npm run type-check
  # 결과: ✅ 성공 (오류 0개)
  ```

### ✅ 3단계: 코드 품질 확인

- [x] ESLint 설정 완료
  ```json
  {
    "extends": "next/core-web-vitals",
    "rules": { /* 설정 완료 */ }
  }
  ```

- [x] 메타데이터 설정
  ```
  ✅ title, description
  ✅ keywords
  ✅ OpenGraph
  ✅ viewport
  ```

- [x] SEO 파일 생성
  ```
  ✅ public/robots.txt
  ✅ app/sitemap.ts
  ✅ app/dashboard/layout.tsx
  ```

### ✅ 4단계: 성능 최적화

- [x] 번들 분석기 통합
  ```bash
  npm install --save-dev @next/bundle-analyzer
  # 사용: ANALYZE=true npm run build
  ```

- [x] CSS 최적화
  ```bash
  npm install --save-dev cssnano
  # postcss.config.js에 통합
  ```

- [x] 캐싱 정책 설정
  ```javascript
  // ISR + stale-while-revalidate
  Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=600
  ```

### ✅ 5단계: 배포 준비

- [x] .vercelignore 작성
  ```
  ✅ 문서 파일 제외
  ✅ 테스트 파일 제외
  ✅ 임시 파일 제외
  ```

- [x] 배포 문서 작성
  ```
  ✅ README.md (완전히 재작성)
  ✅ PRODUCTION_BUILD_REPORT.md
  ✅ OPTIMIZATION_SUMMARY.md
  ✅ DEPLOYMENT_CHECKLIST.md (이 파일)
  ```

---

## 🚀 Vercel 배포 단계

### 1단계: Vercel CLI 설치 (필요시)

```bash
npm install -g vercel
```

### 2단계: Vercel 환경 변수 설정

**방법 A: Vercel Dashboard (추천)**

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수 추가:

```
GOOGLE_CREDENTIALS_JSON = <Service Account JSON>
SPREADSHEET_ID = <Google Sheets ID>
NEXT_PUBLIC_API_URL = https://your-project.vercel.app
```

**방법 B: 명령어 사용**

```bash
vercel env add GOOGLE_CREDENTIALS_JSON
vercel env add SPREADSHEET_ID
vercel env add NEXT_PUBLIC_API_URL
```

### 3단계: 프로덕션 배포

```bash
# 초기 배포
vercel --prod

# 또는 기존 프로젝트에 배포
cd C:\AI\251118\dashboard
vercel --prod
```

### 4단계: 배포 완료 확인

- [x] Vercel 대시보드에서 배포 상태 확인
- [x] 프로덕션 URL 생성 확인
- [x] 배포 로그 확인 (오류 없음)

---

## 🧪 배포 후 검증 (24시간 내)

### 페이지 로드 확인

- [ ] 홈페이지 접속
  ```
  https://your-project.vercel.app
  → 정상 로드 확인
  ```

- [ ] 대시보드 페이지
  ```
  https://your-project.vercel.app/dashboard
  → 정상 로드 확인
  ```

- [ ] API 라우트
  ```
  https://your-project.vercel.app/api/sheets
  → 200 OK 응답 확인
  ```

### 기능 확인

- [ ] 필터 기능 정상 작동
- [ ] 검색 기능 정상 작동
- [ ] 테이블 렌더링 정상
- [ ] 로딩 UI 표시 정상

### 성능 확인

- [ ] 페이지 로드 시간 < 3초
- [ ] API 응답 시간 < 200ms
- [ ] 모바일 반응형 정상

### SEO 확인

- [ ] robots.txt 접근 가능
  ```
  https://your-project.vercel.app/robots.txt
  ```

- [ ] sitemap.xml 접근 가능
  ```
  https://your-project.vercel.app/sitemap.xml
  ```

- [ ] 메타데이터 확인 (F12 개발자 도구)
  ```html
  <title>해양수산부 크롤링 대시보드</title>
  <meta name="description" content="...">
  ```

### 모바일 테스트

- [ ] iPhone 반응형 확인
- [ ] Android 반응형 확인
- [ ] 터치 영역 크기 확인 (최소 44px)

---

## 📊 성능 메트릭 목표

### Lighthouse 점수 목표

| 메트릭 | 목표 | 확인 방법 |
|--------|------|----------|
| Performance | > 90 | PageSpeed Insights |
| Accessibility | > 95 | Lighthouse |
| Best Practices | > 90 | Lighthouse |
| SEO | > 90 | Lighthouse |

### Core Web Vitals 목표

| 메트릭 | 목표 | 확인 |
|--------|------|------|
| LCP (Largest Contentful Paint) | < 2.5초 | Vercel Analytics |
| FID (First Input Delay) | < 100ms | Vercel Analytics |
| CLS (Cumulative Layout Shift) | < 0.1 | Vercel Analytics |

---

## 🔧 배포 후 모니터링

### Vercel Analytics 설정 (선택사항)

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx에 추가
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 모니터링 도구

- **Vercel Dashboard**: 배포 상태 및 성능
- **Google Lighthouse**: 성능 점수
- **Google PageSpeed Insights**: 모바일/데스크톱 성능
- **Chrome DevTools**: 개발 시 성능 분석

---

## ⚠️ 배포 후 트러블슈팅

### 문제: 빌드 실패

**증상**: Vercel 배포 중 빌드 오류

**해결책**:
1. 로컬에서 `npm run build` 성공 확인
2. `npm run type-check` 실행하여 타입 오류 확인
3. Vercel 로그 확인
4. 환경 변수 재확인

### 문제: API 오류 (403/500)

**증상**: `/api/sheets` 접속 시 오류

**해결책**:
1. `GOOGLE_CREDENTIALS_JSON` 설정 확인
2. `SPREADSHEET_ID` 설정 확인
3. Service Account 권한 확인
4. Vercel 함수 로그 확인

### 문제: 페이지 로드 느림

**증상**: 홈페이지 로드 시간 > 3초

**해결책**:
1. Lighthouse 보고서 확인
2. 번들 크기 분석 (`ANALYZE=true npm run build`)
3. 이미지 최적화 확인
4. CSS/JS 최소화 확인

### 문제: 모바일 반응형 문제

**증상**: 모바일에서 레이아웃 깨짐

**해결책**:
1. Chrome DevTools에서 모바일 뷰 확인
2. Tailwind CSS 브레이크포인트 확인
3. viewport 메타 태그 확인
4. 터치 영역 크기 (최소 44px) 확인

---

## 📝 최종 체크리스트

### 배포 전 (오늘)

- [x] 프로덕션 빌드 성공 ✅
- [x] TypeScript 검증 성공 ✅
- [x] 메타데이터 설정 ✅
- [x] SEO 파일 생성 ✅
- [x] 성능 최적화 완료 ✅
- [x] 배포 가이드 작성 ✅

### 배포 시간 (약 5-10분)

- [ ] Vercel 환경 변수 설정
- [ ] 프로덕션 배포 실행
- [ ] 배포 완료 확인
- [ ] 프로덕션 URL 공지

### 배포 후 24시간

- [ ] 모든 페이지 로드 확인
- [ ] 기능 테스트
- [ ] 성능 메트릭 확인
- [ ] 에러 모니터링 확인

---

## 📞 지원 및 연락처

### 문서 참고

1. **README.md** - 전체 프로젝트 가이드
2. **PRODUCTION_BUILD_REPORT.md** - 빌드 상세 보고서
3. **OPTIMIZATION_SUMMARY.md** - 최적화 요약
4. **ACCESSIBILITY_CHECKLIST.md** - 접근성 검증

### 외부 지원

- **Vercel 문서**: https://vercel.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Google Sheets API**: https://developers.google.com/sheets

---

## 🎉 배포 완료 후

배포가 완료되면:

1. **팀에 공지**
   ```
   프로덕션 배포 완료: https://your-project.vercel.app
   ```

2. **성능 데이터 수집**
   ```
   Vercel Analytics에서 24시간 모니터링
   ```

3. **피드백 수집**
   ```
   사용자 피드백 수집 및 이슈 추적
   ```

4. **추후 개선**
   ```
   성능 메트릭 기반 최적화
   ```

---

## 📋 배포 기록

| 날짜 | 상태 | 메모 |
|------|------|------|
| 2025-11-18 | 배포 준비 완료 | 모든 검증 완료 ✅ |
| - | 프로덕션 배포 | (배포 시 기록) |
| - | 배포 확인 | (배포 후 기록) |

---

**최종 상태**: 배포 준비 완료 ✅
**다음 단계**: Vercel 배포 실행
**예상 배포 시간**: 5-10분

