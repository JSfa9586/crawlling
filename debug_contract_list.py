
import os
import requests
import json
from datetime import datetime, timedelta

API_KEY = os.environ.get('G2B_API_KEY')
if not API_KEY:
    try:
        with open('dashboard/.env.local', 'r') as f:
            for line in f:
                if line.startswith('G2B_API_KEY='):
                    API_KEY = line.split('=')[1].strip().strip("'").strip('"')
                    break
    except:
        pass

def try_request(url, params):
    print(f"Testing URL: {url.split('/')[-1]}")
    try:
        response = requests.get(url, params=params)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if 'response' in data and 'header' in data['response']:
                     header = data['response']['header']
                     print(f"ResultCode: {header.get('resultCode')}")
                     print(f"ResultMsg: {header.get('resultMsg')}")
                
                body = data.get('response', {}).get('body', {})
                count = body.get('totalCount', 0)
                print(f"Total Count: {count}")
                if count > 0:
                    print("First item sample:")
                    print(json.dumps(body.get('items', {}), indent=2, ensure_ascii=False)[:300])
                
            except json.JSONDecodeError:
                print("Not JSON")
        else:
            print("HTTP Error")
    except Exception as e:
        print(f"Ex: {e}")

if __name__ == "__main__":
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Test 1: List API
    base_url = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
    params = {
        'serviceKey': API_KEY,
        'numOfRows': 5,
        'pageNo': 1,
        'type': 'json',
        'inqryDiv': '1', # 1: Contract Date
        'inqryBgnDt': start_date.strftime('%Y%m%d'),
        'inqryEndDt': end_date.strftime('%Y%m%d'),
    }
    try_request(base_url, params)
