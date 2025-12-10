"""
지세포 계약의 지분율 직접 업데이트
"""
from fix_share_ratio import get_chrome_driver, get_share_ratios_from_page
import psycopg2

DB_CONFIG = {
    'host': 'localhost', 'port': 5432, 'database': 'g2b_contracts',
    'user': 'postgres', 'password': 'postgres123'
}

conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# 지세포 계약 중 공동수급 (파트너 2개 이상) 조회
cursor.execute("""
    SELECT c.contract_no, c.detail_url, c.contract_name
    FROM contracts c
    WHERE c.contract_name LIKE '%지세포%'
    AND c.detail_url IS NOT NULL
    AND (SELECT COUNT(*) FROM contract_partners cp WHERE cp.contract_no = c.contract_no) > 1
""")

contracts = cursor.fetchall()
print(f"지세포 공동수급 계약: {len(contracts)}개\n")

driver = get_chrome_driver()
fixed_count = 0

for contract_no, detail_url, contract_name in contracts:
    print(f"{contract_no}: {contract_name[:40]}...")
    
    partners_data = get_share_ratios_from_page(driver, detail_url)
    
    if partners_data:
        for partner in partners_data:
            name_pattern = partner['name'][:10].replace('주식회사 ', '').replace('(주)', '')
            
            cursor.execute("""
                UPDATE contract_partners 
                SET share_ratio = %s 
                WHERE contract_no = %s AND partner_name LIKE %s
            """, (partner['share_ratio'], contract_no, f"%{name_pattern}%"))
            
            if cursor.rowcount > 0:
                print(f"  ✓ {partner['name'][:25]}: {partner['share_ratio']}%")
                fixed_count += 1
        
        conn.commit()
    else:
        print("  ✗ 지분율 정보 없음")

driver.quit()
cursor.close()
conn.close()

print(f"\n완료! {fixed_count}건 업데이트됨")
