#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase 데이터가 로컬에 이미 있는지 확인
"""

import psycopg2
from supabase import create_client

# Supabase 설정
SUPABASE_URL = "https://mlyvjiywpssnrjqtkmnj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seXZqaXl3cHNzbnJqcXRrbW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU4ODM4NSwiZXhwIjoyMDc3MTY0Mzg1fQ.F_8qEwsTFsYBOkfsEGiNHa2ADhLDk74M5FG8bByzavU"

# 로컬 PostgreSQL 설정
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'g2b_contracts',
    'user': 'postgres',
    'password': 'postgres123'
}

print("=" * 60)
print("Supabase vs 로컬 PostgreSQL 중복 확인")
print("=" * 60)

# Supabase에서 계약번호 목록 가져오기
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 전체 계약번호 목록 가져오기 (페이지네이션 필요)
supabase_contract_nos = set()
offset = 0
batch_size = 1000

while True:
    response = supabase.table("contracts").select("cntrct_no").range(offset, offset + batch_size - 1).execute()
    if not response.data:
        break
    for row in response.data:
        supabase_contract_nos.add(row['cntrct_no'])
    offset += batch_size
    if len(response.data) < batch_size:
        break

print(f"\nSupabase 계약번호 수: {len(supabase_contract_nos)}개")

# 로컬 PostgreSQL에서 동일 계약번호 확인
conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# Supabase 계약번호 중 로컬에 없는 것 찾기
not_in_local = []
in_local = []

for contract_no in supabase_contract_nos:
    cursor.execute("SELECT 1 FROM contracts WHERE contract_no = %s", (contract_no,))
    if cursor.fetchone():
        in_local.append(contract_no)
    else:
        not_in_local.append(contract_no)

print(f"로컬에 이미 존재: {len(in_local)}개")
print(f"로컬에 없음: {len(not_in_local)}개")

if not_in_local:
    print(f"\n로컬에 없는 계약번호 샘플 (최대 10개):")
    for i, no in enumerate(not_in_local[:10], 1):
        # Supabase에서 해당 계약 정보 가져오기
        response = supabase.table("contracts").select("cntrct_nm, cntrct_instt_nm, cntrct_cncls_date").eq("cntrct_no", no).execute()
        if response.data:
            row = response.data[0]
            print(f"  {i}. {no}: {row.get('cntrct_nm', 'N/A')[:40]}...")
            print(f"     발주기관: {row.get('cntrct_instt_nm', 'N/A')}, 체결일: {row.get('cntrct_cncls_date', 'N/A')}")
else:
    print("\n>>> 모든 Supabase 데이터가 로컬에 이미 존재합니다!")

conn.close()

print("\n" + "=" * 60)
print("확인 완료")
print("=" * 60)
