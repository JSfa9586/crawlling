"""
지분율 대량 업데이트 스크립트
- 날짜별 역순 진행 (최신 → 과거)
- 한 건씩 즉시 DB 갱신
- 진행 상황 저장 (중단 시 재개 가능)
- 1년 단위로 실행
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import psycopg2
import time
import re
import json
from datetime import datetime, timedelta
import os

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

PROGRESS_FILE = 'share_ratio_progress.json'


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
    """상세페이지에서 지분율 추출 (인덱스 6: 지분율(%), 인덱스 7: 전체지분율)"""
    try:
        driver.get(detail_url)
        time.sleep(4)
        
        partner_data = []
        seen = set()
        
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
                company_name = row[4].strip()
                share_ratio_str = row[6].strip()  # 인덱스 6: 지분율(%)
                
                if company_name and share_ratio_str and re.match(r'^[\d.]+$', share_ratio_str):
                    ratio = float(share_ratio_str)
                    key = (company_name, ratio)
                    if key not in seen and 0 < ratio <= 100:
                        seen.add(key)
                        partner_data.append({
                            'name': company_name,
                            'share_ratio': ratio
                        })
        
        return partner_data if partner_data else None
        
    except Exception as e:
        return None


def save_progress(data):
    """진행 상황 저장"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_progress():
    """진행 상황 로드"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def update_share_ratio_by_year(year, month=None, resume=True):
    """특정 년도(월)의 지분율 업데이트
    
    Args:
        year: 년도 (예: 2025)
        month: 월 (1-12), None이면 전체 년도
        resume: 이전 진행 재개 여부
    """
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 진행 상황 확인
    progress_key = f"{year}-{month}" if month else str(year)
    progress = load_progress() if resume else None
    last_contract_no = None
    
    if progress and progress.get('key') == progress_key:
        last_contract_no = progress.get('last_contract_no')
        print(f"이전 진행 발견: {last_contract_no} 이후부터 재개")
    
    # 해당 년도(월)의 공동수급 계약 조회 (0% 또는 100% 지분율)
    params = [year]
    query = """
        SELECT c.contract_no, c.detail_url, c.contract_name, c.contract_date
        FROM contracts c
        WHERE EXTRACT(YEAR FROM c.contract_date) = %s
    """
    
    if month:
        query += " AND EXTRACT(MONTH FROM c.contract_date) = %s"
        params.append(month)
    
    query += """
        AND c.detail_url IS NOT NULL AND c.detail_url != ''
        AND (SELECT COUNT(*) FROM contract_partners cp WHERE cp.contract_no = c.contract_no) > 1
        AND EXISTS (
            SELECT 1 FROM contract_partners cp 
            WHERE cp.contract_no = c.contract_no 
            AND (cp.share_ratio = 100 OR cp.share_ratio = 0)
        )
    """
    
    if last_contract_no:
        query += f" AND c.contract_no < '{last_contract_no}'"
    
    query += " ORDER BY c.contract_date DESC, c.contract_no DESC"
    
    cursor.execute(query, params)
    contracts = cursor.fetchall()
    
    total = len(contracts)
    month_str = f"{month}월" if month else "전체"
    print(f"\n{'='*60}")
    print(f"{year}년 {month_str} 지분율 업데이트 시작")
    print(f"수정 대상: {total}개 계약")
    print(f"{'='*60}\n")
    
    if total == 0:
        print("수정할 계약이 없습니다.")
        return
    
    driver = get_chrome_driver()
    fixed_count = 0
    processed = 0
    
    try:
        for i, (contract_no, detail_url, contract_name, contract_date) in enumerate(contracts, 1):
            processed += 1
            date_str = contract_date.strftime('%Y-%m-%d') if contract_date else ''
            print(f"[{i}/{total}] {date_str} | {contract_no}: {contract_name[:35]}...")
            
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
                        print(f"  ✓ {partner['name'][:20]}... = {partner['share_ratio']}%")
                        fixed_count += 1
                
                # 즉시 커밋 (한 건씩)
                conn.commit()
            else:
                print("  ✗ 지분율 정보 없음")
            
            # 진행 상황 저장 (10건마다)
            if i % 10 == 0:
                save_progress({
                    'key': progress_key,
                    'year': year,
                    'month': month,
                    'last_contract_no': contract_no,
                    'processed': processed,
                    'fixed': fixed_count,
                    'updated_at': datetime.now().isoformat()
                })
            
            time.sleep(1.5)  # 서버 부하 방지
            
    except KeyboardInterrupt:
        print("\n\n중단됨. 진행 상황 저장...")
        save_progress({
            'key': progress_key,
            'year': year,
            'month': month,
            'last_contract_no': contract_no,
            'processed': processed,
            'fixed': fixed_count,
            'updated_at': datetime.now().isoformat()
        })
        raise
    finally:
        driver.quit()
    
    # 완료 시 진행 상황 초기화
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
    
    cursor.close()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"{year}년 완료!")
    print(f"처리: {processed}개 계약, 업데이트: {fixed_count}건")
    print(f"{'='*60}")


def get_statistics():
    """지분율 통계 조회"""
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 년도별 수정 대상 계약 통계
    cursor.execute("""
        SELECT 
            EXTRACT(YEAR FROM c.contract_date)::int as year,
            COUNT(DISTINCT c.contract_no) as need_fix_count
        FROM contracts c
        WHERE c.contract_date IS NOT NULL
        AND c.detail_url IS NOT NULL AND c.detail_url != ''
        AND (SELECT COUNT(*) FROM contract_partners cp WHERE cp.contract_no = c.contract_no) > 1
        AND EXISTS (
            SELECT 1 FROM contract_partners cp 
            WHERE cp.contract_no = c.contract_no 
            AND (cp.share_ratio = 100 OR cp.share_ratio = 0)
        )
        GROUP BY EXTRACT(YEAR FROM c.contract_date)::int
        ORDER BY year DESC
        LIMIT 15
    """)
    
    print("\n=== 년도별 수정 필요 계약 통계 ===")
    print(f"{'년도':>6} | {'수정필요':>10}")
    print("-" * 25)
    for row in cursor.fetchall():
        year, count = row
        if year:
            print(f"{year:>6} | {count:>10}")
    
    conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("사용법:")
        print("  python mass_update_share_ratio.py <년도>        # 특정 년도 전체 업데이트")
        print("  python mass_update_share_ratio.py <년도> <월>   # 특정 년도-월 업데이트")
        print("  python mass_update_share_ratio.py stats        # 통계 조회")
        print("  python mass_update_share_ratio.py resume       # 중단된 작업 재개")
        print("\n예시:")
        print("  python mass_update_share_ratio.py 2025         # 2025년 전체")
        print("  python mass_update_share_ratio.py 2025 12      # 2025년 12월만")
        print("  python mass_update_share_ratio.py 2025 11      # 2025년 11월만")
        sys.exit(1)
    
    arg = sys.argv[1]
    
    if arg == 'stats':
        get_statistics()
    elif arg == 'resume':
        progress = load_progress()
        if progress:
            year = progress.get('year')
            month = progress.get('month')
            print(f"이전 진행 재개: {year}년 {month or '전체'}월")
            update_share_ratio_by_year(year, month=month, resume=True)
        else:
            print("재개할 진행 상황이 없습니다.")
    else:
        try:
            year = int(arg)
            month = int(sys.argv[2]) if len(sys.argv) > 2 else None
            if month and (month < 1 or month > 12):
                print("월은 1~12 사이로 입력하세요.")
                sys.exit(1)
            update_share_ratio_by_year(year, month=month, resume=True)
        except ValueError:
            print(f"올바른 년도를 입력하세요: {arg}")
