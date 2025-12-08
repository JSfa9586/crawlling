#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase → 로컬 PostgreSQL 계약 데이터 마이그레이션
로컬에 없는 계약만 가져와서 삽입
"""

import psycopg2
from supabase import create_client
from datetime import datetime
import json

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

def get_local_contract_nos(conn):
    """로컬 DB의 모든 계약번호 조회"""
    cursor = conn.cursor()
    cursor.execute("SELECT contract_no FROM contracts")
    return set(row[0] for row in cursor.fetchall())

def parse_date(date_str):
    """날짜 문자열을 DATE 형식으로 변환"""
    if not date_str:
        return None
    try:
        # 2020-01-02 형식
        if isinstance(date_str, str) and len(date_str) >= 10:
            return date_str[:10]
        return str(date_str)[:10] if date_str else None
    except:
        return None

def parse_corp_list(parsed_corp_list):
    """parsed_corp_list JSON을 contract_partners 형식으로 변환"""
    partners = []
    if not parsed_corp_list:
        return partners
    
    try:
        corp_list = parsed_corp_list if isinstance(parsed_corp_list, list) else json.loads(parsed_corp_list)
        
        for i, corp in enumerate(corp_list):
            partner = {
                'partner_order': i + 1,
                'partner_type': corp.get('corpDiv', ''),
                'joint_type': corp.get('jntcontrDiv', ''),
                'partner_name': corp.get('corpNm', ''),
                'ceo_name': corp.get('ceoNm', ''),
                'nationality': corp.get('nationality', '대한민국'),
                'share_ratio': float(corp.get('share', 0)) if corp.get('share') else None,
                'bizno': corp.get('bizno', '')
            }
            partners.append(partner)
    except Exception as e:
        print(f"    corp_list 파싱 오류: {e}")
    
    return partners

def migrate_contract(conn, supabase_row):
    """계약 하나를 로컬 DB에 삽입"""
    cursor = conn.cursor()
    
    contract_no = supabase_row.get('cntrct_no')
    
    # contracts 테이블 삽입
    cursor.execute("""
        INSERT INTO contracts (
            contract_no, contract_name, product_name, contract_amount,
            total_contract_amount, contract_date, contract_period,
            order_org_name, contractor_name, detail_url, corp_list_raw,
            base_law_name, contract_method
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (contract_no) DO NOTHING
    """, (
        contract_no,
        supabase_row.get('cntrct_nm'),
        supabase_row.get('pub_prcrmnt_clsfc_nm'),  # 품명 대신 분류명 사용
        supabase_row.get('thtm_cntrct_amt'),
        supabase_row.get('tot_cntrct_amt'),
        parse_date(supabase_row.get('cntrct_cncls_date')),
        supabase_row.get('cntrct_prd'),
        supabase_row.get('cntrct_instt_nm'),
        None,  # contractor_name은 partners에서 추출
        supabase_row.get('cntrct_dtl_info_url'),
        supabase_row.get('corp_list'),
        supabase_row.get('base_law_nm'),
        supabase_row.get('cntrct_cncls_mthd_nm')
    ))
    
    # contract_partners 테이블 삽입
    partners = parse_corp_list(supabase_row.get('parsed_corp_list'))
    
    for partner in partners:
        cursor.execute("""
            INSERT INTO contract_partners (
                contract_no, partner_order, partner_type, joint_type,
                partner_name, ceo_name, nationality, share_ratio, bizno
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            contract_no,
            partner['partner_order'],
            partner['partner_type'],
            partner['joint_type'],
            partner['partner_name'],
            partner['ceo_name'],
            partner['nationality'],
            partner['share_ratio'],
            partner['bizno']
        ))
    
    # 주계약업체를 contractor_name으로 설정
    main_partner = next((p for p in partners if '주계약' in p['partner_type']), 
                        partners[0] if partners else None)
    if main_partner:
        cursor.execute("""
            UPDATE contracts SET contractor_name = %s WHERE contract_no = %s
        """, (main_partner['partner_name'], contract_no))
    
    return len(partners)

def main():
    print("=" * 60)
    print("Supabase → 로컬 PostgreSQL 마이그레이션")
    print("=" * 60)
    
    # 연결
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    conn = psycopg2.connect(**DB_CONFIG)
    
    try:
        # 로컬 계약번호 목록
        print("\n1. 로컬 계약번호 목록 조회 중...")
        local_nos = get_local_contract_nos(conn)
        print(f"   로컬 계약 수: {len(local_nos)}건")
        
        # Supabase 전체 데이터 가져오기
        print("\n2. Supabase 데이터 조회 중...")
        offset = 0
        batch_size = 500
        migrated = 0
        partners_added = 0
        skipped = 0
        
        while True:
            response = supabase.table("contracts").select("*").range(offset, offset + batch_size - 1).execute()
            
            if not response.data:
                break
            
            for row in response.data:
                contract_no = row.get('cntrct_no')
                
                if contract_no in local_nos:
                    skipped += 1
                    continue
                
                try:
                    p_count = migrate_contract(conn, row)
                    migrated += 1
                    partners_added += p_count
                    
                    if migrated % 100 == 0:
                        conn.commit()
                        print(f"   진행: {migrated}건 마이그레이션 완료...")
                        
                except Exception as e:
                    print(f"   오류 ({contract_no}): {e}")
                    continue
            
            offset += batch_size
            if len(response.data) < batch_size:
                break
        
        conn.commit()
        
        print("\n" + "=" * 60)
        print("마이그레이션 완료")
        print("=" * 60)
        print(f"- 마이그레이션된 계약: {migrated}건")
        print(f"- 추가된 공동수급체: {partners_added}건")
        print(f"- 스킵된 (중복): {skipped}건")
        
        # 최종 확인
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM contracts")
        total = cursor.fetchone()[0]
        print(f"\n최종 로컬 계약 수: {total}건")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
