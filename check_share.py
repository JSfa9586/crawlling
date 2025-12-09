import psycopg2

conn = psycopg2.connect(
    host='localhost',
    database='g2b_contracts',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

# 공동수급 계약 corpList 원본 확인
cur.execute("""
    SELECT contract_name, corp_list_raw 
    FROM contracts 
    WHERE corp_list_raw LIKE '%공동%' 
    AND LENGTH(corp_list_raw) > 100 
    LIMIT 3
""")
print("=== corpList 원본 분석 ===\n")
for row in cur.fetchall():
    print(f"계약명: {row[0][:40]}...")
    print(f"corpList: {row[1]}")
    print("---\n")

conn.close()
