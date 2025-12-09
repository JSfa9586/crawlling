"""
계약번호 길이 확인 스크립트
현재 데이터베이스 스키마와 실제 데이터 분석
"""

import psycopg2
import requests
import urllib.parse
from datetime import datetime

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
API_URL = "https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

def check_db_schema():
    """데이터베이스 스키마 확인"""
    print("=== 데이터베이스 스키마 확인 ===\n")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # contract_no 필드 정보 확인
    cursor.execute("""
        SELECT 
            column_name, 
            data_type, 
            character_maximum_length,
            is_nullable
        FROM information_schema.columns
        WHERE table_name = 'contracts'
        AND column_name LIKE '%contract%no%'
        OR column_name LIKE '%no'
        ORDER BY ordinal_position;
    """)
    
    print("계약 관련 필드:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]}({row[2]}) {'NULL 허용' if row[3] == 'YES' else 'NOT NULL'}")
    
    # 현재 저장된 계약번호 최대 길이 확인
    cursor.execute("""
        SELECT 
            MAX(LENGTH(contract_no)) as max_contract_no,
            MAX(LENGTH(notice_no)) as max_notice_no,
            MAX(LENGTH(fixed_contract_no)) as max_fixed_contract_no,
            MAX(LENGTH(contract_ref_no)) as max_contract_ref_no,
            MAX(LENGTH(request_no)) as max_request_no
        FROM contracts;
    """)
    
    result = cursor.fetchone()
    print("\n현재 저장된 데이터의 최대 길이:")
    print(f"  - contract_no: {result[0]}")
    print(f"  - notice_no: {result[1]}")
    print(f"  - fixed_contract_no: {result[2]}")
    print(f"  - contract_ref_no: {result[3]}")
    print(f"  - request_no: {result[4]}")
    
    # 50자를 초과하는 데이터 확인
    cursor.execute("""
        SELECT 
            contract_no,
            LENGTH(contract_no) as len,
            contract_name
        FROM contracts
        WHERE LENGTH(contract_no) > 50
        LIMIT 10;
    """)
    
    long_contracts = cursor.fetchall()
    if long_contracts:
        print("\n⚠️ 50자를 초과하는 계약번호:")
        for row in long_contracts:
            print(f"  - {row[0]} (길이: {row[1]})")
    else:
        print("\n✓ 50자를 초과하는 계약번호 없음")
    
    conn.close()

def check_api_data():
    """API에서 반환되는 실제 데이터의 계약번호 길이 확인"""
    print("\n\n=== API 데이터 샘플 확인 ===\n")
    
    # 최근 데이터 조회
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
            
            if item_list:
                print(f"총 {len(item_list)}건의 샘플 데이터 분석\n")
                
                max_lengths = {
                    'untyCntrctNo': 0,
                    'ntceNo': 0,
                    'dcsnCntrctNo': 0,
                    'cntrctRefNo': 0,
                    'reqNo': 0
                }
                
                examples = {}
                
                for item in item_list:
                    for key in max_lengths.keys():
                        value = item.get(key, '')
                        if value:
                            length = len(str(value))
                            if length > max_lengths[key]:
                                max_lengths[key] = length
                                examples[key] = str(value)
                
                print("API 데이터의 최대 길이:")
                field_names = {
                    'untyCntrctNo': 'contract_no (통합계약번호)',
                    'ntceNo': 'notice_no (공고번호)',
                    'dcsnCntrctNo': 'fixed_contract_no (확정계약번호)',
                    'cntrctRefNo': 'contract_ref_no (계약참조번호)',
                    'reqNo': 'request_no (요청번호)'
                }
                
                for key, max_len in max_lengths.items():
                    field_name = field_names.get(key, key)
                    status = "⚠️ 초과" if max_len > 50 else "✓ 정상"
                    print(f"  - {field_name}: {max_len}자 {status}")
                    if key in examples:
                        print(f"    예시: {examples[key]}")
            else:
                print("샘플 데이터 없음")
    except Exception as e:
        print(f"API 조회 오류: {e}")

if __name__ == "__main__":
    check_db_schema()
    check_api_data()
    
    print("\n\n=== 권장 사항 ===")
    print("1. contract_no 및 관련 필드를 VARCHAR(100)으로 확장")
    print("2. 또는 TEXT 타입으로 변경하여 길이 제한 제거")
    print("3. 인덱스는 유지하되, 필요시 부분 인덱스 고려")
