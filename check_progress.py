
import psycopg2
from datetime import datetime
import sys

# PostgreSQL 연결 정보 (from collect_contracts.py)
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

def check_progress_2025():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("=== 2025년 데이터 수집 현황 점검 ===")
        
        # 2025년 전체 건수
        cursor.execute("SELECT COUNT(*) FROM contracts WHERE contract_date >= '2025-01-01' AND contract_date <= '2025-12-31'")
        total_2025 = cursor.fetchone()[0]
        print(f"2025년 총 수집 건수: {total_2025}건")

        # 월별 건수 확인
        print("\n[월별 수집 현황]")
        cursor.execute("""
            SELECT TO_CHAR(contract_date, 'YYYY-MM') as month, COUNT(*) 
            FROM contracts 
            WHERE contract_date >= '2025-01-01' AND contract_date <= '2025-12-31'
            GROUP BY month 
            ORDER BY month
        """)
        rows = cursor.fetchall()
        for row in rows:
            print(f"{row[0]}: {row[1]}건")

        # 최근 수집된 날짜 확인 (가장 마지막 날짜)
        cursor.execute("SELECT MAX(contract_date) FROM contracts WHERE contract_date <= CURRENT_DATE")
        max_date = cursor.fetchone()[0]
        print(f"\nDB상 가장 최근 계약일: {max_date}")

    except Exception as e:
        print(f"DB 점검 실패: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_progress_2025()
