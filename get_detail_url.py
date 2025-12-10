import psycopg2

conn = psycopg2.connect(
    host='localhost', port=5432, database='g2b_contracts',
    user='postgres', password='postgres123'
)
cursor = conn.cursor()
cursor.execute("SELECT detail_url FROM contracts WHERE contract_name LIKE '%지세포%' LIMIT 1")
print(cursor.fetchone()[0])
conn.close()
