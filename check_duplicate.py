import psycopg2

conn = psycopg2.connect(
    host='localhost', port=5432, database='g2b_contracts',
    user='postgres', password='postgres123'
)
cursor = conn.cursor()

print("=== 지세포 환경영향평가 중복 확인 ===\n")
cursor.execute("""
    SELECT contract_no, contract_name, contract_date 
    FROM contracts 
    WHERE contract_name LIKE '%지세포항%환경영향평가%1차%' 
    ORDER BY contract_date DESC
""")

for r in cursor.fetchall():
    print(f"{r[0]}: {r[1][:50]}... | {r[2]}")

conn.close()
