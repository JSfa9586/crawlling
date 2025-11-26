# GitHub Actions 구현 가이드

## 목차
1. [사전 준비](#1-사전-준비)
2. [GitHub Repository 설정](#2-github-repository-설정)
3. [Secrets 설정](#3-secrets-설정)
4. [워크플로우 배포](#4-워크플로우-배포)
5. [테스트 및 검증](#5-테스트-및-검증)
6. [모니터링 및 유지보수](#6-모니터링-및-유지보수)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비

### 1.1 필요한 자료

#### Google Service Account 준비
1. Google Cloud Console 접속: https://console.cloud.google.com
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 → 사용자 인증 정보 → 서비스 계정 만들기
4. 역할: "편집자" 또는 "소유자"
5. 키 만들기 → JSON 형식 다운로드
6. 파일명: `gen-lang-client-0556505482-e847371ea87e.json` (또는 임의의 이름)

#### Google Sheets 준비
1. Google Sheets 생성: https://sheets.google.com
2. 서비스 계정 이메일을 시트에 공유 (편집 권한)
3. URL에서 Spreadsheet ID 복사
   ```
   예: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

#### Slack Webhook 준비 (선택사항)
1. Slack 워크스페이스 → Apps → "Incoming WebHooks" 검색
2. Webhook URL 생성
3. 알림을 받을 채널 선택

---

## 2. GitHub Repository 설정

### 2.1 Repository 생성

```bash
# 1. GitHub에서 새 Repository 생성
#    - Repository name: marine-ministry-crawler
#    - Visibility: Private (권장) 또는 Public
#    - .gitignore: Python
#    - License: MIT (선택)

# 2. 로컬에 클론
git clone https://github.com/[YOUR_USERNAME]/marine-ministry-crawler.git
cd marine-ministry-crawler

# 3. 기존 파일 복사
cp C:/AI/251118/*.py .
cp C:/AI/251118/requirements.txt .
cp C:/AI/251118/.gitignore .

# 4. .github/workflows 디렉토리 생성
mkdir -p .github/workflows
cp C:/AI/251118/daily-crawling.yml .github/workflows/

# 5. 초기 커밋
git add .
git commit -m "Initial commit: Marine Ministry Crawler"
git push origin main
```

### 2.2 파일 구조 확인

```bash
# 최종 구조
marine-ministry-crawler/
├── .github/
│   └── workflows/
│       └── daily-crawling.yml
├── .gitignore
├── README.md
├── requirements.txt
├── marine_ministry_crawler_final.py
├── upload_to_gsheet.py
└── resize_columns.py
```

---

## 3. Secrets 설정

### 3.1 GitHub Secrets 추가

1. GitHub Repository → **Settings** 탭
2. 좌측 메뉴 → **Secrets and variables** → **Actions**
3. **New repository secret** 버튼 클릭

### 3.2 필수 Secrets

#### GOOGLE_CREDENTIALS_JSON
```
Name: GOOGLE_CREDENTIALS_JSON
Value: (JSON 파일 전체 내용 붙여넣기)
```

**예시**:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### SPREADSHEET_ID
```
Name: SPREADSHEET_ID
Value: 1AbC2DeFgHiJkLmNoPqRsTuVwXyZ0123456789
```
(Google Sheets URL에서 추출)

### 3.3 선택적 Secrets (알림 기능)

#### Slack 알림용
```
Name: SLACK_BOT_TOKEN
Value: xoxb-your-slack-bot-token

Name: SLACK_CHANNEL_ID
Value: C0123456789
```

#### Email 알림용
```
Name: MAIL_USERNAME
Value: your-email@gmail.com

Name: MAIL_PASSWORD
Value: your-app-password

Name: NOTIFICATION_EMAIL
Value: recipient@example.com
```

**Gmail 앱 비밀번호 생성**:
1. Google 계정 → 보안 → 2단계 인증 활성화
2. 앱 비밀번호 → "기타" 선택 → 생성
3. 16자리 비밀번호 복사

### 3.4 Secrets 확인

설정 완료 후 다음과 같이 표시되어야 합니다:

```
Secrets (6)
├── GOOGLE_CREDENTIALS_JSON    Updated 1 minute ago
├── SPREADSHEET_ID              Updated 1 minute ago
├── SLACK_BOT_TOKEN             Updated 1 minute ago
├── SLACK_CHANNEL_ID            Updated 1 minute ago
├── MAIL_USERNAME               Updated 1 minute ago
└── MAIL_PASSWORD               Updated 1 minute ago
```

---

## 4. 워크플로우 배포

### 4.1 워크플로우 파일 배포

```bash
# 1. 워크플로우 파일이 올바른 위치에 있는지 확인
ls .github/workflows/daily-crawling.yml

# 2. Git에 추가 및 커밋
git add .github/workflows/daily-crawling.yml
git commit -m "Add GitHub Actions workflow for daily crawling"
git push origin main
```

### 4.2 워크플로우 활성화 확인

1. GitHub Repository → **Actions** 탭
2. 좌측에서 "Daily Marine Ministry Crawling" 워크플로우 확인
3. 활성화 상태 확인

---

## 5. 테스트 및 검증

### 5.1 수동 실행 테스트

1. **Actions** 탭 → "Daily Marine Ministry Crawling" 선택
2. **Run workflow** 버튼 클릭
3. Branch: `main` 선택
4. Debug mode: `false` (또는 `true`)
5. **Run workflow** 클릭

### 5.2 실행 모니터링

실행 중인 워크플로우를 클릭하여 실시간 로그 확인:

```
├─ Set up job                         ✓ (5s)
├─ Checkout repository                ✓ (2s)
├─ Set up Python                      ✓ (10s)
├─ Cache pip dependencies             ✓ (3s)
├─ Install dependencies               ✓ (25s)
├─ Verify dependencies                ✓ (2s)
├─ Create Google credentials          ✓ (1s)
├─ Run crawler                        🔄 (진행 중...)
├─ Check crawling results             ⏳
├─ Upload to Google Sheets            ⏳
├─ Cleanup credentials                ⏳
├─ Upload crawling results            ⏳
├─ Notify on success (Slack)          ⏳
└─ Summary                            ⏳
```

### 5.3 결과 확인

#### 5.3.1 로그 확인
```
=== 크롤링 시작 ===
시작 시간: 2025-11-18 09:00:15

############################################################
해양수산부 산하기관 크롤링 시작
기준일: 2025-11-18
수집기간: 2025-11-12 ~ 2025-11-18
############################################################

============================================================
크롤링 시작: 부산지방해양수산청 - 공지사항
============================================================
1페이지 크롤링 중...
  ✓ [2025-11-18] 게시물 제목 1
  ✓ [2025-11-17] 게시물 제목 2
  ...

종료 시간: 2025-11-18 09:08:32
✅ 크롤링 완료
```

#### 5.3.2 아티팩트 다운로드
1. 워크플로우 실행 페이지 하단 **Artifacts** 섹션
2. `crawling-results-[번호]` 다운로드
3. ZIP 파일 압축 해제 → CSV/Excel 파일 확인

#### 5.3.3 Google Sheets 확인
1. Google Sheets 열기
2. 데이터가 업로드되었는지 확인
3. 날짜별로 정렬되어 있는지 확인

### 5.4 테스트 체크리스트

- [ ] 워크플로우가 정상적으로 실행됨
- [ ] 크롤링이 완료됨 (에러 없음)
- [ ] CSV/Excel 파일이 생성됨
- [ ] Google Sheets에 데이터가 업로드됨
- [ ] 아티팩트가 저장됨
- [ ] Slack/Email 알림이 도착함 (설정한 경우)

---

## 6. 모니터링 및 유지보수

### 6.1 일일 모니터링

#### 매일 확인할 사항
1. GitHub Actions 탭에서 실행 결과 확인
2. 성공/실패 여부 확인
3. 수집 건수 확인

#### Slack 알림 예시 (성공)
```
✅ 해양수산부 크롤링 성공

📊 실행 정보
• 실행 시간: 2025-11-18T00:00:00Z
• 실행 ID: #42
• 트리거: schedule

📈 수집 결과
• 수집 건수: 324 건
• 파일명: marine_ministry_posts_20251118.csv

🔗 링크
• 실행 로그: https://github.com/.../actions/runs/123456
```

### 6.2 주간 점검

#### 실행 통계 확인
1. Actions 탭 → 워크플로우 선택
2. 최근 7일 실행 결과 확인
3. 실패율 계산

#### 데이터 품질 확인
1. Google Sheets에서 최근 7일 데이터 검토
2. 수집 건수 추이 확인
3. 비정상적인 패턴 확인

### 6.3 월간 점검

#### GitHub Actions 사용량 확인
1. Settings → Billing → Plans and usage
2. 사용 시간 확인 (무료 플랜: 2,000분/월)
3. 스토리지 사용량 확인 (500MB)

#### 워크플로우 최적화
1. 평균 실행 시간 확인
2. 병목 구간 식별
3. 필요 시 최적화

---

## 7. 문제 해결

### 7.1 일반적인 오류

#### 오류: "Invalid JSON format"
```
원인: GOOGLE_CREDENTIALS_JSON Secret 형식 오류
해결:
1. JSON 파일 내용을 https://jsonlint.com 에서 검증
2. 줄바꿈이 포함된 경우 그대로 복사
3. Secret 재설정
```

#### 오류: "Spreadsheet not found"
```
원인: SPREADSHEET_ID 오류 또는 권한 부족
해결:
1. Spreadsheet ID 재확인
2. 서비스 계정 이메일을 시트에 공유했는지 확인
3. 편집 권한이 있는지 확인
```

#### 오류: "Timeout"
```
원인: 크롤링 시간 초과 (15분)
해결:
1. timeout-minutes 값 증가 (20분)
2. 크롤링 대상 기관 수 축소
3. 병렬 처리 검토
```

### 7.2 디버깅 방법

#### Step 1: 로그 확인
```bash
# GitHub Actions 로그에서 오류 메시지 확인
# 빨간색으로 표시된 실패 단계 클릭
```

#### Step 2: 로컬 재현
```bash
# 로컬 환경에서 동일한 명령어 실행
python marine_ministry_crawler_final.py
python upload_to_gsheet.py
```

#### Step 3: 디버그 모드 실행
```
# GitHub Actions → Run workflow
# Debug mode: true 선택
# 상세 로그 확인
```

### 7.3 긴급 대응

#### 크롤링 실패 시
1. **즉시 확인**: GitHub Actions 로그
2. **원인 파악**:
   - 사이트 구조 변경?
   - 네트워크 문제?
   - API 제한?
3. **임시 조치**: 수동 크롤링 실행
4. **영구 해결**: 코드 수정 및 배포

#### 데이터 손실 시
1. **아티팩트 복구**: GitHub Actions Artifacts 다운로드
2. **수동 업로드**: Google Sheets에 수동 업로드
3. **재실행**: 워크플로우 수동 실행

---

## 부록 A: 유용한 명령어

### GitHub CLI 명령어
```bash
# 워크플로우 수동 실행
gh workflow run daily-crawling.yml

# 최근 실행 이력 확인
gh run list --workflow=daily-crawling.yml

# 특정 실행 로그 확인
gh run view [RUN_ID] --log

# 아티팩트 다운로드
gh run download [RUN_ID]

# Secrets 관리
gh secret set GOOGLE_CREDENTIALS_JSON < credentials.json
gh secret list
```

### Python 환경 재현
```bash
# 가상 환경 생성
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 의존성 설치
pip install -r requirements.txt

# 로컬 테스트
python marine_ministry_crawler_final.py
```

---

## 부록 B: 자주 묻는 질문 (FAQ)

### Q1: 크롤링 시간을 변경하고 싶습니다.
```yaml
# .github/workflows/daily-crawling.yml
on:
  schedule:
    # KST 09:00 → UTC 00:00
    - cron: '0 0 * * *'
    # KST 18:00 → UTC 09:00
    - cron: '0 9 * * *'
```

### Q2: 특정 기관만 크롤링하고 싶습니다.
```python
# marine_ministry_crawler_final.py 수정
# 특정 기관만 활성화
ORGANIZATIONS = [
    'busan',  # 활성화
    # 'incheon',  # 비활성화
    # 'yeosu',   # 비활성화
]
```

### Q3: 알림을 받지 못합니다.
```
확인 사항:
1. Slack Bot Token이 올바른지 확인
2. Channel ID가 올바른지 확인
3. 워크플로우 로그에서 알림 단계 확인
4. continue-on-error: true 로 인해 오류가 무시되지 않았는지 확인
```

### Q4: 수집 건수가 0건입니다.
```
원인:
1. 최근 7일 이내 게시물이 없음 (정상)
2. 사이트 구조 변경 (크롤러 수정 필요)
3. 날짜 파싱 오류 (로그 확인)

해결:
- 브라우저에서 수동으로 사이트 확인
- 로그에서 "7일 이내 게시물 없음" 메시지 확인
```

---

## 부록 C: 추가 자료

### 공식 문서
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [BeautifulSoup 문서](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

### 관련 도구
- [GitHub CLI](https://cli.github.com/)
- [Act (로컬 Actions 테스트)](https://github.com/nektos/act)
- [JSON Validator](https://jsonlint.com/)

---

**작성일**: 2025-11-18
**버전**: 1.0
**다음 업데이트**: 배포 후 1주일
