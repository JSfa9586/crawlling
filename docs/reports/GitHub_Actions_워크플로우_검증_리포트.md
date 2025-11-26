# GitHub Actions 워크플로우 검증 리포트

## 프로젝트 개요
- **프로젝트명**: 해양수산부 산하기관 크롤러
- **목적**: 16개 기관의 공지사항/입찰 게시판 자동 크롤링 및 Google Sheets 업로드
- **검토일**: 2025-11-18
- **검토자**: DevOps Engineer

---

## 1. 워크플로우 구조 검증

### 1.1 Cron 스케줄 설정

#### 현재 요구사항
- 한국 시간(KST) 기준 매일 오전 9시 실행

#### UTC 변환 검증
```yaml
schedule:
  - cron: '0 0 * * *'  # UTC 00:00 = KST 09:00
```

**❌ 문제점**:
- UTC 00:00 = KST 09:00 (한국은 UTC+9)
- 올바른 cron: `'0 0 * * *'` → KST 09:00

**✅ 권장 설정**:
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # UTC 00:00 = KST 09:00
  workflow_dispatch:  # 수동 실행 옵션 추가
  push:
    branches:
      - main
    paths:
      - 'marine_ministry_crawler_final.py'
      - '.github/workflows/daily-crawling.yml'
```

**추가 권장사항**:
- `workflow_dispatch` 추가: 수동 테스트/실행 가능
- `push` 트리거 추가: 코드 변경 시 즉시 테스트

---

### 1.2 Job 의존성 및 순서

#### 제안하는 워크플로우 구조
```yaml
jobs:
  crawl-and-upload:
    name: Crawl Marine Ministry Data
    runs-on: ubuntu-latest
    timeout-minutes: 30  # 전체 작업 타임아웃 설정

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install --upgrade pip
          pip install -r requirements.txt

      - name: Create credentials file
        env:
          GOOGLE_CREDENTIALS_JSON: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
        run: |
          echo "$GOOGLE_CREDENTIALS_JSON" > gen-lang-client-0556505482-e847371ea87e.json

      - name: Run crawler
        id: crawler
        timeout-minutes: 15
        run: |
          python marine_ministry_crawler_final.py
        continue-on-error: false

      - name: Upload to Google Sheets
        id: upload
        timeout-minutes: 10
        env:
          SPREADSHEET_ID: ${{ secrets.SPREADSHEET_ID }}
        run: |
          python upload_to_gsheet.py
        continue-on-error: false

      - name: Cleanup credentials
        if: always()
        run: |
          rm -f gen-lang-client-0556505482-e847371ea87e.json

      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: crawling-results-${{ github.run_number }}
          path: |
            marine_ministry_posts_*.csv
            marine_ministry_posts_*.xlsx
          retention-days: 30
```

**주요 설계 결정**:
- ✅ 단일 Job 구조: 크롤링-업로드가 순차적이므로 의존성 관리 간소화
- ✅ Step별 타임아웃 설정: 무한 대기 방지
- ✅ `continue-on-error: false`: 오류 시 즉시 중단 (데이터 무결성 보장)
- ✅ `if: always()`: 크레덴셜 삭제 및 아티팩트 업로드는 실패 시에도 실행

---

### 1.3 재시도 로직

#### 권장 구현
```yaml
- name: Run crawler with retry
  id: crawler
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 15
    max_attempts: 3
    retry_wait_seconds: 60
    command: python marine_ministry_crawler_final.py
```

**대안 - Python 스크립트 내부 재시도**:
```python
# marine_ministry_crawler_final.py 수정
import time
from functools import wraps

def retry(max_attempts=3, delay=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"⚠️ 재시도 {attempt+1}/{max_attempts}: {e}")
                    time.sleep(delay * (attempt + 1))  # 지수 백오프
        return wrapper
    return decorator
```

**권장**: Python 내부 재시도 (더 세밀한 제어 가능)

---

## 2. 환경 구성 검토

### 2.1 Python 3.11 적절성

**✅ 양호**:
- Python 3.11은 안정적이며 성능 향상 버전
- `requests`, `beautifulsoup4`, `pandas`, `gspread` 모두 호환

**권장 최적화**:
```yaml
- name: Set up Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'  # pip 캐시 활성화로 설치 속도 향상
```

---

### 2.2 의존성 관리

#### requirements.txt 생성 필요
```txt
# requirements.txt
requests==2.31.0
beautifulsoup4==4.12.3
pandas==2.2.0
pytz==2024.1
openpyxl==3.1.2
lxml==5.1.0
gspread==6.0.0
google-auth==2.27.0
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
```

**설치 최적화**:
```yaml
- name: Cache Python dependencies
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
      ${{ runner.os }}-

- name: Install dependencies
  run: |
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt
```

**예상 캐시 효과**:
- 첫 실행: ~30초
- 캐시 적중 시: ~5초

---

### 2.3 작업 디렉토리 구조

#### 권장 프로젝트 구조
```
.
├── .github/
│   └── workflows/
│       └── daily-crawling.yml
├── marine_ministry_crawler_final.py
├── upload_to_gsheet.py
├── resize_columns.py
├── requirements.txt
├── README.md
└── .gitignore
```

#### .gitignore 필수 항목
```gitignore
# Credentials
*.json
!requirements.json

# Data files
marine_ministry_posts_*.csv
marine_ministry_posts_*.xlsx

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
```

---

## 3. 보안 및 크레덴셜 관리

### 3.1 GitHub Secrets 구성

#### 필수 Secrets
```yaml
GOOGLE_CREDENTIALS_JSON:
  description: Google Service Account JSON (전체 내용)
  required: true

SPREADSHEET_ID:
  description: Google Sheets ID (URL에서 추출)
  required: true
```

#### Secrets 설정 방법
1. GitHub Repository → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 두 개의 Secret 추가:
   - `GOOGLE_CREDENTIALS_JSON`: Service Account JSON 전체 내용
   - `SPREADSHEET_ID`: Google Sheets ID

---

### 3.2 Credentials 파일 관리

#### 안전한 생성 및 삭제
```yaml
- name: Create credentials file
  env:
    GOOGLE_CREDENTIALS_JSON: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
  run: |
    # JSON 유효성 검증
    echo "$GOOGLE_CREDENTIALS_JSON" | jq empty || exit 1
    echo "$GOOGLE_CREDENTIALS_JSON" > credentials.json
    chmod 600 credentials.json  # 소유자만 읽기 가능

- name: Cleanup credentials
  if: always()
  run: |
    rm -f credentials.json
    rm -f gen-lang-client-*.json
```

**보안 강화**:
```yaml
- name: Verify credentials not leaked
  if: always()
  run: |
    # Git 상태 확인 (credentials 파일이 추적되지 않았는지 확인)
    git status --short
```

---

### 3.3 민감 정보 로그 노출 방지

#### 로그 마스킹
```yaml
- name: Run crawler
  run: |
    # 민감 정보 출력 시 마스킹
    python marine_ministry_crawler_final.py 2>&1 | grep -v "credentials"
```

#### Python 코드 수정
```python
# marine_ministry_crawler_final.py
import logging

# 크레덴셜 정보 로깅 방지
logging.getLogger('google').setLevel(logging.WARNING)
logging.getLogger('googleapiclient').setLevel(logging.WARNING)
```

**❌ 절대 금지**:
```python
# 절대 하지 말 것
print(f"Credentials: {credentials_json}")
print(f"Spreadsheet ID: {spreadsheet_id}")
```

---

## 4. 에러 처리 및 모니터링

### 4.1 Continue-on-error 전략

#### 권장 설정
```yaml
- name: Run crawler
  id: crawler
  run: python marine_ministry_crawler_final.py
  continue-on-error: false  # 크롤링 실패 시 전체 중단

- name: Upload to Google Sheets
  id: upload
  run: python upload_to_gsheet.py
  continue-on-error: false  # 업로드 실패 시 전체 중단

- name: Cleanup
  if: always()  # 항상 실행
  run: rm -f credentials.json
```

**원칙**:
- 중요 작업: `continue-on-error: false` (기본값)
- 정리 작업: `if: always()`

---

### 4.2 아티팩트 저장 전략

#### 권장 구성
```yaml
- name: Upload crawling results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: crawling-results-${{ github.run_number }}
    path: |
      marine_ministry_posts_*.csv
      marine_ministry_posts_*.xlsx
    retention-days: 30
    if-no-files-found: warn

- name: Upload error logs
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: error-logs-${{ github.run_number }}
    path: |
      *.log
    retention-days: 7
```

**보관 기간 전략**:
- 정상 결과: 30일
- 에러 로그: 7일
- GitHub Free: 500MB 스토리지, 무료 플랜 적합

---

### 4.3 알림 메커니즘

#### Slack 알림 (권장)
```yaml
- name: Notify on success
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: 'C123456'  # Slack 채널 ID
    slack-message: |
      ✅ 크롤링 성공
      - 실행 시간: ${{ github.run_started_at }}
      - 수집 건수: (upload_to_gsheet.py에서 출력)
      - 결과: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: 'C123456'
    slack-message: |
      ❌ 크롤링 실패
      - 오류 발생 시간: ${{ github.run_started_at }}
      - 실패 단계: ${{ steps.crawler.outcome || steps.upload.outcome }}
      - 로그: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

#### 이메일 알림 (대안)
```yaml
- name: Send failure email
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.MAIL_USERNAME }}
    password: ${{ secrets.MAIL_PASSWORD }}
    subject: "[실패] 해양수산부 크롤링 - ${{ github.run_id }}"
    to: admin@example.com
    from: GitHub Actions
    body: |
      크롤링 작업이 실패했습니다.
      실행 ID: ${{ github.run_id }}
      로그: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

**비용 비교**:
- Slack: 무료 (Workflow 제한 내)
- Email: 무료 (Gmail SMTP 사용 시)

---

## 5. 비용 및 성능

### 5.1 GitHub Actions 무료 플랜 분석

#### 제한사항
- **Public Repository**: 무제한
- **Private Repository**: 2,000분/월

#### 예상 실행 시간
```
1회 실행:
├── Setup (Python, 의존성 설치): 2분
├── 크롤링 (16개 기관): 5-10분
├── Google Sheets 업로드: 1-2분
└── 정리 및 아티팩트: 1분
───────────────────────────────
총 예상 시간: 10-15분
```

#### 월간 비용 계산
```
시나리오 1: Public Repository
- 매일 1회 실행: 30일 × 15분 = 450분
- 비용: 무료

시나리오 2: Private Repository
- 매일 1회 실행: 30일 × 15분 = 450분
- 무료 플랜: 2,000분
- 초과 비용: 없음
- 여유분: 1,550분 (수동 실행/테스트 가능)

결론: ✅ 무료 플랜으로 충분
```

---

### 5.2 병렬 처리 가능성

#### 현재 구조
```python
# marine_ministry_crawler_final.py (순차 처리)
for org in organizations:
    crawl_board(org, 'notice')
    crawl_board(org, 'bid')
```

#### 병렬 처리 개선안
```yaml
jobs:
  crawl-regional-offices:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        org: ['busan', 'incheon', 'yeosu', 'masan', 'ulsan', 'donghae',
              'gunsan', 'mokpo', 'pohang', 'pyeongtaek', 'daesan']
      fail-fast: false
    steps:
      - name: Crawl ${{ matrix.org }}
        run: python crawl_single_org.py --org ${{ matrix.org }}

  crawl-public-corps:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        org: ['koem']
    steps:
      - name: Crawl ${{ matrix.org }}
        run: python crawl_single_org.py --org ${{ matrix.org }}

  crawl-port-authorities:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        org: ['busan-pa', 'incheon-pa', 'yeosu-pa', 'ulsan-pa']
    steps:
      - name: Crawl ${{ matrix.org }}
        run: python crawl_single_org.py --org ${{ matrix.org }}

  merge-and-upload:
    needs: [crawl-regional-offices, crawl-public-corps, crawl-port-authorities]
    runs-on: ubuntu-latest
    steps:
      - name: Merge results
        run: python merge_results.py
      - name: Upload to Google Sheets
        run: python upload_to_gsheet.py
```

**효과**:
- 실행 시간: 10-15분 → 3-5분 (약 70% 단축)
- 비용: 변경 없음 (동시 실행은 무료)

**단점**:
- 코드 복잡도 증가
- 16개 동시 Job → IP 차단 위험

**권장**:
- 초기 단계: 순차 처리 (안정성 우선)
- 향후 확장 시: 병렬 처리 (성능 우선)

---

### 5.3 리소스 사용 최적화

#### 캐싱 전략
```yaml
- name: Cache pip packages
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Cache crawled data (선택)
  uses: actions/cache@v4
  with:
    path: |
      marine_ministry_posts_*.csv
    key: crawl-${{ github.run_number }}
    restore-keys: |
      crawl-
```

#### 조건부 실행
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 매일 실행
  workflow_dispatch:
    inputs:
      target_orgs:
        description: '크롤링 대상 기관 (쉼표 구분, 공백 시 전체)'
        required: false
        default: ''

jobs:
  crawl:
    steps:
      - name: Run crawler
        run: |
          if [ -n "${{ github.event.inputs.target_orgs }}" ]; then
            python marine_ministry_crawler_final.py --orgs "${{ github.event.inputs.target_orgs }}"
          else
            python marine_ministry_crawler_final.py
          fi
```

---

## 6. 최종 권장 워크플로우

```yaml
# .github/workflows/daily-crawling.yml
name: Daily Marine Ministry Crawling

on:
  schedule:
    - cron: '0 0 * * *'  # UTC 00:00 = KST 09:00
  workflow_dispatch:  # 수동 실행 옵션
  push:
    branches:
      - main
    paths:
      - 'marine_ministry_crawler_final.py'
      - 'upload_to_gsheet.py'
      - 'requirements.txt'
      - '.github/workflows/daily-crawling.yml'

env:
  PYTHON_VERSION: '3.11'

jobs:
  crawl-and-upload:
    name: Crawl and Upload to Google Sheets
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'

      - name: Cache pip dependencies
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-

      - name: Install dependencies
        run: |
          pip install --upgrade pip setuptools wheel
          pip install -r requirements.txt

      - name: Verify dependencies
        run: |
          pip list
          python --version

      - name: Create Google credentials
        env:
          GOOGLE_CREDENTIALS_JSON: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
        run: |
          echo "$GOOGLE_CREDENTIALS_JSON" | jq empty || (echo "Invalid JSON" && exit 1)
          echo "$GOOGLE_CREDENTIALS_JSON" > gen-lang-client-0556505482-e847371ea87e.json
          chmod 600 gen-lang-client-0556505482-e847371ea87e.json

      - name: Run crawler
        id: crawler
        timeout-minutes: 15
        run: |
          python marine_ministry_crawler_final.py
        continue-on-error: false

      - name: Upload to Google Sheets
        id: upload
        timeout-minutes: 10
        env:
          SPREADSHEET_ID: ${{ secrets.SPREADSHEET_ID }}
        run: |
          python upload_to_gsheet.py
        continue-on-error: false

      - name: Cleanup credentials
        if: always()
        run: |
          rm -f gen-lang-client-0556505482-e847371ea87e.json
          git status --short

      - name: Upload crawling results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: crawling-results-${{ github.run_number }}
          path: |
            marine_ministry_posts_*.csv
            marine_ministry_posts_*.xlsx
          retention-days: 30
          if-no-files-found: warn

      - name: Notify on success (Slack)
        if: success()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: ${{ secrets.SLACK_CHANNEL_ID }}
          slack-message: |
            ✅ 해양수산부 크롤링 성공
            - 실행 시간: ${{ github.run_started_at }}
            - 결과 확인: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
        continue-on-error: true

      - name: Notify on failure (Slack)
        if: failure()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: ${{ secrets.SLACK_CHANNEL_ID }}
          slack-message: |
            ❌ 해양수산부 크롤링 실패
            - 실패 시간: ${{ github.run_started_at }}
            - 실패 단계: ${{ steps.crawler.outcome }}, ${{ steps.upload.outcome }}
            - 로그 확인: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
        continue-on-error: true
```

---

## 7. 수정이 필요한 부분 목록

### 7.1 즉시 수정 필요 (High Priority)

| 번호 | 항목 | 문제점 | 해결방안 |
|-----|------|--------|---------|
| 1 | requirements.txt 없음 | 의존성 관리 불가 | requirements.txt 파일 생성 |
| 2 | credentials.json 하드코딩 | 보안 취약 | GitHub Secrets 사용 |
| 3 | 타임아웃 미설정 | 무한 대기 위험 | timeout-minutes 설정 |
| 4 | 에러 알림 없음 | 실패 인지 지연 | Slack/Email 알림 추가 |

### 7.2 권장 개선 사항 (Medium Priority)

| 번호 | 항목 | 현재 상태 | 개선 방안 |
|-----|------|---------|---------|
| 5 | 수동 실행 불가 | schedule만 존재 | workflow_dispatch 추가 |
| 6 | 캐싱 미사용 | 매번 재설치 | pip cache 활성화 |
| 7 | 아티팩트 미저장 | 결과 확인 어려움 | upload-artifact 추가 |
| 8 | 재시도 로직 없음 | 일시적 오류에 취약 | retry 로직 추가 |

### 7.3 향후 고려 사항 (Low Priority)

| 번호 | 항목 | 설명 |
|-----|------|------|
| 9 | 병렬 처리 | 성능 향상 (70% 시간 단축) |
| 10 | Matrix 전략 | 기관별 독립 실행 |
| 11 | 조건부 실행 | 특정 기관만 크롤링 옵션 |
| 12 | 데이터 검증 | 수집 건수 자동 검증 |

---

## 8. 구현 체크리스트

### 8.1 사전 준비
- [ ] GitHub Repository 생성
- [ ] Google Service Account JSON 준비
- [ ] Google Sheets ID 확인
- [ ] Slack Webhook URL 생성 (선택)

### 8.2 코드 수정
- [ ] `requirements.txt` 파일 생성
- [ ] `.gitignore` 파일 생성
- [ ] `marine_ministry_crawler_final.py` 로깅 개선
- [ ] `upload_to_gsheet.py` 수집 건수 출력 추가

### 8.3 GitHub 설정
- [ ] Secrets 추가: `GOOGLE_CREDENTIALS_JSON`
- [ ] Secrets 추가: `SPREADSHEET_ID`
- [ ] Secrets 추가: `SLACK_BOT_TOKEN` (선택)
- [ ] Secrets 추가: `SLACK_CHANNEL_ID` (선택)

### 8.4 워크플로우 배포
- [ ] `.github/workflows/daily-crawling.yml` 파일 생성
- [ ] 워크플로우 파일 커밋 및 푸시
- [ ] Actions 탭에서 활성화 확인

### 8.5 테스트
- [ ] 수동 실행 테스트 (workflow_dispatch)
- [ ] 크롤링 결과 확인
- [ ] Google Sheets 업로드 확인
- [ ] 아티팩트 다운로드 확인
- [ ] 알림 수신 확인 (Slack/Email)

---

## 9. 위험 요소 및 대응 방안

### 9.1 크롤링 실패 위험

| 위험 요소 | 발생 확률 | 영향도 | 대응 방안 |
|---------|---------|--------|---------|
| 사이트 구조 변경 | 중간 | 높음 | 정기 모니터링, 알림 설정 |
| 네트워크 타임아웃 | 낮음 | 중간 | 재시도 로직, 타임아웃 설정 |
| IP 차단 | 낮음 | 높음 | 요청 간격 조정, User-Agent 설정 |
| 서버 점검 | 낮음 | 낮음 | 재시도 로직 |

### 9.2 보안 위험

| 위험 요소 | 발생 확률 | 영향도 | 대응 방안 |
|---------|---------|--------|---------|
| Credentials 노출 | 낮음 | 치명적 | Secrets 사용, .gitignore 설정 |
| 로그에 민감 정보 | 중간 | 높음 | 로그 필터링, 마스킹 |
| 아티팩트 공개 | 낮음 | 중간 | Private Repository 사용 |

### 9.3 비용 위험

| 위험 요소 | 발생 확률 | 영향도 | 대응 방안 |
|---------|---------|--------|---------|
| 무한 루프 | 낮음 | 중간 | timeout-minutes 설정 |
| 과도한 실행 | 낮음 | 낮음 | cron 검증, 수동 실행 제한 |
| 스토리지 초과 | 낮음 | 낮음 | 아티팩트 보관 기간 조정 |

---

## 10. 결론 및 권장사항

### 10.1 종합 평가

**✅ 구현 가능성**: **높음**
- GitHub Actions 무료 플랜으로 충분히 운영 가능
- 예상 실행 시간 10-15분/일, 월 450분 사용
- 추가 비용 없이 안정적 운영 가능

**✅ 기술적 적합성**: **높음**
- Python 크롤링 스크립트 그대로 사용 가능
- Google Sheets API 통합 용이
- 기존 코드 구조 변경 최소화

**✅ 보안 수준**: **양호**
- GitHub Secrets로 크레덴셜 안전 관리
- 로그 마스킹으로 민감 정보 보호
- Private Repository 권장

### 10.2 핵심 권장사항

#### 1단계: 최소 구현 (1일 소요)
```
✓ requirements.txt 생성
✓ GitHub Secrets 설정
✓ 기본 워크플로우 파일 작성
✓ 수동 실행 테스트
```

#### 2단계: 안정화 (2-3일 소요)
```
✓ 타임아웃 및 재시도 로직 추가
✓ 아티팩트 저장 설정
✓ 기본 알림 설정 (실패 시)
✓ 일주일 모니터링
```

#### 3단계: 최적화 (선택, 1주일 소요)
```
✓ Slack/Email 상세 알림
✓ 데이터 검증 로직
✓ 성능 모니터링
✓ 병렬 처리 고려 (필요 시)
```

### 10.3 운영 모니터링

#### 주간 점검 항목
- [ ] Actions 실행 성공률 확인
- [ ] 수집 데이터 건수 추이 확인
- [ ] 아티팩트 스토리지 사용량 확인

#### 월간 점검 항목
- [ ] GitHub Actions 사용 시간 확인
- [ ] 크롤링 오류 패턴 분석
- [ ] 사이트 구조 변경 확인

---

## 부록 A: 전체 파일 구조

```
marine-ministry-crawler/
├── .github/
│   └── workflows/
│       └── daily-crawling.yml          # GitHub Actions 워크플로우
├── .gitignore                           # Git 제외 파일
├── README.md                            # 프로젝트 설명
├── requirements.txt                     # Python 의존성
├── marine_ministry_crawler_final.py     # 크롤링 스크립트
├── upload_to_gsheet.py                  # Google Sheets 업로드
└── resize_columns.py                    # 컬럼 크기 조정
```

---

## 부록 B: 유용한 GitHub Actions 명령어

```bash
# 로컬에서 워크플로우 검증 (act 도구 사용)
act -l                              # 워크플로우 목록 확인
act workflow_dispatch               # 수동 실행 테스트
act schedule                        # 스케줄 실행 테스트

# GitHub CLI로 워크플로우 실행
gh workflow run daily-crawling.yml  # 수동 실행
gh run list                         # 실행 이력 확인
gh run view <run-id>                # 실행 로그 확인
gh run download <run-id>            # 아티팩트 다운로드

# Secrets 관리
gh secret set GOOGLE_CREDENTIALS_JSON < credentials.json
gh secret list
```

---

## 부록 C: 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [Python Setup Action](https://github.com/actions/setup-python)
- [Google Sheets API Python Quickstart](https://developers.google.com/sheets/api/quickstart/python)
- [Slack GitHub Action](https://github.com/slackapi/slack-github-action)

---

**검토 완료일**: 2025-11-18
**다음 검토 예정일**: 배포 후 1주일
**문서 버전**: 1.0
