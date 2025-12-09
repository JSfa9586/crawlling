"""
G2B 용역 계약 데이터 연도별 수집 스크립트
API 날짜 범위 제한을 우회하여 연도별로 분할 수집
"""

import subprocess
import sys
from datetime import datetime

def collect_year(year):
    """특정 연도의 데이터 수집"""
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    
    if year == 2025:  # 현재 연도는 오늘까지
        end_date = "2025-12-07"
    
    print(f"\n{'='*50}")
    print(f"=== {year}년 데이터 수집 시작 ===")
    print(f"{'='*50}")
    
    cmd = ['python', 'c:\\AI\\251118 크롤링\\collect_contracts.py', 'range', start_date, end_date]
    result = subprocess.run(cmd, capture_output=False)
    
    return result.returncode == 0

def collect_range(start_year, end_year):
    """연도 범위 수집 (역순: 최신→과거)"""
    print(f"\n{'#'*60}")
    print(f"### G2B 용역 계약 데이터 수집: {end_year}년 → {start_year}년 (역순) ###")
    print(f"{'#'*60}")
    
    # 역순으로 수집 (최신 데이터 먼저)
    for year in range(end_year, start_year - 1, -1):
        collect_year(year)
    
    print(f"\n{'#'*60}")
    print(f"### 수집 완료: {end_year}년 → {start_year}년 ###")
    print(f"{'#'*60}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        start_year = int(sys.argv[1])
        end_year = int(sys.argv[2])
        collect_range(start_year, end_year)
    else:
        print("사용법: python collect_by_year.py [시작연도] [종료연도]")
        print("예시: python collect_by_year.py 2010 2025")
