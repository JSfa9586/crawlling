# 빠른 시작 가이드

## 5분 안에 시작하기

### 1단계: 프로젝트 구조 확인

```
C:\AI\251118\dashboard\
├── 설정 파일
│   └── tailwind.config.ts
├── 스타일
│   └── app/globals.css
├── 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MainLayout.tsx
│   ├── StatCard.tsx
│   ├── FilterBar.tsx
│   ├── DataTable.tsx
│   ├── Alert.tsx
│   ├── Badge.tsx
│   └── LoadingSpinner.tsx
├── 페이지
│   └── pages/index.tsx
└── 문서
    ├── README.md
    ├── DESIGN_GUIDE.md
    ├── ACCESSIBILITY_CHECKLIST.md
    ├── IMPLEMENTATION_REPORT.md
    └── QUICK_START.md
```

### 2단계: 설정 파일 복사

프로젝트 루트에 다음 파일을 복사하세요:
- `tailwind.config.ts` - Tailwind 설정

`app/` 디렉토리에:
- `globals.css` - 글로벌 스타일

### 3단계: 컴포넌트 사용

```jsx
import Header from '@/components/Header'
import StatCard from '@/components/StatCard'
import FilterBar from '@/components/FilterBar'
import DataTable from '@/components/DataTable'
import MainLayout from '@/components/MainLayout'

export default function Dashboard() {
  return (
    <MainLayout>
      {/* 헤더 */}
      <Header
        title="해양수산부 공지사항"
        subtitle="크롤링 대시보드"
      />

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 게시물"
          value="1,245"
          variant="ocean"
          trend={{ value: 12, isPositive: true }}
        />
        {/* 추가 카드 */}
      </div>

      {/* 필터 */}
      <FilterBar
        organizations={['전체', '해양수산부']}
        categories={['공지사항', '보도자료']}
        onFilter={(filters) => console.log(filters)}
      />

      {/* 데이터 테이블 */}
      <DataTable
        columns={columns}
        data={data}
        pageSize={10}
      />
    </MainLayout>
  )
}
```

## 주요 클래스

### 버튼

```jsx
<button className="btn btn-primary">주 버튼</button>
<button className="btn btn-secondary">보조 버튼</button>
<button className="btn btn-outline">아웃라인</button>
<button className="btn btn-sm">작음</button>
<button className="btn btn-lg">큼</button>
```

### 입력 필드

```jsx
<input className="input" placeholder="입력" />
<input className="input input-error" />
<select className="select">
  <option>옵션</option>
</select>
```

### 카드

```jsx
<div className="card">기본 카드</div>
<div className="card card-sm">작은 카드</div>
<div className="card card-lg">큰 카드</div>
```

### 색상

```jsx
// StatCard
<StatCard variant="primary" />   {/* 파란색 */}
<StatCard variant="ocean" />     {/* 해양 테마 */}
<StatCard variant="success" />   {/* 초록색 */}
<StatCard variant="warning" />   {/* 주황색 */}
<StatCard variant="error" />     {/* 빨간색 */}

// Badge
<Badge label="배지" variant="ocean" />
<Badge label="배지" variant="success" />

// Alert
<Alert type="info" message="정보" />
<Alert type="success" message="성공" />
<Alert type="warning" message="경고" />
<Alert type="error" message="에러" />
```

### 반응형

```jsx
{/* 모바일: 블록, 태블릿+: flex */}
<div className="block md:flex">
  콘텐츠
</div>

{/* 모바일: 숨김, 데스크톱+: 표시 */}
<div className="hidden lg:block">
  데스크톱에만 표시
</div>

{/* 반응형 그리드 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card">카드 1</div>
  <div className="card">카드 2</div>
  <div className="card">카드 3</div>
</div>
```

## 색상 참고

| 색상 | HEX | Tailwind | 용도 |
|------|-----|----------|------|
| 주 파란색 | #0066cc | primary-500 | 버튼, 링크 |
| 해양 테마 | #0097a7 | ocean-500 | 헤더, 강조 |
| 성공 | #10b981 | success-500 | 성공 상태 |
| 경고 | #f59e0b | warning-500 | 경고 |
| 에러 | #ef4444 | error-500 | 에러 |
| 회색 | #6c757d | gray-500 | 보조 |

## Tailwind Breakpoints

```
sm:  640px    (tablet)
md:  768px    (tablet landscape)
lg:  1024px   (desktop)
xl:  1280px   (wide)
2xl: 1536px   (extra wide)
```

## 접근성 팁

### 버튼에 라벨 추가
```jsx
<button aria-label="메뉴 열기">☰</button>
```

### 폼 필드 연결
```jsx
<label htmlFor="email">이메일</label>
<input id="email" type="email" />
```

### 이미지 설명
```jsx
<img src="chart.png" alt="2024년 월별 통계" />
```

### 링크 명확화
```jsx
<a href="/page" aria-label="전체 제목">링크 텍스트</a>
```

## 다크 모드

### 활성화
```jsx
// HTML에 dark 클래스 추가
<html className="dark">
```

### 스타일 작성
```css
.card {
  @apply bg-white text-gray-900;
}

.dark .card {
  @apply bg-gray-800 text-gray-100;
}
```

## 자주 묻는 질문

### Q: 색상을 커스터마이즈하려면?
A: `tailwind.config.ts`의 `colors` 섹션 수정

```javascript
colors: {
  ocean: {
    500: '#0097a7',  // 이 값을 변경
  }
}
```

### Q: 새로운 폰트를 추가하려면?
A: `tailwind.config.ts`의 `fontFamily` 수정

```javascript
fontFamily: {
  sans: ['새폰트', 'sans-serif']
}
```

### Q: 버튼 크기를 조정하려면?
A: `spacing` 또는 `fontSize` 수정

```javascript
extend: {
  spacing: {
    'btn': '1rem'  // 커스텀 크기
  }
}
```

### Q: 애니메이션 속도를 변경하려면?
A: `keyframes` 수정

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 성능 최적화

### 1. CSS 정리 (자동)
Tailwind가 사용하지 않는 클래스 자동 제거

### 2. 이미지 최적화
```jsx
import Image from 'next/image'
<Image src={src} alt={alt} width={w} height={h} />
```

### 3. 폰트 최적화
필요한 font-weight만 로드

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700');
```

## 배포

### Next.js 빌드
```bash
npm run build
npm start
```

### Vercel 배포 (권장)
```bash
npm i -g vercel
vercel
```

### 다른 호스팅
- AWS Amplify
- Netlify
- GitHub Pages

## 문제 해결

### CSS가 적용되지 않음
1. 브라우저 캐시 초기화 (Ctrl+Shift+Delete)
2. `content` 경로 확인
3. 클래스명 공백 확인

### 다크 모드가 작동 안 함
1. HTML에 `dark` 클래스 확인
2. `tailwind.config.ts` 설정 확인
3. 개발자 도구에서 HTML 확인

### 반응형이 안 됨
1. 모바일에서 viewport meta 확인
2. 브레이크포인트 확인
3. CSS 선택자 확인

## 참고 자료

- **Tailwind 공식**: https://tailwindcss.com
- **디자인 가이드**: DESIGN_GUIDE.md
- **접근성**: ACCESSIBILITY_CHECKLIST.md
- **전체 보고서**: IMPLEMENTATION_REPORT.md

## 다음 단계

1. **API 연결**: 실제 데이터 통합
2. **추가 페이지**: 상세, 통계, 설정 페이지
3. **테스트**: Jest, Cypress
4. **배포**: Vercel, AWS 등

---

**도움말**: 문제가 있으면 DESIGN_GUIDE.md를 참고하세요!

Happy Coding! 🚀
