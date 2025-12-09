#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase 계약 데이터 확인 스크립트
"""

from supabase import create_client

SUPABASE_URL = "https://mlyvjiywpssnrjqtkmnj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seXZqaXl3cHNzbnJqcXRrbW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU4ODM4NSwiZXhwIjoyMDc3MTY0Mzg1fQ.F_8qEwsTFsYBOkfsEGiNHa2ADhLDk74M5FG8bByzavU"

client = create_client(SUPABASE_URL, SUPABASE_KEY)

output_lines = []

def log(text):
    print(text)
    output_lines.append(text)

# contracts 테이블 확인
log("=" * 70)
log("contracts 테이블 확인")
log("=" * 70)

try:
    # 전체 개수 확인
    response = client.table("contracts").select("*", count="exact").limit(10).execute()
    total_count = response.count if hasattr(response, 'count') and response.count else len(response.data)
    log(f"\n총 데이터 수: {total_count}건\n")
    
    if response.data:
        log("컬럼 목록:")
        columns = list(response.data[0].keys())
        for col in columns:
            log(f"  - {col}")
        
        log("\n\n샘플 데이터 (10건):")
        log("-" * 70)
        for i, row in enumerate(response.data, 1):
            log(f"\n[{i}]")
            for key, value in row.items():
                if value:
                    # 긴 값은 잘라서 표시
                    str_val = str(value)
                    if len(str_val) > 80:
                        str_val = str_val[:80] + "..."
                    log(f"    {key}: {str_val}")
except Exception as e:
    log(f"contracts ERROR: {e}")

log("\n\n" + "=" * 70)
log("완료")
log("=" * 70)

# 파일로 저장
with open('supabase_contracts_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print("\n\n결과가 supabase_contracts_report.txt에 저장되었습니다.")
