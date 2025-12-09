"""
G2B 용역 계약 데이터 수집 스크립트 (개선 버전)
- 모든 API 필드 수집
- 2005~2025년 역순 수집 모드
"""

import requests
import urllib.parse
import psycopg2
from datetime import datetime, timedelta
import time
import re
import json
import os

# 진행률 저장 파일
PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "collection_progress.json")

# PostgreSQL 연결 정보
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

# G2B API 키
API_KEY = "43dd4dea66b7f6b7585b3ad8c7a8d1c1bf29e2a2e1e991984e508e677eec6561"

# API URL
API_URL = "https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"


def load_progress():
    """진행률 로드"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"year": None, "page": 0, "status": "ready"}


def save_progress(year, page, status="running", date=None):
    """진행률 저장"""
    progress = {
        "year": year,
        "page": page,
        "date": date,
        "status": status,
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)
    return progress


def get_db_connection():
    """PostgreSQL 연결"""
    return psycopg2.connect(**DB_CONFIG)


def parse_corp_list(corp_list_raw):
    """
    공동사 목록 파싱 (개선)
    형식: [1^도급업체^공동^주식회사 피켐코리아^최성민^대한민국^48.79^1234567890],
    """
    if not corp_list_raw:
        return []
    
    partners = []
    pattern = r'\[([^\]]+)\]'
    matches = re.findall(pattern, corp_list_raw)
    
    for match in matches:
        parts = match.split('^')
        if len(parts) >= 4:
            try:
                partner = {
                    'order': int(parts[0]) if parts[0].isdigit() else 0,
                    'type': parts[1] if len(parts) > 1 else '',
                    'joint_type': parts[2] if len(parts) > 2 else '',
                    'name': parts[3] if len(parts) > 3 else '',
                    'ceo': parts[4] if len(parts) > 4 else '',
                    'nationality': parts[5] if len(parts) > 5 else '',
                    'share_ratio': float(parts[6]) if len(parts) > 6 and parts[6] and parts[6].replace('.','').isdigit() else 0.0,
                    'bizno': parts[7] if len(parts) > 7 else ''
                }
                partners.append(partner)
            except (ValueError, IndexError) as e:
                print(f"파싱 오류: {e}, 데이터: {parts[:4]}")
    
    return partners


def parse_date(date_str):
    """날짜 문자열 파싱"""
    if not date_str:
        return None
    try:
        # 형식: 2024-11-25 또는 20241125 또는 2024-11-25 10:30:00
        date_str = date_str.strip()
        if '-' in date_str:
            return datetime.strptime(date_str.split()[0], '%Y-%m-%d').date()
        elif len(date_str) >= 8:
            return datetime.strptime(date_str[:8], '%Y%m%d').date()
    except:
        pass
    return None


def parse_datetime(dt_str):
    """날짜시간 문자열 파싱"""
    if not dt_str:
        return None
    try:
        dt_str = dt_str.strip()
        if len(dt_str) >= 14:
            return datetime.strptime(dt_str[:14], '%Y%m%d%H%M%S')
        elif len(dt_str) >= 8:
            return datetime.strptime(dt_str[:8], '%Y%m%d')
    except:
        pass
    return None


def parse_rate(rate_str):
    """비율 파싱"""
    if not rate_str:
        return None
    try:
        return float(rate_str.replace('%', '').strip())
    except:
        return None


class QuotaExceededError(Exception):
    pass


def fetch_contracts(start_date, end_date, page=1, num_rows=100):
    """G2B API에서 계약 데이터 조회"""
    params = {
        'numOfRows': str(num_rows),
        'pageNo': str(page),
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': start_date.strftime('%Y%m%d') + '0000',
        'inqryEndDt': end_date.strftime('%Y%m%d') + '2359',
        'bsnsDivCd': '5'  # 용역만
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{API_URL}?{qp}&serviceKey={API_KEY}"
    
    try:
        response = requests.get(full_url, timeout=30)
        
        if response.status_code == 429:
            raise QuotaExceededError("API Quota Exceeded (429)")

        if response.status_code == 200:
            data = response.json()
            
            if 'nkoneps.com.response.ResponseError' in data:
                error = data['nkoneps.com.response.ResponseError']['header']
                print(f"API 에러: {error['resultCode']} - {error['resultMsg']}")
                return None, 0
            
            body = data.get('response', {}).get('body', {})
            total_count = int(body.get('totalCount', 0))
            
            items = body.get('items', {})
            if isinstance(items, list):
                item_list = items
            elif items and items.get('item'):
                item_list = items['item'] if isinstance(items['item'], list) else [items['item']]
            else:
                item_list = []
            
            return item_list, total_count
        else:
            print(f"HTTP 에러: {response.status_code}")
            return None, 0
    except QuotaExceededError:
        raise
    except Exception as e:
        print(f"요청 예외: {e}")
        return None, 0


def save_contracts(conn, contracts):
    """계약 데이터를 PostgreSQL에 저장 (모든 필드)"""
    cursor = conn.cursor()
    
    saved_count = 0
    for item in contracts:
        contract_no = item.get('untyCntrctNo')
        if not contract_no:
            continue
        
        # 날짜 파싱
        contract_date = parse_date(item.get('cntrctCnclsDate') or item.get('cntrctDate'))
        start_date = parse_date(item.get('wbgnDate'))
        current_complete_date = parse_date(item.get('thtmScmpltDate'))
        total_complete_date = parse_date(item.get('ttalScmpltDate'))
        api_rgst_dt = parse_datetime(item.get('rgstDt'))
        api_chg_dt = parse_datetime(item.get('chgDt'))
        
        # 비율 파싱
        guarantee_rate = parse_rate(item.get('grntymnyRate'))
        delay_penalty_rate = parse_rate(item.get('dfrcmpnstRt'))
        
        try:
            cursor.execute("""
                INSERT INTO contracts (
                    contract_no, contract_name, product_name,
                    contract_amount, total_contract_amount, contract_date,
                    contract_period, order_org_code, order_org_name,
                    demand_org_code, demand_org_name, contractor_name,
                    detail_url, corp_list_raw, base_law_name, request_no,
                    notice_no, fixed_contract_no, contract_ref_no,
                    business_div_name, joint_contract_yn, long_term_div_name,
                    guarantee_rate, delay_penalty_rate, pay_div_name,
                    creditor_name, start_date, current_complete_date,
                    total_complete_date, org_jurisdiction, org_dept_name,
                    org_officer_name, org_officer_tel, org_officer_fax,
                    contract_info_url, base_details, contract_method_name,
                    demand_org_list, classification_no, classification_name,
                    large_class_name, mid_class_name, info_biz_yn,
                    api_rgst_dt, api_chg_dt
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
                ON CONFLICT (contract_no) DO UPDATE SET
                    contract_name = EXCLUDED.contract_name,
                    contract_amount = EXCLUDED.contract_amount,
                    notice_no = EXCLUDED.notice_no,
                    fixed_contract_no = EXCLUDED.fixed_contract_no,
                    contract_ref_no = EXCLUDED.contract_ref_no,
                    business_div_name = EXCLUDED.business_div_name,
                    joint_contract_yn = EXCLUDED.joint_contract_yn,
                    long_term_div_name = EXCLUDED.long_term_div_name,
                    guarantee_rate = EXCLUDED.guarantee_rate,
                    delay_penalty_rate = EXCLUDED.delay_penalty_rate,
                    pay_div_name = EXCLUDED.pay_div_name,
                    creditor_name = EXCLUDED.creditor_name,
                    start_date = EXCLUDED.start_date,
                    current_complete_date = EXCLUDED.current_complete_date,
                    total_complete_date = EXCLUDED.total_complete_date,
                    org_jurisdiction = EXCLUDED.org_jurisdiction,
                    org_dept_name = EXCLUDED.org_dept_name,
                    org_officer_name = EXCLUDED.org_officer_name,
                    org_officer_tel = EXCLUDED.org_officer_tel,
                    org_officer_fax = EXCLUDED.org_officer_fax,
                    contract_info_url = EXCLUDED.contract_info_url,
                    base_details = EXCLUDED.base_details,
                    contract_method_name = EXCLUDED.contract_method_name,
                    demand_org_list = EXCLUDED.demand_org_list,
                    classification_no = EXCLUDED.classification_no,
                    classification_name = EXCLUDED.classification_name,
                    large_class_name = EXCLUDED.large_class_name,
                    mid_class_name = EXCLUDED.mid_class_name,
                    info_biz_yn = EXCLUDED.info_biz_yn,
                    api_rgst_dt = EXCLUDED.api_rgst_dt,
                    api_chg_dt = EXCLUDED.api_chg_dt,
                    updated_at = NOW()
            """, (
                contract_no,
                item.get('cntrctNm', ''),
                item.get('prdctNm', ''),
                int(item.get('thtmCntrctAmt', 0) or 0),
                int(item.get('totCntrctAmt', 0) or 0),
                contract_date,
                item.get('cntrctPrd', ''),
                item.get('cntrctInsttCd', ''),
                item.get('cntrctInsttNm', ''),
                item.get('dmndInsttCd', ''),
                item.get('dmndInsttNm', ''),
                '',  # 대표업체는 corpList에서 파싱
                item.get('cntrctDtlInfoUrl', ''),
                item.get('corpList', ''),
                item.get('baseLawNm', ''),
                item.get('reqNo', ''),
                # 새로 추가된 필드들
                item.get('ntceNo', ''),
                item.get('dcsnCntrctNo', ''),
                item.get('cntrctRefNo', ''),
                item.get('bsnsDivNm', ''),
                item.get('cmmnCntrctYn', ''),
                item.get('lngtrmCtnuDivNm', ''),
                guarantee_rate,
                delay_penalty_rate,
                item.get('payDivNm', ''),
                item.get('crdtrNm', ''),
                start_date,
                current_complete_date,
                total_complete_date,
                item.get('cntrctInsttJrsdctnDivNm', ''),
                item.get('cntrctInsttChrgDeptNm', ''),
                item.get('cntrctInsttOfclNm', ''),
                item.get('cntrctInsttOfclTelNo', ''),
                item.get('cntrctInsttOfclFaxNo', ''),
                item.get('cntrctInfoUrl', ''),
                item.get('baseDtls', ''),
                item.get('cntrctCnclsMthdNm', ''),
                item.get('dminsttList', ''),
                item.get('pubPrcrmntClsfcNo', ''),
                item.get('pubPrcrmntClsfcNm', ''),
                item.get('pubPrcrmntLrgClsfcNm', ''),
                item.get('pubPrcrmntMidClsfcNm', ''),
                item.get('infoBizYn', ''),
                api_rgst_dt,
                api_chg_dt
            ))
            
            # 공동수급체 정보 저장
            corp_list_raw = item.get('corpList', '')
            if corp_list_raw:
                partners = parse_corp_list(corp_list_raw)
                
                cursor.execute("DELETE FROM contract_partners WHERE contract_no = %s", (contract_no,))
                
                for partner in partners:
                    cursor.execute("""
                        INSERT INTO contract_partners (
                            contract_no, partner_order, partner_type, joint_type,
                            partner_name, ceo_name, nationality, share_ratio, bizno
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        contract_no,
                        partner['order'],
                        partner['type'],
                        partner['joint_type'],
                        partner['name'],
                        partner['ceo'],
                        partner['nationality'],
                        partner['share_ratio'],
                        partner['bizno']
                    ))
                
                # 대표업체명 업데이트
                main_partner = next((p for p in partners if '주계약' in p['type']), partners[0] if partners else None)
                if main_partner:
                    cursor.execute("""
                        UPDATE contracts SET contractor_name = %s WHERE contract_no = %s
                    """, (main_partner['name'], contract_no))
            
            saved_count += 1
            
        except Exception as e:
            print(f"저장 오류 (계약번호: {contract_no}): {e}")
            conn.rollback()  # 트랜잭션 롤백하여 다음 저장 가능하게
            continue
    
    conn.commit()
    return saved_count


def collect_contracts(start_date, end_date, year=None, start_page=1):
    """지정 기간의 계약 데이터 수집 (start_page부터 시작)"""
    print(f"=== G2B 용역 계약 데이터 수집 ===")
    print(f"기간: {start_date.strftime('%Y-%m-%d')} ~ {end_date.strftime('%Y-%m-%d')}")
    if start_page > 1:
        print(f"시작 페이지: {start_page}")
    print()
    
    conn = get_db_connection()
    
    try:
        items, total_count = fetch_contracts(start_date, end_date, page=1, num_rows=100)
        
        if items is None:
            print("데이터 조회 실패")
            return
        
        print(f"총 {total_count:,}건의 용역 계약 발견")
        
        total_pages = (total_count + 99) // 100
        print(f"총 {total_pages} 페이지 수집 예정")
        print()
        
        # 첫 페이지는 start_page가 1일 때만 저장
        if start_page == 1:
            saved = save_contracts(conn, items)
            print(f"페이지 1/{total_pages}: {saved}건 저장")
            save_progress(year, 1)
        
        for page in range(max(2, start_page), total_pages + 1):
            time.sleep(0.5)
            
            items, _ = fetch_contracts(start_date, end_date, page=page, num_rows=100)
            if items:
                saved = save_contracts(conn, items)
                print(f"페이지 {page}/{total_pages}: {saved}건 저장")
                
                # 10페이지마다 진행률 저장
                if page % 10 == 0:
                    save_progress(year, page)
                    print(f"--- {page}/{total_pages} 완료 ({page*100:,}/{total_count:,}건) ---")
            else:
                print(f"페이지 {page} 실패, 건너뜀")
        
        # 완료 시 진행률 업데이트
        save_progress(year, total_pages, status="completed")
        
        print()
        print("=== 수집 완료 ===")
        
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM contracts")
        total_contracts = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM contract_partners")
        total_partners = cursor.fetchone()[0]
        
        print(f"DB 총 계약 수: {total_contracts:,}건")
        print(f"DB 총 공동수급체 수: {total_partners:,}건")
        
    finally:
        conn.close()


def collect_reverse_by_year(start_year=2005, end_year=2025, resume=True):
    """역순으로 연도별 수집 (최신 -> 과거)"""
    print(f"=== 역순 수집 시작: {end_year}년 -> {start_year}년 ===")
    print()
    
    # 진행률 로드하여 재시작 지점 확인
    start_page = 1
    resume_year = None
    
    if resume:
        progress = load_progress()
        if progress.get("status") == "running" and progress.get("year"):
            resume_year = progress["year"]
            start_page = progress.get("page", 0) + 1
            print(f">>> 이전 진행 발견: {resume_year}년 {start_page}페이지부터 재시작 <<<")
            print()
    
    for year in range(end_year, start_year - 1, -1):
        # 재시작 지점 전 연도는 건너뜀
        if resume_year and year > resume_year:
            print(f"{year}년 - 이미 완료됨, 건너뜀")
            continue
        
        print(f"\n{'='*50}")
        print(f"=== {year}년 수집 시작 ===")
        print(f"{'='*50}")
        
        # 해당 연도의 시작~종료일
        if year == end_year:
            # 현재 연도는 오늘까지
            end_date = datetime.now()
        else:
            end_date = datetime(year, 12, 31)
        
        start_date_dt = datetime(year, 1, 1)
        
        # 재시작 연도인 경우 해당 페이지부터 시작
        page_to_start = start_page if (resume_year and year == resume_year) else 1
        
        try:
            collect_contracts(start_date_dt, end_date, year=year, start_page=page_to_start)
            start_page = 1  # 다음 연도는 1페이지부터
            resume_year = None  # 재시작 완료
        except QuotaExceededError:
            print(f"\n!!! API 할당량 초과 - {year}년에서 중단됨 !!!")
            print(f"다음 실행 시 자동으로 이어서 수집됩니다.")
            break
        except Exception as e:
            print(f"오류 발생: {e}")
            continue
        
        # 연도 간 휴식
        print(f"{year}년 완료. 5초 대기...")
        time.sleep(5)
    
    # 전체 완료 시
    save_progress(None, 0, status="all_completed")
    print("\n=== 전체 수집 완료 ===")


def collect_reverse_by_day(start_date_str="2005-01-01", end_date_str=None, resume=True):
    """역순으로 일별 수집 (최신 -> 과거)"""
    
    # 종료일 설정 (기본: 오늘)
    if end_date_str:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    else:
        end_date = datetime.now()
    
    # 시작일 설정
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    
    print(f"=== 일별 역순 수집 시작 ===")
    print(f"기간: {end_date.strftime('%Y-%m-%d')} -> {start_date.strftime('%Y-%m-%d')}")
    print()
    
    # 진행률 로드하여 재시작 지점 확인
    resume_date = None
    if resume:
        progress = load_progress()
        if progress.get("status") == "running" and progress.get("date"):
            resume_date = datetime.strptime(progress["date"], "%Y-%m-%d")
            print(f">>> 이전 진행 발견: {resume_date.strftime('%Y-%m-%d')}부터 재시작 <<<")
            print()
    
    conn = get_db_connection()
    
    try:
        current_date = end_date
        total_saved = 0
        days_completed = 0
        
        while current_date >= start_date:
            date_str = current_date.strftime("%Y-%m-%d")
            
            # 재시작 지점 전 날짜는 건너뜀
            if resume_date and current_date > resume_date:
                current_date -= timedelta(days=1)
                continue
            
            print(f"\n--- {date_str} 수집 중 ---")
            
            # 해당 날짜의 데이터 수집
            day_start = datetime(current_date.year, current_date.month, current_date.day, 0, 0)
            day_end = datetime(current_date.year, current_date.month, current_date.day, 23, 59)
            
            try:
                items, total_count = fetch_contracts(day_start, day_end, page=1, num_rows=100)
                
                if items is None:
                    print(f"  {date_str} 조회 실패, 건너뜀")
                    current_date -= timedelta(days=1)
                    continue
                
                if total_count == 0:
                    print(f"  {date_str}: 계약 없음")
                    save_progress(None, 0, status="running", date=date_str)
                    current_date -= timedelta(days=1)
                    continue
                
                total_pages = (total_count + 99) // 100
                day_saved = save_contracts(conn, items)
                
                # 여러 페이지인 경우 추가 수집
                for page in range(2, total_pages + 1):
                    time.sleep(0.3)
                    items, _ = fetch_contracts(day_start, day_end, page=page, num_rows=100)
                    if items:
                        day_saved += save_contracts(conn, items)
                
                total_saved += day_saved
                days_completed += 1
                
                print(f"  {date_str}: {day_saved}건 저장 (누적: {total_saved:,}건)")
                
                # 진행률 저장 (날짜 기반)
                save_progress(None, 0, status="running", date=date_str)
                
            except QuotaExceededError:
                print(f"\n!!! API 할당량 초과 - {date_str}에서 중단 !!!")
                print(f"다음 실행 시 자동으로 이어서 수집됩니다.")
                return
            except Exception as e:
                print(f"  {date_str} 오류: {e}")
            
            current_date -= timedelta(days=1)
            time.sleep(0.5)  # 날짜 간 휴식
        
        # 전체 완료
        save_progress(None, 0, status="all_completed")
        print(f"\n=== 전체 수집 완료 ===")
        print(f"총 {days_completed}일, {total_saved:,}건 저장")
        
    finally:
        conn.close()


def collect_daily():
    """일일 신규 계약 수집"""
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    collect_contracts(yesterday, today)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'daily':
            collect_daily()
        elif sys.argv[1] == 'reverse':
            # 역순 수집: python collect_contracts_v2.py reverse [시작연도] [종료연도]
            start_year = int(sys.argv[2]) if len(sys.argv) > 2 else 2005
            end_year = int(sys.argv[3]) if len(sys.argv) > 3 else 2025
            collect_reverse_by_year(start_year, end_year)
        elif sys.argv[1] == 'range':
            if len(sys.argv) >= 4:
                start_str = sys.argv[2]
                end_str = sys.argv[3]
                start_date = datetime.strptime(start_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_str, '%Y-%m-%d')
                collect_contracts(start_date, end_date)
            else:
                print("사용법: python collect_contracts.py range YYYY-MM-DD YYYY-MM-DD")
        elif sys.argv[1] == 'daily-reverse':
            # 일별 역순 수집: python collect_contracts.py daily-reverse [시작일] [종료일]
            start_date_str = sys.argv[2] if len(sys.argv) > 2 else "2005-01-01"
            end_date_str = sys.argv[3] if len(sys.argv) > 3 else None
            collect_reverse_by_day(start_date_str, end_date_str)
        else:
            print("사용법:")
            print("  python collect_contracts.py daily            # 일일 수집")
            print("  python collect_contracts.py reverse          # 연도별 역순 수집")
            print("  python collect_contracts.py daily-reverse    # 일별 역순 수집 (권장)")
            print("  python collect_contracts.py daily-reverse 2010-01-01")
            print("  python collect_contracts.py range 2024-01-01 2024-12-31")
    else:
        # 기본: 최근 7일 수집
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        collect_contracts(start_date, end_date)
