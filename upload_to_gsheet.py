#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
구글 시트 업로드 모듈
- 크롤링 결과를 구글 시트에 업로드
- 중복 제거 기능
"""

import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
from datetime import datetime
import pytz
import os


class GoogleSheetsUploader:
    """구글 시트 업로더"""

    def __init__(self, credentials_file, spreadsheet_id):
        """
        초기화

        Args:
            credentials_file: 서비스 계정 JSON 키 파일 경로
            spreadsheet_id: 구글 시트 ID
        """
        self.credentials_file = credentials_file
        self.spreadsheet_id = spreadsheet_id
        self.client = None
        self.spreadsheet = None

    def authenticate(self):
        """구글 시트 인증"""
        try:
            # 인증 범위 설정
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]

            # 1. 환경 변수(GOOGLE_CREDENTIALS_JSON)에서 직접 로드 시도
            json_content = os.getenv('GOOGLE_CREDENTIALS_JSON')
            if json_content:
                import json
                info = json.loads(json_content)
                credentials = Credentials.from_service_account_info(info, scopes=scopes)
                print("[INFO] 환경 변수(GOOGLE_CREDENTIALS_JSON)에서 인증 정보 로드")
            
            # 2. 파일에서 로드 시도
            elif os.path.exists(self.credentials_file):
                credentials = Credentials.from_service_account_file(
                    self.credentials_file,
                    scopes=scopes
                )
                print(f"[INFO] 파일({self.credentials_file})에서 인증 정보 로드")
            
            else:
                print(f"[ERROR] 인증 파일을 찾을 수 없고 GOOGLE_CREDENTIALS_JSON 환경 변수도 없습니다.")
                return False

            # gspread 클라이언트 생성
            self.client = gspread.authorize(credentials)

            # 스프레드시트 열기
            self.spreadsheet = self.client.open_by_key(self.spreadsheet_id)

            print(f"[OK] 구글 시트 인증 성공")
            return True

        except Exception as e:
            print(f"[ERROR] 구글 시트 인증 실패: {e}")
            return False

    def get_existing_data(self, worksheet_name='크롤링 결과'):
        """
        기존 시트 데이터 가져오기

        Args:
            worksheet_name: 워크시트 이름

        Returns:
            DataFrame: 기존 데이터
        """
        try:
            # 워크시트 가져오기 (없으면 생성)
            try:
                worksheet = self.spreadsheet.worksheet(worksheet_name)
            except gspread.exceptions.WorksheetNotFound:
                worksheet = self.spreadsheet.add_worksheet(
                    title=worksheet_name,
                    rows=1000,
                    cols=10
                )
                # 헤더 추가
                headers = ['기관구분', '기관명', '게시판', '제목', '작성일', '링크', '수집일시']
                worksheet.append_row(headers)
                return pd.DataFrame(columns=headers)

            # 모든 데이터 가져오기
            all_values = worksheet.get_all_values()

            if len(all_values) <= 1:  # 헤더만 있거나 비어있음
                return pd.DataFrame(columns=all_values[0] if all_values else [])

            # DataFrame 생성
            df = pd.DataFrame(all_values[1:], columns=all_values[0])
            print(f"[INFO] 기존 데이터 {len(df)}건 로드")

            return df

        except Exception as e:
            print(f"[WARN] 기존 데이터 로드 실패: {e}")
            return pd.DataFrame()

    def update_execution_time(self, worksheet_name='Metadata'):
        """
        크롤링 실행 시간 기록

        Args:
            worksheet_name: 메타데이터 워크시트 이름
        """
        try:
            # 워크시트 가져오기 (없으면 생성)
            try:
                worksheet = self.spreadsheet.worksheet(worksheet_name)
            except gspread.exceptions.WorksheetNotFound:
                worksheet = self.spreadsheet.add_worksheet(
                    title=worksheet_name,
                    rows=10,
                    cols=2
                )
                # 헤더 추가
                worksheet.append_row(['키', '값'])

            # 현재 시간 (KST)
            seoul_tz = pytz.timezone('Asia/Seoul')
            current_time = datetime.now(seoul_tz).strftime('%Y-%m-%d %H:%M:%S')

            # 기존 데이터 확인
            all_values = worksheet.get_all_values()
            last_execution_row = None

            for i, row in enumerate(all_values):
                if len(row) >= 1 and row[0] == '마지막_크롤링_실행시간':
                    last_execution_row = i + 1  # 1-based index
                    break

            # 업데이트 또는 추가
            if last_execution_row:
                worksheet.update_cell(last_execution_row, 2, current_time)
            else:
                worksheet.append_row(['마지막_크롤링_실행시간', current_time])

            print(f"[INFO] 크롤링 실행 시간 기록: {current_time}")

        except Exception as e:
            print(f"[WARN] 실행 시간 기록 실패: {e}")

    def upload_data(self, df, worksheet_name='크롤링 결과'):
        """
        데이터를 구글 시트에 업로드 (중복 제거)

        Args:
            df: 업로드할 DataFrame
            worksheet_name: 워크시트 이름

        Returns:
            tuple: (추가된 건수, 중복 건수)
        """
        try:
            # 워크시트 가져오기
            try:
                worksheet = self.spreadsheet.worksheet(worksheet_name)
            except gspread.exceptions.WorksheetNotFound:
                worksheet = self.spreadsheet.add_worksheet(
                    title=worksheet_name,
                    rows=1000,
                    cols=10
                )
                # 헤더 추가
                headers = list(df.columns)
                worksheet.append_row(headers)

            # 기존 데이터 가져오기
            existing_df = self.get_existing_data(worksheet_name)

            # 수집일시 추가
            seoul_tz = pytz.timezone('Asia/Seoul')
            current_time = datetime.now(seoul_tz).strftime('%Y-%m-%d %H:%M:%S')
            df['수집일시'] = current_time

            # NaN 값을 빈 문자열로 변환 (JSON 직렬화 오류 방지)
            df = df.fillna('')

            # 중복 확인 (링크 기준)
            if not existing_df.empty and '링크' in existing_df.columns:
                existing_links = set(existing_df['링크'].tolist())
                new_df = df[~df['링크'].isin(existing_links)].copy()
                duplicate_count = len(df) - len(new_df)
            else:
                new_df = df.copy()
                duplicate_count = 0
            
            if new_df.empty:
                print(f"[INFO] 새로운 데이터가 없습니다 (중복: {duplicate_count}건)")
                return 0, duplicate_count
            
            # 데이터 추가
            # DataFrame을 리스트로 변환
            values = new_df.values.tolist()

            # 시트가 비어있거나 헤더가 없는 경우 헤더 추가
            if existing_df.empty or len(existing_df.columns) == 0:
                print("[INFO] 시트가 비어있어 헤더를 먼저 추가합니다.")
                headers = list(df.columns)
                # 헤더가 이미 있는지 확인 (첫 번째 행 읽기)
                first_row = worksheet.row_values(1)
                if not first_row:
                    worksheet.append_row(headers)

            # 배치로 추가 (더 빠름)
            worksheet.append_rows(values)

            # 열 너비 자동 조정
            self.auto_resize_columns(worksheet)

            print(f"[OK] 구글 시트 업로드 완료")
            print(f"   - 새로 추가: {len(new_df)}건")
            print(f"   - 중복 제외: {duplicate_count}건")
            print(f"   - 전체: {len(existing_df) + len(new_df)}건")

            return len(new_df), duplicate_count

        except Exception as e:
            print(f"[ERROR] 구글 시트 업로드 실패: {e}")
            return 0, 0

    def auto_resize_columns(self, worksheet):
        """
        열 너비 자동 조정 (내용에 맞게)

        Args:
            worksheet: 워크시트 객체
        """
        try:
            # 각 열의 최대 너비 계산
            all_values = worksheet.get_all_values()
            if not all_values:
                return

            # 열별 최대 글자 수 계산
            column_widths = []
            num_columns = len(all_values[0])

            for col_idx in range(num_columns):
                max_length = 0
                for row in all_values:
                    if col_idx < len(row):
                        # 한글은 2글자로 계산 (더 정확한 너비)
                        cell_length = sum(2 if ord(c) > 127 else 1 for c in str(row[col_idx]))
                        max_length = max(max_length, cell_length)

                # 최소 너비 100, 최대 너비 600 픽셀
                # 글자당 약 7픽셀로 계산
                width = min(max(max_length * 7, 100), 600)
                column_widths.append(width)

            # 각 열의 너비 설정
            requests = []
            for i, width in enumerate(column_widths):
                requests.append({
                    'updateDimensionProperties': {
                        'range': {
                            'sheetId': worksheet.id,
                            'dimension': 'COLUMNS',
                            'startIndex': i,
                            'endIndex': i + 1
                        },
                        'properties': {
                            'pixelSize': width
                        },
                        'fields': 'pixelSize'
                    }
                })

            # 배치로 적용
            if requests:
                self.spreadsheet.batch_update({'requests': requests})
                print(f"[INFO] 열 너비 자동 조정 완료")

        except Exception as e:
            print(f"[WARN] 열 너비 조정 실패: {e}")

    def clear_sheet(self, worksheet_name='크롤링 결과'):
        """
        워크시트 내용 지우기 (헤더 제외)

        Args:
            worksheet_name: 워크시트 이름
        """
        try:
            worksheet = self.spreadsheet.worksheet(worksheet_name)
            worksheet.clear()
            print(f"[OK] 워크시트 '{worksheet_name}' 초기화 완료")

        except Exception as e:
            print(f"[ERROR] 워크시트 초기화 실패: {e}")


def main():
    """테스트 메인 함수"""
    # 설정 (환경 변수 우선, 없으면 기본값)
    CREDENTIALS_FILE = os.getenv(
        'GOOGLE_CREDENTIALS_FILE',
        'gen-lang-client-0556505482-e847371ea87e.json'  # GitHub Actions 환경용
    )
    # 로컬 환경 체크: 기본 파일이 없으면 현재 폴더에서 검색
    if not os.path.exists(CREDENTIALS_FILE):
        import glob
        json_files = glob.glob('gen-lang-client-*.json')
        if json_files:
            CREDENTIALS_FILE = json_files[0]
            print(f"[INFO] 발견된 인증 파일 사용: {CREDENTIALS_FILE}")
        else:
            # 백업 경로 체크 (기존 코드 유지)
            CREDENTIALS_FILE = r'C:\AI\251118\gen-lang-client-0556505482-e847371ea87e.json'

    SPREADSHEET_ID = os.getenv(
        'SPREADSHEET_ID',
        '1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw'
    )

    # 업로더 생성
    uploader = GoogleSheetsUploader(CREDENTIALS_FILE, SPREADSHEET_ID)

    # 인증
    if not uploader.authenticate():
        return

    # 처리할 파일 패턴 및 타겟 시트 정의
    targets = [
        {
            'pattern': 'marine_ministry_posts_*.csv',
            'sheet_name': '크롤링 결과'
        },
        {
            'pattern': 'data/eiaa_boards_*.csv',
            'sheet_name': '관련협회'
        },
        {
            'pattern': 'moleg_data.csv',
            'sheet_name': '관련법령'
        },
        {
            'pattern': 'ai_news_*.csv',
            'sheet_name': 'AI소식'
        },
        {
            'pattern': 'g2b_combined_*.csv',
            'sheet_name': '나라장터'
        },
        {
            'pattern': 'g2b_pre_specs_*.csv',
            'sheet_name': '나라장터_사전규격'
        },
        {
            'pattern': 'g2b_bids_*.csv',
            'sheet_name': '나라장터_입찰공고'
        }
    ]


    import glob

    for target in targets:
        pattern = target['pattern']
        sheet_name = target['sheet_name']
        
        print(f"\n[{sheet_name}] 데이터 처리 시작 ({pattern})...")

        # 크롤링 결과 CSV 파일 읽기 (가장 최신 파일 자동 검색)
        csv_files = glob.glob(pattern)
        if not csv_files:
            print(f"[INFO] {pattern} 패턴의 CSV 파일을 찾을 수 없습니다. 건너뜁니다.")
            continue

        # 가장 최신 파일 선택 (수정 시간 기준)
        csv_file = max(csv_files, key=os.path.getmtime)
        print(f"[INFO] CSV 파일 발견: {csv_file}")

        try:
            df = pd.read_csv(csv_file, encoding='utf-8-sig')
            print(f"[INFO] CSV 파일 로드: {len(df)}건")

            # 크롤링 실행 시간 기록 (항상 실행)
            uploader.update_execution_time()

            # 구글 시트에 업로드
            added, duplicated = uploader.upload_data(df, worksheet_name=sheet_name)

            print(f"업로드 완료! (시트: {sheet_name})")
            print(f"새로 추가: {added}건")
            print(f"중복 제외: {duplicated}건")

        except Exception as e:
            print(f"[ERROR] 파일 처리 오류: {e}")


if __name__ == "__main__":
    main()
