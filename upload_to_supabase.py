#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Supabase 데이터 업로더
- 크롤링 결과(CSV)를 Supabase(PostgreSQL)에 업로드
- upsert를 사용하여 중복 방지
"""

import os
import glob
import pandas as pd
from datetime import datetime
from supabase import create_client, Client
import pytz

# 한국 시간대 설정
KST = pytz.timezone('Asia/Seoul')

def get_supabase_client() -> Client:
    """Supabase 클라이언트 생성"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL 및 SUPABASE_KEY(또는 SUPABASE_SERVICE_ROLE_KEY) 환경변수가 필요합니다.")
        
    return create_client(url, key)

def upload_pre_specs(csv_file: str, client: Client):
    """사전규격 데이터 업로드"""
    try:
        df = pd.read_csv(csv_file, encoding='utf-8-sig')
        if df.empty:
            print(f"[INFO] {csv_file} 파일이 비어있습니다.")
            return

        # NaN 처리 (JSON 오류 방지)
        df = df.fillna('')
        
        print(f"[INFO] 사전규격 {len(df)}건 처리 중...")
        
        records = []
        for _, row in df.iterrows():
            # CSV 컬럼 -> DB 컬럼 매핑
            reg_date = row.get('등록일', None)
            if reg_date and str(reg_date).lower() != 'nan':
                reg_date = str(reg_date).strip()
                # 날짜만 있으면 시간 추가, 시간 있으면 그대로
                if len(reg_date) == 10:
                    reg_date += " 00:00:00+09"
                elif len(reg_date) > 10 and '+' not in reg_date:
                    reg_date += "+09"
            else:
                reg_date = None
            
            end_date = row.get('규격공개종료일', '')
            if end_date and str(end_date).lower() != 'nan':
                end_date = str(end_date).strip()
                if len(end_date) == 10:
                    end_date += " 23:59:59+09"
                elif len(end_date) > 10 and '+' not in end_date:
                    end_date += "+09"
            else:
                end_date = None

            record = {
                'reg_no': str(row.get('등록번호', '')),
                'category': row.get('카테고리', ''),
                'title': row.get('공고명', ''),
                'publisher': row.get('발주기관', ''),
                'demand_org': row.get('수요기관', ''),
                'budget': str(row.get('배정예산', '')),
                'reg_date': reg_date,
                'end_date': end_date,
                'status': row.get('상태', '신규'),
                'link': row.get('링크', '')
            }
            # 필수 키 확인
            if record['reg_no']:
                records.append(record)

        if records:
            # 배치 업로드 (upsert)
            data = client.table("g2b_pre_specs").upsert(records).execute()
            print(f"[OK] 사전규격 {len(records)}건 업로드 완료")

    except Exception as e:
        print(f"[ERROR] 사전규격 업로드 실패: {e}")

def upload_bids(csv_file: str, client: Client):
    """입찰공고 데이터 업로드"""
    try:
        df = pd.read_csv(csv_file, encoding='utf-8-sig')
        if df.empty:
            print(f"[INFO] {csv_file} 파일이 비어있습니다.")
            return

        # NaN 처리
        df = df.fillna('')
        
        print(f"[INFO] 입찰공고 {len(df)}건 처리 중...")
        
        records = []
        for _, row in df.iterrows():
            notice_date = row.get('공고일', None)
            if notice_date and str(notice_date).lower() != 'nan':
                notice_date = str(notice_date).strip()
                if len(notice_date) == 10:
                    notice_date += " 00:00:00+09"
                elif len(notice_date) > 10 and '+' not in notice_date:
                    notice_date += "+09"
            else:
                notice_date = None
            
            # 입찰마감 날짜 처리
            bid_end = row.get('입찰마감', '')
            if bid_end and str(bid_end).lower() != 'nan':
                bid_end = str(bid_end).strip()
                if len(bid_end) > 10 and '+' not in bid_end:
                    bid_end += "+09"
            else:
                bid_end = None
            
            # 개찰일 날짜 처리
            open_date = row.get('개찰일', '')
            if not open_date or open_date == '' or str(open_date).lower() == 'nan':
                 open_date = None
            elif len(str(open_date)) > 10 and '+' not in str(open_date):
                 open_date = str(open_date).strip() + "+09"

            record = {
                'bid_no': str(row.get('공고번호', '')),
                'bid_seq': str(row.get('공고차수', '00')),
                'category': row.get('카테고리', ''),
                'title': row.get('공고명', ''),
                'publisher': row.get('발주기관', ''),
                'demand_org': row.get('수요기관', ''),
                'est_price': str(row.get('추정가격', '')),
                'base_price': str(row.get('기초금액', '')),
                'method': row.get('입찰방식', ''),
                'notice_date': notice_date,
                'bid_end_date': bid_end,
                'open_date': open_date,
                'status': row.get('상태', '신규'),
                'link': row.get('링크', '')
            }
            
            if record['bid_no']:
                records.append(record)

        if records:
            data = client.table("g2b_bids").upsert(records).execute()
            print(f"[OK] 입찰공고 {len(records)}건 업로드 완료")

    except Exception as e:
        print(f"[ERROR] 입찰공고 업로드 실패: {e}")

def update_crawler_status(client: Client, status: str = 'success'):
    """크롤러 실행 상태 업데이트"""
    try:
        now = datetime.now(KST).isoformat()
        
        data = {
            'service_name': 'g2b_crawler',
            'last_run_at': now,
            'status': status,
            'updated_at': now
        }
        
        # Upsert operation
        client.table('g2b_crawler_status').upsert(data, on_conflict='service_name').execute()
        print(f"[INFO] 크롤러 상태 업데이트 완료: {now}")
        
    except Exception as e:
        print(f"[ERROR] 상태 업데이트 실패: {e}")

def main():
    try:
        client = get_supabase_client()
        print("[INFO] Supabase 클라이언트 연결 성공")
        
        # 1. 사전규격 파일 찾기
        pre_spec_files = glob.glob('g2b_pre_specs_*.csv')
        if pre_spec_files:
            latest_pre = max(pre_spec_files, key=os.path.getmtime)
            upload_pre_specs(latest_pre, client)
        
        # 2. 입찰공고 파일 찾기
        bid_files = glob.glob('g2b_bids_*.csv')
        if bid_files:
            latest_bid = max(bid_files, key=os.path.getmtime)
            upload_bids(latest_bid, client)
            
        # 3. 실행 상태 업데이트
        update_crawler_status(client, 'success')
            
    except Exception as e:
        print(f"[FATAL] 스크립트 실행 중 오류: {e}")
        exit(1)

if __name__ == "__main__":
    main()
