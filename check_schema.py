"""
contracts 테이블 스키마 확인
"""
import psycopg2

conn = psycopg2.connect(
    host='localhost',
    port=5432,
    database='g2b_contracts',
    user='postgres',
    password='postgres123'
)
cursor = conn.cursor()

# contracts 테이블 컬럼 확인
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'contracts' 
    ORDER BY ordinal_position
""")

print("=== contracts 테이블 컬럼 ===")
for row in cursor.fetchall():
    print(f"{row[0]}: {row[1]}")

# contract_partners 테이블 컬럼 확인
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'contract_partners' 
    ORDER BY ordinal_position
""")

print("\n=== contract_partners 테이블 컬럼 ===")
for row in cursor.fetchall():
    print(f"{row[0]}: {row[1]}")

conn.close()
