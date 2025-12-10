"""
지세포 계약의 공동수급 상태 확인
"""
import psycopg2

conn = psycopg2.connect(
    host='localhost', port=5432, database='g2b_contracts',
    user='postgres', password='postgres123'
)
cursor = conn.cursor()

print("=== 지세포 계약 공동수급 상태 ===\n")
cursor.execute("""
    SELECT c.contract_no, c.contract_name, 
           (SELECT COUNT(*) FROM contract_partners cp WHERE cp.contract_no = c.contract_no) as partner_count
    FROM contracts c
    WHERE c.contract_name LIKE '%지세포%'
    ORDER BY c.contract_date DESC
""")

for row in cursor.fetchall():
    print(f"{row[0]}: {row[1][:40]}... (파트너 수: {row[2]})")
    
    # 파트너 상세 정보
    cursor.execute("""
        SELECT partner_name, share_ratio FROM contract_partners 
        WHERE contract_no = %s ORDER BY partner_order
    """, (row[0],))
    partners = cursor.fetchall()
    for p in partners:
        print(f"  - {p[0]}: {p[1]}%")
    print()

conn.close()
