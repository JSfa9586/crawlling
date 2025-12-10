"""
금액 및 지분율 데이터 확인
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

# 지세포 계약 금액 확인
print("=== 지세포 계약 금액 확인 ===")
cursor.execute("""
    SELECT contract_no, contract_name, contract_amount, total_contract_amount 
    FROM contracts 
    WHERE contract_name LIKE '%지세포%' 
    ORDER BY contract_date DESC
    LIMIT 5
""")
for row in cursor.fetchall():
    print(f"계약번호: {row[0]}")
    print(f"  계약명: {row[1][:40]}...")
    print(f"  금차계약금액: {row[2]:,}원")
    print(f"  총계약금액: {row[3]:,}원" if row[3] else "  총계약금액: 없음")
    print()

# 지분율 확인
print("=== 공동수급체 지분율 확인 ===")
cursor.execute("""
    SELECT cp.contract_no, cp.partner_name, cp.share_ratio
    FROM contract_partners cp
    JOIN contracts c ON c.contract_no = cp.contract_no
    WHERE c.contract_name LIKE '%지세포%'
    ORDER BY c.contract_date DESC, cp.partner_order
    LIMIT 10
""")
for row in cursor.fetchall():
    print(f"{row[0]}: {row[1]} - {row[2]}%")

conn.close()
