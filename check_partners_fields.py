"""
contract_partners 테이블의 VARCHAR 필드 길이 확인
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

def check_partners_table():
    """contract_partners 테이블의 VARCHAR 필드 확인"""
    print("=== contract_partners 테이블 VARCHAR 필드 분석 ===\n")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # VARCHAR 필드 목록 조회
    cursor.execute("""
        SELECT 
            column_name, 
            character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'contract_partners'
        AND data_type = 'character varying'
        ORDER BY character_maximum_length, column_name;
    """)
    
    varchar_fields = cursor.fetchall()
    
    print(f"총 {len(varchar_fields)}개의 VARCHAR 필드 발견\n")
    
    issues = []
    
    for field_name, max_length in varchar_fields:
        if max_length is None:
            continue
            
        # 실제 데이터의 최대 길이 확인
        try:
            cursor.execute(f"""
                SELECT 
                    MAX(LENGTH({field_name})) as max_len,
                    COUNT(*) FILTER (WHERE LENGTH({field_name}) > {max_length}) as over_limit_count
                FROM contract_partners
                WHERE {field_name} IS NOT NULL;
            """)
            
            result = cursor.fetchone()
            actual_max = result[0] if result[0] else 0
            over_count = result[1] if result[1] else 0
            
            status = "✓"
            if over_count > 0:
                status = "⚠️ 초과!"
                issues.append((field_name, max_length, actual_max, over_count))
            elif actual_max > max_length * 0.8:  # 80% 이상 사용
                status = "⚠️ 거의 찬"
            
            usage_pct = (actual_max / max_length * 100) if max_length > 0 else 0
            
            print(f"{status} {field_name:30s}: {actual_max:3d}/{max_length:3d} ({usage_pct:5.1f}%)")
            
            if over_count > 0:
                print(f"   └─ {over_count}건이 길이 제한 초과!")
                
        except Exception as e:
            print(f"⚠️  {field_name:30s}: 확인 실패 - {e}")
    
    if issues:
        print("\n\n=== 길이 초과 필드 상세 ===\n")
        for field_name, max_length, actual_max, over_count in issues:
            print(f"\n필드: {field_name}")
            print(f"  - 제한: {max_length}자")
            print(f"  - 실제 최대: {actual_max}자")
            print(f"  - 초과 건수: {over_count}건")
            
            # 초과 데이터 샘플 조회
            cursor.execute(f"""
                SELECT 
                    contract_no,
                    {field_name},
                    LENGTH({field_name}) as len
                FROM contract_partners
                WHERE LENGTH({field_name}) > {max_length}
                LIMIT 10;
            """)
            
            samples = cursor.fetchall()
            print(f"  - 샘플:")
            for contract_no, value, length in samples:
                print(f"    • {contract_no}: {length}자 - {value}")
    else:
        print("\n\n✓ 모든 필드가 길이 제한 내에 있습니다.")
    
    # 전체 통계
    cursor.execute("SELECT COUNT(*) FROM contract_partners")
    total_partners = cursor.fetchone()[0]
    print(f"\n총 공동수급체 레코드 수: {total_partners:,}건")
    
    conn.close()

if __name__ == "__main__":
    check_partners_table()
