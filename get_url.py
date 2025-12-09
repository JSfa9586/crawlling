import psycopg2

conn = psycopg2.connect(
    host='localhost',
    database='g2b_contracts',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

cur.execute("""
    SELECT contract_no, detail_url, contract_info_url 
    FROM contracts 
    WHERE contract_name LIKE '%지세포항%환경%' 
    LIMIT 1
""")
row = cur.fetchone()
if row:
    print(f"계약번호: {row[0]}")
    print(f"detail_url: {row[1]}")
    print(f"contract_info_url: {row[2]}")

conn.close()
