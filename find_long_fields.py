"""
2025-11-25 전체 데이터에서 모든 필드 길이 확인
문제가 될 수 있는 긴 데이터 찾기
"""

import requests
import urllib.parse
from datetime import datetime
import time

# G2B API 키
API_KEY = "43dd4dea66b7f6b7585b3ad8c7a8d1c1bf29e2a2e1e991984e508e677eec6561"
API_URL = "https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

def fetch_all_contracts_on_date(date_str="20251125"):
    """특정 날짜의 모든 계약 데이터 조회"""
    print(f"=== {date_str} 전체 데이터 조회 ===\n")
    
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
            
            print(f"총 {total_count}건 발견")
            
            all_items = []
            total_pages = (total_count + 99) // 100
            
            for page in range(1, total_pages + 1):
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
                    print(f"  페이지 {page}/{total_pages}: {len(item_list)}건 수집")
                    
                    time.sleep(0.3)
            
            return all_items
    except Exception as e:
        print(f"오류: {e}")
        return []

def analyze_field_lengths(items):
    """모든 필드의 최대 길이 분석"""
    print(f"\n\n=== 필드 길이 분석 (총 {len(items)}건) ===\n")
    
    # VARCHAR(50) 필드들
    varchar_50_fields = {
        'untyCntrctNo': 'contract_no',
        'ntceNo': 'notice_no',
        'dcsnCntrctNo': 'fixed_contract_no',
        'cntrctRefNo': 'contract_ref_no',
        'reqNo': 'request_no',
        'cntrctInsttCd': 'order_org_code',
        'dmndInsttCd': 'demand_org_code',
        'pubPrcrmntClsfcNo': 'classification_no',
        'bsnsDivNm': 'business_div_name',
        'lngtrmCtnuDivNm': 'long_term_div_name',
        'payDivNm': 'pay_div_name',
        'cntrctInsttOfclTelNo': 'org_officer_tel',
        'cntrctInsttOfclFaxNo': 'org_officer_fax',
    }
    
    max_lengths = {}
    examples = {}
    issues = []
    
    for item in items:
        for api_field, db_field in varchar_50_fields.items():
            value = item.get(api_field, '')
            if value:
                length = len(str(value))
                if api_field not in max_lengths or length > max_lengths[api_field]:
                    max_lengths[api_field] = length
                    examples[api_field] = str(value)
                
                # 50자 초과 발견
                if length > 50:
                    contract_no = item.get('untyCntrctNo', 'Unknown')
                    issues.append({
                        'contract_no': contract_no,
                        'field': db_field,
                        'api_field': api_field,
                        'length': length,
                        'value': str(value)
                    })
    
    print("VARCHAR(50) 필드 최대 길이:\n")
    for api_field, db_field in varchar_50_fields.items():
        max_len = max_lengths.get(api_field, 0)
        status = "⚠️ 초과!" if max_len > 50 else "✓"
        print(f"{status} {db_field:30s} ({api_field:25s}): {max_len:3d}자")
        if api_field in examples and max_len > 40:
            print(f"   예시: {examples[api_field]}")
    
    if issues:
        print("\n\n=== ⚠️ 50자 초과 필드 발견! ===\n")
        for issue in issues:
            print(f"계약번호: {issue['contract_no']}")
            print(f"  필드: {issue['field']} ({issue['api_field']})")
            print(f"  길이: {issue['length']}자")
            print(f"  값: {issue['value']}")
            print()
        
        return issues
    else:
        print("\n\n✓ 모든 필드가 50자 이내입니다.")
        return []

if __name__ == "__main__":
    items = fetch_all_contracts_on_date("20251125")
    if items:
        issues = analyze_field_lengths(items)
        
        if issues:
            print("\n=== 권장 조치 ===")
            affected_fields = set(issue['field'] for issue in issues)
            print(f"다음 필드들을 VARCHAR(100) 또는 TEXT로 확장 필요:")
            for field in affected_fields:
                print(f"  - {field}")
