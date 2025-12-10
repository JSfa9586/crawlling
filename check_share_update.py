"""
지분율 업데이트 결과 확인
"""
import psycopg2

conn = psycopg2.connect(
    host='localhost', port=5432, database='g2b_contracts',
    user='postgres', password='postgres123'
)
cursor = conn.cursor()

# 0이 아니고 100이 아닌 지분율 확인 (업데이트된 데이터)
print("=== 업데이트된 지분율 (0%, 100% 아닌 값) ===\n")
cursor.execute("""
    SELECT c.contract_no, c.contract_name, cp.partner_name, cp.share_ratio
    FROM contract_partners cp
    JOIN contracts c ON c.contract_no = cp.contract_no
    WHERE cp.share_ratio > 0 AND cp.share_ratio < 100
    ORDER BY c.contract_date DESC
    LIMIT 30
""")

current_contract = None
for row in cursor.fetchall():
    contract_no, contract_name, partner_name, share_ratio = row
    if contract_no != current_contract:
        print(f"\n{contract_no}: {contract_name[:50]}...")
        current_contract = contract_no
    print(f"  - {partner_name}: {share_ratio}%")

# 통계
print("\n\n=== 지분율 통계 ===")
cursor.execute("""
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN share_ratio = 0 THEN 1 END) as zero_count,
        COUNT(CASE WHEN share_ratio = 100 THEN 1 END) as hundred_count,
        COUNT(CASE WHEN share_ratio > 0 AND share_ratio < 100 THEN 1 END) as valid_count
    FROM contract_partners
""")
total, zero, hundred, valid = cursor.fetchone()
print(f"전체 파트너: {total}건")
print(f"  - 0%: {zero}건")
print(f"  - 100%: {hundred}건")
print(f"  - 유효한 지분율 (0~100% 사이): {valid}건")

conn.close()
