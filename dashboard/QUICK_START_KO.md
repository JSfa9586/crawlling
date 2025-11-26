# 해양수산부 대시보드 - 빠른 시작 가이드

## 프로젝트 완성 상태

✅ **프로젝트 초기화**: 완료
✅ **컴포넌트 개발**: 완료
✅ **타입 정의**: 완료
✅ **스타일링**: 완료
✅ **빌드 테스트**: 성공
✅ **배포 준비**: 완료

---

## 1단계: 프로젝트 실행

### 개발 서버 시작 (권장)
```bash
cd C:\AI©118\dashboard
npm run dev
```

### 브라우저에서 접속
```
http://localhost:3000
```

### 주요 페이지
- **홈**: http://localhost:3000 (프로젝트 소개)
- **대시보드**: http://localhost:3000/dashboard (메인 데이터 페이지)

---

## 2단계: 프로덕션 빌드

### 빌드 생성
```bash
npm run build
```

### 프로덕션 서버 실행
```bash
npm start
```

---

## 3단계: 유용한 명령어

### 타입 체크
```bash
npm run type-check
```

### 코드 검사 및 자동 수정
```bash
npm run lint
npm run lint -- --fix
```

### 의존성 확인
```bash
npm ls
npm outdated
```

---

## 4단계: 환경 변수 설정 (선택사항)

`.env.local` 파일 생성:
```env
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
SPREADSHEET_ID=1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 5단계: 프로젝트 파일 위치

```
C:\AI©118\dashboard├── app/                      # 페이지 및 레이아웃
│   ├── page.tsx             # 홈페이지
│   ├── dashboard/
│   │   └── page.tsx         # 대시보드
│   └── api/sheets/
│       └── route.ts         # API 라우트
├── components/              # 재사용 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── DataTable.tsx
│   ├── FilterBar.tsx
│   ├── StatCard.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── lib/                     # 유틸리티 함수
│   ├── filters.ts          # 필터링, 정렬, 페이지네이션
│   └── googleSheets.ts     # API 클라이언트
├── types/                  # TypeScript 타입
│   └── index.ts
└── README.md              # 상세 문서
```

---

## 6단계: 주요 컴포넌트 사용법

### StatCard (통계 카드)
```typescript
<StatCard
  title="총 게시물"
  value={1000}
  icon="📄"
  trend={{ value: 12, direction: 'up' }}
  color="primary"
/>
```

### DataTable (데이터 테이블)
```typescript
<DataTable
  data={crawlingData}
  isLoading={false}
  onRowClick={(row) => console.log(row)}
/>
```

### FilterBar (필터바)
```typescript
<FilterBar
  onFilter={(filters) => {
    console.log('필터:', filters);
  }}
/>
```

---

## 7단계: 데이터 구조

### CrawlingData (크롤링 데이터)
```typescript
{
  기관구분: "청",
  기관명: "해양수산부",
  게시판: "보도자료",
  제목: "2024년 해양안전 강화",
  작성일: "2025-11-18",
  링크: "https://www.mof.go.kr/...",
  수집일시: "2025-11-18 10:30:00"
}
```

---

## 8단계: 개발 팁

### 핫 리로드 활용
개발 서버는 파일 저장 시 자동으로 리로드됩니다.

### 디버깅
```bash
# Chrome DevTools 사용
http://localhost:3000
# F12 또는 오른쪽 마우스 > 검사
```

### 빌드 캐시 초기화
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 9단계: 성능 최적화

### 현재 상태
- ✅ SSG (정적 사이트 생성)
- ✅ TypeScript 타입 검사
- ✅ ESLint 코드 검사
- ✅ Tailwind CSS 최적화

### 향후 개선 사항
- 이미지 최적화
- 코드 분할
- 데이터 캐싱
- 번들 분석

---

## 10단계: 배포 준비

### 환경 확인
```bash
node --version    # v22.20.0 이상
npm --version     # 10.9.3 이상
```

### 배포 체크리스트
- [ ] 환경 변수 설정 (.env.local)
- [ ] Google Sheets API 키 획득
- [ ] 타입 체크 통과 (npm run type-check)
- [ ] 빌드 성공 (npm run build)
- [ ] 로컬 테스트 완료

### 배포 옵션
- **Vercel**: https://vercel.com (추천)
- **Netlify**: https://netlify.com
- **AWS Amplify**: https://aws.amazon.com/amplify
- **자체 서버**: Node.js + PM2

---

## 주의사항

⚠️ **포트 3000이 이미 사용 중인 경우**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

⚠️ **의존성 문제**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 지원 정보

### 문서
- **README.md**: 상세한 프로젝트 설명
- **FINAL_REPORT.md**: 완료 보고서
- **DESIGN_GUIDE.md**: 디자인 시스템
- **QUICK_START.md**: 이 파일

### 참고 링크
- Next.js 공식: https://nextjs.org
- React 공식: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- TypeScript: https://www.typescriptlang.org

---

**프로젝트**: 해양수산부 크롤링 데이터 대시보드
**상태**: 개발 준비 완료
**마지막 업데이트**: 2025-11-18
