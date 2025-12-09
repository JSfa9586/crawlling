#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
나라장터 공공데이터 API 크롤러

조달청의 나라장터에서 사전규격 및 입찰공고 정보를 검색하여
회사에서 참여 가능한 공고를 필터링하고 CSV로 저장합니다.

API 사용:
- 사전규격정보서비스: https://www.data.go.kr/data/15129399/openapi.do
- 입찰공고정보서비스: https://www.data.go.kr/data/15129394/openapi.do
"""

import os
import sys
import csv
import json
import logging
import requests
from datetime import datetime, timedelta
from urllib.parse import urlencode, quote_plus
from typing import List, Dict, Optional, Any

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('g2b_crawler_log.txt', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


# ==================== 설정 ====================

# API 키 (환경변수 + 하드코딩)
# 기존 키(환경변수)와 신규 키를 모두 사용
RAW_NEW_KEY = '3aa8be53451db70ab496024bc5e726947aa641a2333bc7a59a420c2b431ff872'
API_KEYS = [
    os.environ.get('G2B_API_KEY'),         # 기존 키 (1순위)
    RAW_NEW_KEY                           # 신규 키 (2순위)
]
# None이나 빈 문자열 제거
API_KEYS = [k for k in API_KEYS if k]

# 검색 키워드 (회사 관련 분야)
SEARCH_KEYWORDS = [
    '영향평가', '환경영향', '해양환경', '환경성검토', '보전방안', 
    '해양이용', '해역이용', '영향조사', '모니터링', '해상풍력'
]

# 예산 범위 (단위: 원)
MIN_BUDGET = 50_000_000      # 5천만원
MAX_BUDGET = 50_000_000_000  # 500억원

# 마감일 필터 (최소 N일 이상 남은 공고만)
MIN_DAYS_UNTIL_DEADLINE = 3

# API 기본 URL
BASE_URLS = {
    'pre_spec': 'http://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService',  # 사전규격
    'bid': 'http://apis.data.go.kr/1230000/ad/BidPublicInfoService'  # 입찰공고
}

# 카테고리 매핑
CATEGORIES = {
    'Servc': '용역',
    'Thng': '물품',
    'Cnstwk': '공사',
    'Frgcpt': '외자'
}

# ==================== API 클라이언트 ====================

class G2BAPIClient:
    """나라장터 API 클라이언트 (다중 키 지원)"""
    
    def __init__(self, api_keys: List[str]):
        self.api_keys = api_keys
        self.current_key_idx = 0
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'G2B-Crawler/1.0'
        })
        logger.info(f"사용 가능한 API 키: {len(self.api_keys)}개")

    def _get_current_key(self) -> str:
        return self.api_keys[self.current_key_idx]

    def _rotate_key(self):
        """다음 API 키로 전환"""
        prev_idx = self.current_key_idx
        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
        logger.warning(f"API 키 전환: {prev_idx} -> {self.current_key_idx}")

    def _make_request(self, base_url: str, endpoint: str, params: Dict) -> Optional[Dict]:
        """API 요청 실행 (Failover 지원)"""
        
        # 최대 재시도 횟수 = 키 개수 (한 바퀴 돌 때까지)
        max_retries = len(self.api_keys)
        
        for attempt in range(max_retries):
            current_key = self._get_current_key()
            
            # 파라미터 복사본 사용 (수정 방지)
            current_params = params.copy()
            current_params['serviceKey'] = current_key
            current_params['type'] = 'json'
            
            url = f"{base_url}/{endpoint}"
            
            try:
                response = self.session.get(url, params=current_params, timeout=30)
                
                # 401(Unauthorized)이나 429(Too Many Requests), 500(Server Error) 등 발생 시 키 교체 시도
                if response.status_code in [401, 403, 429, 500]:
                    logger.warning(f"HTTP {response.status_code} 오류 발생 (키 인덱스: {self.current_key_idx})")
                    if attempt < max_retries - 1:
                        self._rotate_key()
                        continue
                    else:
                        logger.error("모든 API 키 시도 실패")
                        return None

                response.raise_for_status()
                
                # JSON 파싱
                try:
                    data = response.json()
                except json.JSONDecodeError:
                    # 가끔 HTML 에러 페이지가 올 수 있음
                    logger.error("JSON 파싱 실패 (응답이 JSON이 아님)")
                    if attempt < max_retries - 1:
                        self._rotate_key()
                        continue
                    return None

                # 응답 코드 확인
                if 'response' in data:
                    header = data['response'].get('header', {})
                    result_code = header.get('resultCode')
                    
                    # 정상 성공
                    if result_code == '00':
                        return data['response'].get('body', {})
                    
                    # 에러 메시지 확인
                    result_msg = header.get('resultMsg', '')
                    logger.warning(f"API 논리 오류: {result_msg} (코드: {result_code})")
                    
                    # 쿼터 초과(DEADLINE_HAS_EXPIRED 등) 시 키 교체
                    # 정확한 에러 코드를 모를 때는 일반적인 키 관련 에러라고 가정하고 교체 시도
                    if attempt < max_retries - 1:
                        logger.warning("다른 API 키로 재시도합니다.")
                        self._rotate_key()
                        continue
                    
                    return None
                
                return data.get('body', data)

            except requests.exceptions.RequestException as e:
                logger.error(f"요청 중 예외 발생: {e}")
                if attempt < max_retries - 1:
                    self._rotate_key()
                    continue
                return None
                
        return None
    
    # ========== 사전규격 API ==========
    
    def get_pre_specs(self, category: str, start_date: str, end_date: str, 
                      page: int = 1, num_rows: int = 100) -> List[Dict]:
        """사전규격 목록 조회 (전체)"""
        endpoint = f"getPublicPrcureThngInfo{category}"
        
        params = {
            'pageNo': str(page),
            'numOfRows': str(num_rows),
            'inqryDiv': '1',
            'inqryBgnDt': start_date,
            'inqryEndDt': end_date
        }
        
        return self._parse_items(self._make_request(BASE_URLS['pre_spec'], endpoint, params))
    
    def search_pre_specs_by_keyword(self, category: str, keyword: str, start_date: str, end_date: str,
                                     max_pages: int = 10) -> List[Dict]:
        """사전규격 키워드 검색 (PPSSrch) - 페이지네이션 포함"""
        endpoint = f"getPublicPrcureThngInfo{category}PPSSrch"
        all_items = []
        
        for page in range(1, max_pages + 1):
            params = {
                'pageNo': str(page),
                'numOfRows': '100',
                'inqryDiv': '1',
                'inqryBgnDt': start_date,
                'inqryEndDt': end_date,
                'prdctClsfcNoNm': keyword  # 품명(사업명) 검색
            }
            
            result = self._make_request(BASE_URLS['pre_spec'], endpoint, params)
            items = self._parse_items(result)
            
            if not items:
                break
                
            all_items.extend(items)
            
            # 총 건수 확인하여 더 조회할 필요 없으면 중단
            total_count = result.get('totalCount', 0) if result else 0
            if len(all_items) >= total_count:
                break
        
        return all_items
    
    # ========== 입찰공고 API ==========
    
    def get_bid_announcements(self, category: str, start_date: str, end_date: str,
                               page: int = 1, num_rows: int = 100) -> List[Dict]:
        """입찰공고 목록 조회 (전체)"""
        endpoint = f"getBidPblancListInfo{category}"
        
        params = {
            'pageNo': str(page),
            'numOfRows': str(num_rows),
            'inqryDiv': '1',
            'inqryBgnDt': start_date,
            'inqryEndDt': end_date
        }
        
        return self._parse_items(self._make_request(BASE_URLS['bid'], endpoint, params))
    
    def search_bids_by_keyword(self, category: str, keyword: str, start_date: str, end_date: str,
                                max_pages: int = 10) -> List[Dict]:
        """입찰공고 키워드 검색 (PPSSrch) - 페이지네이션 포함"""
        endpoint = f"getBidPblancListInfo{category}PPSSrch"
        all_items = []
        
        for page in range(1, max_pages + 1):
            params = {
                'pageNo': str(page),
                'numOfRows': '100',
                'inqryDiv': '1',
                'inqryBgnDt': start_date,
                'inqryEndDt': end_date,
                'bidNtceNm': keyword  # 공고명 검색
            }
            
            result = self._make_request(BASE_URLS['bid'], endpoint, params)
            items = self._parse_items(result)
            
            if not items:
                break
                
            all_items.extend(items)
            
            # 총 건수 확인하여 더 조회할 필요 없으면 중단
            total_count = result.get('totalCount', 0) if result else 0
            if len(all_items) >= total_count:
                break
        
        return all_items
    
    def _parse_items(self, result: Optional[Dict]) -> List[Dict]:
        """API 응답에서 items 파싱"""
        if not result or 'items' not in result:
            return []
        
        items = result['items']
        if isinstance(items, list):
            return items
        elif isinstance(items, dict):
            if 'item' in items:
                item_list = items['item']
                return item_list if isinstance(item_list, list) else [item_list]
            else:
                return [items]
        return []


# ==================== 필터링 ====================

def matches_keywords(text: str, keywords: List[str]) -> bool:
    """텍스트가 키워드 중 하나라도 포함하는지 확인 (공백 무시)"""
    if not text:
        return False
    
    # 공백 제거 및 소문자 변환
    text_normalized = text.replace(' ', '').lower()
    
    for keyword in keywords:
        key_norm = keyword.replace(' ', '').lower()
        if key_norm in text_normalized:
            return True
            
    return False


def is_within_budget(amount_str: str) -> bool:
    """금액이 예산 범위 내인지 확인"""
    if not amount_str:
        return True  # 금액 정보 없으면 일단 포함
    try:
        amount = float(str(amount_str).replace(',', ''))
        return MIN_BUDGET <= amount <= MAX_BUDGET
    except (ValueError, TypeError):
        return True


def has_enough_time(deadline_str: str) -> bool:
    """마감일까지 충분한 시간이 있는지 확인"""
    if not deadline_str:
        return True  # 마감일 정보 없으면 일단 포함
    try:
        # 다양한 날짜 형식 파싱 시도
        for fmt in ['%Y%m%d%H%M', '%Y-%m-%d %H:%M', '%Y-%m-%d', '%Y%m%d']:
            try:
                deadline = datetime.strptime(deadline_str[:len(fmt.replace('%', ''))], fmt)
                days_left = (deadline - datetime.now()).days
                return days_left >= MIN_DAYS_UNTIL_DEADLINE
            except ValueError:
                continue
        return True
    except Exception:
        return True


def filter_items(items: List[Dict], keywords: List[str], is_bid: bool = False) -> List[Dict]:
    """아이템 목록 필터링
    
    Args:
        items: 원본 아이템 목록
        keywords: 검색 키워드 목록
        is_bid: True면 입찰공고, False면 사전규격
    
    Returns:
        필터링된 아이템 목록
    """
    filtered = []
    
    for item in items:
        # 제목/품명으로 키워드 매칭
        title = item.get('bidNtceNm') or item.get('prdctClsfcNoNm') or item.get('bfSpecRgstNo', '')
        
        if not matches_keywords(title, keywords):
            continue
        
        # 예산 확인
        amount = item.get('asignBdgtAmt') or item.get('presmptPrce') or ''
        if not is_within_budget(amount):
            continue
        
        # 입찰공고인 경우 마감일 확인
        if is_bid:
            deadline = item.get('bidClseDt') or item.get('opengDt') or ''
            if not has_enough_time(deadline):
                continue
        
        filtered.append(item)
    
    return filtered


# ==================== 데이터 정규화 ====================

def normalize_pre_spec(item: Dict, category: str) -> Dict:
    """사전규격 데이터 정규화"""
    return {
        '구분': '사전규격',
        '카테고리': CATEGORIES.get(category, category),
        '등록번호': item.get('bfSpecRgstNo', ''),
        '공고명': item.get('prdctClsfcNoNm', '') or item.get('bidNtceNm', ''),
        '발주기관': item.get('rlDminsttNm', '') or item.get('dminsttNm', ''),
        '수요기관': item.get('pchrgDminsttNm', ''),
        '배정예산': item.get('asignBdgtAmt', ''),
        '등록일': item.get('rgstDt', ''),
        '규격공개종료일': item.get('opninRgstClseDt', ''),
        '상태': '신규',
        '링크': f"https://www.g2b.go.kr:8101/ep/preparation/prestd/preStdDtl.do?preStdRegNo={item.get('bfSpecRgstNo', '')}"
    }


def normalize_bid(item: Dict, category: str) -> Dict:
    """입찰공고 데이터 정규화"""
    bid_no = item.get('bidNtceNo', '')
    bid_seq = item.get('bidNtceOrd', '00')
    
    return {
        '구분': '입찰공고',
        '카테고리': CATEGORIES.get(category, category),
        '공고번호': bid_no,
        '공고차수': bid_seq,
        '공고명': item.get('bidNtceNm', ''),
        '발주기관': item.get('ntceInsttNm', '') or item.get('dminsttNm', ''),
        '수요기관': item.get('dminsttNm', ''),
        '추정가격': item.get('presmptPrce', ''),
        '기초금액': item.get('bssamt', ''),
        '입찰방식': item.get('bidMethdNm', ''),
        '공고일': item.get('bidNtceDt', ''),
        '입찰마감': item.get('bidClseDt', ''),
        '개찰일': item.get('opengDt', ''),
        '상태': '신규',
        '링크': f"http://www.g2b.go.kr:8081/ep/invitation/publish/bidInfoDtl.do?bidno={bid_no}&bidseq={bid_seq}&releaseYn=Y&taskClCd=1"
    }


# ==================== 메인 실행 ====================

def crawl_g2b(days_back: int = 1, output_dir: str = '.') -> Dict[str, List[Dict]]:
    """나라장터 공고 크롤링 실행 (키워드별 검색)
    
    Args:
        days_back: 며칠 전까지 검색할지
        output_dir: 출력 디렉토리
    
    Returns:
        {'pre_specs': [...], 'bids': [...]}
    """
    if not API_KEYS:
        logger.error("API 키가 설정되지 않았습니다. G2B_API_KEY 환경변수를 설정하거나 코드를 확인하세요.")
        return {'pre_specs': [], 'bids': []}
    
    client = G2BAPIClient(API_KEYS)
    
    # 날짜 범위 계산
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    start_str = start_date.strftime('%Y%m%d') + '0000'
    end_str = end_date.strftime('%Y%m%d') + '2359'
    
    logger.info(f"검색 기간: {start_date.strftime('%Y-%m-%d')} ~ {end_date.strftime('%Y-%m-%d')}")
    
    # 중복 제거를 위한 딕셔너리
    pre_spec_dict = {}  # key: 등록번호
    bid_dict = {}  # key: 공고번호
    
    cat_code = 'Servc'  # 용역만 검색
    
    # ==========================================
    # 1. 사전규격 수집 (전체 - 페이지네이션)
    # ==========================================
    logger.info("[사전규격] 전체 수집 시작...")
    page = 1
    while True:
        try:
            items = client.get_pre_specs(cat_code, start_str, end_str, page=page, num_rows=100)
            if not items:
                break
            
            new_count = 0
            for item in items:
                reg_no = item.get('bfSpecRgstNo', '')
                if reg_no and reg_no not in pre_spec_dict:
                    pre_spec_dict[reg_no] = normalize_pre_spec(item, cat_code)
                    new_count += 1
            
            logger.info(f"  - {page}페이지: {len(items)}건 조회, {new_count}건 신규 (누적: {len(pre_spec_dict)}건)")
            
            # 다음 페이지
            page += 1
            
            # 안전장치: 너무 많은 페이지 방지 (일일 수집이므로 100페이지=10000건 정도면 충분할 듯)
            if page > 200: 
                logger.warning("페이지 제한 도달 (200페이지)")
                break
                
        except Exception as e:
            logger.error(f"사전규격 {page}페이지 수집 중 오류: {e}")
            break

    # ==========================================
    # 2. 입찰공고 수집 (전체 - 페이지네이션)
    # ==========================================
    logger.info("[입찰공고] 전체 수집 시작...")
    page = 1
    while True:
        try:
            items = client.get_bid_announcements(cat_code, start_str, end_str, page=page, num_rows=100)
            if not items:
                break
            
            new_count = 0
            for item in items:
                bid_no = item.get('bidNtceNo', '')
                if bid_no and bid_no not in bid_dict:
                    bid_dict[bid_no] = normalize_bid(item, cat_code)
                    new_count += 1
            
            logger.info(f"  - {page}페이지: {len(items)}건 조회, {new_count}건 신규 (누적: {len(bid_dict)}건)")
            
            page += 1
            if page > 200:
                logger.warning("페이지 제한 도달 (200페이지)")
                break
                
        except Exception as e:
            logger.error(f"입찰공고 {page}페이지 수집 중 오류: {e}")
            break
    
    # 딕셔너리에서 리스트로 변환
    all_pre_specs = list(pre_spec_dict.values())
    all_bids = list(bid_dict.values())
    
    logger.info(f"[결과] 사전규격: {len(all_pre_specs)}건, 입찰공고: {len(all_bids)}건")
    
    # 결과 저장
    today_str = datetime.now().strftime('%Y%m%d')
    
    # 사전규격 CSV 저장
    if all_pre_specs:
        pre_spec_file = os.path.join(output_dir, f'g2b_pre_specs_{today_str}.csv')
        save_to_csv(all_pre_specs, pre_spec_file)
        logger.info(f"사전규격 저장: {pre_spec_file} ({len(all_pre_specs)}건)")
    
    # 입찰공고 CSV 저장
    if all_bids:
        bid_file = os.path.join(output_dir, f'g2b_bids_{today_str}.csv')
        save_to_csv(all_bids, bid_file)
        logger.info(f"입찰공고 저장: {bid_file} ({len(all_bids)}건)")
    
    # 통합 파일도 저장
    combined = all_pre_specs + all_bids
    if combined:
        combined_file = os.path.join(output_dir, f'g2b_combined_{today_str}.csv')
        save_to_csv(combined, combined_file)
        logger.info(f"통합 파일 저장: {combined_file} ({len(combined)}건)")
    
    return {
        'pre_specs': all_pre_specs,
        'bids': all_bids
    }


def save_to_csv(data: List[Dict], filepath: str):
    """데이터를 CSV 파일로 저장 (고정된 헤더 순서)"""
    if not data:
        return
    
    # 데이터 타입에 따른 고정된 필드 순서
    PRE_SPEC_FIELDS = ['구분', '카테고리', '등록번호', '공고명', '발주기관', '수요기관', 
                       '배정예산', '등록일', '규격공개종료일', '상태', '링크']
    BID_FIELDS = ['구분', '카테고리', '공고번호', '공고차수', '공고명', '발주기관', '수요기관',
                  '추정가격', '기초금액', '입찰방식', '공고일', '입찰마감', '개찰일', '상태', '링크']
    
    # 첫 번째 항목으로 데이터 타입 확인
    first_item = data[0]
    if first_item.get('구분') == '사전규격':
        fieldnames = PRE_SPEC_FIELDS
    elif first_item.get('구분') == '입찰공고':
        fieldnames = BID_FIELDS
    else:
        # 통합 파일의 경우 모든 필드 포함
        fieldnames = PRE_SPEC_FIELDS.copy()
        for f in BID_FIELDS:
            if f not in fieldnames:
                fieldnames.append(f)
    
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(data)



import argparse

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='G2B Crawler')
    parser.add_argument('--days', type=int, default=1, help='Number of days to look back')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info(f"나라장터 공고 크롤러 시작 (기간: {args.days}일)")
    logger.info("=" * 60)
    
    try:
        result = crawl_g2b(days_back=args.days)
        
        logger.info("=" * 60)
        logger.info("크롤링 완료")
        logger.info(f"  - 사전규격: {len(result['pre_specs'])}건")
        logger.info(f"  - 입찰공고: {len(result['bids'])}건")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"크롤링 실패: {e}")
        raise

if __name__ == '__main__':
    main()
