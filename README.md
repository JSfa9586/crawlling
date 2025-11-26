# 해양수산부 통합 공지사항 크롤러

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-success)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-API-red)

**해양수산부 본부 및 산하기관 16개의 공지사항, 입찰, 인사발령을 자동으로 수집하는 크롤러**

[기능](#주요-기능) • [설치](#설치) • [사용법](#사용법) • [자동화](#자동화-github-actions) • [기여](#기여하기)

</div>

---

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [시스템 요구사항](#시스템-요구사항)
- [설치](#설치)
- [설정](#설정)
- [사용법](#사용법)
- [크롤링 대상 기관](#크롤링-대상-기관)
- [자동화 (GitHub Actions)](#자동화-github-actions)
- [프로젝트 구조](#프로젝트-구조)
- [결과 데이터 형식](#결과-데이터-형식)
- [문제 해결](#문제-해결)
- [향후 계획](#향후-계획)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

---

## 🌊 프로젝트 개요

**해양수산부 통합 공지사항 크롤러**는 해양수산부 본부와 16개 산하기관의 공지사항, 입찰, 인사발령 정보를 자동으로 수집하는 Python 기반 웹 크롤러입니다.

### 프로젝트 목적

- 해양수산부 관련 기관의 정보를 한곳에서 통합 관리
- 수동 확인 작업 자동화로 시간 절약
- 최신 공지사항 및 입찰 정보 신속 파악
- Google Sheets를 통한 실시간 공유 및 협업

### 주요 특징

- **포괄적인 범위**: 본부 + 지방청 11개 + 어업관리단 2개 + 공단 1개 + 항만공사 3개
- **자동 스케줄링**: GitHub Actions를 통한 일일 자동 실행
- **중복 제거**: 동일 게시물 자동 필터링
- **클라우드 연동**: Google Sheets 자동 업로드
- **시간 기준**: Asia/Seoul 시간대 기준 최근 7일 데이터

---

## ✨ 주요 기능

### 1. 다중 기관 크롤링

- **16개 기관 동시 크롤링**: 지방청, 어업관리단, 공단, 항만공사
- **3개 게시판 타입**: 공지사항, 입찰, 인사발령
- **스마트 페이징**: 최근 게시물이 없을 때까지 자동 페이지 이동

### 2. 데이터 처리

- **날짜 필터링**: 최근 7일 (당일 포함) 게시물만 수집
- **중복 제거**: URL 기반 자동 중복 제거
- **인코딩 최적화**: UTF-8 완벽 지원

### 3. 결과 저장

- **다중 포맷 지원**:
  - CSV 파일 (`utf-8-sig` 인코딩)
  - Excel 파일 (`.xlsx`)
  - Google Sheets 자동 업로드

### 4. 안정성

- **에러 핸들링**: 개별 기관 오류 시 다른 기관 크롤링 계속 진행
- **타임아웃 설정**: 네트워크 지연 방지
- **요청 간격**: 서버 부하 방지를 위한 지연 시간 설정

---

## 💻 시스템 요구사항

### 필수 요구사항

- **Python**: 3.8 이상
- **운영체제**: Windows / Linux / macOS
- **네트워크**: 안정적인 인터넷 연결

### 선택 사항

- **Google Cloud Project**: Google Sheets API 사용 시
- **GitHub Account**: GitHub Actions 자동화 사용 시

---

## 📦 설치

### 1. 저장소 클론

```bash
git clone git@github.com:JSfa9586/crawlling.git
cd crawlling
```

### 2. Python 가상환경 생성 (권장)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 패키지 설치

```bash
pip install -r requirements.txt
```

### 설치되는 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `requests` | 2.31.0 | HTTP 요청 |
| `beautifulsoup4` | 4.12.3 | HTML 파싱 |
| `lxml` | 5.1.0 | XML/HTML 파서 |
| `pandas` | 2.2.0 | 데이터 처리 |
| `pytz` | 2024.1 | 시간대 처리 |
| `openpyxl` | 3.1.2 | Excel 파일 생성 |
| `gspread` | 6.0.0 | Google Sheets API |
| `google-auth` | 2.27.0 | Google 인증 |

---

## ⚙️ 설정

### Google Sheets API 설정 (선택 사항)

Google Sheets 자동 업로드 기능을 사용하려면 다음 단계를 따르세요:

#### 1. Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름: `해양수산부 크롤러` (또는 원하는 이름)

#### 2. Google Sheets API 활성화

1. **API 및 서비스** → **라이브러리** 이동
2. "Google Sheets API" 검색 후 활성화
3. "Google Drive API" 검색 후 활성화

#### 3. 서비스 계정 생성

1. **IAM 및 관리자** → **서비스 계정** 이동
2. **서비스 계정 만들기** 클릭
3. 서비스 계정 이름: `crawler-bot` (또는 원하는 이름)
4. 역할: `편집자` 권한 부여

#### 4. 서비스 계정 키 다운로드

1. 생성된 서비스 계정 클릭
2. **키** 탭 → **키 추가** → **새 키 만들기**
3. 키 유형: **JSON** 선택
4. 다운로드된 JSON 파일을 프로젝트 폴더에 저장
   - 파일명: `gen-lang-client-0556505482-e847371ea87e.json` (또는 원하는 이름)

#### 5. Google Sheets 공유

1. Google Sheets에서 새 스프레드시트 생성
2. 서비스 계정 이메일 주소 복사 (예: `crawler-bot@project-id.iam.gserviceaccount.com`)
3. 스프레드시트 공유 → 서비스 계정 이메일로 **편집자** 권한 부여
4. 스프레드시트 URL에서 **Spreadsheet ID** 복사
   - URL 형식: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

#### 6. 환경 변수 설정

`upload_to_gsheet.py` 파일에서 다음 값을 수정:

```python
CREDENTIALS_FILE = r'경로\to\your-credentials.json'
SPREADSHEET_ID = '여기에-스프레드시트-ID-입력'
```

---

## 🚀 사용법

### 기본 크롤링 실행

#### 1. 16개 산하기관 크롤링

```bash
python marine_ministry_crawler_final.py
```

**결과 파일**:
- `marine_ministry_posts_YYYYMMDD.csv`
- `marine_ministry_posts_YYYYMMDD.xlsx`

#### 2. 본부 크롤링 (별도 실행 가능)

```bash
python mof_crawler.py
```

**결과 파일**:
- `mof_posts_YYYYMMDD.json`

#### 3. Google Sheets 업로드

```bash
python upload_to_gsheet.py
```

### 실행 예시

```bash
# 전체 프로세스 실행
$ python marine_ministry_crawler_final.py

############################################################
해양수산부 산하기관 크롤링 시작
기준일: 2025-11-18
수집기간: 2025-11-12 ~ 2025-11-18
############################################################

============================================================
크롤링 시작: 부산지방해양수산청 - 공지사항
URL: https://busan.mof.go.kr/ko/board.do?menuIdx=4468
============================================================

1페이지 크롤링 중...
  ✓ [2025-11-18] 비관리청 항만개발사업 시행(변경) 허가...
  ✓ [2025-11-17] 부산항 항만인력 도급분야 선발공고...
  ✓ [2025-11-14] 선박용물건 형식승인 고시

...

############################################################
크롤링 완료!
총 127건의 게시물 수집
CSV 파일: marine_ministry_posts_20251118.csv
Excel 파일: marine_ministry_posts_20251118.xlsx
############################################################
```

---

## 🏢 크롤링 대상 기관

### 해양수산부 본부 (1개)

| 기관명 | 게시판 |
|--------|--------|
| 해양수산부 | 공지사항, 입찰, 인사 |

### 지방청 (11개)

| 번호 | 기관명 | 게시판 |
|------|--------|--------|
| 1 | 부산지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 2 | 인천지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 3 | 여수지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 4 | 마산지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 5 | 울산지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 6 | 동해지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 7 | 군산지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 8 | 목포지방해양수산청 | 공지사항, 입찰 (인사발령 게시판 없음) |
| 9 | 포항지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 10 | 평택지방해양수산청 | 공지사항, 입찰, 인사발령 |
| 11 | 대산지방해양수산청 | 공지사항, 입찰, 인사발령 |

### 어업관리단 (2개)

| 번호 | 기관명 | 게시판 |
|------|--------|--------|
| 1 | 동해어업관리단 | 인사발령 |
| 2 | 남해어업관리단 | 인사발령 |

### 공단 (1개)

| 번호 | 기관명 | 게시판 |
|------|--------|--------|
| 1 | 해양환경공단 | 공지사항 |

### 항만공사 (3개)

| 번호 | 기관명 | 게시판 | 비고 |
|------|--------|--------|------|
| 1 | 부산항만공사 | 공지사항, 입찰 | |
| 2 | 인천항만공사 | 공지사항, 입찰 | |
| 3 | 울산항만공사 | 공지사항, 입찰 | |
| 4 | 여수광양항만공사 | - | JavaScript 렌더링 필요 (미지원) |

**총 16개 기관, 약 40개 게시판 크롤링**

---

## 🤖 자동화 (GitHub Actions)

GitHub Actions를 통해 매일 자동으로 크롤링을 실행할 수 있습니다.

### 워크플로우 파일 설정

`.github/workflows/daily-crawling.yml` 파일이 이미 구성되어 있습니다.

### 실행 스케줄

- **자동 실행**: 매일 KST 09:00 (UTC 00:00)
- **수동 실행**: GitHub Actions 탭에서 "Run workflow" 버튼 클릭
- **코드 변경 시**: `main` 브랜치에 푸시 시 자동 테스트

### GitHub Secrets 설정

GitHub 저장소 설정에서 다음 Secrets을 추가해야 합니다:

1. **Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭

| Secret 이름 | 설명 | 필수 여부 |
|--------------|------|-----------|
| `GOOGLE_CREDENTIALS_JSON` | 서비스 계정 JSON 파일 전체 내용 | 필수 |
| `SPREADSHEET_ID` | Google Sheets ID | 필수 |
| `SLACK_BOT_TOKEN` | Slack 알림용 봇 토큰 | 선택 |
| `SLACK_CHANNEL_ID` | Slack 채널 ID | 선택 |
| `MAIL_USERNAME` | 이메일 알림용 Gmail 주소 | 선택 |
| `MAIL_PASSWORD` | Gmail 앱 비밀번호 | 선택 |
| `NOTIFICATION_EMAIL` | 알림 수신 이메일 | 선택 |

#### 📚 상세 설정 가이드

Secrets 설정에 대한 자세한 내용은 다음 문서를 참조하세요:

- **빠른 시작**: [5단계 설정 가이드](SECRETS_설정_5단계.md) - 5분 안에 완료
- **전체 가이드**: [GitHub Secrets 설정 가이드](GitHub_Secrets_설정_가이드.md) - 문제 해결 포함
- **검증 스크립트**: `verify_secrets.py` - Secrets 유효성 검증

### 실행 결과 확인

1. **GitHub Actions** 탭 이동
2. 워크플로우 실행 내역 확인
3. **Artifacts** 섹션에서 결과 파일 다운로드 (30일 보관)

### 알림 설정

- **Slack 알림**: `SLACK_BOT_TOKEN` 설정 시 자동 알림
- **이메일 알림**: `MAIL_PASSWORD` 설정 시 자동 이메일 발송

---

## 📁 프로젝트 구조

```
crawlling/
│
├── marine_ministry_crawler_final.py   # 16개 산하기관 크롤러 (메인)
├── mof_crawler.py                     # 해양수산부 본부 크롤러
├── upload_to_gsheet.py                # Google Sheets 업로드 스크립트
├── resize_columns.py                  # Google Sheets 열 너비 조정
├── verify_secrets.py                  # GitHub Secrets 검증 스크립트
│
├── requirements.txt                   # Python 의존성 패키지
├── README.md                          # 프로젝트 문서 (본 파일)
├── LICENSE                            # MIT 라이선스
├── CHANGELOG.md                       # 변경 이력
├── CONTRIBUTING.md                    # 기여 가이드
├── .gitignore                         # Git 무시 파일 목록
│
├── GitHub_Secrets_설정_가이드.md      # GitHub Secrets 전체 설정 가이드
├── SECRETS_설정_5단계.md              # GitHub Secrets 빠른 설정 가이드
│
├── .github/
│   └── workflows/
│       └── daily-crawling.yml         # GitHub Actions 워크플로우
│
├── gen-lang-client-*.json             # Google 서비스 계정 키 (Git 제외)
│
└── marine_ministry_posts_*.csv        # 크롤링 결과 (Git 제외)
└── marine_ministry_posts_*.xlsx       # 크롤링 결과 (Git 제외)
```

### 주요 파일 설명

| 파일명 | 설명 |
|--------|------|
| `marine_ministry_crawler_final.py` | 16개 산하기관 크롤러 메인 로직 |
| `mof_crawler.py` | 해양수산부 본부 크롤러 (별도 실행 가능) |
| `upload_to_gsheet.py` | Google Sheets 업로드 및 중복 제거 |
| `verify_secrets.py` | GitHub Secrets 검증 스크립트 |
| `GitHub_Secrets_설정_가이드.md` | Secrets 설정 전체 가이드 (문제 해결 포함) |
| `SECRETS_설정_5단계.md` | Secrets 빠른 설정 가이드 (5분 완성) |
| `requirements.txt` | Python 의존성 패키지 목록 |
| `daily-crawling.yml` | GitHub Actions 자동화 워크플로우 |

---

## 📊 결과 데이터 형식

### CSV/Excel 파일 구조

| 컬럼명 | 설명 | 예시 |
|--------|------|------|
| `기관구분` | 기관 유형 | 지방청, 공단, 항만공사, 본부, 어업관리단 |
| `기관명` | 기관 이름 | 부산지방해양수산청 |
| `게시판` | 게시판 타입 | 공지사항, 입찰, 인사발령, 인사 |
| `제목` | 게시물 제목 | 비관리청 항만개발사업 시행(변경) 허가... |
| `작성일` | 작성 날짜 | 2025-11-18 |
| `링크` | 게시물 URL | https://busan.mof.go.kr/... |
| `수집일시` | 크롤링 시간 | 2025-11-18 09:00:00 (Google Sheets 업로드 시) |

### 데이터 예시

```csv
기관구분,기관명,게시판,제목,작성일,링크
지방청,부산지방해양수산청,공지사항,비관리청 항만개발사업 시행(변경) 허가...,2025-11-18,https://busan.mof.go.kr/...
지방청,부산지방해양수산청,입찰,부산항 준설토 투기장 관리용역 입찰공고,2025-11-17,https://busan.mof.go.kr/...
공단,해양환경공단,공지사항,2025년 제1차 임시이사회 개최,2025-11-16,https://www.koem.or.kr/...
항만공사,부산항만공사,입찰,청사 시설물 유지보수 공사 입찰,2025-11-15,https://www.busanpa.com/...
```

---

## 🔧 문제 해결

### 자주 발생하는 오류

#### 1. `ModuleNotFoundError`

**문제**: Python 패키지가 설치되지 않음

```bash
ModuleNotFoundError: No module named 'requests'
```

**해결**:
```bash
pip install -r requirements.txt
```

#### 2. 한글 인코딩 오류

**문제**: CSV 파일을 Excel에서 열 때 한글이 깨짐

**해결**:
- Excel에서 **데이터** → **텍스트/CSV 가져오기** → **UTF-8** 선택
- 또는 `.xlsx` 파일 사용 (한글 자동 지원)

#### 3. Google Sheets 인증 오류

**문제**: `google.auth.exceptions.DefaultCredentialsError`

**해결**:
1. 서비스 계정 JSON 파일 경로 확인
2. JSON 파일 형식 유효성 검증
3. Google Sheets API가 활성화되었는지 확인
4. 스프레드시트가 서비스 계정과 공유되었는지 확인

#### 4. 연결 시간 초과

**문제**: `requests.exceptions.Timeout`

**해결**:
- 네트워크 연결 확인
- VPN 사용 시 해제 후 재시도
- 크롤러 재실행 (일부 기관 오류는 자동으로 건너뜀)

#### 5. GitHub Actions 실패

**문제**: 워크플로우 실행 실패

**해결**:
1. **Secrets 검증**:
   - 로컬에서 검증 스크립트 실행:
     ```bash
     # 환경 변수 설정
     export GOOGLE_CREDENTIALS_JSON=$(cat gen-lang-client-*.json)
     export SPREADSHEET_ID="your-spreadsheet-id"

     # 검증 실행
     python verify_secrets.py
     ```
   - `GOOGLE_CREDENTIALS_JSON`이 올바른지 확인
   - `SPREADSHEET_ID`가 정확한지 확인
2. **실행 로그** 확인:
   - GitHub Actions 탭 → 실패한 워크플로우 클릭
   - 각 스텝별 로그 확인
3. **수동 실행 테스트**:
   - "Run workflow" 버튼으로 수동 실행
   - 디버그 모드 활성화
4. **상세 가이드**:
   - [GitHub Secrets 설정 가이드](GitHub_Secrets_설정_가이드.md) 참조
   - 문제 해결 섹션 확인

---

## 🗺️ 향후 계획

### Phase 1: 크롤러 완성 ✅ (완료)
- [x] 16개 기관 크롤링 구현
- [x] Google Sheets 연동
- [x] GitHub Actions 자동화

### Phase 2: 대시보드 개발 (계획 중)
- [ ] Next.js 기반 웹 대시보드 구축
- [ ] 실시간 데이터 시각화
- [ ] 키워드 알림 기능
- [ ] 사용자 맞춤 필터링

### Phase 3: 고급 기능 (장기 계획)
- [ ] AI 기반 중요 공지사항 분류
- [ ] 모바일 앱 개발
- [ ] 여수광양항만공사 크롤링 추가 (Selenium/Playwright)
- [ ] 텔레그램 봇 알림
- [ ] 이메일 다이제스트 발송

---

## 🤝 기여하기

프로젝트에 기여해주셔서 감사합니다! 다음 방법으로 기여할 수 있습니다:

### 기여 방법

1. **이슈 제보**:
   - 버그 발견 시 [Issues](https://github.com/JSfa9586/crawlling/issues) 탭에서 제보
   - 새로운 기능 제안

2. **Pull Request**:
   - Fork → 수정 → Pull Request 생성
   - 상세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md) 참조

3. **문서 개선**:
   - 오타 수정
   - 사용 예시 추가
   - 번역 (영어 등)

### 기여 가이드라인

- **코드 스타일**: PEP 8 준수
- **커밋 메시지**: 명확하고 간결하게 작성
- **테스트**: 변경 사항 테스트 후 제출
- **문서화**: 새 기능 추가 시 문서 업데이트

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

---

## 📄 라이선스

이 프로젝트는 **MIT License** 하에 배포됩니다.

```
MIT License

Copyright (c) 2025 해양수산부 통합 공지사항 크롤러

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 📞 문의

문제가 발생하거나 질문이 있으시면 다음 방법으로 연락주세요:

- **GitHub Issues**: [이슈 생성](https://github.com/JSfa9586/crawlling/issues)
- **이메일**: (필요 시 이메일 주소 추가)

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 라이브러리를 사용합니다:

- [requests](https://github.com/psf/requests) - HTTP 요청
- [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/) - HTML 파싱
- [pandas](https://pandas.pydata.org/) - 데이터 처리
- [gspread](https://github.com/burnash/gspread) - Google Sheets API

---

<div align="center">

**Made with ❤️ for 해양수산부 관계자 여러분**

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!

[맨 위로 이동](#해양수산부-통합-공지사항-크롤러)

</div>
