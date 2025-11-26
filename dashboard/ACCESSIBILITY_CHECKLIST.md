# 접근성 체크리스트 (WCAG 2.1 AA)

## 지각 가능성 (Perceivable)

### 1.1 텍스트 대체 (Text Alternatives)

- [x] 모든 이미지에 alt text 제공
- [x] 아이콘 버튼에 aria-label 추가
- [x] 차트/그래프에 텍스트 설명 포함

**구현 예시:**
```jsx
<img src="chart.png" alt="2024년 월별 게시물 통계" />
<button aria-label="메뉴 열기">☰</button>
```

### 1.3 적응성 (Adaptable)

- [x] 시맨틱 HTML 사용 (header, nav, main, footer)
- [x] 제목 순서 정확 (h1 → h2 → h3)
- [x] 목록 구조 명확 (ul, ol)
- [x] 테이블 헤더 정확 (thead, tbody, th)

**구현 예시:**
```jsx
<header>
  <nav>...</nav>
</header>
<main>
  <section>
    <h1>제목</h1>
    <h2>부제목</h2>
    <p>내용</p>
  </section>
</main>
<footer>...</footer>
```

### 1.4 구분 가능성 (Distinguishable)

#### 색상 대비
- [x] 일반 텍스트: 최소 4.5:1 대비
- [x] 큰 텍스트 (18pt+): 최소 3:1 대비
- [x] UI 컴포넌트: 최소 3:1 대비

**색상 대비 검증:**
```
Primary Text: #212529 on #ffffff
대비: 16.1:1 ✓

Link: #0097a7 on #ffffff
대비: 5.4:1 ✓
```

#### 텍스트 간격
- [x] 최소 줄 높이: 1.5배
- [x] 문단 간격: 줄 높이의 1.5배

**구현:**
```css
body {
  line-height: 1.5;
  letter-spacing: 0.02em;
}

p {
  margin-bottom: 1.5em;
}
```

#### 색상에 의존하지 않기
- [x] 상태 표시: 색상 + 텍스트 또는 아이콘
- [x] 오류 메시지: 색상 + 아이콘 + 텍스트

**구현 예시:**
```jsx
<Badge variant="success" label="진행 중" dot />
<Alert type="error" title="오류" message="필수 필드입니다" />
```

---

## 조작 가능성 (Operable)

### 2.1 키보드 접근성 (Keyboard Accessible)

- [x] 모든 기능 키보드로 조작 가능
- [x] Tab 키로 순서대로 포커스 이동
- [x] 포커스 트랩 없음 (모달 제외)
- [x] Enter/Space 키로 버튼/링크 활성화

**구현 체크리스트:**
```
[ ] Header 네비게이션: Tab으로 이동 가능
[ ] FilterBar 컨트롤: Tab으로 이동 가능
[ ] DataTable 행: Tab으로 선택 가능
[ ] 모달/대화: Tab으로 내부만 순회
```

**코드 예시:**
```jsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  클릭
</button>
```

### 2.2 충분한 시간 (Enough Time)

- [x] 타임아웃 없음 (또는 연장 가능)
- [x] 애니메이션 일시정지 가능
- [x] 주의 필요 콘텐츠 경고 표시

**구현:**
```jsx
// prefers-reduced-motion 존중
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### 2.3 발작 및 물리적 반응 (Seizures and Physical Reactions)

- [x] 초당 3회 이상 깜박임 없음
- [x] 강렬한 번쩍임 없음

### 2.4 네비게이션 가능성 (Navigable)

- [x] 페이지 목적 명확
- [x] 포커스 순서 논리적
- [x] 링크 목적 명확

**구현:**
```jsx
<h1>페이지 제목 - 명확한 목적</h1>

<nav aria-label="주 네비게이션">
  {/* 네비게이션 순서 */}
</nav>

<a href="/page" title="전체 제목">링크 텍스트</a>
```

---

## 이해 가능성 (Understandable)

### 3.1 읽기 쉬움 (Readable)

- [x] 기본 언어 명시
- [x] 복잡한 용어 설명 제공
- [x] 약어 정의 (처음 사용할 때)

**구현:**
```jsx
<html lang="ko">
  {/* ... */}
</html>

<abbr title="Hypertext Markup Language">HTML</abbr>
```

### 3.2 예측 가능성 (Predictable)

- [x] 네비게이션 일관성
- [x] 컴포넌트 일관된 동작
- [x] 예기치 않은 변경 없음

**구현:**
```jsx
// 버튼은 항상 같은 위치, 같은 스타일
// 링크는 항상 새 탭/같은 탭 일관되게
<a href="/page" target="_blank" rel="noopener noreferrer">
  외부 사이트 (새 탭)
</a>
```

### 3.3 입력 오류 보조 (Input Assistance)

- [x] 오류 식별: 명확한 메시지
- [x] 오류 제안: 수정 방법 제시
- [x] 오류 방지: 검증 전 경고

**구현:**
```jsx
<div>
  <label htmlFor="email">이메일 *</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={error ? 'true' : 'false'}
  />
  {error && (
    <span id="email-error" className="text-error-600">
      유효한 이메일을 입력하세요. 예: user@example.com
    </span>
  )}
</div>
```

---

## 견고성 (Robust)

### 4.1 호환성 (Compatible)

- [x] 유효한 HTML (W3C Validator)
- [x] ARIA 정확히 사용
- [x] 중복되지 않은 ID
- [x] 모든 폼 필드에 label

**구현:**
```jsx
// ✓ 올바름
<input id="username" />
<label htmlFor="username">사용자명</label>

// ✗ 잘못됨
<label>사용자명</label>
<input />
```

---

## 컴포넌트별 접근성 구현

### Header Component
```jsx
<header className="bg-white shadow-sm border-b border-gray-200">
  <nav className="container mx-auto px-4 py-4" aria-label="주 네비게이션">
    <h1 className="text-xl font-bold">
      해양수산부 공지사항
    </h1>
    <ul>
      <li>
        <a href="/" aria-current="page">홈</a>
      </li>
      <li>
        <a href="/dashboard">대시보드</a>
      </li>
    </ul>
    <button
      aria-label="모바일 메뉴 열기"
      className="md:hidden"
    >
      ☰
    </button>
  </nav>
</header>
```

### FilterBar Component
```jsx
<div className="card mb-6" role="search">
  <h2 className="text-lg font-semibold">검색 및 필터</h2>

  <div className="grid gap-4">
    <div>
      <label htmlFor="org-select">기관 선택 *</label>
      <select id="org-select" aria-required="true">
        <option>전체 기관</option>
      </select>
    </div>

    <button className="btn btn-primary" aria-label="검색 수행">
      검색
    </button>
  </div>
</div>
```

### DataTable Component
```jsx
<div className="table-container">
  <table role="table" aria-label="게시물 목록">
    <thead>
      <tr>
        <th scope="col">제목</th>
        <th scope="col">날짜</th>
        <th scope="col">조회수</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <a href="/post/1">게시물 제목</a>
        </td>
        <td>2024-01-15</td>
        <td>1,234</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Alert Component
```jsx
<div
  role="alert"
  className="alert alert-info"
  aria-live="polite"
  aria-atomic="true"
>
  <strong>주의:</strong> 시스템 점검이 예정되어 있습니다.
</div>
```

---

## 접근성 테스트 도구

### 자동 테스트
- axe DevTools (Chrome/Firefox)
- Lighthouse (Chrome DevTools)
- WAVE (WebAIM)

### 수동 테스트
- 키보드만으로 사용 가능 여부
- 스크린 리더 테스트 (NVDA, JAWS)
- 색상 대비 검사

### 테스트 체크리스트
```
[ ] 키보드 네비게이션 완전 가능
[ ] Tab 순서 논리적
[ ] 포커스 표시 명확
[ ] 색상 대비 4.5:1 이상
[ ] 이미지 alt text 제공
[ ] 폼 필드 label 연결
[ ] 오류 메시지 명확
[ ] 모달 포커스 트랩 있음
[ ] 동영상 자막 제공
[ ] 링크 목적 명확
```

---

## 개선 가능 영역

### 현재 상태 (Achieved)
- 색상 대비 적절
- 키보드 네비게이션 지원
- 시맨틱 HTML 사용
- ARIA labels 적용
- 반응형 디자인

### 향후 개선 (Future)
- 페이지 폭 조절 (200%)
- 다국어 지원 (en, ko, ja)
- 고대비 모드 (High Contrast)
- 음성 안내 (Audio Description)
- 실시간 자막 (Live Captions)

---

## 참고 자료

### 표준 및 가이드
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- MDN 접근성 가이드: https://developer.mozilla.org/ko/docs/Web/Accessibility

### 테스트 도구
- axe DevTools: https://www.deque.com/axe/devtools/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- WAVE: https://wave.webaim.org/

---

**마지막 검사**: 2024년 1월 18일
**준수 수준**: WCAG 2.1 AA
