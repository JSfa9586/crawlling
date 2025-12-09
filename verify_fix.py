"""
2025-11-25 데이터가 정상적으로 저장되었는지 확인
"""

import psycopg2

# PostgreSQL 연결 정보
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

def verify_fix():
    """문제 해결 확인"""
    print("=== 2025-11-25 데이터 저장 확인 ===\n")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 1. 문제의 계약번호 확인
    print("1. 문제 계약 R25TE09458478 확인...")
    cursor.execute("""
        SELECT 
            contract_no,
            contract_name,
            contract_date,
            contractor_name
        FROM contracts
        WHERE contract_no = 'R25TE09458478';
    """)
    
    result = cursor.fetchone()
    if result:
        print(f"   ✓ 계약 발견!")
        print(f"   - 계약번호: {result[0]}")
        print(f"   - 계약명: {result[1][:50]}...")
        print(f"   - 계약일자: {result[2]}")
        print(f"   - 계약자: {result[3]}")
    else:
        print(f"   ⚠️ 계약을 찾을 수 없습니다. 아직 저장되지 않았을 수 있습니다.")
    
    # 2. 공동수급체 정보 확인
    print("\n2. 공동수급체 정보 확인...")
    cursor.execute("""
        SELECT 
            partner_name,
            bizno,
            LENGTH(bizno) as bizno_len
        FROM contract_partners
        WHERE contract_no = 'R25TE09458478';
    """)
    
    partners = cursor.fetchall()
    if partners:
        print(f"   ✓ {len(partners)}개의 공동수급체 발견")
        for partner in partners:
            print(f"   - {partner[0]}")
            print(f"     bizno: {partner[1]} ({partner[2]}자)")
            if partner[2] > 50:
                print(f"     ✓ 50자 초과 데이터가 정상적으로 저장됨!")
    else:
        print(f"   ⚠️ 공동수급체 정보를 찾을 수 없습니다.")
    
    # 3. 2025-11-25 전체 데이터 확인
    print("\n3. 2025-11-25 전체 데이터 확인...")
    cursor.execute("""
        SELECT COUNT(*)
        FROM contracts
        WHERE contract_date = '2025-11-25';
    """)
    
    count = cursor.fetchone()[0]
    print(f"   2025-11-25 저장된 계약 수: {count:,}건")
    
    if count >= 7700:
        print(f"   ✓ 예상 데이터(7,720건)가 거의 모두 저장됨")
    elif count > 0:
        print(f"   ⚠️ 일부만 저장됨. 재수집 필요할 수 있음")
    else:
        print(f"   ⚠️ 데이터 없음. 아직 수집되지 않았거나 오류 발생")
    
    # 4. 최근 저장 데이터 확인
    print("\n4. 최근 저장 데이터 확인...")
    cursor.execute("""
        SELECT 
            contract_date,
            COUNT(*) as count
        FROM contracts
        WHERE contract_date >= '2025-11-20'
        GROUP BY contract_date
        ORDER BY contract_date DESC
        LIMIT 10;
    """)
    
    recent = cursor.fetchall()
    print("   최근 저장된 날짜:")
    for date, count in recent:
        print(f"   - {date}: {count:,}건")
    
    conn.close()
    
    print("\n=== 검증 완료 ===")

if __name__ == "__main__":
    verify_fix()
