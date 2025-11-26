# 발견된 문제 및 수정 가이드

**작성일**: 2025-11-18
**대상**: 해양수산부 크롤링 시스템

---

## I. Medium 심각도 (권장 수정)

### 1. 미래 날짜 데이터 크롤링

**문제 설명**:
- 테스트 결과에서 2025-11-28 데이터 발견 (오늘: 2025-11-18)
- 10일 미래의 데이터가 크롤링됨
- 날짜 검증 로직의 버그로 추정

**영향도**: Medium (데이터 품질 저하)

**위치**: `marine_ministry_crawler_final.py` 라인 75-79

**현재 코드**:
```python
def is_within_7days(self, date_obj):
    """7일 이내 게시물인지 확인"""
    if not date_obj:
        return False
    return date_obj >= self.seven_days_ago.replace(hour=0, minute=0, second=0, microsecond=0)
```

**문제점**:
- 미래 날짜 체크 없음
- `self.today` 이후의 날짜도 허용

**수정 코드**:
```python
def is_within_7days(self, date_obj):
    """7일 이내 게시물인지 확인 (미래 날짜 제외)"""
    if not date_obj:
        return False

    # 미래 날짜 필터링 (시간 무시)
    date_only = date_obj.replace(hour=0, minute=0, second=0, microsecond=0)
    today_only = self.today.replace(hour=0, minute=0, second=0, microsecond=0)

    if date_only > today_only:
        print(f"  [경고] 미래 날짜 제외: {date_only.strftime('%Y-%m-%d')}")
        return False

    return date_only >= self.seven_days_ago.replace(hour=0, minute=0, second=0, microsecond=0)
```

**테스트 방법**:
```bash
# 수정 후 실행
python marine_ministry_crawler_final.py

# 출력에서 확인:
# [경고] 미래 날짜 제외: 2025-11-28 (또는 없음)
```

**예상 결과**:
- 미래 날짜 제외
- 수집 건수 소폭 감소 (70건 → ~65건)
- 데이터 신뢰도 향상

---

### 2. 광범위한 예외 처리

**문제 설명**:
- 모든 종류의 예외를 무시하는 `except:` 사용
- 예상치 못한 오류 감지 불가
- 디버깅 및 로깅 어려움

**심각도**: Medium (유지보수성 저하)

**위치**: 다중 위치
- 라인 70 (parse_date 메서드)
- 라인 180 (crawl_mof_board 메서드)
- 라인 276 (crawl_koem_board 메서드)
- 라인 366 (crawl_port_authority_board 메서드)
- 라인 487 (crawl_mof_main_board 메서드)
- 라인 577 (crawl_busanpa_board 메서드)

**현재 코드 (예시)**:
```python
def parse_date(self, date_str):
    """다양한 날짜 형식 파싱"""
    date_str = date_str.strip().rstrip('.')

    formats = [...]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return self.seoul_tz.localize(dt)
        except:  # ← 문제
            continue

    return None
```

**수정 코드**:
```python
def parse_date(self, date_str):
    """다양한 날짜 형식 파싱"""
    date_str = date_str.strip().rstrip('.')

    formats = [...]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return self.seoul_tz.localize(dt)
        except ValueError:  # ← 명시적 예외 타입
            continue

    return None
```

**다른 위치 예시**:
```python
# 라인 180, 276, 366 등에서
try:
    # ... 코드 ...
except Exception as e:  # ← Exception으로 변경
    logger.debug(f"Row processing error: {e}")
    continue
```

**추가: logging 모듈 추가**:
```python
import logging

# 파일 시작 부분에 추가
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

**테스트 방법**:
```bash
python marine_ministry_crawler_final.py 2>&1 | grep -i error
```

---

## II. Low 심각도 (추후 개선)

### 1. npm 보안 취약점

**문제 설명**:
- 2개의 High severity 취약점 감지
- 패키지 의존성 보안 업데이트 필요

**위치**: `dashboard/package.json`

**현재 상태**:
```
2 high severity vulnerabilities
```

**수정 방법 (선택)**:

```bash
# 방법 1: 자동 수정
cd dashboard
npm audit fix

# 방법 2: 강제 수정 (주의)
npm audit fix --force

# 방법 3: 수동 확인
npm audit
```

**권장**: 방법 1 먼저 시도, 필요시 방법 2

**테스트**:
```bash
npm audit
# 0 vulnerabilities 확인
```

---

### 2. API 한글 쿼리 파라미터

**문제 설명**:
- API가 한글 파라미터명 사용 (기관, 게시판 등)
- URL 인코딩 문제 및 국제화 어려움
- RESTful API 표준 미준수

**영향도**: Low (기능 정상, 국제화 이슈)

**위치**: `dashboard/app/api/sheets/route.ts` 라인 88-95

**현재 코드**:
```typescript
const filterOptions = {
  기관: url.searchParams.get('기관') || undefined,
  게시판: url.searchParams.get('게시판') || undefined,
  검색어: url.searchParams.get('검색어') || undefined,
  시작일: url.searchParams.get('시작일') || undefined,
  종료일: url.searchParams.get('종료일') || undefined,
  페이지: parseInt(url.searchParams.get('페이지') || '1', 10),
  페이지크기: parseInt(url.searchParams.get('페이지크기') || '20', 10),
};
```

**예시 URL**:
```
Before: /api/sheets?기관=해양수산부&게시판=공지사항
After:  /api/sheets?org=해양수산부&board=공지사항
```

**수정 방안** (점진적 적용):

**Step 1**: 양쪽 파라미터 모두 지원
```typescript
const filterOptions = {
  기관: url.searchParams.get('기관') || url.searchParams.get('org'),
  게시판: url.searchParams.get('게시판') || url.searchParams.get('board'),
  검색어: url.searchParams.get('검색어') || url.searchParams.get('query'),
  시작일: url.searchParams.get('시작일') || url.searchParams.get('startDate'),
  종료일: url.searchParams.get('종료일') || url.searchParams.get('endDate'),
  페이지: parseInt(url.searchParams.get('페이지') || url.searchParams.get('page') || '1', 10),
  페이지크기: parseInt(url.searchParams.get('페이지크기') || url.searchParams.get('pageSize') || '20', 10),
};
```

**Step 2**: 문서 업데이트 (API 명세서에서)
```
Deprecated: 기관, 게시판 등 (한글 파라미터)
Recommended: org, board, query 등 (영문 파라미터)
```

**Step 3**: 향후 버전에서 한글 파라미터 제거

---

### 3. 크롤러 로깅 부재

**문제 설명**:
- 파일 기반 로깅 없음 (stdout만 사용)
- 크롤러 실행 기록 추적 불가
- 장기 모니터링 어려움

**권장사항**:

**수정 코드** (파일 시작 부분):
```python
import logging
from datetime import datetime

# 로깅 설정
def setup_logger():
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)

    log_file = f"{log_dir}/crawler_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    handler = logging.FileHandler(log_file, encoding='utf-8')
    handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    ))

    logger = logging.getLogger(__name__)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

    return logger, log_file

# __init__ 메서드에 추가
self.logger, self.log_file = setup_logger()

# 크롤링 시작
self.logger.info(f"크롤링 시작: {self.today.strftime('%Y-%m-%d')}")
```

**사용 예**:
```python
self.logger.info(f"크롤링 완료: {len(self.results)}건")
self.logger.error(f"크롤링 실패: {org_name}")
self.logger.warning(f"미래 날짜 제외: {date_str}")
```

**결과**:
```
logs/
  crawler_20251118_131500.log
  crawler_20251118_141200.log
  ...
```

---

### 4. 구성 하드코딩

**문제 설명**:
- 기관 정보가 코드에 하드코딩됨
- 변경 시마다 소스 수정 필요
- 유지보수 어려움

**위치**: 라인 604-678 (run 메서드)

**현재 방식**:
```python
fishery_units = [
    ("동해어업관리단", "https://eastship.mof.go.kr/..."),
    ("남해어업관리단", "https://southship.mof.go.kr/..."),
]
```

**개선 방안**: 설정 파일 사용

**config.json**:
```json
{
  "fishery_units": [
    {
      "name": "동해어업관리단",
      "personnel_url": "https://eastship.mof.go.kr/ko/board.do?menuIdx=265"
    },
    {
      "name": "남해어업관리단",
      "personnel_url": "https://southship.mof.go.kr/ko/board.do?menuIdx=766"
    }
  ],
  "regional_offices": [
    ...
  ]
}
```

**코드 수정**:
```python
import json

def load_config(config_file='config.json'):
    with open(config_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def run(self):
    config = load_config()

    # 어업관리단 크롤링
    for org_data in config['fishery_units']:
        count, status = self.crawl_mof_board(
            "어업관리단",
            org_data['name'],
            org_data['personnel_url'],
            "인사발령"
        )
```

---

## III. 개선 우선순위 매트릭스

### 우선순위 1 (P0: 즉시)
- [x] 미래 날짜 필터링 추가
  - **난이도**: 낮음 (30분)
  - **영향도**: 중간 (데이터 품질)
  - **권장**: 배포 전 필수 적용

### 우선순위 2 (P1: 중요)
- [ ] 예외 처리 개선
  - **난이도**: 낮음 (1시간)
  - **영향도**: 중간 (유지보수성)
  - **권장**: 3개월 내 적용

- [ ] npm 보안 패치
  - **난이도**: 낮음 (5분)
  - **영향도**: 낮음 (보안)
  - **권장**: 배포 전 선택 적용

### 우선순위 3 (P2: 권장)
- [ ] 로깅 시스템 추가
  - **난이도**: 중간 (2시간)
  - **영향도**: 낮음 (모니터링)
  - **권장**: 6개월 내 적용

- [ ] API 파라미터 개선
  - **난이도**: 중간 (2시간)
  - **영향도**: 낮음 (국제화)
  - **권장**: 12개월 내 적용

### 우선순위 4 (P3: 선택)
- [ ] 설정 파일 분리
  - **난이도**: 중간 (2시간)
  - **영향도**: 낮음 (유지보수성)
  - **권장**: 장기 계획

---

## IV. 수정 적용 순서

### Week 1 (배포 전)
```
Day 1:
  1. 미래 날짜 필터링 적용 (30분)
  2. 테스트 (30분)

Day 2:
  1. npm 보안 패치 (5분)
  2. 배포 준비 (1시간)
```

### Week 2-4 (배포 후)
```
  1. 예외 처리 개선 (1시간)
  2. 로깅 시스템 추가 (2시간)
  3. 테스트 및 배포 (1시간)
```

### Month 2 (성능 개선)
```
  1. API 파라미터 개선 (2시간)
  2. 설정 파일 분리 (2시간)
  3. 캐싱 시스템 (4시간)
```

---

## V. 테스트 체크리스트

### 미래 날짜 필터링 테스트
- [ ] 코드 수정 적용
- [ ] 로컬에서 실행
- [ ] 수집 건수 확인 (70건 → ~65건)
- [ ] 미래 날짜 제외 로그 확인
- [ ] Git 커밋

### 예외 처리 개선 테스트
- [ ] 코드 수정 적용
- [ ] 네트워크 오류 시뮬레이션
- [ ] 로그 출력 확인
- [ ] Git 커밋

### npm 보안 패치 테스트
- [ ] `npm audit fix` 실행
- [ ] `npm audit` 결과 확인
- [ ] `npm run build` 성공 확인
- [ ] Git 커밋

---

## VI. 성능 개선 로드맵

### Phase 2 (단기: 1-2개월)
```
1. 캐싱 시스템
   - Google Sheets 데이터 메모리 캐시
   - TTL: 1시간
   - 예상 개선: 조회 속도 10배

2. 에러 처리 강화
   - 예외 처리 명시화
   - 로깅 시스템 구축
   - 모니터링 대시보드

3. API 개선
   - 파라미터 영문화
   - CORS 설정
   - 속도 최적화
```

### Phase 3 (중기: 2-3개월)
```
1. 병렬 크롤링
   - asyncio 도입
   - 동시 요청 5개
   - 예상 개선: 속도 3배

2. 데이터베이스
   - SQLite 또는 PostgreSQL
   - 대규모 데이터 처리
   - 쿼리 최적화

3. 자동화 강화
   - GitHub Actions 최적화
   - 배포 자동화
   - 테스트 자동화
```

### Phase 4 (장기: 3-6개월)
```
1. 머신러닝 통합
   - 카테고리 자동 분류
   - 중요도 순위 지정
   - 중복 감지

2. 대시보드 고도화
   - 실시간 업데이트
   - 트렌드 분석
   - 고급 필터링

3. 모니터링 시스템
   - ELK Stack 도입
   - 성능 모니터링
   - 경고 시스템
```

---

## VII. 추가 권장사항

### 즉시 실행 (1주일 내)
1. 미래 날짜 필터링 수정
2. npm 보안 패치
3. 배포 검증

### 단기 실행 (1개월 내)
1. 예외 처리 개선
2. 로깅 시스템 추가
3. GitHub Actions 테스트

### 중기 실행 (3개월 내)
1. 캐싱 시스템
2. 병렬 크롤링
3. API 개선

### 장기 실행 (6개월 내)
1. 데이터베이스 마이그레이션
2. 머신러닝 통합
3. 모니터링 시스템

---

**수정 완료**: 최신 버전 커밋
**검증 날짜**: 2025-11-18
**담당자**: E2E 테스트 시스템
