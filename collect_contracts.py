"""
G2B 용역 계약 데이터 수집 스크립트
PostgreSQL에 계약 정보 저장
"""

import requests
import urllib.parse
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timedelta
import time
import re

# PostgreSQL 연결 정보
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'  # 사용자가 설정한 비밀번호로 변경
}

# G2B API 키
API_KEY = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="

# API URL
API_URL = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"


def get_db_connection():
    """PostgreSQL 연결"""
    return psycopg2.connect(**DB_CONFIG)


def parse_corp_list(corp_list_raw):
    """
    공동사 목록 파싱
    형식: [1^도급업체^공동^주식회사 피켐코리아^최성민^대한민국^48.79^...],
          [2^주계약업체^공동^주식회사 오에이티씨^방상구^대한민국^51.21^...]
    """
    if not corp_list_raw:
        return []
    
    partners = []
    # [...]로 분리
    pattern = r'\[([^\]]+)\]'
    matches = re.findall(pattern, corp_list_raw)
    
    for match in matches:
        parts = match.split('^')
        if len(parts) >= 7:
            try:
                partner = {
                    'order': int(parts[0]) if parts[0].isdigit() else 0,
                    'type': parts[1] if len(parts) > 1 else '',
                    'joint_type': parts[2] if len(parts) > 2 else '',
                    'name': parts[3] if len(parts) > 3 else '',
                    'ceo': parts[4] if len(parts) > 4 else '',
                    'nationality': parts[5] if len(parts) > 5 else '',
                    'share_ratio': float(parts[6]) if len(parts) > 6 and parts[6] else 0.0
                }
                partners.append(partner)
            except (ValueError, IndexError) as e:
                print(f"파싱 오류: {e}, 데이터: {parts}")
    
    return partners


def fetch_contracts(start_date, end_date, page=1, num_rows=100):
    """G2B API에서 계약 데이터 조회"""
    params = {
        'numOfRows': str(num_rows),
        'pageNo': str(page),
        'type': 'json',
        'inqryDiv': '1',  # 날짜 기반
        'inqryBgnDt': start_date.strftime('%Y%m%d') + '0000',
        'inqryEndDt': end_date.strftime('%Y%m%d') + '2359',
        'bsnsDivCd': '5'  # 용역만
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{API_URL}?{qp}&serviceKey={urllib.parse.quote(API_KEY)}"
    
    try:
        response = requests.get(full_url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            
            # 에러 체크
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
    except Exception as e:
        print(f"요청 예외: {e}")
        return None, 0


def save_contracts(conn, contracts):
    """계약 데이터를 PostgreSQL에 저장"""
    cursor = conn.cursor()
    
    saved_count = 0
    for item in contracts:
        contract_no = item.get('untyCntrctNo')
        if not contract_no:
            continue
        
        # 계약 날짜 파싱
        date_str = item.get('cntrctCnclsDate') or item.get('cntrctDate')
        contract_date = None
        if date_str:
            try:
                # 형식: 2024-11-25 또는 20241125
                if '-' in date_str:
                    contract_date = datetime.strptime(date_str.split()[0], '%Y-%m-%d').date()
                else:
                    contract_date = datetime.strptime(date_str[:8], '%Y%m%d').date()
            except:
                pass
        
        # 메인 계약 데이터
        try:
            cursor.execute("""
                INSERT INTO contracts (
                    contract_no, contract_name, product_name,
                    contract_amount, total_contract_amount, contract_date,
                    contract_period, order_org_code, order_org_name,
                    demand_org_code, demand_org_name, contractor_name,
                    detail_url, corp_list_raw, base_law_name, request_no
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (contract_no) DO UPDATE SET
                    contract_name = EXCLUDED.contract_name,
                    contract_amount = EXCLUDED.contract_amount,
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
                item.get('reqNo', '')
            ))
            
            # 공동수급체 정보 저장
            corp_list_raw = item.get('corpList', '')
            if corp_list_raw:
                partners = parse_corp_list(corp_list_raw)
                
                # 기존 파트너 삭제
                cursor.execute("DELETE FROM contract_partners WHERE contract_no = %s", (contract_no,))
                
                # 새 파트너 추가
                for partner in partners:
                    cursor.execute("""
                        INSERT INTO contract_partners (
                            contract_no, partner_order, partner_type, joint_type,
                            partner_name, ceo_name, nationality, share_ratio
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        contract_no,
                        partner['order'],
                        partner['type'],
                        partner['joint_type'],
                        partner['name'],
                        partner['ceo'],
                        partner['nationality'],
                        partner['share_ratio']
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
            continue
    
    conn.commit()
    return saved_count


def collect_contracts(start_date, end_date):
    """지정 기간의 계약 데이터 수집"""
    print(f"=== G2B 용역 계약 데이터 수집 ===")
    print(f"기간: {start_date.strftime('%Y-%m-%d')} ~ {end_date.strftime('%Y-%m-%d')}")
    print()
    
    conn = get_db_connection()
    
    try:
        # 첫 페이지 조회로 총 건수 확인
        items, total_count = fetch_contracts(start_date, end_date, page=1, num_rows=100)
        
        if items is None:
            print("데이터 조회 실패")
            return
        
        print(f"총 {total_count:,}건의 용역 계약 발견")
        
        total_pages = (total_count + 99) // 100
        print(f"총 {total_pages} 페이지 수집 예정")
        print()
        
        # 첫 페이지 저장
        saved = save_contracts(conn, items)
        print(f"페이지 1/{total_pages}: {saved}건 저장")
        
        # 나머지 페이지 수집
        for page in range(2, total_pages + 1):
            time.sleep(0.5)  # API 호출 간격
            
            items, _ = fetch_contracts(start_date, end_date, page=page, num_rows=100)
            if items:
                saved = save_contracts(conn, items)
                print(f"페이지 {page}/{total_pages}: {saved}건 저장")
            else:
                print(f"페이지 {page} 실패, 건너뜀")
            
            # 10페이지마다 진행상황 출력
            if page % 10 == 0:
                print(f"--- {page}/{total_pages} 완료 ({page*100:,}/{total_count:,}건) ---")
        
        print()
        print("=== 수집 완료 ===")
        
        # 최종 통계
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM contracts")
        total_contracts = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM contract_partners")
        total_partners = cursor.fetchone()[0]
        
        print(f"DB 총 계약 수: {total_contracts:,}건")
        print(f"DB 총 공동수급체 수: {total_partners:,}건")
        
    finally:
        conn.close()


def collect_daily():
    """일일 신규 계약 수집"""
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    collect_contracts(yesterday, today)


def collect_initial(days=365):
    """초기 데이터 수집 (기본 1년)"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    collect_contracts(start_date, end_date)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'daily':
            collect_daily()
        elif sys.argv[1] == 'initial':
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 365
            collect_initial(days)
        elif sys.argv[1] == 'range':
            # 날짜 범위 지정: python collect_contracts.py range 2010-01-01 2024-12-07
            if len(sys.argv) >= 4:
                start_str = sys.argv[2]
                end_str = sys.argv[3]
                start_date = datetime.strptime(start_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_str, '%Y-%m-%d')
                collect_contracts(start_date, end_date)
            else:
                print("사용법: python collect_contracts.py range YYYY-MM-DD YYYY-MM-DD")
        else:
            print("사용법: python collect_contracts.py [daily|initial|range] [args]")
    else:
        # 기본: 최근 30일 수집 (테스트용)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        collect_contracts(start_date, end_date)
