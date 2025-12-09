#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
로컬 PostgreSQL 계약 데이터 현황 확인
"""

import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

try:
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 계약 수 확인
    cursor.execute("SELECT COUNT(*) FROM contracts")
    contract_count = cursor.fetchone()[0]
    print(f"로컬 PostgreSQL 계약 수: {contract_count}건")
    
    # 공동수급체 수 확인
    cursor.execute("SELECT COUNT(*) FROM contract_partners")
    partner_count = cursor.fetchone()[0]
    print(f"로컬 PostgreSQL 공동수급체 수: {partner_count}건")
    
    # 데이터 기간 확인
    cursor.execute("SELECT MIN(contract_date), MAX(contract_date) FROM contracts")
    date_range = cursor.fetchone()
    print(f"데이터 기간: {date_range[0]} ~ {date_range[1]}")
    
    # 샘플 데이터 확인
    cursor.execute("SELECT contract_no, contract_name, order_org_name, contract_date FROM contracts ORDER BY contract_date DESC LIMIT 5")
    samples = cursor.fetchall()
    
    print("\n최근 5건:")
    for row in samples:
        print(f"  - {row[0]}: {row[1][:40] if row[1] else 'N/A'}... ({row[3]})")
    
    conn.close()
    
except Exception as e:
    print(f"오류: {e}")
