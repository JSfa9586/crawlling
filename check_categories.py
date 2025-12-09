import psycopg2

conn = psycopg2.connect(
    host='localhost',
    database='g2b_contracts',
    user='postgres',
    password='postgres123'
)
cur = conn.cursor()

print("=== 용역 대분류 ===")
cur.execute("""
    SELECT large_class_name, COUNT(*) as cnt 
    FROM contracts 
    WHERE large_class_name IS NOT NULL AND large_class_name != ''
    GROUP BY large_class_name 
    ORDER BY cnt DESC 
    LIMIT 20
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]:,}건")

print("\n=== 용역 중분류 (상위 20개) ===")
cur.execute("""
    SELECT mid_class_name, COUNT(*) as cnt 
    FROM contracts 
    WHERE mid_class_name IS NOT NULL AND mid_class_name != ''
    GROUP BY mid_class_name 
    ORDER BY cnt DESC 
    LIMIT 20
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]:,}건")

conn.close()
