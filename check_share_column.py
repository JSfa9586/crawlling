"""
상세페이지에서 지분율 컬럼 구조 확인
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import re

def get_chrome_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--log-level=3')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    return webdriver.Chrome(options=options)

# 지세포 계약 상세 URL
url = "https://www.g2b.go.kr/link/FIUA027_01/single/?ctrtNo=R25TA01161938&ctrtChgOrd=00&prcmBsneSeCd=조070003&srchName=ctrtCrst&openUrl=Y"

driver = get_chrome_driver()
try:
    driver.get(url)
    time.sleep(4)
    
    print(f"URL: {url}\n")
    
    # 페이지 소스에서 그리드 헤더 찾기
    source = driver.page_source
    
    # 지분율 관련 헤더 찾기
    print("=== 지분율 관련 헤더 찾기 ===")
    patterns = [
        r'value="([^"]*지분율[^"]*)"',
        r'>([^<]*지분율[^<]*)<'
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, source)
        for m in matches:
            if m.strip():
                print(f"  발견: {m.strip()}")
    
    # 그리드 데이터에서 숫자 패턴 분석
    print("\n=== 그리드 행 데이터 분석 ===")
    
    # JavaScript로 그리드 데이터 가져오기
    script = """
    var results = [];
    var grids = document.querySelectorAll('.w2grid, [class*="gridView"]');
    grids.forEach(function(grid, gIdx) {
        var rows = grid.querySelectorAll('tr');
        rows.forEach(function(row, rIdx) {
            var cells = row.querySelectorAll('td, th');
            if (cells.length > 5) {
                var rowData = [];
                cells.forEach(function(cell) {
                    rowData.push(cell.innerText.trim());
                });
                // 주식회사가 포함된 행만
                var rowText = rowData.join('|');
                if (rowText.includes('주식회사') || rowText.includes('지분율')) {
                    results.push({grid: gIdx, row: rIdx, cells: rowData});
                }
            }
        });
    });
    return results;
    """
    
    grid_data = driver.execute_script(script)
    
    for item in grid_data:
        print(f"\n그리드 {item['grid']}, 행 {item['row']}:")
        for i, cell in enumerate(item['cells']):
            if cell:
                print(f"  [{i}] {cell[:50]}")

finally:
    driver.quit()
