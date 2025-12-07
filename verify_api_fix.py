import requests
import os
import json
from datetime import datetime, timedelta

# API Key from environment or hardcoded for verification (using the one from debug script)
API_KEY = os.environ.get('G2B_API_KEY') or "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE%2FmQLxG5XmvzCSqdQ%3D%3D" # Reusing key from context

def log(msg):
    print(msg)
    with open('verify_result.txt', 'a', encoding='utf-8') as f:
        f.write(str(msg) + '\n')

def verify_fix():
    if os.path.exists('verify_result.txt'):
        try: os.remove('verify_result.txt')
        except: pass

    log("=== Verifying Bid Search API (as Contract Search Proxy) ===")
    
    # 1. Setup Parameters (Server-side logic simulation)
    end_dt = datetime.now()
    start_dt = end_dt - timedelta(days=30) # 1 Month verification
    
    # Route now adds HHMM
    s_date_hm = start_dt.strftime('%Y%m%d') + "0000"
    e_date_hm = end_dt.strftime('%Y%m%d') + "2359"
    keyword = "영향평가"
    
    url = "http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch"
    
    params = {
        'serviceKey': API_KEY,
        'numOfRows': '10',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': s_date_hm,
        'inqryEndDt': e_date_hm,
        'bidNtceNm': keyword
    }
    
    log(f"Fetching: {url}")
    log(f"Params: {params}")
    
    try:
        response = requests.get(url, params=params)
        log(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            result_code = data.get('response', {}).get('header', {}).get('resultCode')
            log(f"Result Code: {result_code}")
            
            if result_code == '00':
                body = data.get('response', {}).get('body', {})
                items_raw = body.get('items')
                
                log(f"Items Raw Type: {type(items_raw)}")
                
                items = []
                if isinstance(items_raw, list):
                    items = items_raw
                elif isinstance(items_raw, dict) and 'item' in items_raw:
                    items = items_raw['item']
                
                if not isinstance(items, list): items = [items]
                
                log(f"Found {len(items)} items.")
                
                # Check Transformation Logic
                log("\n--- Transformed Data Preview ---")
                for i, item in enumerate(items[:3]):
                    transformed = {
                        'cntrctNm': item.get('bidNtceNm'),
                        'cntrctAmt': item.get('presmptPrce'), # Presumed Price
                        'orderInsttNm': item.get('ntceInsttNm'),
                        'cntrctCnclsDt': item.get('bidNtceDt')[:10] if item.get('bidNtceDt') else ''
                    }
                    log(f"[{i+1}] {transformed['cntrctCnclsDt']} | {transformed['cntrctNm']} | {transformed['orderInsttNm']} | {transformed['cntrctAmt']}")
            else:
                log(f"API Error: {data}")
        else:
            log(f"HTTP Error: {response.text[:200]}")
            
    except Exception as e:
        log(f"Exception: {e}")

if __name__ == "__main__":
    verify_fix()
