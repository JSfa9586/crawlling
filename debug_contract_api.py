
import os
import requests
import json
from datetime import datetime, timedelta

# Load API Key from environment or hardcode for testing if needed (but better to use env)
API_KEY = os.environ.get('G2B_API_KEY')
if not API_KEY:
    print("Error: G2B_API_KEY not found in environment variables.")
    # Attempt to load from .env.local if running locally and simple env var fails
    try:
        with open('dashboard/.env.local', 'r') as f:
            for line in f:
                if line.startswith('G2B_API_KEY='):
                    API_KEY = line.split('=')[1].strip().strip("'").strip('"')
                    break
    except:
        pass

if not API_KEY:
    print("Warning: G2B_API_KEY not found. Please ensure it is set.")

def test_contract_search(keyword):
    base_url = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServcPPSSrch"
    
    # Calculate dates
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30) # Last 1 month
    

    # Attempt 1: inqryDiv=1 (Contract Date) + prdctNm (Product Name)
    print("--- Attempt 1: inqryDiv='1', prdctNm=keyword ---")
    params = {
        'serviceKey': API_KEY,
        'numOfRows': 10,
        'pageNo': 1,
        'type': 'json',
        'inqryDiv': '1', 
        'inqryBgnDt': start_date.strftime('%Y%m%d'),
        'inqryEndDt': end_date.strftime('%Y%m%d'),
        'prdctNm': keyword 
    }
    try_request(base_url, params)

    # Attempt 2: inqryDiv='1' + cntrctNm (Contract Name)
    print("\n--- Attempt 2: inqryDiv='1', cntrctNm=keyword ---")
    params = {
        'serviceKey': API_KEY,
        'numOfRows': 10,
        'pageNo': 1,
        'type': 'json',
        'inqryDiv': '1', 
        'inqryBgnDt': start_date.strftime('%Y%m%d'),
        'inqryEndDt': end_date.strftime('%Y%m%d'),
        'cntrctNm': keyword 
    }
    try_request(base_url, params)

def try_request(url, params):
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if 'response' in data and 'header' in data['response']:
                     header = data['response']['header']
                     if header['resultCode'] != '00':
                         print(f"API Error: {header['resultMsg']}")
                
                print("Response JSON snippet:")
                print(json.dumps(data, indent=2, ensure_ascii=False)[:300])
                
                body = data.get('response', {}).get('body', {})
                count = body.get('totalCount', 0)
                print(f"Found {count} items.")
                
            except json.JSONDecodeError:
                print("Response is not JSON.")
        else:
            print("Error response:", response.status_code)
    except Exception as e:
        print(f"Exception: {e}")


if __name__ == "__main__":
    test_contract_search("폐기물")
