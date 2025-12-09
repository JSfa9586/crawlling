"""
corpList 파싱 데이터의 bizno 필드 길이 확인
2025-11-25 데이터에서 bizno가 50자를 초과하는지 확인
"""

import requests
import urllib.parse
from datetime import datetime
import time
import re

# G2B API 키
API_KEY = "43dd4dea66b7f6b7585b3ad8c7a8d1c1bf29e2a2e1e991984e508e677eec6561"
API_URL = "https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

def parse_corp_list(corp_list_raw):
    """
    공동사 목록 파싱
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
                pass
    
    return partners

def fetch_all_contracts_on_date(date_str="20251125"):
    """특정 날짜의 모든 계약 데이터 조회"""
    print(f"=== {date_str} corpList 데이터 분석 ===\n")
    
    params = {
        'numOfRows': '100',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': date_str + '0000',
        'inqryEndDt': date_str + '2359',
        'bsnsDivCd': '5'  # 용역만
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{API_URL}?{qp}&serviceKey={API_KEY}"
    
    try:
        response = requests.get(full_url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            body = data.get('response', {}).get('body', {})
            total_count = int(body.get('totalCount', 0))
            
            print(f"총 {total_count}건 발견\n")
            
            all_items = []
            total_pages = (total_count + 99) // 100
            
            for page in range(1, min(total_pages + 1, 80)):  # 최대 80페이지만
                params['pageNo'] = str(page)
                qp = urllib.parse.urlencode(params)
                full_url = f"{API_URL}?{qp}&serviceKey={API_KEY}"
                
                response = requests.get(full_url, timeout=30)
                if response.status_code == 200:
                    data = response.json()
                    body = data.get('response', {}).get('body', {})
                    items = body.get('items', {})
                    
                    if isinstance(items, list):
                        item_list = items
                    elif items and items.get('item'):
                        item_list = items['item'] if isinstance(items['item'], list) else [items['item']]
                    else:
                        item_list = []
                    
                    all_items.extend(item_list)
                    
                    if page % 10 == 0:
                        print(f"  페이지 {page}/{total_pages}: {len(all_items)}건 누적")
                    
                    time.sleep(0.3)
            
            print(f"\n총 {len(all_items)}건 수집 완료\n")
            return all_items
    except Exception as e:
        print(f"오류: {e}")
        return []

def analyze_bizno_lengths(items):
    """corpList에서 파싱된 bizno 필드 길이 분석"""
    print("=== bizno 필드 길이 분석 ===\n")
    
    max_bizno_len = 0
    max_bizno_example = ""
    max_bizno_contract = ""
    long_biznos = []
    
    total_partners = 0
    contracts_with_partners = 0
    
    for item in items:
        contract_no = item.get('untyCntrctNo', '')
        corp_list_raw = item.get('corpList', '')
        
        if corp_list_raw:
            contracts_with_partners += 1
            partners = parse_corp_list(corp_list_raw)
            total_partners += len(partners)
            
            for partner in partners:
                bizno = partner.get('bizno', '')
                if bizno:
                    length = len(str(bizno))
                    
                    if length > max_bizno_len:
                        max_bizno_len = length
                        max_bizno_example = bizno
                        max_bizno_contract = contract_no
                    
                    if length > 50:
                        long_biznos.append({
                            'contract_no': contract_no,
                            'partner_name': partner.get('name', ''),
                            'bizno': bizno,
                            'length': length
                        })
    
    print(f"분석 결과:")
    print(f"  - 총 계약 수: {len(items)}건")
    print(f"  - 공동수급체 있는 계약: {contracts_with_partners}건")
    print(f"  - 총 파트너 수: {total_partners}건")
    print(f"  - bizno 최대 길이: {max_bizno_len}자")
    
    if max_bizno_len > 0:
        print(f"  - 최대 길이 예시:")
        print(f"    • 계약번호: {max_bizno_contract}")
        print(f"    • bizno: {max_bizno_example}")
    
    if long_biznos:
        print(f"\n⚠️ 50자 초과 bizno 발견: {len(long_biznos)}건\n")
        for item in long_biznos[:10]:
            print(f"계약번호: {item['contract_no']}")
            print(f"  업체명: {item['partner_name']}")
            print(f"  bizno: {item['bizno']} ({item['length']}자)")
            print()
        
        return long_biznos
    else:
        print(f"\n✓ 모든 bizno가 50자 이내입니다.")
        
        if max_bizno_len > 40:
            print(f"\n⚠️ 주의: 최대 길이가 {max_bizno_len}자로 50자에 근접합니다.")
            print(f"   안전을 위해 VARCHAR(100)으로 확장을 권장합니다.")
        
        return []

if __name__ == "__main__":
    items = fetch_all_contracts_on_date("20251125")
    if items:
        long_biznos = analyze_bizno_lengths(items)
        
        if long_biznos:
            print("\n=== 권장 조치 ===")
            print("contract_partners 테이블의 bizno 필드를 VARCHAR(100)으로 확장 필요")
