# Changelog

프로젝트의 모든 주요 변경사항은 이 파일에 기록됩니다.

이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

---

## [Unreleased]

### 계획 중
- Next.js 기반 웹 대시보드 구축
- 실시간 데이터 시각화
- 키워드 알림 기능
- 여수광양항만공사 크롤링 추가 (JavaScript 렌더링 지원)

---

## [1.0.0] - 2025-11-18

### 추가됨 (Added)
- 해양수산부 산하기관 16개 크롤러 구현
  - 지방청 11개
  - 어업관리단 2개
  - 공단 1개
  - 항만공사 3개
- 해양수산부 본부 크롤러 별도 구현
- 3개 게시판 타입 크롤링 지원 (공지사항, 입찰, 인사발령)
- 최근 7일 데이터 자동 필터링 (Asia/Seoul 시간대 기준)
- 중복 제거 기능 (URL 기반)
- CSV 및 Excel 파일 출력
- Google Sheets 자동 업로드 기능
- Google Sheets 중복 제거 및 열 너비 자동 조정
- GitHub Actions 자동화 워크플로우
  - 매일 KST 09:00 자동 실행
  - 수동 실행 옵션
  - 코드 변경 시 자동 테스트
- Slack 알림 기능 (선택 사항)
- 이메일 알림 기능 (선택 사항)
- 크롤링 결과 아티팩트 자동 저장 (30일 보관)

### 기술 사양
- Python 3.8+ 지원
- `requests`, `beautifulsoup4`, `pandas`, `gspread` 등 의존성 패키지
- UTF-8 인코딩 완벽 지원
- 에러 핸들링 및 타임아웃 설정
- 서버 부하 방지 지연 시간 설정

### 문서화
- 포괄적인 README.md 작성
- 사용법 가이드 (사용법.txt)
- GitHub Actions 구현 가이드
- Google Sheets API 기술검토 리포트
- UI/UX 설계 문서
- 컴포넌트 명세서

---

## [0.2.0] - 2025-11-15 (베타)

### 추가됨
- 부산항만공사 전용 크롤링 함수 (`crawl_busanpa_board`)
- 항만공사 크롤링 함수 (`crawl_port_authority_board`)
- 해양환경공단 크롤링 함수 (`crawl_koem_board`)
- 크롤링 상태 추적 및 요약 출력

### 변경됨
- 제목 추출 로직 개선 (`extract_title` 함수)
- 날짜 파싱 로직 강화 (다양한 날짜 형식 지원)

### 수정됨
- 일부 기관의 게시판 구조 변경에 대응
- 페이징 로직 안정성 개선

---

## [0.1.0] - 2025-11-10 (알파)

### 추가됨
- 초기 프로젝트 구조 생성
- 지방청 11개 크롤링 기본 구현
- 기본 데이터 저장 기능 (CSV)

### 알려진 이슈
- 일부 기관의 게시판 구조 미지원
- 중복 제거 미구현

---

## 변경 유형 (Change Types)

이 프로젝트는 다음과 같은 변경 유형을 사용합니다:

- **추가됨 (Added)**: 새로운 기능
- **변경됨 (Changed)**: 기존 기능의 변경사항
- **더 이상 사용되지 않음 (Deprecated)**: 곧 제거될 기능
- **제거됨 (Removed)**: 제거된 기능
- **수정됨 (Fixed)**: 버그 수정
- **보안 (Security)**: 보안 관련 수정

---

## 버전 관리 규칙

- **Major (X.0.0)**: 호환성이 깨지는 대규모 변경
- **Minor (0.X.0)**: 하위 호환성을 유지하는 새로운 기능
- **Patch (0.0.X)**: 하위 호환성을 유지하는 버그 수정

---

## 링크

- [Unreleased]: https://github.com/JSfa9586/crawlling/compare/v1.0.0...HEAD
- [1.0.0]: https://github.com/JSfa9586/crawlling/releases/tag/v1.0.0
- [0.2.0]: https://github.com/JSfa9586/crawlling/releases/tag/v0.2.0
- [0.1.0]: https://github.com/JSfa9586/crawlling/releases/tag/v0.1.0
