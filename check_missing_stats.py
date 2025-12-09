
import requests
import urllib.parse
import psycopg2
import calendar
from datetime import datetime
import time

# PostgreSQL Config
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

# API Config
API_KEY = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="
API_URL = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

def get_api_count(start_date, end_date):
    params = {
        'numOfRows': '1',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': start_date.replace('-', '') + '0000',
        'inqryEndDt': end_date.replace('-', '') + '2359',
        'bsnsDivCd': '5',
        'serviceKey': API_KEY
    }
    # Manually encoding serviceKey to avoid double encoding issues if using params dict directly with requests sometimes
    # But here simple approach:
    qp = urllib.parse.urlencode({k:v for k,v in params.items() if k != 'serviceKey'})
    full_url = f"{API_URL}?{qp}&serviceKey={urllib.parse.quote(API_KEY)}"
    
    try:
        res = requests.get(full_url, timeout=10)
        data = res.json()
        body = data.get('response', {}).get('body', {})
        return int(body.get('totalCount', 0))
    except Exception as e:
        print(f"API Error ({start_date}): {e}")
        return 0

def get_db_count(cursor, start_date, end_date):
    cursor.execute("""
        SELECT COUNT(*) FROM contracts 
        WHERE contract_date >= %s AND contract_date <= %s
    """, (start_date, end_date))
    return cursor.fetchone()[0]

def analyze_gaps():
    output_lines = []
    output_lines.append(f"{'='*50}")
    output_lines.append(f"G2B Service Contract Data Collection Status (DB Only)")
    output_lines.append(f"* API Quota Exceeded (429 Error)")
    output_lines.append(f"{'='*50}")
    output_lines.append(f"{'Month':^10} | {'DB Saved (Count)':^20}")
    output_lines.append(f"{'-'*50}")

    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    year = 2025
    total_db = 0

    for month in range(1, 13):
        # Calculate date range
        _, last_day = calendar.monthrange(year, month)
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-{last_day}"
        
        db_cnt = get_db_count(cursor, start_date, end_date)
        
        line = f"{year}-{month:02d} | {db_cnt:>18,}"
        output_lines.append(line)
        print(line)
        
        total_db += db_cnt

    output_lines.append(f"{'-'*50}")
    line = f"{'Total':^10} | {total_db:>18,}"
    output_lines.append(line)
    output_lines.append(f"{'='*50}")
    
    conn.close()

    with open("missing_stats_report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    
    print("Report saved to missing_stats_report.txt")

if __name__ == "__main__":
    analyze_gaps()
