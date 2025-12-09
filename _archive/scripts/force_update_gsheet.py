from upload_to_gsheet import GoogleSheetsUploader
import pandas as pd
import glob
import os

def force_update(sheet_name, file_pattern):
    print(f"Forcing update for {sheet_name}...")
    try:
        # 설정 (환경 변수 우선, 없으면 기본값)
        CREDENTIALS_FILE = os.getenv(
            'GOOGLE_CREDENTIALS_FILE',
            'gen-lang-client-0556505482-e847371ea87e.json'
        )
        if not os.path.exists(CREDENTIALS_FILE):
            import glob
            json_files = glob.glob('gen-lang-client-*.json')
            if json_files:
                CREDENTIALS_FILE = json_files[0]
                print(f"[INFO] 발견된 인증 파일 사용: {CREDENTIALS_FILE}")

        SPREADSHEET_ID = os.getenv(
            'SPREADSHEET_ID',
            '1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw'
        )

        uploader = GoogleSheetsUploader(CREDENTIALS_FILE, SPREADSHEET_ID)
        uploader.authenticate() # Ensure authenticated
        
        # Find latest file
        files = glob.glob(file_pattern)
        if not files:
            print(f"No files found for {file_pattern}")
            return
            
        latest_file = max(files, key=os.path.getctime)
        print(f"Using file: {latest_file}")
        
        df = pd.read_csv(latest_file)
        
        # 기존 데이터 유지 (중복 제거로 처리)
        # try:
        #     ws = uploader.spreadsheet.worksheet(sheet_name)
        #     print("Clearing worksheet...")
        #     ws.clear()
        # except Exception as e:
        #     pass
            
        print("Uploading data...")
        uploader.upload_data(df, sheet_name)
        print("Done.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Update Pre-specs
    force_update("나라장터_사전규격", "g2b_pre_specs_*.csv")
    
    # Update Bids
    force_update("나라장터_입찰공고", "g2b_bids_*.csv")
