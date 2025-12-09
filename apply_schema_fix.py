"""
bizno 필드 길이 확장 스크립트 실행
Python을 통해 PostgreSQL 스키마 변경 적용
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

def apply_schema_fix():
    """bizno 필드 길이 확장"""
    print("=== bizno 필드 길이 확장 시작 ===\n")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    try:
        # 현재 상태 확인
        print("1. 현재 스키마 확인...")
        cursor.execute("""
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'contract_partners' 
            AND column_name = 'bizno';
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"   현재: {result[0]} {result[1]}({result[2]})")
        else:
            print("   ⚠️ bizno 필드를 찾을 수 없습니다!")
            return
        
        # 스키마 변경
        print("\n2. 스키마 변경 실행...")
        cursor.execute("ALTER TABLE contract_partners ALTER COLUMN bizno TYPE VARCHAR(100);")
        conn.commit()
        print("   ✓ ALTER TABLE 완료")
        
        # 변경 확인
        print("\n3. 변경 결과 확인...")
        cursor.execute("""
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'contract_partners' 
            AND column_name = 'bizno';
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"   변경 후: {result[0]} {result[1]}({result[2]})")
            
            if result[2] == 100:
                print("\n✓ 스키마 변경 성공!")
            else:
                print(f"\n⚠️ 예상과 다른 길이: {result[2]}")
        
        # 데이터 무결성 확인
        print("\n4. 데이터 무결성 확인...")
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                MAX(LENGTH(bizno)) as max_len
            FROM contract_partners
            WHERE bizno IS NOT NULL;
        """)
        
        result = cursor.fetchone()
        print(f"   총 레코드: {result[0]:,}건")
        print(f"   최대 길이: {result[1]}자")
        
        if result[1] and result[1] <= 100:
            print("   ✓ 모든 데이터가 새 제한 내에 있습니다.")
        
    except Exception as e:
        print(f"\n⚠️ 오류 발생: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
    
    print("\n=== 스키마 변경 완료 ===")

if __name__ == "__main__":
    apply_schema_fix()
