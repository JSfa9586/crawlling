# 기술적 권장사항 및 구현 가이드

**작성일**: 2025-11-18
**대상**: 개발팀
**레벨**: Advanced

---

## 목차
1. [로깅 시스템 개선](#로깅-시스템-개선)
2. [에러 처리 패턴](#에러-처리-패턴)
3. [재시도 및 타임아웃 전략](#재시도-및-타임아웃-전략)
4. [모니터링 및 경고](#모니터링-및-경고)
5. [테스트 전략](#테스트-전략)

---

## 로깅 시스템 개선

### 1.1 Python 로깅 표준화

**파일**: 새로운 `logger_config.py`

```python
# logger_config.py
import logging
import json
from datetime import datetime
import os

class JSONFormatter(logging.Formatter):
    """JSON 형식 로거"""

    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)

        return json.dumps(log_data, ensure_ascii=False)

def setup_logger(name, log_file=None):
    """로거 설정"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # 콘솔 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)

    # 파일 핸들러
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)
        json_formatter = JSONFormatter()
        file_handler.setFormatter(json_formatter)
        logger.addHandler(file_handler)

    logger.addHandler(console_handler)
    return logger

# 사용 예
logger = setup_logger(
    'crawler',
    log_file=f'logs/crawler_{datetime.now().strftime("%Y%m%d")}.log'
)
```

**사용 방법**:

```python
# marine_ministry_crawler_final.py에서
from logger_config import setup_logger

class MarineMinistryJejCrawler:
    def __init__(self):
        self.logger = setup_logger(__name__)
        # ...

    def crawl_mof_board(self, org_type, org_name, url, board_type):
        """게시판 크롤링"""
        self.logger.info(
            f'Starting crawl for {org_name}',
            extra={
                'extra_data': {
                    'org_type': org_type,
                    'board_type': board_type,
                    'url': url[:100],
                }
            }
        )

        try:
            response = requests.get(url, timeout=30)
        except requests.Timeout as e:
            self.logger.error(
                'Request timeout',
                extra={
                    'extra_data': {
                        'org_name': org_name,
                        'board_type': board_type,
                        'timeout': 30,
                        'retry_count': retry_count,
                    }
                },
                exc_info=True
            )
```

### 1.2 TypeScript 로깅 표준화

**파일**: `C:\AI\251118\dashboard\lib\logger.ts` (기존 파일 개선)

```typescript
// logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

export class Logger {
  private serviceName: string;
  private startTimes: Map<string, number> = new Map();

  constructor(serviceName: string = 'app') {
    this.serviceName = serviceName;
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }
      }),
    };

    return logEntry;
  }

  private output(logEntry: any) {
    if (process.env.NODE_ENV === 'production') {
      // JSON 형식으로 표준 출력
      console.log(JSON.stringify(logEntry));
    } else {
      // 개발 환경에서는 가독성 있게
      const { timestamp, level, service, message, context, error } = logEntry;
      const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
      const errorStr = error ? ` | ${error.message}` : '';
      console.log(
        `[${timestamp}] ${level} [${service}] ${message}${contextStr}${errorStr}`
      );
    }
  }

  debug(message: string, context?: LogContext) {
    this.output(this.formatLog('debug', message, context));
  }

  info(message: string, context?: LogContext) {
    this.output(this.formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    this.output(this.formatLog('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.output(this.formatLog('error', message, context, error));
  }

  startTimer(): () => number {
    const startTime = performance.now();
    return () => {
      return Math.round(performance.now() - startTime);
    };
  }
}

export const logger = new Logger('dashboard-api');
```

---

## 에러 처리 패턴

### 2.1 Python 에러 처리

**파일**: `error_handler.py` (새 파일)

```python
# error_handler.py
from enum import Enum
from typing import Dict, Optional
import traceback

class ErrorCode(Enum):
    """에러 코드 정의"""
    NETWORK_TIMEOUT = 'E001'
    CONNECTION_ERROR = 'E002'
    PARSE_ERROR = 'E003'
    AUTHENTICATION_ERROR = 'E004'
    RATE_LIMIT = 'E005'
    UNEXPECTED = 'E999'

class CrawlerException(Exception):
    """크롤러 기본 예외"""

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        context: Optional[Dict] = None,
        original_exception: Optional[Exception] = None
    ):
        self.code = code
        self.message = message
        self.context = context or {}
        self.original_exception = original_exception
        self.stack_trace = traceback.format_exc()

        super().__init__(self.message)

    def to_dict(self):
        return {
            'code': self.code.value,
            'message': self.message,
            'context': self.context,
            'stack_trace': self.stack_trace if DEBUG else None,
        }

class ErrorHandler:
    """에러 핸들러"""

    def __init__(self, logger):
        self.logger = logger
        self.error_counts = {}

    def handle_timeout(self, org_name: str, url: str, timeout: int):
        """타임아웃 처리"""
        exc = CrawlerException(
            code=ErrorCode.NETWORK_TIMEOUT,
            message=f'Request timeout after {timeout}s',
            context={
                'org_name': org_name,
                'url': url[:100],
                'timeout': timeout,
                'retry_count': self.error_counts.get(org_name, 0)
            }
        )
        self.logger.error(exc.message, exc_info=True, extra=exc.context)
        return exc

    def handle_connection_error(self, org_name: str, url: str, error: Exception):
        """연결 오류 처리"""
        exc = CrawlerException(
            code=ErrorCode.CONNECTION_ERROR,
            message=f'Connection failed: {str(error)}',
            context={
                'org_name': org_name,
                'url': url[:100],
                'error_type': type(error).__name__
            },
            original_exception=error
        )
        self.logger.error(exc.message, exc_info=True, extra=exc.context)
        return exc

    def should_retry(self, error_code: ErrorCode, retry_count: int) -> bool:
        """재시도 여부 판단"""
        retry_config = {
            ErrorCode.NETWORK_TIMEOUT: 3,
            ErrorCode.CONNECTION_ERROR: 3,
            ErrorCode.RATE_LIMIT: 5,
            ErrorCode.PARSE_ERROR: 0,
            ErrorCode.AUTHENTICATION_ERROR: 0,
        }
        return retry_count < retry_config.get(error_code, 0)
```

**사용 예**:

```python
class RobustCrawler(MarineMinistryJejCrawler):
    def __init__(self):
        super().__init__()
        self.error_handler = ErrorHandler(self.logger)

    def crawl_with_retry(self, org_name, url, board_type, max_retries=3):
        """재시도 로직과 함께 크롤링"""
        for attempt in range(max_retries):
            try:
                response = requests.get(
                    url,
                    headers=self.headers,
                    timeout=30
                )
                response.raise_for_status()
                return response

            except requests.Timeout as e:
                exc = self.error_handler.handle_timeout(org_name, url, 30)
                if self.error_handler.should_retry(exc.code, attempt):
                    wait_time = 2 ** attempt  # exponential backoff
                    self.logger.info(
                        f'Retrying in {wait_time}s',
                        extra={'org_name': org_name, 'attempt': attempt}
                    )
                    time.sleep(wait_time)
                else:
                    raise exc

            except requests.ConnectionError as e:
                exc = self.error_handler.handle_connection_error(org_name, url, e)
                if self.error_handler.should_retry(exc.code, attempt):
                    time.sleep(2 ** attempt)
                else:
                    raise exc
```

### 2.2 TypeScript 에러 처리

**파일**: `C:\AI\251118\dashboard\lib\errors.ts` (새 파일)

```typescript
// lib/errors.ts
export enum ErrorCode {
  CREDENTIALS_NOT_SET = 'CREDENTIALS_NOT_SET',
  CREDENTIALS_INVALID = 'CREDENTIALS_INVALID',
  SPREADSHEET_NOT_FOUND = 'SPREADSHEET_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('GOOGLE_CREDENTIALS_JSON')) {
      return new ApiError(
        ErrorCode.CREDENTIALS_NOT_SET,
        500,
        'Google credentials are not configured',
        { details: message }
      );
    }

    if (message.includes('SPREADSHEET_ID')) {
      return new ApiError(
        ErrorCode.SPREADSHEET_NOT_FOUND,
        500,
        'Spreadsheet ID is not configured',
        { details: message }
      );
    }

    if (message.includes('Permission denied')) {
      return new ApiError(
        ErrorCode.PERMISSION_DENIED,
        403,
        'You do not have permission to access this spreadsheet',
        { details: message }
      );
    }

    if (message.includes('Invalid JSON')) {
      return new ApiError(
        ErrorCode.CREDENTIALS_INVALID,
        500,
        'Google credentials format is invalid',
        { details: message }
      );
    }

    return new ApiError(
      ErrorCode.UNKNOWN,
      500,
      'An unknown error occurred',
      { details: message }
    );
  }

  toJSON() {
    return {
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && { details: this.details }),
    };
  }
}
```

---

## 재시도 및 타임아웃 전략

### 3.1 Exponential Backoff 재시도

**파일**: `retry_strategy.py` (새 파일)

```python
# retry_strategy.py
import time
import random
from typing import Callable, Any, TypeVar, Optional

T = TypeVar('T')

class RetryStrategy:
    """재시도 전략"""

    def __init__(
        self,
        max_retries: int = 3,
        base_delay: int = 1,
        max_delay: int = 60,
        exponential_base: float = 2.0,
        jitter: bool = True
    ):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter

    def get_delay(self, attempt: int) -> int:
        """재시도 대기 시간 계산"""
        delay = min(
            self.base_delay * (self.exponential_base ** attempt),
            self.max_delay
        )

        if self.jitter:
            # 지터 추가 (서버 부하 분산)
            delay = delay * (0.5 + random.random())

        return int(delay)

    def execute(
        self,
        func: Callable[..., T],
        *args,
        retryable_exceptions: tuple = (Exception,),
        **kwargs
    ) -> T:
        """재시도 로직과 함께 함수 실행"""
        last_exception = None

        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except retryable_exceptions as e:
                last_exception = e

                if attempt < self.max_retries - 1:
                    delay = self.get_delay(attempt)
                    print(f'Retry in {delay}s (attempt {attempt + 1}/{self.max_retries})')
                    time.sleep(delay)
                else:
                    raise

        raise last_exception

# 사용 예
strategy = RetryStrategy(max_retries=3, base_delay=1)

response = strategy.execute(
    requests.get,
    url,
    headers=headers,
    timeout=30,
    retryable_exceptions=(
        requests.Timeout,
        requests.ConnectionError,
    )
)
```

### 3.2 기관별 동적 타임아웃

**파일**: `timeout_config.py` (새 파일)

```python
# timeout_config.py
from dataclasses import dataclass
from typing import Dict, Tuple

@dataclass
class TimeoutConfig:
    """기관별 타임아웃 설정"""
    connect_timeout: int  # 연결 시간 (초)
    read_timeout: int     # 읽기 시간 (초)

# 기관별 타임아웃 설정
TIMEOUT_CONFIG: Dict[str, TimeoutConfig] = {
    '본부': TimeoutConfig(connect_timeout=5, read_timeout=15),
    '지방청': TimeoutConfig(connect_timeout=5, read_timeout=20),
    '공단': TimeoutConfig(connect_timeout=5, read_timeout=25),
    '항만공사': TimeoutConfig(connect_timeout=5, read_timeout=30),
}

def get_timeout_for_org(org_type: str) -> Tuple[int, int]:
    """기관 유형에 따른 타임아웃 반환"""
    config = TIMEOUT_CONFIG.get(org_type)
    if config:
        return (config.connect_timeout, config.read_timeout)
    return (5, 20)  # 기본값

# 사용
class OptimizedCrawler:
    def fetch_url(self, url: str, org_type: str):
        timeout = get_timeout_for_org(org_type)
        response = requests.get(url, headers=self.headers, timeout=timeout)
        return response
```

---

## 모니터링 및 경고

### 4.1 Slack 통합

**파일**: `slack_notifier.py` (새 파일)

```python
# slack_notifier.py
import os
import json
from typing import Dict, Any
import requests

class SlackNotifier:
    """Slack 알림 시스템"""

    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url or os.getenv('SLACK_WEBHOOK_URL')

    def send_notification(self, message: str, severity: str = 'info', context: Dict[str, Any] = None):
        """Slack 알림 전송"""
        if not self.webhook_url:
            return

        color_map = {
            'info': '#36a64f',
            'warning': '#ff9900',
            'error': '#ff0000',
        }

        payload = {
            'attachments': [{
                'color': color_map.get(severity, '#808080'),
                'title': f'{severity.upper()}: {message}',
                'fields': [
                    {'title': key, 'value': str(value), 'short': True}
                    for key, value in (context or {}).items()
                ],
                'footer': 'Marine Ministry Crawler',
                'ts': int(time.time())
            }]
        }

        try:
            response = requests.post(self.webhook_url, json=payload)
            response.raise_for_status()
        except Exception as e:
            print(f'Failed to send Slack notification: {e}')

# 사용 예
notifier = SlackNotifier()

try:
    # 크롤링 수행
    crawler.run()
except Exception as e:
    notifier.send_notification(
        'Crawling failed',
        severity='error',
        context={
            'org_name': 'Example Org',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }
    )
```

### 4.2 Health Check Endpoint

**파일**: `C:\AI\251118\dashboard\app\api\health\route.ts` (새 파일)

```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheetData } from '@/lib/googleSheets';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const checks = {
    api: false,
    spreadsheet: false,
    timestamp: new Date().toISOString(),
  };

  // API 상태 확인
  checks.api = true;

  // Google Sheets 접근 확인
  try {
    const data = await getSpreadsheetData();
    checks.spreadsheet = data.length > 0;
  } catch (error) {
    logger.error('Health check failed', error as Error);
    checks.spreadsheet = false;
  }

  const healthy = checks.api && checks.spreadsheet;
  const status = healthy ? 200 : 503;

  return NextResponse.json(checks, { status });
}
```

---

## 테스트 전략

### 5.1 Python 테스트

**파일**: `test_crawler.py` (새 파일)

```python
# test_crawler.py
import pytest
from unittest.mock import Mock, patch
import requests
from marine_ministry_crawler_final import MarineMinistryJejCrawler

@pytest.fixture
def crawler():
    return MarineMinistryJejCrawler()

def test_parse_date_valid_formats(crawler):
    """날짜 파싱 테스트"""
    test_cases = [
        ('2025-11-18', 2025, 11, 18),
        ('2025.11.18', 2025, 11, 18),
        ('2025/11/18', 2025, 11, 18),
    ]

    for date_str, year, month, day in test_cases:
        result = crawler.parse_date(date_str)
        assert result.year == year
        assert result.month == month
        assert result.day == day

@patch('requests.get')
def test_crawl_with_timeout(mock_get, crawler):
    """타임아웃 처리 테스트"""
    mock_get.side_effect = requests.Timeout('Connection timeout')

    with pytest.raises(requests.Timeout):
        crawler.crawl_mof_board(
            '본부',
            '해양수산부',
            'https://example.com',
            '공지사항'
        )

@patch('requests.get')
def test_duplicate_removal(mock_get, crawler):
    """중복 제거 테스트"""
    # 같은 링크를 가진 2개의 결과
    link = 'https://example.com/post/1'
    crawler.add_result('본부', '해양수산부', '공지사항', 'Title 1', None, link)
    result = crawler.add_result('본부', '해양수산부', '공지사항', 'Title 2', None, link)

    assert result == False  # 두 번째는 중복으로 추가되지 않음

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
```

### 5.2 TypeScript 테스트

**파일**: `test/api.test.ts` (새 파일)

```typescript
// test/api.test.ts
import { GET } from '@/app/api/sheets/route';
import { NextRequest } from 'next/server';

describe('GET /api/sheets', () => {
  it('should return data on success', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/sheets')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeInstanceOf(Array);
  });

  it('should handle missing credentials', async () => {
    // 환경 변수 제거
    const originalEnv = process.env.GOOGLE_CREDENTIALS_JSON;
    delete process.env.GOOGLE_CREDENTIALS_JSON;

    const request = new NextRequest(
      new URL('http://localhost:3000/api/sheets')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);

    // 환경 변수 복원
    process.env.GOOGLE_CREDENTIALS_JSON = originalEnv;
  });
});
```

---

## 우선순위별 구현 계획

### Week 1: 로깅 및 에러 처리
- [ ] 로거 표준화 (Python + TypeScript)
- [ ] 에러 코드 정의 및 핸들링
- [ ] GitHub Actions 로그 구성

### Week 2: 재시도 및 타임아웃
- [ ] RetryStrategy 구현
- [ ] 기관별 타임아웃 적용
- [ ] 통합 테스트

### Week 3: 모니터링
- [ ] Slack 통합
- [ ] Health Check Endpoint
- [ ] 대시보드 메트릭

### Week 4: 테스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트
- [ ] 성능 테스트

---

**예상 총 소요 시간**: 40-50시간 (2-2.5주)

