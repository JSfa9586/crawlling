# GitHub Secrets 설정 가이드

## 📋 목차
1. [개요](#개요)
2. [필수 Secrets 설정](#필수-secrets-설정)
3. [GOOGLE_CREDENTIALS_JSON 설정](#google_credentials_json-설정)
4. [SPREADSHEET_ID 설정](#spreadsheet_id-설정)
5. [선택 Secrets 설정 (알림)](#선택-secrets-설정-알림)
6. [설정 확인 방법](#설정-확인-방법)
7. [문제 해결](#문제-해결)
8. [보안 체크리스트](#보안-체크리스트)

---

## 개요

### GitHub Secrets란?
GitHub Secrets는 GitHub Actions 워크플로우에서 사용하는 **민감한 정보를 안전하게 저장**하는 기능입니다.
API 키, 인증 토큰, 비밀번호 등을 코드에 직접 노출하지 않고 암호화하여 저장합니다.

### 왜 필요한가?
- **보안**: 인증 정보가 코드에 노출되지 않음
- **자동화**: GitHub Actions에서 자동으로 크롤링 및 업로드 실행
- **암호화**: GitHub이 AES-256 암호화로 Secrets 보호
- **접근 제어**: 저장소 관리자만 설정 가능

### 보안 고려사항
- ✅ Secrets는 로그에 자동으로 마스킹됨 (`***`)
- ✅ Pull Request에서 Secrets 접근 불가 (Fork 방지)
- ✅ 워크플로우 실행 중에만 메모리에 로드
- ⚠️ 절대 코드에 Secrets를 하드코딩하지 마세요
- ⚠️ `.env` 파일을 Git에 커밋하지 마세요

---

## 필수 Secrets 설정

이 프로젝트는 **2개의 필수 Secrets**가 필요합니다:

| Secret 이름 | 설명 | 형식 | 사용처 |
|------------|------|------|--------|
| `GOOGLE_CREDENTIALS_JSON` | Google Service Account JSON 전체 내용 | JSON 문자열 | Google Sheets API 인증 |
| `SPREADSHEET_ID` | Google Sheets 문서 ID | 문자열 (44자) | 업로드할 시트 지정 |

---

## GOOGLE_CREDENTIALS_JSON 설정

### 1단계: GitHub 저장소 접속

1. GitHub에서 저장소 페이지로 이동
2. 상단 메뉴에서 **Settings** 클릭
3. 왼쪽 사이드바에서 **Secrets and variables** → **Actions** 클릭

```
Repository → Settings → Secrets and variables → Actions
```

### 2단계: New Repository Secret 생성

1. **New repository secret** 버튼 클릭
2. **Name** 입력란에 정확히 입력:
   ```
   GOOGLE_CREDENTIALS_JSON
   ```
   ⚠️ 대소문자 구분 주의! 정확히 일치해야 합니다.

### 3단계: JSON 파일 내용 복사

현재 프로젝트의 Credentials 파일 경로:
```
C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json
```

#### Windows에서 복사 방법

**방법 1: PowerShell 사용 (권장)**
```powershell
# PowerShell을 관리자 권한으로 실행한 후 아래 명령 실행
Get-Content "C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json" | Set-Clipboard
```
이제 클립보드에 JSON 내용이 복사되었습니다.

**방법 2: 메모장 사용**
1. 메모장으로 JSON 파일 열기
2. `Ctrl + A` (전체 선택)
3. `Ctrl + C` (복사)

#### Linux/Mac에서 복사 방법
```bash
# Linux (xclip 필요)
cat gen-lang-client-0556505482-e847371ea87e.json | xclip -selection clipboard

# Mac
cat gen-lang-client-0556505482-e847371ea87e.json | pbcopy
```

### 4단계: Secret 값 붙여넣기

1. GitHub의 **Secret** 입력란에 복사한 JSON 전체 내용 붙여넿기
2. JSON 형식이 올바른지 확인:
   - 첫 줄: `{`로 시작
   - 마지막 줄: `}`로 끝
   - 개행 문자 포함 (있어도 됨)

예시 (일부):
```json
{
  "type": "service_account",
  "project_id": "gen-lang-client-0556505482",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "sbdb-sheet-reader@gen-lang-client-0556505482.iam.gserviceaccount.com",
  ...
}
```

3. **Add secret** 버튼 클릭

### 주의사항

⚠️ **개행 문자 처리**
- `private_key` 필드에 `\n` (개행 이스케이프)가 포함되어야 함
- 실제 개행이 아닌 `\n` 문자열로 저장되어야 함
- PowerShell 방법을 사용하면 자동으로 올바르게 처리됨

⚠️ **특수 문자**
- JSON에 있는 따옴표(`"`)와 백슬래시(`\`)를 수정하지 마세요
- 복사-붙여넣기만 하고 편집하지 마세요

⚠️ **공백 제거 금지**
- JSON 앞뒤 공백을 제거하지 마세요
- 구조를 변경하지 마세요

---

## SPREADSHEET_ID 설정

### 1단계: Google Sheets에서 ID 추출

Google Sheets URL 구조:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=0
                                    └─────────────┘
                                       여기 부분!
```

현재 프로젝트의 Spreadsheet ID:
```
1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw
```

### 2단계: Secret 추가

1. **New repository secret** 버튼 클릭
2. **Name**: `SPREADSHEET_ID`
3. **Secret**: `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw` 붙여넣기
4. **Add secret** 클릭

### 3단계: 권한 확인

Google Sheets에 Service Account 이메일이 공유되어 있는지 확인:
```
sbdb-sheet-reader@gen-lang-client-0556505482.iam.gserviceaccount.com
```

**확인 방법:**
1. Google Sheets 열기
2. 우측 상단 **공유** 버튼 클릭
3. 위 이메일이 **편집자** 권한으로 추가되어 있는지 확인

---

## 선택 Secrets 설정 (알림)

알림 기능을 사용하려면 아래 Secrets를 추가로 설정하세요. (선택 사항)

### Slack 알림 (5개 중 2개)

#### SLACK_BOT_TOKEN 생성 방법

1. [Slack API](https://api.slack.com/apps) 접속
2. **Create New App** → **From scratch**
3. App 이름: `GitHub Actions Bot`
4. Workspace 선택
5. **OAuth & Permissions** 메뉴 이동
6. **Scopes** 섹션에서 아래 권한 추가:
   - `chat:write` (메시지 전송)
   - `chat:write.public` (공개 채널 메시지)
7. **Install to Workspace** 버튼 클릭
8. **Bot User OAuth Token** 복사 (xoxb-로 시작)

**GitHub Secret 추가:**
- Name: `SLACK_BOT_TOKEN`
- Secret: `xoxb-1234567890-...` (복사한 토큰)

#### SLACK_CHANNEL_ID 확인 방법

1. Slack 앱 열기
2. 알림받을 채널로 이동
3. 채널 이름 클릭 → **채널 세부정보 보기**
4. 맨 아래 **채널 ID** 복사 (예: `C01234ABC5D`)

**GitHub Secret 추가:**
- Name: `SLACK_CHANNEL_ID`
- Secret: `C01234ABC5D` (채널 ID)

---

### Email 알림 (5개 중 3개)

#### Gmail 앱 비밀번호 생성

1. [Google 계정](https://myaccount.google.com/) 접속
2. **보안** 메뉴 이동
3. **2단계 인증** 활성화 (필수)
4. **앱 비밀번호** 클릭
5. 앱 선택: **메일**
6. 기기 선택: **기타** → `GitHub Actions` 입력
7. 생성된 16자리 비밀번호 복사

**GitHub Secrets 추가:**

| Secret 이름 | 값 예시 | 설명 |
|------------|---------|------|
| `MAIL_USERNAME` | `your-email@gmail.com` | Gmail 주소 |
| `MAIL_PASSWORD` | `abcd efgh ijkl mnop` | 앱 비밀번호 (16자리) |
| `NOTIFICATION_EMAIL` | `recipient@example.com` | 알림 받을 이메일 |

⚠️ **주의**: 일반 Gmail 비밀번호가 아닌 **앱 비밀번호**를 사용해야 합니다!

---

## 설정 확인 방법

### 1단계: Secrets 목록 확인

GitHub 저장소:
```
Settings → Secrets and variables → Actions → Repository secrets
```

**필수 Secrets 체크리스트:**
- [x] GOOGLE_CREDENTIALS_JSON
- [x] SPREADSHEET_ID

**선택 Secrets (알림):**
- [ ] SLACK_BOT_TOKEN
- [ ] SLACK_CHANNEL_ID
- [ ] MAIL_USERNAME
- [ ] MAIL_PASSWORD
- [ ] NOTIFICATION_EMAIL

### 2단계: 수동 워크플로우 실행

1. GitHub 저장소 → **Actions** 탭
2. **Daily Marine Ministry Crawling** 워크플로우 선택
3. **Run workflow** 버튼 클릭
4. **디버그 모드**: `false` 선택
5. **Run workflow** 실행

### 3단계: 로그에서 Secret 마스킹 확인

워크플로우 로그에서 확인할 내용:

✅ **올바른 예시:**
```
GOOGLE_CREDENTIALS_JSON: ***
SPREADSHEET_ID: ***
Spreadsheet ID: 1lXwc_EvZ-...
```

❌ **잘못된 예시 (Secret 노출):**
```
GOOGLE_CREDENTIALS_JSON: {"type": "service_account"...}
```
이런 경우 즉시 Secret를 삭제하고 재생성해야 합니다!

### 4단계: 검증 스크립트 실행 (선택)

프로젝트에 포함된 검증 스크립트 사용:
```bash
python verify_secrets.py
```

이 스크립트는:
- 환경 변수 존재 확인
- JSON 유효성 검증
- Google Sheets 접근 권한 테스트
- 상세한 오류 메시지 제공

---

## 문제 해결

### 오류 1: "Invalid credentials" / "Permission denied"

**증상:**
```
google.auth.exceptions.DefaultCredentialsError:
Could not automatically determine credentials.
```

**원인:**
- `GOOGLE_CREDENTIALS_JSON` Secret이 설정되지 않음
- JSON 형식이 잘못됨
- Service Account 이메일이 Google Sheets에 공유되지 않음

**해결 방법:**
1. Secret 이름 확인: `GOOGLE_CREDENTIALS_JSON` (정확한 대소문자)
2. JSON 형식 검증:
   ```bash
   # PowerShell에서 검증
   Get-Content gen-lang-client-*.json | ConvertFrom-Json
   ```
3. Google Sheets 공유 확인:
   - 공유 대상: `sbdb-sheet-reader@gen-lang-client-0556505482.iam.gserviceaccount.com`
   - 권한: **편집자**

---

### 오류 2: "Secret not found" / "Context access might be invalid"

**증상:**
```
Error: Secret SPREADSHEET_ID is not set
```

**원인:**
- Secret 이름 오타
- Secret이 Organization 레벨이 아닌 Repository 레벨에 설정되어야 함

**해결 방법:**
1. Secret 이름 정확히 확인:
   - `GOOGLE_CREDENTIALS_JSON` (언더스코어 2개)
   - `SPREADSHEET_ID` (언더스코어 1개)
2. Repository Secrets에 설정했는지 확인 (Environment Secrets 아님)

---

### 오류 3: "Invalid JSON format"

**증상:**
```
❌ Invalid JSON format
jq: parse error: Invalid numeric literal at line 1, column 10
```

**원인:**
- JSON 구조가 손상됨
- 특수 문자가 잘못 이스케이프됨
- 불완전한 복사-붙여넣기

**해결 방법:**
1. 원본 JSON 파일 다시 복사:
   ```powershell
   Get-Content "C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json" -Raw | Set-Clipboard
   ```
2. GitHub Secret을 완전히 삭제하고 재생성
3. JSON 유효성 검증:
   ```bash
   # 로컬에서 테스트
   cat gen-lang-client-*.json | jq empty
   ```

---

### 오류 4: "Spreadsheet not found" / "404 Error"

**증상:**
```
googleapiclient.errors.HttpError:
<HttpError 404 when requesting ... returned "Requested entity was not found.">
```

**원인:**
- `SPREADSHEET_ID`가 잘못됨
- Google Sheets가 삭제됨
- Service Account에 권한이 없음

**해결 방법:**
1. Spreadsheet URL에서 ID 재확인:
   ```
   https://docs.google.com/spreadsheets/d/1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw/edit
                                          └────────────────────────────────────────────┘
   ```
2. Google Sheets 공유 설정 재확인
3. Service Account 이메일로 직접 접속 테스트

---

### 오류 5: "workflow_dispatch" 이벤트에서만 Secret 접근 불가

**증상:**
- `schedule` 또는 `push` 이벤트: 정상 작동
- `workflow_dispatch` (수동 실행): Secret 없음

**원인:**
- Fork된 저장소에서 실행 중
- Repository가 Private이 아님

**해결 방법:**
1. 원본 저장소 (Fork 아님)에서 실행
2. Repository Settings → Actions → General
3. **Fork pull request workflows from outside collaborators** 확인

---

## 보안 체크리스트

### 설정 후 반드시 확인하세요

- [x] **Secrets가 로그에 노출되지 않음**
  - Actions 로그에서 `***`로 마스킹되는지 확인

- [x] **Pull Request에서 Secrets 접근 불가**
  - Repository Settings → Actions → General
  - "Require approval for first-time contributors" 활성화

- [x] **정기적인 Credentials 갱신**
  - Google Service Account 키: 90일마다 갱신 권장
  - Gmail 앱 비밀번호: 6개월마다 갱신 권장

- [x] **Credentials 파일이 Git에 추적되지 않음**
  - `.gitignore`에 추가:
    ```gitignore
    # Google Credentials
    gen-lang-client-*.json
    *.json

    # Environment files
    .env
    .env.local
    ```

- [x] **최소 권한 원칙**
  - Service Account는 필요한 최소 권한만 부여
  - Google Sheets에만 접근 가능하도록 제한

- [x] **Secret 공유 금지**
  - Slack, Discord, 이메일로 Secret 전송 금지
  - 스크린샷에 Secret 노출 금지

- [x] **Secret 유출 시 즉시 조치**
  1. GitHub에서 Secret 삭제
  2. Google Cloud Console에서 Service Account 키 삭제
  3. 새로운 키 생성 및 재설정
  4. Git 히스토리 확인 (`git log --all --full-history -- "*.json"`)

---

## 참고 자료

### 공식 문서
- [GitHub Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)

### 관련 파일
- 워크플로우 파일: `.github/workflows/daily-crawling.yml`
- Credentials 파일: `gen-lang-client-0556505482-e847371ea87e.json` (로컬 전용)
- 검증 스크립트: `verify_secrets.py`
- 업로드 스크립트: `upload_to_gsheet.py`

### 문제 발생 시
1. Actions 로그 확인: `Repository → Actions → 실행 결과`
2. 검증 스크립트 실행: `python verify_secrets.py`
3. Issue 생성: 오류 로그 첨부 (Secret은 제외!)

---

**작성일:** 2025-11-18
**버전:** 1.0
**프로젝트:** 해양수산부 산하기관 크롤링 자동화
