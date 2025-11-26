# 기여 가이드 (Contributing Guide)

먼저, 이 프로젝트에 기여해주셔서 진심으로 감사드립니다! 🎉

이 문서는 프로젝트에 기여하는 방법을 안내합니다.

---

## 📋 목차

- [행동 강령](#행동-강령)
- [어떻게 기여할 수 있나요?](#어떻게-기여할-수-있나요)
- [이슈 제보하기](#이슈-제보하기)
- [Pull Request 제출하기](#pull-request-제출하기)
- [개발 환경 설정](#개발-환경-설정)
- [코딩 규칙](#코딩-규칙)
- [커밋 메시지 가이드](#커밋-메시지-가이드)
- [테스트](#테스트)
- [문서화](#문서화)
- [리뷰 프로세스](#리뷰-프로세스)

---

## 🤝 행동 강령

이 프로젝트는 모든 기여자가 존중받는 환경을 추구합니다.

### 우리의 약속

- 다양한 배경과 경험을 가진 사람들을 환영합니다
- 건설적인 피드백을 주고받습니다
- 다른 관점과 경험을 존중합니다
- 실수를 인정하고 배웁니다

### 금지 행위

- 괴롭힘, 차별, 모욕적인 언어 사용
- 개인 정보 무단 공개
- 다른 사람의 기여를 폄하하는 행동

---

## 🚀 어떻게 기여할 수 있나요?

### 1. 이슈 제보

- 버그 발견 시 이슈 생성
- 새로운 기능 제안
- 문서 개선 제안

### 2. 코드 기여

- 버그 수정
- 새로운 기능 구현
- 성능 개선
- 코드 리팩토링

### 3. 문서 개선

- README 개선
- 주석 추가
- 사용 예시 추가
- 번역 (영어, 일본어 등)

### 4. 테스트

- 테스트 케이스 추가
- 버그 재현 및 확인
- 성능 테스트

### 5. 리뷰

- Pull Request 리뷰
- 코드 품질 개선 제안

---

## 🐛 이슈 제보하기

### 버그 리포트

버그를 발견하셨나요? [이슈 생성](https://github.com/JSfa9586/crawlling/issues/new)을 통해 알려주세요.

#### 포함할 내용

```markdown
### 버그 설명
버그에 대한 명확하고 간결한 설명을 작성해주세요.

### 재현 방법
1. '...' 페이지로 이동
2. '....' 클릭
3. '....'까지 스크롤
4. 오류 확인

### 예상 동작
어떤 동작을 기대했는지 설명해주세요.

### 스크린샷
가능하다면 스크린샷을 첨부해주세요.

### 환경
- OS: [예: Windows 11]
- Python 버전: [예: 3.11.5]
- 프로젝트 버전: [예: 1.0.0]

### 추가 정보
버그와 관련된 추가 정보를 작성해주세요.
```

### 기능 제안

새로운 기능을 제안하고 싶으신가요?

#### 포함할 내용

```markdown
### 기능 설명
제안하는 기능에 대한 명확한 설명을 작성해주세요.

### 동기
이 기능이 왜 필요한지 설명해주세요.

### 해결 방안
어떻게 구현할 수 있을지 아이디어를 공유해주세요.

### 대안
고려한 다른 대안이 있다면 설명해주세요.

### 추가 정보
관련된 추가 정보를 작성해주세요.
```

---

## 🔧 Pull Request 제출하기

### 프로세스

1. **Fork**: 저장소를 Fork합니다
2. **Branch**: 새 브랜치를 생성합니다
3. **Commit**: 변경사항을 커밋합니다
4. **Push**: Fork한 저장소에 푸시합니다
5. **PR**: Pull Request를 생성합니다

### 단계별 가이드

#### 1. 저장소 Fork

GitHub에서 **Fork** 버튼을 클릭합니다.

#### 2. 로컬에 Clone

```bash
git clone https://github.com/YOUR_USERNAME/crawlling.git
cd crawlling
```

#### 3. 원본 저장소를 upstream으로 추가

```bash
git remote add upstream https://github.com/JSfa9586/crawlling.git
```

#### 4. 새 브랜치 생성

```bash
# 브랜치 이름 규칙
# feature/기능명 - 새로운 기능
# fix/버그명 - 버그 수정
# docs/문서명 - 문서 수정
# refactor/내용 - 리팩토링

git checkout -b feature/add-new-crawler
```

#### 5. 변경사항 작성

코드를 수정하고 테스트합니다.

#### 6. 변경사항 커밋

```bash
git add .
git commit -m "feat: 여수광양항만공사 크롤러 추가"
```

커밋 메시지는 [커밋 메시지 가이드](#커밋-메시지-가이드)를 참조하세요.

#### 7. 최신 변경사항 동기화

```bash
git fetch upstream
git rebase upstream/main
```

#### 8. Fork한 저장소에 푸시

```bash
git push origin feature/add-new-crawler
```

#### 9. Pull Request 생성

GitHub에서 **Pull Request** 버튼을 클릭하고 다음 정보를 포함합니다:

```markdown
## 변경 사항
이 PR에서 무엇을 변경했는지 설명해주세요.

## 관련 이슈
Closes #이슈번호

## 변경 유형
- [ ] 버그 수정 (Bug fix)
- [ ] 새로운 기능 (New feature)
- [ ] 문서 업데이트 (Documentation)
- [ ] 리팩토링 (Refactoring)
- [ ] 테스트 추가 (Test)

## 체크리스트
- [ ] 코드가 코딩 규칙을 준수합니다
- [ ] 주석을 추가했습니다
- [ ] 문서를 업데이트했습니다
- [ ] 테스트를 추가했습니다
- [ ] 모든 테스트가 통과합니다

## 스크린샷 (선택 사항)
변경사항을 보여주는 스크린샷을 첨부해주세요.

## 추가 정보
PR과 관련된 추가 정보를 작성해주세요.
```

---

## 💻 개발 환경 설정

### 1. Python 가상환경 생성

```bash
python -m venv venv
```

#### Windows
```bash
venv\Scripts\activate
```

#### Linux/macOS
```bash
source venv/bin/activate
```

### 2. 의존성 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 개발용 패키지 설치 (선택 사항)

```bash
pip install -r requirements-dev.txt
```

개발용 패키지 예시:
- `black` - 코드 포맷터
- `flake8` - 린터
- `pytest` - 테스트 프레임워크
- `mypy` - 타입 체커

### 4. Git Hook 설정 (선택 사항)

```bash
# pre-commit 설치
pip install pre-commit

# pre-commit hook 설정
pre-commit install
```

---

## 📏 코딩 규칙

### Python 스타일 가이드

이 프로젝트는 [PEP 8](https://peps.python.org/pep-0008/) 스타일 가이드를 따릅니다.

### 주요 규칙

#### 1. 들여쓰기
- 4칸 공백 사용 (탭 사용 금지)

```python
# ✅ 좋은 예
def function():
    if condition:
        do_something()

# ❌ 나쁜 예
def function():
  if condition:
    do_something()
```

#### 2. 줄 길이
- 최대 88자 (Black 포맷터 기준)
- 주석은 최대 72자

#### 3. 네이밍 규칙

```python
# 클래스: PascalCase
class MarineMinistryJejCrawler:
    pass

# 함수/변수: snake_case
def crawl_board():
    post_count = 0

# 상수: UPPER_SNAKE_CASE
MAX_PAGES = 10
BASE_URL = "https://example.com"

# 비공개: 앞에 언더스코어
def _internal_function():
    pass
```

#### 4. 임포트 순서

```python
# 1. 표준 라이브러리
import os
import sys
from datetime import datetime

# 2. 서드파티 라이브러리
import requests
import pandas as pd
from bs4 import BeautifulSoup

# 3. 로컬 애플리케이션
from .utils import helper_function
```

#### 5. 독스트링

```python
def crawl_board(board_name: str, page: int = 1) -> tuple:
    """특정 게시판의 특정 페이지 크롤링

    Args:
        board_name: 게시판 이름 ('공지사항', '입찰', '인사')
        page: 페이지 번호 (1부터 시작)

    Returns:
        (게시물 리스트, 7일 이내 게시물 있음 여부)

    Raises:
        ValueError: board_name이 유효하지 않을 때

    Example:
        >>> posts, has_recent = crawl_board('공지사항', 1)
        >>> print(len(posts))
        15
    """
    pass
```

#### 6. 타입 힌트 (권장)

```python
from typing import List, Dict, Optional

def parse_date(date_str: str) -> Optional[datetime]:
    """날짜 문자열을 datetime 객체로 변환"""
    pass

def get_posts() -> List[Dict[str, str]]:
    """게시물 목록 반환"""
    pass
```

### 코드 포맷팅

#### Black 사용 (권장)

```bash
# 전체 프로젝트 포맷팅
black .

# 특정 파일 포맷팅
black marine_ministry_crawler_final.py
```

#### Flake8 린트

```bash
# 전체 프로젝트 린트
flake8 .

# 특정 파일 린트
flake8 marine_ministry_crawler_final.py
```

---

## 📝 커밋 메시지 가이드

### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅 (기능 변경 없음)
- **refactor**: 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스, 패키지 등 변경

### Scope (선택 사항)

변경 범위를 명시합니다.
- `crawler`: 크롤러 로직
- `upload`: Google Sheets 업로드
- `actions`: GitHub Actions
- `docs`: 문서

### Subject

- 첫 글자는 소문자
- 마침표 없음
- 명령형 사용 ("added" 대신 "add")
- 50자 이내

### Body (선택 사항)

- 변경 이유와 방법 설명
- 72자마다 줄바꿈

### Footer (선택 사항)

- 관련 이슈 참조
- Breaking Changes 명시

### 예시

```bash
# 기본
feat: 여수광양항만공사 크롤러 추가

# 상세
feat(crawler): 여수광양항만공사 크롤러 추가

Selenium을 사용하여 JavaScript 렌더링 지원.
최근 7일 데이터 자동 필터링 기능 포함.

Closes #42

# 버그 수정
fix(upload): Google Sheets 중복 제거 오류 수정

링크 비교 시 대소문자 무시하도록 변경

# 문서
docs: README에 여수광양항만공사 크롤링 가이드 추가

# Breaking Change
feat(api): 크롤러 API 인터페이스 변경

BREAKING CHANGE: crawl_board() 함수의 반환값이 변경되었습니다.
기존: (posts, has_recent)
변경: {'posts': [...], 'has_recent': True, 'count': 15}
```

---

## 🧪 테스트

### 테스트 작성

#### 1. 테스트 파일 생성

```bash
# tests/ 디렉토리에 생성
tests/test_crawler.py
tests/test_upload.py
```

#### 2. 테스트 작성 예시

```python
import pytest
from marine_ministry_crawler_final import MarineMinistryJejCrawler

def test_parse_date():
    """날짜 파싱 테스트"""
    crawler = MarineMinistryJejCrawler()

    # 정상 케이스
    date_obj = crawler.parse_date("2025.11.18")
    assert date_obj is not None
    assert date_obj.year == 2025

    # 비정상 케이스
    date_obj = crawler.parse_date("invalid")
    assert date_obj is None

def test_is_within_7days():
    """7일 이내 게시물 확인 테스트"""
    crawler = MarineMinistryJejCrawler()

    from datetime import datetime, timedelta
    import pytz

    seoul_tz = pytz.timezone('Asia/Seoul')
    today = datetime.now(seoul_tz)

    # 오늘 날짜
    assert crawler.is_within_7days(today) is True

    # 10일 전 날짜
    old_date = today - timedelta(days=10)
    assert crawler.is_within_7days(old_date) is False
```

### 테스트 실행

```bash
# 전체 테스트 실행
pytest

# 특정 파일 테스트
pytest tests/test_crawler.py

# 특정 테스트 함수
pytest tests/test_crawler.py::test_parse_date

# 커버리지 확인
pytest --cov=. --cov-report=html
```

---

## 📚 문서화

### 코드 주석

- 복잡한 로직에는 주석 추가
- "무엇을" 하는지보다 "왜" 하는지 설명
- 한글 또는 영어 사용 가능

```python
# ✅ 좋은 주석
# 서버 부하를 방지하기 위해 요청 간 지연 시간 추가
time.sleep(1)

# ❌ 나쁜 주석
# time.sleep 호출
time.sleep(1)
```

### README 업데이트

새로운 기능을 추가하면 README.md를 업데이트합니다:

- 기능 설명
- 사용 예시
- 설정 방법

### CHANGELOG 업데이트

CHANGELOG.md에 변경사항을 기록합니다:

```markdown
## [Unreleased]

### 추가됨
- 여수광양항만공사 크롤러 추가 (#42)

### 수정됨
- Google Sheets 중복 제거 오류 수정 (#45)
```

---

## 👀 리뷰 프로세스

### Pull Request 리뷰 기준

1. **코드 품질**
   - PEP 8 준수
   - 명확한 변수명과 함수명
   - 적절한 주석

2. **기능**
   - 요구사항을 충족하는지
   - 버그가 없는지
   - 엣지 케이스 처리

3. **테스트**
   - 테스트 케이스 포함
   - 모든 테스트 통과

4. **문서**
   - README 업데이트
   - 주석 추가
   - CHANGELOG 업데이트

### 리뷰어로 참여하기

- 건설적인 피드백 제공
- 칭찬도 중요합니다!
- 질문하기를 두려워하지 마세요

### 리뷰 받을 때

- 피드백에 감사하기
- 질문에 답변하기
- 필요 시 코드 수정

---

## 🎯 첫 기여 가이드

처음 기여하시나요? 환영합니다! 다음 이슈부터 시작해보세요:

- `good first issue` 라벨: 초보자에게 적합한 이슈
- `help wanted` 라벨: 도움이 필요한 이슈
- `documentation` 라벨: 문서 개선 이슈

### 간단한 기여 아이디어

1. **오타 수정**: README나 주석의 오타 찾기
2. **예시 추가**: 사용 예시 코드 추가
3. **번역**: 문서 번역 (영어, 일본어 등)
4. **테스트**: 버그 재현 및 리포트
5. **리뷰**: 다른 사람의 PR 리뷰

---

## 📞 도움이 필요하신가요?

- **GitHub Issues**: [이슈 생성](https://github.com/JSfa9586/crawlling/issues)
- **Discussions**: [토론 시작](https://github.com/JSfa9586/crawlling/discussions)

---

## 🙏 감사합니다!

모든 기여는 프로젝트를 더 나아지게 만듭니다.

당신의 시간과 노력에 진심으로 감사드립니다! ❤️

---

<div align="center">

**Happy Contributing!** 🚀

[맨 위로 이동](#기여-가이드-contributing-guide)

</div>
