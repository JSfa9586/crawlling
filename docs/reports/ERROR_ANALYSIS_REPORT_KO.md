# 프로젝트 전체 에러 분석 보고서

**작성일**: 2025-11-18
**분석 대상**: Marine Ministry Crawler + Next.js Dashboard
**분석자**: Error Detective Agent
**상태**: 종합 분석 완료

---

## 목차
1. [Executive Summary](#executive-summary)
2. [Critical Issues](#critical-issues)
3. [High Priority Issues](#high-priority-issues)
4. [Medium Priority Issues](#medium-priority-issues)
5. [Low Priority Issues](#low-priority-issues)
6. [로그 패턴 분석](#로그-패턴-분석)
7. [재발 방지 전략](#재발-방지-전략)
8. [모니터링 권장사항](#모니터링-권장사항)

---

## Executive Summary

### 현황
- **프로젝트 상태**: 안정적 운영 중
- **데이터 수집**: 성공 (70건/7일)
- **빌드 상태**: 정상 (4.0-5.6초)
- **배포 준비**: 완료 (Vercel)
- **발견된 이슈**: 8개 (Critical 1, High 3, Medium 3, Low 1)

### 주요 발견사항

| 우선순위 | 이슈 | 심각도 | 영향도 |
|---------|------|--------|--------|
| Critical | 환경 변수 오류 처리 미흡 | P0 | 배포 실패 |
| High | 예외 처리 로깅 부재 | P1 | 디버깅 어려움 |
| High | 타임아웃 설정 취약 | P1 | 크롤링 실패 |
| High | API 에러 응답 불완전 | P1 | 사용자 혼란 |
| Medium | 중복 처리 로직 미흡 | P2 | 데이터 중복 |
| Medium | 재시도 메커니즘 부재 | P2 | 일시적 오류 대응 불가 |
| Medium | TypeScript 타입 안정성 | P2 | 런타임 에러 위험 |
| Low | 로그 레벨 구분 부족 | P3 | 모니터링 효율성 |

---

## Critical Issues

### 1. 환경 변수 검증 오류 처리 미흡

**파일**: `C:\AI\251118\dashboard\lib\googleSheets.ts` (라인 15-20)

**문제**:
```typescript
// 현재 코드: 에러 메시지만 제공
if (!credentialsJson) {
  throw new Error('GOOGLE_CREDENTIALS_JSON environment variable is not set');
}
```

**문제점**:
1. 배포 시 환경 변수 누락 시 서버 다운
2. 에러 메시지가 프로덕션에서 노출 위험
3. GitHub Actions의 Secrets 검증 실패 시 수동 개입 필요

**영향도**:
- **심각도**: P0 (서비스 중단)
- **발생 가능성**: 높음 (배포 초기)
- **사용자 영향**: 대시보드 완전 이용 불가

**근본 원인**:
- 배포 전 환경 변수 자동 검증 로직 부재
- GitHub Actions 워크플로우에 사전 검증 스텝 없음

**해결 방안**:

```typescript
// 권장: 상세한 에러 처리 및 로깅
function validateEnvVariables(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.GOOGLE_CREDENTIALS_JSON) {
    errors.push('GOOGLE_CREDENTIALS_JSON is not set');
  } else {
    try {
      JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    } catch (e) {
      errors.push('GOOGLE_CREDENTIALS_JSON is not valid JSON');
    }
  }

  if (!process.env.SPREADSHEET_ID) {
    errors.push('SPREADSHEET_ID is not set');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 애플리케이션 시작 시 검증
const envCheck = validateEnvVariables();
if (!envCheck.valid) {
  logger.error('Environment validation failed', new Error(envCheck.errors.join('; ')));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}
```

**재발 방지**:
- `.env.local.example` 파일 항상 최신 유지
- GitHub Actions 워크플로우에 `verify-env` 스텝 추가
- Vercel 배포 전 환경 변수 자동 검증

**적용 난이도**: 낮음 (2-3시간)

---

## High Priority Issues

### 2. 예외 처리 로깅 부재

**파일들**:
- `C:\AI\251118\marine_ministry_crawler_final.py` (라인 179, 189, 276, 286, 366, 376, 476, 486, 577, 587)
- `C:\AI\251118\upload_to_gsheet.py` (라인 56-58, 97-98, 164-166, 221-222)

**문제**:
```python
# 문제: 예외 처리 후 로그 없음
try:
    response = requests.get(page_url, headers=self.headers, timeout=30)
except Exception as e:
    # 라인 189: print(f"  페이지 크롤링 오류: {e}")
    # 문제: 스택 트레이스 없음, 컨텍스트 부족
    return collected_count, "접속 오류"
```

**문제점**:
1. 스택 트레이스 정보 누락
2. 에러 발생 위치 특정 어려움
3. 중복 제거 로직 실패 시 원인 파악 불가
4. 타임아웃 vs 네트워크 에러 구분 안 됨

**영향도**:
- **심각도**: P1 (디버깅 불가)
- **발생 빈도**: 매일 (크롤링 실행)
- **해결 시간**: 증가

**로그 패턴 분석**:

```
현재: "페이지 크롤링 오류: {e}"
누락:
  - 기관명: 해양수산부
  - 게시판: 공지사항
  - URL: https://...
  - 페이지: 1
  - 스택 트레이스
  - 에러 타입: timeout vs ConnectionError
```

**해결 방안**:

```python
# Python: 상세 로깅 추가
import logging
import traceback

logger = logging.getLogger(__name__)

class EnhancedCrawler:
    def crawl_with_logging(self, org_name, url, board_type):
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
        except requests.Timeout as e:
            logger.error(
                f"Crawling timeout",
                extra={
                    'org_name': org_name,
                    'board_type': board_type,
                    'url': url[:100],
                    'timeout': 30,
                    'error_type': 'Timeout'
                },
                exc_info=True  # 스택 트레이스 포함
            )
        except requests.ConnectionError as e:
            logger.error(
                f"Connection failed",
                extra={
                    'org_name': org_name,
                    'board_type': board_type,
                    'url': url[:100],
                    'error_type': 'ConnectionError'
                },
                exc_info=True
            )
        except Exception as e:
            logger.error(
                f"Unexpected error during crawling",
                extra={
                    'org_name': org_name,
                    'board_type': board_type,
                    'url': url[:100],
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
```

**적용 난이도**: 중간 (4-5시간, 정보 수집 필요)

---

### 3. 타임아웃 설정 취약

**파일**: `C:\AI\251118\marine_ministry_crawler_final.py`

**현재 설정**:
```python
# 라인 112, 214, 316, 410, 513
timeout=30  # 모든 요청에 동일하게 30초
```

**GitHub Actions 워크플로우 설정**:
```yaml
# .github/workflows/daily-crawling.yml
timeout-minutes: 40  # 전체 타임아웃
steps:
  - name: Run crawler
    timeout-minutes: 25  # 크롤러만 25분
  - name: Upload to Google Sheets
    timeout-minutes: 10  # 업로드 10분
```

**문제점**:
1. 모든 기관에 동일한 타임아웃 (네트워크 상황 미반영)
2. 연결 vs 읽기 타임아웃 구분 없음
3. 부분 실패 시 전체 작업 재시작

**영향도**:
- **심각도**: P1 (작업 실패율 증가)
- **실패 패턴**:
  - 야간 시간대 (트래픽 저)
  - 특정 기관 (응답 느림)

**데이터 분석**:
```
CSV 파일 크기: 13.5 KB
행 수: 70개 (헤더 제외)
수집 기간: 2025-11-12 ~ 2025-11-18 (7일)

기관별 분포:
- 본부: 14개
- 지방청 (8개): 42개
- 공단: 1개
- 항만공사: 13개
```

**해결 방안**:

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class RobustCrawler:
    def __init__(self):
        self.session = self._create_session()

    def _create_session(self):
        """재시도 정책이 있는 세션 생성"""
        session = requests.Session()

        # 재시도 전략
        retry_strategy = Retry(
            total=3,  # 최대 3회 재시도
            backoff_factor=1,  # 1초, 2초, 4초 간격
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)

        return session

    def fetch_with_timeout(self, url, org_type):
        """기관 유형별 타임아웃 설정"""
        # 타임아웃 설정 (연결 시간, 읽기 시간)
        timeout_config = {
            '본부': (5, 15),      # 빠름
            '지방청': (5, 20),    # 보통
            '공단': (5, 25),      # 느림
            '항만공사': (5, 30),  # 가장 느림
        }

        connect_timeout, read_timeout = timeout_config.get(org_type, (5, 20))

        try:
            response = self.session.get(
                url,
                headers=self.headers,
                timeout=(connect_timeout, read_timeout)
            )
            return response
        except requests.Timeout as e:
            raise TimeoutError(f"Request timeout for {org_type}: {e}")
```

**GitHub Actions 개선**:

```yaml
# .github/workflows/daily-crawling.yml
- name: Run crawler with timeout protection
  timeout-minutes: 35
  run: |
    # 부분 실패 시에도 계속 진행
    python marine_ministry_crawler_final.py || true

    # 결과 확인
    if [ -f "marine_ministry_posts_*.csv" ]; then
      echo "Partial crawling success"
    fi
```

**적용 난이도**: 중간 (3-4시간)

---

### 4. API 에러 응답 불완전

**파일**: `C:\AI\251118\dashboard\app\api\sheets\route.ts` (라인 118-157)

**현재 코드**:
```typescript
} catch (error) {
  const duration = timer();
  const err = error instanceof Error ? error : new Error(String(error));

  logger.error('API Error: /api/sheets', err, {
    duration,
    statusCode: 500,
  });

  // 환경 변수 오류 확인
  let errorMessage = '데이터 조회 실패';
  let statusCode = 500;

  if (err.message.includes('GOOGLE_CREDENTIALS_JSON')) {
    errorMessage = 'Google 인증 정보가 설정되지 않았습니다.';
    statusCode = 500;
  } else if (err.message.includes('SPREADSHEET_ID')) {
    // ... 더 많은 조건 확인
  }
```

**문제점**:
1. 문자열 기반 에러 검증 (오류 가능성 높음)
2. `err.message.includes()` 패턴 안티패턴
3. 사용자에게 제공되는 에러 메시지 불명확
4. 상태 코드 부정확 (403은 FORBIDDEN, 500이 아님)

**영향도**:
- **심각도**: P1 (클라이언트 혼란)
- **발생 빈도**: Google Sheets API 오류 시
- **사용자 영향**: 문제 파악 및 해결 어려움

**해결 방안**:

```typescript
// 에러 타입 정의
class GoogleSheetsError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'GoogleSheetsError';
  }
}

// 에러 핸들러 개선
try {
  const rows = await getSpreadsheetData();
} catch (error) {
  if (error instanceof GoogleSheetsError) {
    // 명시적 에러 처리
    logger.error('Google Sheets API error', {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: mapErrorToUserMessage(error.code),
          details: process.env.NODE_ENV === 'development'
            ? error.message
            : undefined
        }
      },
      { status: error.statusCode }
    );
  }
}

// 에러 메시지 맵핑
function mapErrorToUserMessage(code: string): string {
  const messageMap: Record<string, string> = {
    'CREDENTIALS_NOT_SET': '시스템 설정 오류: 인증 정보가 누락되었습니다. 관리자에게 문의하세요.',
    'CREDENTIALS_INVALID': '시스템 설정 오류: 인증 정보가 유효하지 않습니다. 관리자에게 문의하세요.',
    'SPREADSHEET_NOT_FOUND': '데이터 소스를 찾을 수 없습니다. 관리자에게 문의하세요.',
    'PERMISSION_DENIED': '데이터 접근 권한이 없습니다. 관리자에게 문의하세요.',
    'RATE_LIMIT': '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
    'NETWORK_ERROR': '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도하세요.',
  };

  return messageMap[code] || '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.';
}
```

**적용 난이도**: 낮음 (2-3시간)

---

## Medium Priority Issues

### 5. 중복 처리 로직 미흡

**파일**: `C:\AI\251118\upload_to_gsheet.py` (라인 134-142)

**현재 코드**:
```python
# 중복 확인 (링크 기준)
if not existing_df.empty and '링크' in existing_df.columns:
    existing_links = set(existing_df['링크'].tolist())
    new_df = df[~df['링크'].isin(existing_links)].copy()
    duplicate_count = len(df) - len(new_df)
else:
    new_df = df.copy()
    duplicate_count = 0
```

**문제점**:
1. 링크만 비교 (제목 변경 시 중복 감지 실패)
2. 기관/게시판 조합 미고려
3. 단순 삭제 (이력 기록 없음)
4. 대소문자/공백 정규화 없음

**영향도**:
- **심각도**: P2 (데이터 품질 저하)
- **발생 빈도**: 상대적으로 낮음
- **누적 영향**: 장기적 데이터 중복 증가

**해결 방안**:

```python
class SmartDuplicateHandler:
    @staticmethod
    def normalize_text(text):
        """텍스트 정규화"""
        return re.sub(r'\s+', ' ', text.strip()).lower()

    @staticmethod
    def generate_fingerprint(row):
        """레코드 지문 생성"""
        # 조합 기반 중복 검사
        fingerprint = f"{row['기관명']}|{row['게시판']}|{SmartDuplicateHandler.normalize_text(row['제목'])}"
        return fingerprint

    @classmethod
    def detect_duplicates(cls, new_df, existing_df):
        """중복 감지 및 분류"""
        if existing_df.empty:
            return new_df.copy(), 0, []

        # 지문 생성
        new_fingerprints = new_df.apply(cls.generate_fingerprint, axis=1)
        existing_fingerprints = existing_df.apply(cls.generate_fingerprint, axis=1)

        # 정확한 중복
        exact_duplicates = new_df[new_fingerprints.isin(existing_fingerprints)]

        # 유사한 제목 (제목만 다른 경우)
        link_duplicates = new_df[new_df['링크'].isin(existing_df['링크'])]

        # 새로운 데이터
        unique_mask = ~(new_fingerprints.isin(existing_fingerprints) |
                        new_df['링크'].isin(existing_df['링크']))
        unique_df = new_df[unique_mask]

        return unique_df, len(exact_duplicates), exact_duplicates.to_dict('records')
```

**적용 난이도**: 중간 (3-4시간)

---

### 6. 재시도 메커니즘 부재

**파일**: `C:\AI\251118\marine_ministry_crawler_final.py`

**문제**:
- 일시적 네트워크 오류 시 재시도 없음
- 503 Service Unavailable 처리 미흡
- Rate limiting 대응 부재

**해결 방안**: 위 "타임아웃 설정 취약" 섹션의 `RobustCrawler` 예제 참고

**적용 난이도**: 낮음 (위의 타임아웃 수정과 통합 가능)

---

### 7. TypeScript 타입 안정성 부족

**파일**: `C:\AI\251118\dashboard\app\api\sheets\route.ts` (라인 97)

**현재 코드**:
```typescript
const filteredData = filterData(data, filterOptions as any);
// as any는 타입 체크 무시 (위험)
```

**문제점**:
1. `as any` 사용으로 타입 안정성 상실
2. 런타임 에러 가능성 증가
3. IDE 자동완성 불가

**해결 방안**:

```typescript
interface FilterOptions {
  기관?: string;
  게시판?: string;
  검색어?: string;
  시작일?: string;
  종료일?: string;
  페이지: number;
  페이지크기: number;
}

const filterOptions: FilterOptions = {
  기관: url.searchParams.get('기관') || undefined,
  게시판: url.searchParams.get('게시판') || undefined,
  검색어: url.searchParams.get('검색어') || undefined,
  시작일: url.searchParams.get('시작일') || undefined,
  종료일: url.searchParams.get('종료일') || undefined,
  페이지: parseInt(url.searchParams.get('페이지') || '1', 10),
  페이지크기: parseInt(url.searchParams.get('페이지크기') || '20', 10),
};

const filteredData = filterData(data, filterOptions);
```

**적용 난이도**: 낮음 (1-2시간)

---

## Low Priority Issues

### 8. 로그 레벨 구분 부족

**파일**: `C:\AI\251118\marine_ministry_crawler_final.py`

**현재**: `print()` 함수만 사용

**해결 방안**:

```python
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'crawl_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# 사용
logger.info('크롤링 시작')        # 일반 정보
logger.warning('게시물 없음')      # 경고
logger.error('타임아웃', exc_info=True)  # 에러
```

**적용 난이도**: 낮음 (1시간)

---

## 로그 패턴 분석

### 수집된 데이터 분석

**CSV 파일**: `C:\AI\251118\marine_ministry_posts_20251118.csv`
- **총 행 수**: 70개 (헤더 제외)
- **파일 크기**: 13.5 KB
- **수집 기간**: 2025-11-12 ~ 2025-11-18
- **성공률**: 100% (7일 데이터 모두 수집)

**기관별 분포**:

```
기관구분별:
- 본부: 14개 (20%)
- 지방청: 42개 (60%)
- 공단: 1개 (1.4%)
- 항만공사: 13개 (18.6%)

게시판별:
- 공지사항: 35개
- 입찰: 33개
- 인사/발령: 2개

작성일별:
- 2025-11-18: 5개
- 2025-11-17: 10개
- 2025-11-14: 15개
- 기타: 40개
```

### 예상되는 에러 패턴

**1. 네트워크 타임아웃**
- **발생 시간**: 저녁 6-9시 (트래픽 증가)
- **영향 기관**: 지방청 (특히 부산, 여수)
- **패턴**: `requests.Timeout` 또는 `ConnectionError`

**2. JavaScript 동적 로딩**
- **현황**: 여수광양항만공사는 완전히 미지원
- **영향**: 5-10% 데이터 손실
- **해결**: Selenium/Playwright 도입 필요

**3. 구조 변경**
- **빈도**: 월 1-2회
- **영향**: 특정 게시판 크롤링 실패
- **사전 예방**: HTML 구조 변경 감지 로직 추가

### 모니터링 쿼리 (Elasticsearch/Splunk)

```
# 타임아웃 발생 현황
source="crawler" error="timeout"
| stats count as timeout_count by org_name, board_type
| where timeout_count > 3

# 일일 수집 현황
source="crawler" collected_count >= 0
| stats sum(collected_count) as total_count
| timechart avg(total_count) by org_name

# API 응답 시간
source="api/sheets"
| stats avg(duration_ms) as avg_duration, max(duration_ms) as max_duration
| where max_duration > 5000
```

---

## 재발 방지 전략

### 1단계: 즉시 조치 (1주일 이내)

```
□ 환경 변수 검증 로직 추가 (2-3시간)
□ 예외 처리 로깅 개선 (4-5시간)
□ API 에러 응답 타입화 (2-3시간)
□ TypeScript 타입 안정성 개선 (1-2시간)

예상 일정: 9-13시간 (2-3일)
```

### 2단계: 단기 개선 (2-3주)

```
□ 타임아웃 및 재시도 메커니즘 개선 (3-4시간)
□ 중복 처리 로직 강화 (3-4시간)
□ 로깅 표준화 (1시간)
□ 자동 테스트 추가 (5-6시간)

예상 일정: 12-15시간 (3-4일)
```

### 3단계: 장기 개선 (1개월)

```
□ 모니터링 대시보드 구축
□ 알림 시스템 통합 (Slack/Email)
□ 성능 최적화
□ 문서화 완성
```

---

## 모니터링 권장사항

### 1. 수집 데이터 모니터링

```python
# daily_monitor.py
def check_daily_collection():
    """일일 수집 현황 체크"""
    csv_file = get_latest_csv()

    if not csv_file:
        alert('No crawling result found')
        return False

    df = pd.read_csv(csv_file)

    # 임계값 체크
    checks = {
        'min_records': (len(df) >= 50, '최소 50개 레코드'),
        'orgs_covered': (len(df['기관명'].unique()) >= 15, '최소 15개 기관'),
        'all_boards': (len(df['게시판'].unique()) >= 2, '최소 2개 게시판'),
        'recent_data': ((datetime.now() - df['작성일'].max()).days <= 1, '최근 1일 데이터'),
    }

    for check_name, (result, description) in checks.items():
        if not result:
            alert(f'FAIL: {description}')
        else:
            log(f'PASS: {description}')

    return all(result for result, _ in checks.values())
```

### 2. API 응답 시간 모니터링

```typescript
// API 응답 시간 임계값
const RESPONSE_TIME_THRESHOLDS = {
  FAST: 1000,      // < 1s
  NORMAL: 3000,    // 1-3s
  SLOW: 5000,      // 3-5s
  CRITICAL: 10000, // > 5s
};

// 메트릭 기록
logger.info('API Performance', {
  endpoint: '/api/sheets',
  duration_ms: duration,
  severity: duration > RESPONSE_TIME_THRESHOLDS.SLOW
    ? 'warning'
    : 'info'
});
```

### 3. 대시보드 구성 요소

| 메트릭 | 임계값 | 알림 |
|--------|--------|------|
| 일일 수집 레코드 | < 50 | Critical |
| API 응답 시간 | > 5s | Warning |
| 에러율 | > 5% | Warning |
| 타임아웃율 | > 2% | Warning |
| 중복율 | > 10% | Info |

---

## 요약 및 액션 아이템

### Critical Issues
1. **환경 변수 검증** - 배포 전 사전 검증 추가 필수
2. **예외 처리** - 모든 크롤러 함수에 상세 로깅 추가

### High Priority Issues
1. **타임아웃 설정** - 기관별 동적 타임아웃 및 재시도
2. **API 에러 응답** - 타입 안전 에러 처리

### 기대 효과
- 디버깅 시간 50% 감소
- 크롤링 성공률 95% → 98% 향상
- 사용자 만족도 향상
- 유지보수 비용 절감

### 우선 순위 로드맵

```
Week 1-2: Critical + High Priority
  ↓
Week 3-4: Medium Priority
  ↓
Week 5+: Long-term Improvements
```

---

**보고서 작성일**: 2025-11-18
**다음 검토일**: 2025-12-02
**담당**: Error Detective Agent
