"""
Selenium으로 나라장터 상세페이지에서 지분율 크롤링
w2grid 컴포넌트에서 데이터 추출
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import psycopg2
import time
import re

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

def get_chrome_driver():
    """Chrome WebDriver 설정"""
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--log-level=3')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    return webdriver.Chrome(options=options)


def get_share_ratios_from_page(driver, detail_url):
    """상세페이지에서 지분율 추출 (w2grid 대응)"""
    try:
        driver.get(detail_url)
        time.sleep(4)  # 페이지 로딩 대기
        
        partner_data = []
        seen = set()  # 중복 방지
        
        # 방법 1: JavaScript로 그리드 데이터 직접 가져오기
        # 그리드 구조: [0]No, [1]구분, [2]공동도급방식, [3]사업자등록번호, 
        #             [4]업체명, [5]공종, [6]지분율(%), [7]전체지분율(%)
        try:
            script = """
            var results = [];
            var grids = document.querySelectorAll('.w2grid, [class*="gridView"]');
            grids.forEach(function(grid) {
                var rows = grid.querySelectorAll('tr');
                rows.forEach(function(row) {
                    var cells = row.querySelectorAll('td');
                    if (cells.length >= 7) {
                        var rowData = [];
                        cells.forEach(function(cell) {
                            rowData.push(cell.innerText.trim());
                        });
                        // 업체명에 '주식회사' 또는 '(주)'가 포함된 행만
                        var companyCell = rowData[4] || '';
                        if (companyCell.includes('주식회사') || companyCell.includes('(주)')) {
                            results.push(rowData);
                        }
                    }
                });
            });
            return results;
            """
            grid_data = driver.execute_script(script)
            
            for row in grid_data:
                if len(row) >= 7:
                    company_name = row[4].strip()  # 인덱스 4: 업체명
                    share_ratio_str = row[6].strip()  # 인덱스 6: 지분율(%) - 전체지분율(인덱스 7)이 아님!
                    
                    if company_name and share_ratio_str and re.match(r'^[\d.]+$', share_ratio_str):
                        ratio = float(share_ratio_str)
                        key = (company_name, ratio)
                        if key not in seen and 0 < ratio <= 100:
                            seen.add(key)
                            partner_data.append({
                                'name': company_name,
                                'share_ratio': ratio
                            })
        except Exception as e:
            pass
        
        return partner_data if partner_data else None
        
    except Exception as e:
        print(f"크롤링 에러: {e}")
        return None


def fix_share_ratios(limit=10):
    """지분율 수정 메인 함수"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 공동수급 계약 중 100% 또는 0%인 경우만 조회
    cursor.execute("""
        SELECT c.contract_no, c.detail_url, c.contract_name
        FROM contracts c
        WHERE c.detail_url IS NOT NULL AND c.detail_url != ''
        AND (SELECT COUNT(*) FROM contract_partners cp WHERE cp.contract_no = c.contract_no) > 1
        AND EXISTS (
            SELECT 1 FROM contract_partners cp 
            WHERE cp.contract_no = c.contract_no 
            AND (cp.share_ratio = 100 OR cp.share_ratio = 0)
        )
        ORDER BY c.contract_date DESC
        LIMIT %s
    """, (limit,))
    
    contracts = cursor.fetchall()
    print(f"수정 대상: {len(contracts)}개 계약\n")
    
    if not contracts:
        print("수정할 계약이 없습니다.")
        return
    
    driver = get_chrome_driver()
    fixed_count = 0
    
    try:
        for i, (contract_no, detail_url, contract_name) in enumerate(contracts, 1):
            print(f"[{i}/{len(contracts)}] {contract_no}: {contract_name[:40]}...")
            
            partners_data = get_share_ratios_from_page(driver, detail_url)
            
            if partners_data:
                for partner in partners_data:
                    # 업체명 일부로 매칭 (앞 10자)
                    name_pattern = partner['name'][:10].replace('주식회사 ', '').replace('(주)', '')
                    
                    cursor.execute("""
                        UPDATE contract_partners 
                        SET share_ratio = %s 
                        WHERE contract_no = %s AND partner_name LIKE %s
                    """, (partner['share_ratio'], contract_no, f"%{name_pattern}%"))
                    
                    if cursor.rowcount > 0:
                        print(f"  ✓ {partner['name'][:25]}... = {partner['share_ratio']}%")
                        fixed_count += 1
                
                conn.commit()
            else:
                print("  ✗ 지분율 정보를 찾을 수 없음")
            
            time.sleep(1.5)  # 서버 부하 방지
    finally:
        driver.quit()
    
    cursor.close()
    conn.close()
    print(f"\n완료! {fixed_count}건 업데이트됨")


def test_single_page(url=None):
    """단일 페이지 테스트"""
    if not url:
        # 테스트용 URL
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT detail_url FROM contracts 
            WHERE contract_name LIKE '%지세포%' 
            AND detail_url IS NOT NULL
            LIMIT 1
        """)
        result = cursor.fetchone()
        conn.close()
        url = result[0] if result else None
    
    if not url:
        print("테스트할 URL이 없습니다.")
        return
    
    print(f"테스트 URL: {url}\n")
    
    driver = get_chrome_driver()
    try:
        data = get_share_ratios_from_page(driver, url)
        
        if data:
            print(f"추출된 지분율 데이터:")
            for d in data:
                print(f"  - {d['name']}: {d['share_ratio']}%")
        else:
            print("데이터를 찾을 수 없음 - 페이지 분석 필요")
            
            # 디버깅: 페이지 소스 일부 저장
            driver.get(url)
            time.sleep(4)
            
            with open('debug_page.html', 'w', encoding='utf-8') as f:
                f.write(driver.page_source)
            print("\n디버깅용 페이지 소스가 debug_page.html에 저장됨")
    finally:
        driver.quit()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        url = sys.argv[2] if len(sys.argv) > 2 else None
        test_single_page(url)
    else:
        limit = int(sys.argv[1]) if len(sys.argv) > 1 else 10
        fix_share_ratios(limit)
