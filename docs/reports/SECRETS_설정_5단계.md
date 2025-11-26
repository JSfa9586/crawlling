# GitHub Secrets 설정 - 5단계 가이드

> **빠른 시작 가이드**: GitHub Actions 워크플로우를 실행하기 위한 최소 설정

---

## 📌 개요

이 프로젝트는 **2개의 필수 Secrets**가 필요합니다:
1. `GOOGLE_CREDENTIALS_JSON` - Google Service Account 인증
2. `SPREADSHEET_ID` - 업로드할 Google Sheets ID

---

## ⚡ 5단계로 설정하기

### 1단계: GitHub 저장소 Settings 이동

```
Repository → Settings → Secrets and variables → Actions
```

1. GitHub에서 저장소 페이지 열기
2. 상단 메뉴 **Settings** 클릭
3. 왼쪽 사이드바 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼 클릭

---

### 2단계: GOOGLE_CREDENTIALS_JSON 설정

#### PowerShell에서 복사 (Windows)
```powershell
Get-Content "C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json" | Set-Clipboard
```

#### 또는 메모장으로 복사
1. 파일 열기: `C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json`
2. `Ctrl + A` (전체 선택)
3. `Ctrl + C` (복사)

#### GitHub에 추가
1. **Name**: `GOOGLE_CREDENTIALS_JSON` (정확히 입력!)
2. **Secret**: 복사한 JSON 전체 내용 붙여넣기
3. **Add secret** 클릭

---

### 3단계: SPREADSHEET_ID 설정

현재 프로젝트 ID:
```
1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw
```

#### GitHub에 추가
1. **New repository secret** 클릭
2. **Name**: `SPREADSHEET_ID`
3. **Secret**: `1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw`
4. **Add secret** 클릭

---

### 4단계: Google Sheets 공유 확인

Service Account에 편집 권한 부여:

1. Google Sheets 열기
2. 우측 상단 **공유** 버튼 클릭
3. 다음 이메일 추가 (편집자 권한):
   ```
   sbdb-sheet-reader@gen-lang-client-0556505482.iam.gserviceaccount.com
   ```

---

### 5단계: 워크플로우 수동 실행으로 테스트

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **Daily Marine Ministry Crawling** 선택
3. 우측 **Run workflow** 버튼 클릭
4. 디버그 모드: `false` 선택
5. **Run workflow** 클릭

#### 실행 확인
- 실행 중: 노란색 점
- 성공: 초록색 체크
- 실패: 빨간색 X

실패 시 로그를 확인하고 [전체 가이드](GitHub_Secrets_설정_가이드.md)를 참조하세요.

---

## ✅ 설정 완료 체크리스트

설정 완료 후 다음을 확인하세요:

- [ ] **GOOGLE_CREDENTIALS_JSON** Secret 추가됨
- [ ] **SPREADSHEET_ID** Secret 추가됨
- [ ] Google Sheets에 Service Account 공유됨
- [ ] 워크플로우 수동 실행 성공

---

## 🔍 선택 사항: 검증 스크립트 실행

로컬에서 Secrets 유효성 검증:

```bash
# 환경 변수 설정 (Windows PowerShell)
$env:GOOGLE_CREDENTIALS_JSON = Get-Content "gen-lang-client-0556505482-e847371ea87e.json" -Raw
$env:SPREADSHEET_ID = "1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw"

# 검증 실행
python verify_secrets.py
```

---

## ❓ 문제 발생 시

### 자주 발생하는 오류

| 오류 메시지 | 원인 | 해결 방법 |
|-----------|------|----------|
| `Invalid credentials` | JSON 형식 오류 | JSON 파일 다시 복사-붙여넣기 |
| `Secret not found` | Secret 이름 오타 | 대소문자 정확히 확인 |
| `404 Not found` | Spreadsheet ID 오류 | ID 재확인 |
| `403 Permission denied` | 권한 없음 | Service Account 공유 확인 |

### 상세 가이드

전체 문제 해결 가이드는 다음 문서를 참조:
- [GitHub_Secrets_설정_가이드.md](GitHub_Secrets_설정_가이드.md) - 전체 가이드
- 섹션: "문제 해결" (7번 섹션)

---

## 📚 추가 설정 (선택)

### Slack 알림

워크플로우 성공/실패 시 Slack으로 알림 받기:

1. Slack Bot Token 생성
2. GitHub Secrets 추가:
   - `SLACK_BOT_TOKEN`
   - `SLACK_CHANNEL_ID`

### Email 알림

Gmail로 알림 받기:

1. Gmail 앱 비밀번호 생성 (2단계 인증 필수)
2. GitHub Secrets 추가:
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `NOTIFICATION_EMAIL`

자세한 방법은 [전체 가이드](GitHub_Secrets_설정_가이드.md) 참조.

---

## 📞 지원

- 전체 가이드: [GitHub_Secrets_설정_가이드.md](GitHub_Secrets_설정_가이드.md)
- 검증 스크립트: `verify_secrets.py`
- 워크플로우 파일: `.github/workflows/daily-crawling.yml`

---

**작성일:** 2025-11-18
**소요 시간:** 약 5분
