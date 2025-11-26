# 해양수산부 크롤링 대시보드 - 디자인 가이드

## 프로젝트 개요

이 프로젝트는 해양수산부의 공식 공지사항을 실시간으로 크롤링하여 효율적인 정보 관리 및 분석을 제공하는 대시보드입니다.

### 핵심 가치
- **사용자 친화성**: 직관적이고 깔끔한 UI/UX 설계
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- **접근성**: WCAG 2.1 AA 표준 준수
- **일관성**: 체계적인 디자인 시스템 적용

---

## 디자인 시스템 (Korean Business Pro)

### 1. 색상 팔레트

#### Primary Colors
```
주 색상: #0066cc (파란색)
- Light: #e6f2ff
- Dark: #003d7a
```

#### Ocean Theme (해양 테마)
```
주 색상: #0097a7 (해양 테마 청록색)
- Light: #e0f2f7
- Dark: #005d77
```

#### Status Colors
```
Success: #10b981 (초록색)
Warning: #f59e0b (주황색)
Error: #ef4444 (빨간색)
Gray: #6c757d (회색)
```

#### Color Usage Guidelines
- **Primary**: 주요 버튼, 링크, 강조 요소
- **Ocean**: 헤더, 네비게이션, 핵심 상호작용
- **Success**: 성공 상태, 긍정적 정보
- **Warning**: 경고 메시지, 주의 필요 항목
- **Error**: 오류 상태, 중요한 경고
- **Gray**: 배경, 테두리, 보조 텍스트

### 2. 타이포그래피

#### 폰트 스택
```
Primary: Pretendard, Noto Sans KR
Fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
```

#### 크기 정의
```
Display:     44px (h1)
Heading 1:   38px (h2)
Heading 2:   30px (h3)
Heading 3:   20px (h4)
Body:        16px
Body Small:  14px
Caption:     12px
```

#### Font Weight
```
Normal:      400
Medium:      500
Semibold:    600
Bold:        700
Extra Bold:  900
```

#### Line Height
```
Compact:     1.2
Normal:      1.5
Relaxed:     1.75
```

### 3. 간격 및 레이아웃

#### Spacing Scale
```
0:   0px      (none)
1:   4px
2:   8px
3:   12px
4:   16px     (base)
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
24:  96px
```

#### Container Widths
```
Mobile:      100% (no padding)
Tablet:      640px - 1024px
Desktop:     1024px - 1280px
Extra:       1280px+
```

### 4. 모서리 반경

```
sm:  4px   (작은 요소)
md:  8px   (기본 버튼)
lg:  12px  (카드)
xl:  16px  (큰 컴포넌트)
```

### 5. 그림자

```
sm: light 1px offset
md: light 4px offset (default)
lg: light 10px offset
xl: light 20px offset
```

### 6. 상호작용 및 애니메이션

#### Duration
```
Fast:    150ms
Base:    200ms
Slow:    300ms
```

#### Easing
```
ease-in:     cubic-bezier(0.4, 0, 1, 1)
ease-out:    cubic-bezier(0, 0, 0.2, 1)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

#### 주요 애니메이션
```
Fade In:     opacity 0→1 (0.5s ease-out)
Slide Up:    translateY +10px (0.5s ease-out)
Slide Down:  translateY -10px (0.5s ease-out)
Hover:       shadow + scale (0.2s ease-out)
```

---

## 컴포넌트 라이브러리

### Header Component

#### 특징
- 스티키(sticky) 위치 고정
- 반응형 네비게이션
- 모바일 메뉴 토글
- 다크모드 토글 버튼

#### 코드 예시
```jsx
<Header
  title="해양수산부 공지사항"
  subtitle="크롤링 대시보드"
/>
```

#### 반응형 동작
- **Mobile**: 모바일 메뉴 버튼 표시, 로고만 표시
- **Tablet**: 일부 네비게이션 표시
- **Desktop**: 전체 네비게이션 표시

---

### StatCard Component

#### 특징
- 통계 정보 표시
- 트렌드 화살표 (상승/하강)
- 컬러 배리언트 지원
- 아이콘 지원

#### 사용 예시
```jsx
<StatCard
  title="총 게시물"
  value="1,245"
  description="전체 게시물 수"
  variant="ocean"
  trend={{ value: 12, isPositive: true }}
  icon={<IconComponent />}
/>
```

#### 색상 옵션
```
- primary: 파란색 배경
- ocean: 해양 테마 배경
- success: 초록색 배경
- warning: 주황색 배경
- error: 빨간색 배경
```

---

### FilterBar Component

#### 특징
- 다중 필터 지원
- 고급 필터 (토글 가능)
- 반응형 그리드
- 로딩 상태 표시

#### 필터 항목
1. 기관 선택 (Organization)
2. 게시판 선택 (Category)
3. 검색어 입력 (Search)
4. 날짜 범위 (Advanced)

#### 모바일 최적화
- 모바일에서 접기/펼치기 가능
- 한 줄에 한 항목씩 표시
- 터치 친화적 크기

---

### DataTable Component

#### 특징
- 반응형 테이블
- 페이지네이션 지원
- 모바일 카드 레이아웃
- 행 확장 기능 (expandable)
- 행 클릭 이벤트
- 링크 지원

#### 레이아웃 전환
```
Desktop:  테이블 형식
Tablet:   테이블 + 카드
Mobile:   카드 레이아웃
```

#### 페이지네이션
- 기본 페이지 크기: 10행
- 커스텀 가능
- 페이지 버튼 표시
- 현재 위치 표시

---

### 공통 컴포넌트들

#### Button Component
```jsx
<button className="btn btn-primary">클릭</button>
<button className="btn btn-secondary">클릭</button>
<button className="btn btn-outline">클릭</button>

// 크기
<button className="btn btn-sm">작음</button>
<button className="btn btn-lg">큼</button>
```

#### Input/Select Component
```jsx
<input className="input" placeholder="입력" />
<select className="select">
  <option>옵션 1</option>
</select>
```

#### Alert Component
```jsx
<Alert type="info" message="정보 메시지" />
<Alert type="success" message="성공 메시지" />
<Alert type="warning" message="경고 메시지" />
<Alert type="error" message="오류 메시지" />
```

#### Badge Component
```jsx
<Badge label="배지" variant="ocean" />
<Badge label="배지" variant="success" dot />
```

---

## 반응형 디자인 전략

### 브레이크포인트 (Tailwind CSS)

```
sm:    640px  (모바일 横向)
md:    768px  (태블릿)
lg:    1024px (데스크톱)
xl:    1280px (와이드)
2xl:   1536px (초와이드)
```

### 모바일 우선 접근법

```css
/* 기본 (모바일) */
.element {
  @apply block;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .element {
    @apply flex;
  }
}
```

### 숨기기/표시하기 Utilities

```
visible-mobile:  md:hidden      (모바일에만)
visible-tablet:  hidden md:block lg:hidden
visible-desktop: hidden lg:block
```

---

## 접근성 (Accessibility)

### WCAG 2.1 AA 준수 체크리스트

- [x] 색상 대비 4.5:1 이상 (텍스트)
- [x] 키보드 네비게이션 완전 지원
- [x] Focus indicator 명확히 표시
- [x] Semantic HTML 사용
- [x] ARIA labels/attributes 적절히 사용
- [x] 이미지에 alt text 포함
- [x] 폼 필드에 label 연결
- [x] 에러 메시지 명확히 표시

### 구현 예시

```jsx
// 올바른 버튼
<button
  aria-label="메뉴 열기"
  className="focus:outline-none focus:ring-2 focus:ring-ocean-500"
>
  메뉴
</button>

// 올바른 폼
<label htmlFor="email">이메일</label>
<input id="email" type="email" />

// 올바른 링크
<a href="/" aria-label="홈으로 돌아가기">홈</a>
```

---

## 다크 모드 지원

### 활성화 방법

```jsx
// HTML에 dark 클래스 추가
<html className="dark">
  {/* ... */}
</html>
```

### 스타일 작성

```css
/* 라이트 모드 */
.card {
  @apply bg-white text-gray-900;
}

/* 다크 모드 */
.dark .card {
  @apply bg-gray-800 text-gray-100;
}
```

---

## 성능 최적화

### 이미지 최적화
```jsx
import Image from 'next/image'

<Image
  src="/image.png"
  alt="설명"
  width={400}
  height={300}
  priority // LCP 이미지
/>
```

### CSS Purge
- Tailwind CSS는 사용하지 않는 클래스 자동 제거
- content 경로 정확히 설정 필수

### Font 최적화
```jsx
import { Pretendard } from 'next/font/google'

const font = Pretendard({ subsets: ['latin'] })
```

---

## 파일 구조

```
dashboard/
├── app/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MainLayout.tsx
│   ├── StatCard.tsx
│   ├── FilterBar.tsx
│   ├── DataTable.tsx
│   ├── Alert.tsx
│   ├── Badge.tsx
│   ├── LoadingSpinner.tsx
│   └── ...other components
├── pages/
│   ├── index.tsx
│   └── ...other pages
├── types/
│   └── index.ts
├── tailwind.config.ts
├── DESIGN_GUIDE.md
└── ...
```

---

## 개발 가이드라인

### 컴포넌트 작성 체크리스트

- [ ] TypeScript 타입 정의
- [ ] Props 인터페이스 정의
- [ ] 기본값(default props) 설정
- [ ] 접근성 속성 추가 (aria-label 등)
- [ ] 반응형 클래스 적용 (sm:, md:, lg:)
- [ ] 포커스 스타일 포함
- [ ] 로딩/에러 상태 처리
- [ ] 문서화 주석 추가

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: CSS/스타일 변경
docs: 문서 변경
test: 테스트 추가/수정
chore: 빌드, 의존성 등
```

---

## 테스트 및 검증

### 반응형 테스트
- [ ] 모바일 (375px - 480px)
- [ ] 태블릿 (768px - 1024px)
- [ ] 데스크톱 (1440px+)

### 브라우저 호환성
- [x] Chrome/Edge 최신
- [x] Safari 최신
- [x] Firefox 최신
- [x] Mobile browsers

### 성능 메트릭
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 참고 자료

### 디자인 도구
- Figma: UI/UX 디자인
- Tailwind Play: CSS 프리뷰

### 문서
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility 모범 사례](https://www.w3.org/WAI/fundamentals/accessibility-intro/)

---

## 변경 이력

| 버전 | 날짜 | 변경사항 |
|------|------|---------|
| 1.0  | 2024-01-18 | 초기 디자인 시스템 문서 작성 |

---

**마지막 업데이트**: 2024년 1월 18일
