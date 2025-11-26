# 🚀 GitHub 업로드 및 배포 가이드

## 📋 목차
1. [요약](#요약)
2. [requirements.txt 검증 결과](#1-requirementstxt-검증-결과)
3. [.gitignore 검증 결과](#2-gitignore-검증-결과)
4. [프로젝트 파일 구조](#3-프로젝트-파일-구조)
5. [환경 변수 설정](#4-환경-변수-설정)
6. [GitHub 업로드 절차](#5-github-업로드-절차)
7. [GitHub Actions 설정](#6-github-actions-설정)
8. [트러블슈팅](#7-트러블슈팅)

---

## 요약

### ✅ 검증 완료 항목
- [x] requirements.txt 패키지 버전 최신화
- [x] .gitignore 보안 설정 검증
- [x] 의존성 설치 테스트 통과
- [x] Python 스크립트 import 분석
- [x] 환경 변수 목록 작성

### 🎯 배포 준비 상태
**100% 준비 완료** - 즉시 GitHub 업로드 가능

---

## 1. requirements.txt 검증 결과

### 📦 업데이트된 패키지 목록

```txt
# Web scraping
requests==2.32.5          (2.31.0 → 2.32.5)
beautifulsoup4==4.14.2    (4.12.3 → 4.14.2)
lxml==6.0.2               (5.1.0 → 6.0.2)

# Data processing
pandas==2.3.3             (2.2.0 → 2.3.3)
pytz==2025.2              (2024.1 → 2025.2)
openpyxl==3.1.5           (3.1.2 → 3.1.5)

# Google Sheets API
gspread==6.2.1            (6.0.0 → 6.2.1)
google-auth==2.41.1       (2.27.0 → 2.41.1)
google-auth-oauthlib==1.2.3   (1.2.0 → 1.2.3)
google-auth-httplib2==0.2.1   (0.2.0 → 0.2.1)
```

### ✅ 검증 결과
- **누락된 패키지**: 없음
- **불필요한 패키지**: 없음
- **버전 충돌**: 없음
- **의존성 테스트**: ✅ 통과

```bash
# 의존성 검증 실행
python test_dependencies.py

# 결과
✅ 모든 의존성 정상
```

---

## 2. .gitignore 검증 결과

### 🔒 보안 설정 (매우 중요!)

```gitignore
# Google Credentials (CRITICAL - NEVER COMMIT)
*.json
!requirements.json
!package.json
!tsconfig.json
```

**보안 검증 결과:**
- ✅ Google Service Account JSON 보호됨
- ✅ 민감한 credentials 파일 차단됨
- ✅ 크롤링 결과 CSV/Excel 제외됨
- ✅ Python 캐시 파일 제외됨
- ✅ 환경 변수 파일 (.env) 제외됨

### 📊 커버리지 분석

| 항목 | 상태 | 비고 |
|------|------|------|
| Python 캐시 | ✅ | `__pycache__/`, `*.pyc` |
| 가상환경 | ✅ | `venv/`, `env/` |
| **Google Credentials** | ✅ | **매우 중요!** |
| 크롤링 결과 | ✅ | `*.csv`, `*.xlsx` |
| 로그 파일 | ✅ | `*.log` |
| IDE 설정 | ✅ | `.vscode/`, `.idea/` |
| OS 파일 | ✅ | `.DS_Store`, `Thumbs.db` |

---

## 3. 프로젝트 파일 구조

```
C:\AI\251118/
│
├── 🐍 핵심 Python 스크립트 (GitHub 업로드)
│   ├── marine_ministry_crawler_final.py   # 산하기관 전체 크롤러 ⭐⭐⭐⭐⭐
│   ├── mof_crawler.py                     # 해양수산부 본부 크롤러 ⭐⭐⭐⭐
│   ├── upload_to_gsheet.py                # Google Sheets 업로드 ⭐⭐⭐⭐⭐
│   ├── resize_columns.py                  # 시트 서식 조정 유틸 ⭐⭐
│   └── test_dependencies.py               # 의존성 검증 스크립트 ⭐⭐⭐
│
├── ⚙️ 설정 파일 (GitHub 업로드)
│   ├── requirements.txt                   # Python 의존성 ✅
│   ├── .gitignore                         # Git 제외 파일 ✅
│   └── daily-crawling.yml                 # GitHub Actions 워크플로우 ✅
│
├── 📚 문서 (선택적 업로드)
│   ├── README.md                          # 프로젝트 설명 (작성 권장)
│   ├── DEPLOYMENT_GUIDE.md                # 이 파일
│   └── *.md (기타 문서)                   # 선택 사항
│
├── 🔴 절대 업로드 금지 (gitignore됨)
│   ├── gen-lang-client-*.json             # Google Credentials 🔥
│   ├── *.csv, *.xlsx                      # 크롤링 결과
│   ├── __pycache__/                       # Python 캐시
│   └── test_mof.py                        # 테스트 스크립트
│
└── 🗂️ 불필요한 파일
    ├── read_docs.py                       # 문서 읽기 유틸 (삭제 가능)
    └── AI251118crawlling/                 # 용도 불명 디렉토리
```

### 📁 업로드 권장 파일

**필수:**
- `marine_ministry_crawler_final.py`
- `mof_crawler.py`
- `upload_to_gsheet.py`
- `requirements.txt`
- `.gitignore`
- `daily-crawling.yml` → `.github/workflows/daily-crawling.yml`로 이동 필요

**권장:**
- `README.md` (새로 작성)
- `DEPLOYMENT_GUIDE.md` (이 파일)
- `test_dependencies.py`

**선택:**
- `resize_columns.py`
- 기타 문서 파일 (`.md`)

---

## 4. 환경 변수 설정

### 🔑 GitHub Actions Secrets (필수)

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름 | 설명 | 필수 | 예시 |
|-------------|------|------|------|
| `GOOGLE_CREDENTIALS_JSON` | Google Service Account JSON 전체 내용 | ✅ | `{"type": "service_account", "project_id": "...", ...}` |
| `SPREADSHEET_ID` | Google Sheets 문서 ID | ✅ | `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw` |
| `SLACK_BOT_TOKEN` | Slack 알림용 Bot 토큰 | ⚪ | `xoxb-1234567890-...` |
| `SLACK_CHANNEL_ID` | Slack 채널 ID | ⚪ | `C01234567` |
| `MAIL_USERNAME` | Gmail 주소 (알림용) | ⚪ | `your-email@gmail.com` |
| `MAIL_PASSWORD` | Gmail 앱 비밀번호 | ⚪ | `abcd efgh ijkl mnop` |
| `NOTIFICATION_EMAIL` | 알림 받을 이메일 주소 | ⚪ | `notify@example.com` |

### 📍 GOOGLE_CREDENTIALS_JSON 설정 방법

#### 1단계: JSON 파일 내용 복사
```bash
# Windows PowerShell
Get-Content gen-lang-client-0556505482-e847371ea87e.json | Set-Clipboard

# 또는 메모장으로 열어서 전체 복사
notepad gen-lang-client-0556505482-e847371ea87e.json
```

#### 2단계: GitHub Secrets에 추가
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. **New repository secret** 클릭
3. Name: `GOOGLE_CREDENTIALS_JSON`
4. Secret: JSON 전체 내용 붙여넣기 (공백, 줄바꿈 모두 포함)
5. **Add secret** 클릭

#### 3단계: 검증
- GitHub Actions 워크플로우가 자동으로 JSON 유효성 검증
- `jq empty` 명령으로 형식 확인

### 📍 SPREADSHEET_ID 찾기

Google Sheets URL에서 추출:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                                         ^^^^^^^^^^^^^^^
                                         이 부분이 ID
```

**예시:**
```
URL: https://docs.google.com/spreadsheets/d/1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw/edit
ID:  1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw
```

### 📧 Slack/Email 알림 설정 (선택사항)

#### Slack 설정
1. Slack App 생성: https://api.slack.com/apps
2. Bot Token 발급 (`xoxb-...`)
3. 채널 ID 확인 (채널 우클릭 → 링크 복사 → 마지막 부분)
4. GitHub Secrets에 `SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID` 추가

#### Gmail 설정
1. Google 계정 → 보안 → 2단계 인증 활성화
2. 앱 비밀번호 생성: https://myaccount.google.com/apppasswords
3. GitHub Secrets에 `MAIL_USERNAME`, `MAIL_PASSWORD` 추가

---

## 5. GitHub 업로드 절차

### 🔧 사전 준비

#### 1. 불필요한 파일 제거 (선택)
```bash
# PowerShell
Remove-Item read_docs.py
Remove-Item -Recurse -Force AI251118crawlling
```

#### 2. README.md 작성 (권장)
```bash
# 간단한 README 생성
notepad README.md
```

**README.md 예시:**
```markdown
# 해양수산부 산하기관 크롤러

매일 자동으로 해양수산부 및 산하기관의 공지사항, 입찰, 인사발령을 수집하여 Google Sheets에 업로드합니다.

## 기능
- 해양수산부 본부 (공지사항, 입찰, 인사)
- 지방해양수산청 11개 기관
- 해양환경공단
- 항만공사 4개 기관
- 어업관리단 2개 기관

## 실행 환경
- Python 3.11
- GitHub Actions (매일 KST 09:00 자동 실행)

## 설정 방법
자세한 내용은 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 참조
```

#### 3. .github/workflows 디렉토리 구조 생성
```bash
# PowerShell
New-Item -ItemType Directory -Force -Path .github\workflows
Move-Item daily-crawling.yml .github\workflows\
```

### 📤 Git 저장소 초기화 및 업로드

```bash
# PowerShell에서 실행
cd C:\AI\251118

# Git 초기화
git init

# 원격 저장소 추가 (GitHub에서 생성 후)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Marine Ministry Crawler

- 해양수산부 산하기관 크롤러 추가
- GitHub Actions 워크플로우 설정
- Google Sheets 자동 업로드 기능
- 최근 7일 게시물 자동 수집"

# GitHub에 푸시
git push -u origin main
```

### ⚠️ 업로드 전 최종 확인

```bash
# .gitignore 작동 확인
git status

# 다음 파일들이 보이면 안 됩니다:
# ❌ gen-lang-client-*.json
# ❌ *.csv
# ❌ *.xlsx
# ❌ __pycache__/
```

**만약 credentials 파일이 보인다면:**
```bash
# 즉시 중단하고 .gitignore 확인
git reset
```

---

## 6. GitHub Actions 설정

### ✅ 워크플로우 파일 위치 확인

```
.github/workflows/daily-crawling.yml
```

### 🕐 실행 스케줄

- **자동 실행**: 매일 UTC 00:00 (KST 09:00)
- **수동 실행**: Actions 탭 → "Run workflow" 버튼
- **코드 변경 시**: main 브랜치에 push하면 자동 테스트

### 🔍 실행 확인

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽 "Daily Marine Ministry Crawling" 클릭
3. 최근 실행 내역 확인

### 📊 실행 결과 확인

#### 성공 시:
- ✅ 모든 단계 녹색 체크
- 크롤링 결과 아티팩트 다운로드 가능
- Google Sheets에 자동 업로드

#### 실패 시:
- ❌ 실패한 단계 빨간색 X
- 로그 확인 가능
- Slack/Email 알림 발송 (설정 시)

### 📥 크롤링 결과 다운로드

1. Actions → 워크플로우 실행 클릭
2. 하단 **Artifacts** 섹션
3. `crawling-results-XXX` 다운로드
4. ZIP 압축 해제 → CSV/Excel 파일

---

## 7. 트러블슈팅

### ❌ 문제: "GOOGLE_CREDENTIALS_JSON" secret not found

**원인**: GitHub Secrets가 설정되지 않음

**해결:**
1. Settings → Secrets and variables → Actions
2. `GOOGLE_CREDENTIALS_JSON` 추가
3. JSON 전체 내용 복사-붙여넣기

---

### ❌ 문제: Invalid JSON format

**원인**: JSON 파일 형식 오류

**해결:**
```bash
# JSON 유효성 검증 (Windows)
powershell -Command "Get-Content gen-lang-client-*.json | ConvertFrom-Json"

# 또는 온라인 도구 사용
# https://jsonlint.com/
```

---

### ❌ 문제: pip install 실패

**원인**: requirements.txt 형식 오류

**해결:**
```bash
# 의존성 검증
python test_dependencies.py

# 수동 설치
pip install -r requirements.txt
```

---

### ❌ 문제: Google Sheets 권한 오류

**원인**: Service Account에 Sheets 접근 권한 없음

**해결:**
1. Google Sheets 열기
2. 우측 상단 **공유** 클릭
3. Service Account 이메일 추가:
   - `gen-lang-client@PROJECT_ID.iam.gserviceaccount.com`
4. 권한: **편집자**
5. **전송** 클릭

---

### ❌ 문제: 크롤링 결과 0건

**원인**: 최근 7일간 새 게시물이 없음

**해결:**
- 정상 동작입니다.
- 실제 게시물이 올라오면 자동으로 수집됩니다.

---

### ❌ 문제: 특정 사이트 크롤링 실패

**원인**: 사이트 구조 변경 또는 접속 차단

**해결:**
```bash
# 로컬에서 수동 테스트
python marine_ministry_crawler_final.py

# 특정 기관만 테스트
# 코드에서 해당 기관 부분만 주석 해제
```

---

## 8. 배포 후 확인 사항

### ✅ 체크리스트

- [ ] GitHub에 코드 업로드 완료
- [ ] `.github/workflows/daily-crawling.yml` 파일 위치 확인
- [ ] GitHub Secrets 2개 이상 설정 (GOOGLE_CREDENTIALS_JSON, SPREADSHEET_ID)
- [ ] Actions 탭에서 워크플로우 보임
- [ ] 수동 실행 테스트 성공
- [ ] Google Sheets에 데이터 업로드 확인
- [ ] credentials 파일이 GitHub에 없음 확인

### 🎯 다음 단계

1. **모니터링 설정**
   - Slack/Email 알림 활성화 (선택)
   - 크롤링 실패 시 알림 받기

2. **대시보드 구축 (선택)**
   - Vercel에 프론트엔드 배포
   - Google Sheets 데이터 시각화

3. **확장 기능**
   - 더 많은 기관 추가
   - 키워드 필터링
   - 알림 기능 강화

---

## 📞 지원

문제가 발생하면:
1. GitHub Issues 생성
2. 에러 로그 첨부
3. 실행 환경 정보 (Python 버전, OS)

---

**생성일**: 2025-11-18
**작성자**: Claude Code
**버전**: 1.0
