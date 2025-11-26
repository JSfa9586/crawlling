#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Sheets에서 제주특별자치도 중복 데이터 제거 스크립트
- curPage 파라미터로 인한 중복 제거
"""

import os
import re
import pandas as pd
from google.oauth2.service_account import Credentials
import gspread

def normalize_jeju_url(url):
    """제주도청 URL 정규화 (curPage 파라미터 제거)"""
    if not url or 'jeju.go.kr' not in url:
        return url

    if 'curPage=' in url:
        # curPage=숫자& 또는 curPage=숫자로 끝나는 경우 제거
        url = re.sub(r'curPage=\d+&', '', url)
        url = re.sub(r'[?&]curPage=\d+', '', url)
        # 남은 파라미터가 &로 시작하면 ?로 변경
        url = re.sub(r'\?&', '?', url)

    return url

def remove_duplicates():
    """Google Sheets에서 제주도 중복 데이터 제거"""
    # 인증 파일 경로
    credentials_file = r'C:\AI\251118\gen-lang-client-0556505482-05857c3f47c2.json'
    spreadsheet_id = '1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw'

    if not os.path.exists(credentials_file):
        print(f"[ERROR] 인증 파일을 찾을 수 없습니다: {credentials_file}")
        return

    # 인증
    print("[INFO] Google Sheets 인증 중...")
    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]

    credentials = Credentials.from_service_account_file(credentials_file, scopes=scopes)
    client = gspread.authorize(credentials)
    spreadsheet = client.open_by_key(spreadsheet_id)

    # 데이터 가져오기
    print("[INFO] 기존 데이터 로드 중...")
    worksheet = spreadsheet.worksheet('크롤링 결과')
    data = worksheet.get_all_values()

    if len(data) <= 1:
        print("[INFO] 데이터가 없습니다.")
        return

    # 헤더 확인 및 수정
    headers = data[0]
    print(f"[INFO] 원본 헤더: {headers}")
    print(f"[INFO] 컬럼 개수: {len(headers)}")

    # 올바른 헤더로 수정 (중복 제거)
    correct_headers = ['기관구분', '기관명', '게시판', '제목', '작성일', '링크', '수집일시']

    # DataFrame 생성 (데이터의 각 행에서 처음 7개 컬럼만 사용)
    cleaned_data = [row[:7] for row in data[1:]]
    df = pd.DataFrame(cleaned_data, columns=correct_headers)

    original_count = len(df)

    print(f"[INFO] 전체 데이터: {original_count}건")

    # 제주특별자치도 데이터만 필터링
    jeju_mask = df.iloc[:, 1] == '제주특별자치도'  # 기관명이 두 번째 컬럼
    jeju_df = df[jeju_mask]
    non_jeju_df = df[~jeju_mask]

    print(f"[INFO] 제주특별자치도 데이터: {len(jeju_df)}건")
    print(f"[INFO] 기타 데이터: {len(non_jeju_df)}건")

    if len(jeju_df) == 0:
        print("[INFO] 제주특별자치도 데이터가 없습니다.")
        return

    # 링크 정규화
    jeju_df_copy = jeju_df.copy()
    jeju_df_copy['정규화_링크'] = jeju_df_copy['링크'].apply(normalize_jeju_url)

    # 중복 제거 (정규화된 링크 기준, 첫 번째 항목만 유지)
    jeju_df_unique = jeju_df_copy.drop_duplicates(subset=['정규화_링크'], keep='first')

    # 정규화_링크 컬럼 제거
    jeju_df_unique = jeju_df_unique.drop(columns=['정규화_링크'])

    removed_count = len(jeju_df) - len(jeju_df_unique)

    print(f"[INFO] 제거된 중복 데이터: {removed_count}건")

    if removed_count == 0:
        print("[INFO] 중복 데이터가 없습니다.")
        return

    # 전체 데이터 재구성 (기타 데이터 + 중복 제거된 제주 데이터)
    df_cleaned = pd.concat([non_jeju_df, jeju_df_unique], ignore_index=True)

    # 정렬 (기존 순서 유지를 위해 기관구분, 기관명, 게시판, 작성일 기준)
    if '기관구분' in df_cleaned.columns and '작성일' in df_cleaned.columns:
        df_cleaned = df_cleaned.sort_values(
            ['기관구분', '기관명', '게시판', '작성일'],
            ascending=[True, True, True, False]
        )

    print(f"[INFO] 정리 후 전체 데이터: {len(df_cleaned)}건")

    # 시트 초기화 및 재업로드
    print("[INFO] 시트 업데이트 중...")

    # 전체 시트 초기화
    worksheet.clear()

    # 헤더 추가
    worksheet.append_row(correct_headers)

    # 새 데이터 추가
    values = df_cleaned.values.tolist()
    if values:
        worksheet.append_rows(values)

    print()
    print("="*60)
    print("[SUCCESS] 중복 데이터 제거 완료!")
    print(f"   - 원본 데이터: {original_count}건")
    print(f"   - 제거된 중복: {removed_count}건")
    print(f"   - 최종 데이터: {len(df_cleaned)}건")
    print("="*60)

if __name__ == "__main__":
    try:
        remove_duplicates()
    except Exception as e:
        print(f"[ERROR] 오류 발생: {e}")
        import traceback
        traceback.print_exc()
