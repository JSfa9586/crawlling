#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
구글 시트 열 너비 자동 조정 스크립트
"""

from upload_to_gsheet import GoogleSheetsUploader

def main():
    # 설정
    CREDENTIALS_FILE = r'C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json'
    SPREADSHEET_ID = '1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw'

    # 업로더 생성
    uploader = GoogleSheetsUploader(CREDENTIALS_FILE, SPREADSHEET_ID)

    # 인증
    if not uploader.authenticate():
        return

    # 워크시트 가져오기
    worksheet = uploader.spreadsheet.worksheet('크롤링 결과')

    print("\n열 너비 자동 조정 시작...")
    uploader.auto_resize_columns(worksheet)
    print("완료!")

if __name__ == "__main__":
    main()
