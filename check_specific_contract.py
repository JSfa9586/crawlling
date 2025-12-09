"""
특정 계약번호의 모든 필드 길이 확인
오류가 발생한 계약번호 R25TE09458478의 실제 데이터 분석
"""

import requests
import urllib.parse
from datetime import datetime

# G2B API 키
API_KEY = "43dd4dea66b7f6b7585b3ad8c7a8d1c1bf29e2a2e1e991984e508e677eec6561"
API_URL = "https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

def check_specific_contract():
    """특정 날짜의 계약 데이터 상세 확인"""
    print("=== 2025-11-25 계약 데이터 상세 분석 ===\n")
    
    # 2025-11-25 데이터 조회
    params = {
        'numOfRows': '100',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': '20251125' + '0000',
        'inqryEndDt': '20251125' + '2359',
        'bsnsDivCd': '5'  # 용역만
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{API_URL}?{qp}&serviceKey={API_KEY}"
    
    try:
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
            
            print(f"총 {len(item_list)}건 발견\n")
            
            # R25TE09458478 찾기
            target_contract = None
            for item in item_list:
                if item.get('untyCntrctNo') == 'R25TE09458478':
                    target_contract = item
                    break
            
            if target_contract:
                print("⚠️ 문제의 계약 발견: R25TE09458478\n")
                print("모든 필드 길이 분석:\n")
                
                # VARCHAR(50) 필드들 확인
                varchar_50_fields = {
                    'untyCntrctNo': 'contract_no',
                    'ntceNo': 'notice_no',
                    'dcsnCntrctNo': 'fixed_contract_no',
                    'cntrctRefNo': 'contract_ref_no',
                    'reqNo': 'request_no',
                    'cntrctInsttCd': 'order_org_code',
                    'dmndInsttCd': 'demand_org_code',
                    'pubPrcrmntClsfcNo': 'classification_no'
                }
                
                print("VARCHAR(50) 필드:")
                for api_field, db_field in varchar_50_fields.items():
                    value = target_contract.get(api_field, '')
                    length = len(str(value)) if value else 0
                    status = "⚠️ 초과!" if length > 50 else "✓"
                    print(f"  {status} {db_field:30s} ({api_field:20s}): {length:3d}자 - {value}")
                
                # VARCHAR(100) 필드들
                varchar_100_fields = {
                    'cntrctPrd': 'contract_period',
                    'cntrctCnclsMthdNm': 'contract_method_name',
                    'payDivNm': 'pay_div_name',
                    'lngtrmCtnuDivNm': 'long_term_div_name',
                    'bsnsDivNm': 'business_div_name'
                }
                
                print("\nVARCHAR(100) 필드:")
                for api_field, db_field in varchar_100_fields.items():
                    value = target_contract.get(api_field, '')
                    length = len(str(value)) if value else 0
                    status = "⚠️ 초과!" if length > 100 else "✓"
                    print(f"  {status} {db_field:30s} ({api_field:20s}): {length:3d}자 - {value}")
                
                # VARCHAR(200) 필드들
                varchar_200_fields = {
                    'cntrctInsttNm': 'order_org_name',
                    'dmndInsttNm': 'demand_org_name',
                    'cntrctInsttChrgDeptNm': 'org_dept_name',
                    'cntrctInsttOfclNm': 'org_officer_name',
                    'cntrctInsttOfclTelNo': 'org_officer_tel',
                    'cntrctInsttOfclFaxNo': 'org_officer_fax',
                    'crdtrNm': 'creditor_name',
                    'cntrctInsttJrsdctnDivNm': 'org_jurisdiction',
                    'pubPrcrmntClsfcNm': 'classification_name',
                    'pubPrcrmntLrgClsfcNm': 'large_class_name',
                    'pubPrcrmntMidClsfcNm': 'mid_class_name'
                }
                
                print("\nVARCHAR(200) 필드:")
                for api_field, db_field in varchar_200_fields.items():
                    value = target_contract.get(api_field, '')
                    length = len(str(value)) if value else 0
                    status = "⚠️ 초과!" if length > 200 else "✓"
                    print(f"  {status} {db_field:30s} ({api_field:20s}): {length:3d}자 - {value}")
                
                # TEXT 필드들도 확인
                text_fields = {
                    'cntrctNm': 'contract_name',
                    'prdctNm': 'product_name',
                    'baseLawNm': 'base_law_name',
                    'baseDtls': 'base_details',
                    'dminsttList': 'demand_org_list',
                    'corpList': 'corp_list_raw'
                }
                
                print("\nTEXT 필드 (참고):")
                for api_field, db_field in text_fields.items():
                    value = target_contract.get(api_field, '')
                    length = len(str(value)) if value else 0
                    print(f"  {db_field:30s} ({api_field:20s}): {length:3d}자")
                    if length > 100:
                        print(f"    내용: {str(value)[:100]}...")
                
            else:
                print("⚠️ R25TE09458478 계약을 찾을 수 없습니다.")
                print("\n전체 계약번호 목록:")
                for item in item_list[:20]:
                    print(f"  - {item.get('untyCntrctNo')}")
    
    except Exception as e:
        print(f"오류: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_specific_contract()
