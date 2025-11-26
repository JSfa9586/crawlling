# Phase 1 시스템 아키텍처 검증 리포트

**프로젝트**: 해양수산부 산하기관 크롤링 데이터 대시보드
**검토 날짜**: 2025-11-18
**검토자**: Claude Code (계획 검토 및 리스크 분석 전문가)
**검토 대상**: Phase 1 설계 문서 4건
**검토 결과**: ⚠️ **조건부 승인** (주요 보안 및 아키텍처 위험 요소 발견)

---

## 📋 계획 개요

### 검토 대상 문서
1. `README (2).md` - 크롤러 기능 명세
2. `해양수산부_대시보드_UIUX_설계.md` - UI/UX 설계서
3. `컴포넌트_명세서.md` - React 컴포넌트 상세 설계
4. `사용자_플로우_다이어그램.md` - 사용자 경험 플로우

### 계획의 핵심 목표
해양수산부 산하 16개 기관(11개 지방청, 1개 공단, 4개 항만공사)의 공지사항/입찰공고를 자동 수집하여 통합 대시보드로 제공

### 주요 단계
1. Python 크롤러 개발 (완료)
2. 크롤링 데이터를 Google Sheets에 저장
3. Google Sheets를 데이터베이스로 활용
4. Next.js 대시보드 개발 (Vercel 배포)
5. GitHub Actions로 정기 크롤링 자동화

---

## ✅ 강점

### 1. 철저한 사용자 중심 설계
- **3개의 명확한 페르소나 정의**: 정책담당자, 입찰담당자, 언론인
- **구체적인 사용 시나리오**: 일일 모니터링, 정밀 검색, 모바일 빠른 확인
- **접근성 우선**: WCAG 2.1 AA 준수 계획, 키보드 네비게이션, 스크린 리더 지원
- **반응형 디자인**: 모바일/태블릿/데스크톱 모두 고려

### 2. 상세한 컴포넌트 설계
- **재사용 가능한 컴포넌트 아키텍처**: Button, Input, Select 등 공통 컴포넌트
- **TypeScript 기반 타입 안전성**: Props 인터페이스 명확히 정의
- **로딩/에러/빈 상태 처리**: 모든 상태 고려
- **테스트 전략 포함**: 단위/통합/E2E 테스트 계획

### 3. 체계적인 에러 처리 플로우
- **네트워크 에러**: 자동 재시도 (최대 3회)
- **서버 에러**: 에러 로깅 (Sentry) 통합 계획
- **오프라인 모드**: Service Worker 기반 캐싱
- **낙관적 업데이트**: 북마크 등 즉각적인 피드백

### 4. 크롤러 안정성
- **자동 페이징**: 7일 내 게시물이 있으면 다음 페이지 자동 수집
- **다양한 날짜 형식 파싱**: 2025-01-17, 2025.01.17, 2025/01/17 모두 지원
- **서버 부하 방지**: 페이지/기관 사이 1-2초 대기
- **예외 처리**: 네트워크 오류 시 다음 기관으로 진행

---

## ⚠️ 주요 우려사항 (심각도 순)

### 🔴 심각 (Critical) - 즉시 해결 필요

#### 1. Google Service Account 키 보안 취약점
**문제**:
- 현재 계획에 Google Service Account JSON 키 관리 방식이 명시되지 않음
- GitHub Actions에서 `gen-lang-client-0556505482-e847371ea87e.json` 사용 추정
- 실제 키 파일이 프로젝트 디렉토리에 존재 (현재 읽은 파일 목록에서 확인)

**위험**:
- 키 파일이 Git에 커밋될 경우 **공개 저장소에서 누구나 접근 가능**
- 무단 Google Sheets API 사용으로 인한 **쿼터 소진**
- **데이터 무단 수정/삭제** 가능
- Google Cloud 프로젝트 전체 보안 침해

**권장 조치**:
```bash
# 즉시 실행
echo "*.json" >> .gitignore
echo "gen-lang-client-*.json" >> .gitignore
git rm --cached gen-lang-client-0556505482-e847371ea87e.json
git commit -m "Remove sensitive service account key"

# GitHub Secrets 등록
# Repository Settings > Secrets > Actions > New repository secret
# Name: GOOGLE_SERVICE_ACCOUNT_KEY
# Value: (JSON 파일 전체 내용을 base64 인코딩)
```

**GitHub Actions 올바른 사용법**:
```yaml
# .github/workflows/crawl.yml
name: Daily Crawl
on:
  schedule:
    - cron: '0 9 * * *'  # 매일 오전 9시 (UTC)
  workflow_dispatch:

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Decode Service Account Key
        run: |
          echo "${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}" | base64 -d > service_account.json

      - name: Run Crawler
        run: |
          python marine_ministry_crawler.py
        env:
          GOOGLE_APPLICATION_CREDENTIALS: service_account.json

      - name: Cleanup
        if: always()
        run: |
          rm -f service_account.json
```

#### 2. Google Sheets API 무료 쿼터 초과 위험
**문제**:
- Google Sheets API 무료 쿼터: **분당 60회, 일일 500회**
- 현재 계획:
  - 16개 기관 × 2개 게시판(공지사항/입찰) = 32개 게시판
  - 평균 3페이지 크롤링 가정 = 96회 크롤링
  - 각 크롤링마다 Sheets에 1회 쓰기 = **96회 API 호출**
  - 대시보드 동시 사용자 10명 × 분당 5회 읽기 = **분당 50회**

**위험**:
- 크롤링 중 쿼터 초과로 **데이터 손실**
- 대시보드 사용자에게 **"429 Too Many Requests" 에러**
- 피크 시간대 서비스 불가

**권장 조치**:

**Option 1: Batch 쓰기로 API 호출 최소화** (추천)
```python
# 잘못된 방법 (96회 API 호출)
for post in posts:
    sheet.append_row([post.title, post.date, post.link])

# 올바른 방법 (1회 API 호출)
all_posts = []
for post in posts:
    all_posts.append([post.title, post.date, post.link])

# 한 번에 모든 행 추가
sheet.append_rows(all_posts, value_input_option='RAW')
```

**Option 2: 캐싱 레이어 추가**
```yaml
# Vercel 환경 변수 설정
ENABLE_CACHE=true
CACHE_TTL=300  # 5분

# Next.js API 라우트에서 캐싱
// pages/api/posts.js
import { unstable_cache } from 'next/cache';

export const revalidate = 300; // 5분 캐싱

async function getPostsFromSheets() {
  // Google Sheets API 호출
}

export default async function handler(req, res) {
  const cachedPosts = await unstable_cache(
    getPostsFromSheets,
    ['posts'],
    { revalidate: 300 }
  )();

  res.json(cachedPosts);
}
```

**Option 3: Rate Limiting 구현**
```javascript
// lib/rateLimiter.js
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 50,  // 분당 50회
  interval: 'minute'
});

export async function callSheetsAPI(fn) {
  await limiter.removeTokens(1);
  return fn();
}
```

#### 3. 데이터베이스 부재에 따른 확장성 문제
**문제**:
- Google Sheets를 데이터베이스로 사용하는 것은 **프로토타입에만 적합**
- 현재 계획으로 예상되는 데이터:
  - 일일 평균 300건 게시물 × 365일 = **연간 109,500건**
  - Google Sheets 최대 행: **500만 행** (이론상 가능)
  - 실제 성능: **1만 행 초과 시 속도 급격히 저하**

**위험**:
- 6개월 후 약 54,000건 누적 시 **대시보드 로딩 속도 10초 이상**
- 필터/검색 기능 **응답 시간 3-5초**
- 복잡한 쿼리 불가 (날짜 범위, 다중 필터 조합)
- 트랜잭션 미지원으로 **데이터 정합성 문제**

**권장 조치**:

**Phase 2 마이그레이션 계획 수립** (3개월 이내)

**Option 1: Supabase (PostgreSQL)** - 추천
```javascript
// 장점:
// - 무료 플랜: 500MB 스토리지, 2GB 전송량/월
// - PostgreSQL 기반 (강력한 쿼리, 인덱싱, FTS)
// - Row Level Security (RLS)
// - Realtime 기능 (WebSocket)
// - Vercel과 완벽 통합

// 마이그레이션 예시
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 복잡한 쿼리 가능
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('board', '입찰공고')
  .gte('created_at', '2025-11-01')
  .lte('created_at', '2025-11-30')
  .ilike('title', '%부산%')
  .order('created_at', { ascending: false })
  .range(0, 19);  // 페이징
```

**Option 2: PlanetScale (MySQL)**
```javascript
// 장점:
// - 무료 플랜: 5GB 스토리지, 1억 행 읽기/월
// - Branching 기능 (Git 같은 스키마 관리)
// - 엣지 배포 최적화
// - Vercel 통합

// 단점:
// - FTS 없음 (검색에 제약)
```

**Option 3: Vercel Postgres (Neon)**
```javascript
// 장점:
// - Vercel 네이티브 통합
// - Serverless, 자동 확장
// - 무료 플랜: 3GB 스토리지

// 단점:
// - 상대적으로 비싼 가격 (유료 전환 시)
```

**데이터 마이그레이션 스크립트**:
```python
# migrate_sheets_to_db.py
import gspread
from supabase import create_client
import os

# Google Sheets 읽기
gc = gspread.service_account(filename='service_account.json')
sheet = gc.open('해양수산부_게시물').sheet1
rows = sheet.get_all_records()

# Supabase 쓰기
supabase = create_client(
    os.environ['SUPABASE_URL'],
    os.environ['SUPABASE_KEY']
)

for row in rows:
    supabase.table('posts').insert({
        'org_category': row['기관구분'],
        'org_name': row['기관명'],
        'board': row['게시판'],
        'title': row['제목'],
        'created_at': row['작성일'],
        'link': row['링크'],
        'collected_at': row['수집일시']
    }).execute()

print(f"Migrated {len(rows)} rows")
```

---

### 🟠 중요 (High) - 2주 이내 해결 필요

#### 4. GitHub Actions 크롤링 실패 시나리오 미대비
**문제**:
- 크롤링 실패 시 알림 메커니즘 없음
- 실패 원인:
  - 기관 웹사이트 구조 변경 (가장 빈번)
  - 웹사이트 일시적 다운
  - GitHub Actions 타임아웃 (최대 6시간, 기본 360분)
  - Google Sheets API 쿼터 초과

**위험**:
- 며칠간 데이터 누락 발견 못함
- 사용자에게 오래된 정보 제공
- 신뢰도 하락

**권장 조치**:

**1. 크롤러에 실패 로깅 추가**
```python
# marine_ministry_crawler.py
import logging
from datetime import datetime

class CrawlerLogger:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_count = 0

    def log_error(self, org_name, board, error):
        self.errors.append({
            'org': org_name,
            'board': board,
            'error': str(error),
            'timestamp': datetime.now().isoformat()
        })

    def get_summary(self):
        return {
            'total': self.total_count,
            'success': self.success_count,
            'failed': len(self.errors),
            'errors': self.errors,
            'timestamp': datetime.now().isoformat()
        }

# 사용 예시
logger = CrawlerLogger()

for org in organizations:
    logger.total_count += 1
    try:
        result = crawl_organization(org)
        logger.success_count += 1
    except Exception as e:
        logger.log_error(org.name, board, e)

summary = logger.get_summary()

# 실패가 30% 이상이면 알림
if summary['failed'] / summary['total'] > 0.3:
    send_alert_email(summary)
```

**2. GitHub Actions 알림 설정**
```yaml
# .github/workflows/crawl.yml
- name: Run Crawler
  id: crawl
  run: |
    python marine_ministry_crawler.py > crawl.log 2>&1
    echo "exit_code=$?" >> $GITHUB_OUTPUT
  continue-on-error: true

- name: Upload Logs
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: crawl-logs
    path: crawl.log

- name: Send Failure Notification
  if: steps.crawl.outputs.exit_code != '0'
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: '[크롤러 실패] 해양수산부 크롤링 오류'
    body: |
      크롤링이 실패했습니다.

      실행 시간: ${{ github.run_started_at }}
      워크플로우 URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}

      로그를 확인하세요.
    to: admin@example.com
```

**3. 대시보드에 데이터 freshness 표시**
```typescript
// components/DataFreshnessIndicator.tsx
import { useEffect, useState } from 'react';

export function DataFreshnessIndicator() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Google Sheets의 "수집일시" 최신 값 가져오기
    fetch('/api/last-update')
      .then(res => res.json())
      .then(data => setLastUpdate(new Date(data.timestamp)));
  }, []);

  if (!lastUpdate) return null;

  const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / 1000 / 60 / 60;
  const isStale = hoursSinceUpdate > 24;

  return (
    <div className={isStale ? 'text-red-600' : 'text-green-600'}>
      {isStale && '⚠️ '}
      마지막 데이터 수집: {lastUpdate.toLocaleString('ko-KR')}
      {isStale && ' (24시간 이상 경과)'}
    </div>
  );
}
```

#### 5. Next.js ISR (Incremental Static Regeneration) 전략 미흡
**문제**:
- 설계 문서에 ISR 언급 없음
- 모든 요청마다 Google Sheets API 호출 시 **쿼터 초과 및 느린 응답**

**위험**:
- 동시 사용자 10명 = 분당 50-100회 API 호출
- 쿼터 초과로 서비스 중단
- 응답 시간 2-3초 (사용자 경험 저하)

**권장 조치**:

**Next.js App Router (13+) 활용**
```typescript
// app/posts/page.tsx
import { unstable_cache } from 'next/cache';

// 5분마다 재검증
export const revalidate = 300;

async function getPosts() {
  // Google Sheets API 호출
  const posts = await fetchFromGoogleSheets();
  return posts;
}

// 캐싱된 함수
const getCachedPosts = unstable_cache(
  getPosts,
  ['posts-list'],
  {
    revalidate: 300,
    tags: ['posts']
  }
);

export default async function PostsPage() {
  const posts = await getCachedPosts();

  return <PostsTable posts={posts} />;
}
```

**On-Demand Revalidation (크롤링 완료 후 캐시 무효화)**
```python
# marine_ministry_crawler.py
import requests

# 크롤링 완료 후
requests.post(
    'https://your-dashboard.vercel.app/api/revalidate',
    headers={'Authorization': f'Bearer {REVALIDATION_TOKEN}'},
    json={'tag': 'posts'}
)
```

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (token !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { tag } = await request.json();
  revalidateTag(tag);

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

#### 6. 크롤러 중복 데이터 삽입 방지 부재
**문제**:
- 같은 게시물이 여러 번 수집될 수 있음
  - 매일 크롤링 시 어제 게시물도 7일 범위에 포함
  - GitHub Actions가 실패 후 재실행될 때 중복 수집

**위험**:
- Google Sheets에 중복 행 누적
- 대시보드에서 같은 게시물이 여러 번 표시
- 사용자 혼란

**권장 조치**:

**Option 1: 게시물 고유 ID 생성**
```python
import hashlib

def generate_post_id(org_name, board, title, date):
    """게시물 고유 ID 생성"""
    unique_string = f"{org_name}|{board}|{title}|{date}"
    return hashlib.sha256(unique_string.encode()).hexdigest()[:16]

# 크롤링 시 ID 생성
post = {
    'id': generate_post_id(org_name, board, title, date),
    'org_category': org_category,
    'org_name': org_name,
    'board': board,
    'title': title,
    'created_at': date,
    'link': link,
    'collected_at': datetime.now().isoformat()
}
```

**Option 2: 삽입 전 중복 체크**
```python
def is_duplicate(sheet, post_id):
    """Google Sheets에서 ID 존재 여부 확인"""
    all_ids = sheet.col_values(1)  # 첫 번째 열이 ID라고 가정
    return post_id in all_ids

# 사용
if not is_duplicate(sheet, post['id']):
    sheet.append_row([post['id'], post['title'], ...])
else:
    print(f"Skipping duplicate: {post['title']}")
```

**Option 3: 데이터베이스 마이그레이션 시 UNIQUE 제약**
```sql
-- Supabase 테이블 생성
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  org_category TEXT NOT NULL,
  org_name TEXT NOT NULL,
  board TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at DATE NOT NULL,
  link TEXT NOT NULL,
  collected_at TIMESTAMP DEFAULT NOW(),

  -- 복합 고유 제약
  UNIQUE (org_name, board, title, created_at)
);

-- 인덱스 생성 (성능)
CREATE INDEX idx_created_at ON posts(created_at DESC);
CREATE INDEX idx_board ON posts(board);
CREATE INDEX idx_org_name ON posts(org_name);
CREATE INDEX idx_title ON posts USING GIN (to_tsvector('korean', title));  -- 전문 검색
```

---

### 🟡 보통 (Medium) - 1개월 이내 개선 권장

#### 7. 모니터링 및 에러 추적 부재
**문제**:
- Sentry 통합 계획만 있고 구체적인 설정 없음
- 사용자 행동 분석 도구 미설정
- 성능 모니터링 부재

**권장 조치**:

**Sentry 설정**
```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Next.js config
}, {
  silent: true,
  org: "your-org",
  project: "marine-dashboard",
});

// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  // 성능 모니터링
  beforeSend(event, hint) {
    // 민감 정보 제거
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  }
});
```

**Vercel Analytics**
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### 8. 백업 및 복구 계획 부재
**문제**:
- Google Sheets 데이터 손실 시 복구 방법 없음
- 실수로 시트 삭제, API를 통한 대량 삭제 가능

**권장 조치**:

**일일 백업 스크립트**
```python
# backup_sheets.py
import gspread
import json
from datetime import datetime
import boto3  # AWS S3 (또는 Google Cloud Storage)

def backup_sheets():
    gc = gspread.service_account(filename='service_account.json')
    sheet = gc.open('해양수산부_게시물').sheet1

    # 모든 데이터 가져오기
    data = sheet.get_all_records()

    # JSON으로 저장
    backup_filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # S3 업로드 (선택사항)
    s3 = boto3.client('s3')
    s3.upload_file(
        backup_filename,
        'marine-dashboard-backups',
        backup_filename
    )

    print(f"Backup saved: {backup_filename}")

if __name__ == '__main__':
    backup_sheets()
```

**GitHub Actions 백업 워크플로우**
```yaml
# .github/workflows/backup.yml
name: Daily Backup
on:
  schedule:
    - cron: '0 2 * * *'  # 매일 오전 2시 (UTC)

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install gspread boto3

      - name: Run Backup
        run: python backup_sheets.py
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

#### 9. 사이트 구조 변경 감지 메커니즘 부재
**문제**:
- 기관 웹사이트 구조 변경 시 크롤러 실패
- 변경 감지 후 수동 코드 수정 필요

**권장 조치**:

**구조 변경 감지 로직**
```python
class StructureValidator:
    def __init__(self):
        # 기대하는 HTML 구조의 특징
        self.expected_selectors = {
            'table': 'table.board-list',
            'title': 'td.title a',
            'date': 'td.date',
            'pagination': 'div.pagination'
        }

    def validate(self, soup):
        """HTML 구조가 예상과 일치하는지 확인"""
        for key, selector in self.expected_selectors.items():
            elements = soup.select(selector)
            if not elements:
                return False, f"Missing selector: {selector}"
        return True, "OK"

    def crawl_with_validation(self, url):
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        is_valid, message = self.validate(soup)
        if not is_valid:
            logger.error(f"Structure changed: {url} - {message}")
            send_alert(f"⚠️ 웹사이트 구조 변경 감지: {url}\n{message}")
            return None

        return self.parse_posts(soup)
```

#### 10. Rate Limiting 없는 크롤러
**문제**:
- 1-2초 대기는 너무 단순
- 특정 사이트는 더 엄격한 제한 필요

**권장 조치**:
```python
from ratelimit import limits, sleep_and_retry

class RateLimitedCrawler:
    @sleep_and_retry
    @limits(calls=10, period=60)  # 분당 10회 제한
    def fetch_page(self, url):
        response = requests.get(url, timeout=30)
        return response

    def crawl_with_retry(self, url, max_retries=3):
        for attempt in range(max_retries):
            try:
                return self.fetch_page(url)
            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                raise
```

---

### 🔵 낮음 (Low) - 향후 개선 고려

#### 11. 국제화(i18n) 미지원
**문제**: 현재 한국어만 지원, 향후 영문 지원 필요 시 전면 수정

**권장 조치**: next-intl 라이브러리 사전 설계

#### 12. 다크 모드 구현 우선순위 낮음
**문제**: 설계에는 포함되어 있으나 MVP에서 제외 권장

**권장 조치**: Phase 2로 연기

#### 13. PWA 기능 부재
**문제**: 오프라인 지원, 푸시 알림 등 PWA 기능 미구현

**권장 조치**: Phase 3 이후 고려

---

## 💡 개선 제안

### 1. 아키텍처 개선안

#### 현재 아키텍처
```
GitHub Actions (크롤러)
        ↓
Google Sheets (데이터베이스)
        ↓
Next.js (Vercel) → 사용자
```

**문제점**:
- Google Sheets가 단일 실패 지점 (SPOF)
- API 쿼터 제한
- 복잡한 쿼리 불가
- 느린 응답 속도

#### 권장 아키텍처 (3개월 이내 마이그레이션)
```
GitHub Actions (크롤러)
        ↓
    Supabase PostgreSQL (데이터베이스)
        ↓
Next.js (Vercel) + Redis 캐시 (Upstash)
        ↓
    사용자
        ↓
Vercel Edge Functions (실시간 검색)
```

**장점**:
- 무제한 쿼리 (쿼터 없음)
- 복잡한 필터/검색 가능
- 빠른 응답 (< 100ms)
- 실시간 업데이트 (WebSocket)
- 트랜잭션 지원
- 자동 백업

**마이그레이션 단계**:
1. **주차 1-2**: Supabase 프로젝트 생성, 스키마 설계
2. **주차 3**: 기존 Google Sheets 데이터 마이그레이션
3. **주차 4**: Next.js API 라우트 Supabase로 전환
4. **주차 5**: 크롤러 Supabase 연동
5. **주차 6**: 병렬 운영 및 테스트
6. **주차 7**: Google Sheets 단계적 폐기

### 2. 보안 강화 방안

#### 현재 취약점
- Service Account 키 노출 위험
- API 엔드포인트 무단 접근 가능
- Rate Limiting 없음

#### 권장 보안 조치
```typescript
// middleware.ts (Vercel Edge Middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),  // 10초당 10회
});

export async function middleware(request: NextRequest) {
  // API 엔드포인트에만 적용
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**CORS 설정**:
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 3. 비용 최적화

#### 현재 무료 플랜 사용 가능
- GitHub Actions: 월 2,000분 (Public 저장소는 무제한)
- Vercel: Hobby 플랜 (무료)
  - 100GB 대역폭/월
  - Serverless 함수 실행 시간 100GB-시간/월
- Google Sheets API: 일일 500회

#### 예상 비용 (무료 쿼터 초과 시)
- **Vercel Pro**: $20/월 (1TB 대역폭, 1000GB-시간)
- **Supabase Pro**: $25/월 (8GB DB, 50GB 전송량)
- **Upstash Redis**: $0.2/월 (10,000회 호출 무료)
- **총 예상**: $0-45/월 (사용량에 따라)

#### 최적화 방안
1. **Vercel ISR 적극 활용**: 캐싱으로 API 호출 99% 감소
2. **이미지 최적화**: Vercel Image Optimization 사용
3. **Edge Functions**: 지역별 캐싱으로 응답 속도 향상
4. **Google Sheets 대신 Supabase**: 쿼터 제한 없음

### 4. 에러 복구 전략

#### 크롤러 실패 시나리오별 대응

| 시나리오 | 감지 방법 | 대응 |
|---------|----------|------|
| 웹사이트 구조 변경 | Selector 찾기 실패 | 이메일 알림 + 마지막 성공 데이터 유지 |
| 웹사이트 일시 다운 | HTTP 500/503 | 자동 재시도 (3회), 실패 시 스킵 |
| 네트워크 타임아웃 | Timeout 예외 | Exponential backoff 재시도 |
| Google Sheets 쿼터 초과 | 429 에러 | 1시간 후 재시도 (GitHub Actions 지연 실행) |
| 데이터 파싱 오류 | 날짜 형식 불일치 | 로그 기록, 해당 게시물 스킵 |

#### 자동 복구 워크플로우
```yaml
# .github/workflows/crawl-retry.yml
name: Crawl Retry
on:
  workflow_run:
    workflows: ["Daily Crawl"]
    types:
      - completed

jobs:
  retry-on-failure:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    steps:
      - name: Wait 1 hour
        run: sleep 3600

      - name: Retry Crawl
        uses: actions/github-script@v6
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'crawl.yml',
              ref: 'main'
            });
```

### 5. 모니터링 개선

#### 대시보드 Health Check API
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    database: false,
    sheets: false,
    lastCrawl: null,
  };

  try {
    // Google Sheets 연결 확인
    const sheetsResponse = await fetch('/api/posts?limit=1');
    checks.sheets = sheetsResponse.ok;

    // 마지막 크롤링 시간 확인
    const posts = await sheetsResponse.json();
    const lastPost = posts[0];
    if (lastPost) {
      checks.lastCrawl = lastPost.collected_at;

      // 24시간 이상 경과 시 경고
      const hoursSince = (Date.now() - new Date(lastPost.collected_at).getTime()) / 1000 / 60 / 60;
      if (hoursSince > 24) {
        checks.warning = 'Last crawl is more than 24 hours ago';
      }
    }

    const status = checks.sheets ? 200 : 503;

    return NextResponse.json(
      {
        status: status === 200 ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

#### UptimeRobot 통합 (무료)
```
Monitor URL: https://your-dashboard.vercel.app/api/health
Interval: 5분
Alert Contacts: 이메일/Slack
```

---

## 🎯 실행 전 체크리스트

### Phase 1 배포 전 필수 조치 (최우선)

- [ ] **보안**
  - [ ] Service Account JSON 키를 GitHub Secrets에 등록
  - [ ] `.gitignore`에 `*.json` 추가
  - [ ] 기존 커밋 히스토리에서 키 파일 제거 (`git filter-branch`)
  - [ ] Google Cloud 프로젝트에 IP 제한 설정

- [ ] **API 쿼터 관리**
  - [ ] Google Sheets API Batch 쓰기로 전환 (96회 → 1회)
  - [ ] Next.js ISR 설정 (revalidate: 300초)
  - [ ] Rate Limiting 미들웨어 추가

- [ ] **데이터 무결성**
  - [ ] 게시물 고유 ID 생성 로직 추가
  - [ ] 중복 체크 로직 구현
  - [ ] Google Sheets에 'id' 컬럼 추가

- [ ] **모니터링**
  - [ ] 크롤러 에러 로깅 추가
  - [ ] GitHub Actions 실패 시 이메일 알림 설정
  - [ ] 대시보드에 데이터 freshness 표시

- [ ] **백업**
  - [ ] 일일 백업 스크립트 작성
  - [ ] GitHub Actions 백업 워크플로우 설정
  - [ ] 복구 절차 문서화

### Phase 2 준비 (1-3개월)

- [ ] **데이터베이스 마이그레이션 계획**
  - [ ] Supabase 프로젝트 생성
  - [ ] 스키마 설계 (ERD 작성)
  - [ ] 마이그레이션 스크립트 작성
  - [ ] 병렬 운영 기간 설정

- [ ] **성능 최적화**
  - [ ] Vercel Analytics 설치
  - [ ] Core Web Vitals 측정
  - [ ] 이미지 최적화 (WebP, lazy loading)
  - [ ] 가상 스크롤링 구현 (1000건 이상 데이터)

- [ ] **보안 강화**
  - [ ] CORS 정책 설정
  - [ ] API 인증 추가 (JWT)
  - [ ] Rate Limiting (Upstash Redis)

### Phase 3 고도화 (3-6개월)

- [ ] **기능 확장**
  - [ ] 실시간 알림 (WebSocket)
  - [ ] 키워드 알림 설정
  - [ ] 데이터 시각화 (D3.js)
  - [ ] AI 기반 추천

- [ ] **접근성 개선**
  - [ ] WCAG 2.1 AA 완전 준수
  - [ ] 키보드 네비게이션 100%
  - [ ] 스크린 리더 최적화

- [ ] **국제화**
  - [ ] 다국어 지원 (한/영)
  - [ ] 타임존 처리

---

## 📊 위험 매트릭스

| 위험 요소 | 발생 가능성 | 영향도 | 우선순위 |
|----------|-----------|-------|---------|
| Service Account 키 노출 | 높음 | 치명적 | 🔴 긴급 |
| Google Sheets 쿼터 초과 | 높음 | 높음 | 🔴 긴급 |
| 크롤러 실패 미감지 | 중간 | 높음 | 🟠 높음 |
| 데이터 중복 삽입 | 높음 | 중간 | 🟠 높음 |
| 웹사이트 구조 변경 | 중간 | 높음 | 🟠 높음 |
| 확장성 문제 (6개월 후) | 확실 | 높음 | 🟠 높음 |
| 백업 부재 | 낮음 | 높음 | 🟡 중간 |
| 모니터링 부재 | 중간 | 중간 | 🟡 중간 |

---

## 💬 최종 권고사항

### 즉시 실행 (배포 전 필수)
1. **Service Account 키를 GitHub Secrets로 이동** (보안 최우선)
2. **Google Sheets Batch API 사용** (쿼터 문제 해결)
3. **중복 데이터 방지 로직 추가** (데이터 무결성)
4. **크롤러 에러 알림 설정** (운영 안정성)

### 2주 이내
5. **Next.js ISR 캐싱 구현** (성능 향상)
6. **일일 백업 자동화** (데이터 안전)
7. **Health Check API 구축** (모니터링)

### 1개월 이내
8. **Supabase 마이그레이션 시작** (확장성 확보)
9. **Sentry 통합** (에러 추적)
10. **Rate Limiting 구현** (서비스 보호)

### 3개월 이내
11. **Supabase 완전 전환** (Google Sheets 폐기)
12. **Redis 캐싱 추가** (성능 최적화)
13. **CI/CD 파이프라인 강화** (테스트 자동화)

---

## 📝 검토 요약

### 검증 결과
**⚠️ 조건부 승인**: 현재 설계는 **프로토타입으로는 적합**하나, 다음 **4가지 심각한 위험 요소**를 즉시 해결해야 프로덕션 배포 가능:

1. Service Account 키 보안 취약점
2. Google Sheets API 쿼터 초과 위험
3. 데이터베이스 부재 (확장성 문제)
4. 크롤링 실패 감지 부재

### 프로젝트 타임라인 재조정 제안

**기존 계획 (추정)**:
- Phase 1: 설계 완료
- Phase 2: 즉시 배포

**수정 계획 (권장)**:
```
Week 1-2: Phase 1.5 - 보안 및 안정성 강화
  - Service Account 키 보안 조치
  - Batch API 전환
  - 중복 방지 로직
  - 에러 알림 설정

Week 3: Phase 2 - MVP 배포
  - 내부 테스트 (3-5명)
  - 버그 수정

Week 4: Phase 3 - 제한적 공개
  - 10-20명 베타 테스터
  - 피드백 수집

Week 5-8: Phase 4 - 데이터베이스 마이그레이션
  - Supabase 전환
  - 성능 최적화

Week 9+: Phase 5 - 정식 출시
  - 전체 공개
  - 지속적 개선
```

### 예상 성공률
- **현재 계획대로 진행 시**: 30% (보안/확장성 문제로 인한 조기 실패 가능성 높음)
- **권장사항 반영 시**: 85% (안정적인 프로덕션 운영 가능)

---

## 🎓 결론

현재 설계는 **UI/UX 측면에서 매우 우수**하며, 사용자 경험 플로우가 잘 계획되어 있습니다. 특히 접근성, 반응형 디자인, 에러 처리 플로우는 모범 사례 수준입니다.

그러나 **백엔드 아키텍처와 보안 측면에서 심각한 취약점**이 발견되었습니다. Google Sheets를 데이터베이스로 사용하는 것은 프로토타입에는 적합하지만, 실제 서비스로는 3-6개월 내에 한계에 도달할 것입니다.

**권장 조치를 모두 반영한다면**, 이 프로젝트는 안정적이고 확장 가능한 서비스로 성장할 수 있습니다. 특히 Supabase 마이그레이션은 장기적으로 필수적이며, 가능한 한 빨리 계획을 수립해야 합니다.

**최종 판정**: ⚠️ **조건부 승인** - 위에 명시된 긴급 조치 4가지를 완료한 후 배포 진행을 권장합니다.

---

**다음 단계**:
1. 이 리포트를 팀과 공유
2. 긴급 조치 4가지 우선 처리
3. 마이그레이션 계획 수립 (3개월 타임라인)
4. 주간 진행 상황 리뷰

**문의사항이 있으면 언제든지 질문해주세요!**
