
import os
import requests
import json
from datetime import datetime, timedelta

API_KEY = os.environ.get('G2B_API_KEY')
if not API_KEY:
    try:
        with open('dashboard/.env.local', 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('G2B_API_KEY='):
                    API_KEY = line.split('=')[1].strip().strip("'").strip('"')
                    break
    except:
        pass

def try_search(keyword, start_date, end_date):
    log(f"\n=== Searching for '{keyword}' ({start_date} ~ {end_date}) ===")
    
    # Common common_params
    common_params = {
        'serviceKey': API_KEY,
        'numOfRows': 5,
        'pageNo': 1,
        'type': 'json',
    }
    
    # Scenario 1: Standard API (getCntrctInfoListServc) with inqryDiv='1' (Date) + cntrctNm 
    log("\n[Scenario 1] Standard API, inqryDiv='1' (Date), cntrctNm param")
    url = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
    params = common_params.copy()
    params.update({
        'inqryDiv': '1',
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'cntrctNm': keyword
    })
    run_request(url, params)

    # Scenario 4: Standard API, inqryDiv='6' (Item Name)
    log("\n[Scenario 4] Standard API, inqryDiv='6' (Item Name), prdctNm param")
    params = common_params.copy()
    params.update({
        'inqryDiv': '6',
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'prdctNm': keyword 
    })
    run_request(url, params)
    
    # Scenario 5: Standard API, inqryDiv='6' (Item Name), cntrctNm param
    log("\n[Scenario 5] Standard API, inqryDiv='6' (Item Name), cntrctNm param")
    params = common_params.copy()
    params.update({
        'inqryDiv': '6',
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'cntrctNm': keyword
    })
    run_request(url, params)

    # Scenario 6: PPSSrch API
    log("\n[Scenario 6] PPSSrch API, default params")
    url_pps = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServcPPSSrch"
    params = common_params.copy()
    params.update({
        'inqryDiv': '1',
        'inqryBgnDt': start_date,
        'inqryEndDt': end_date,
        'cntrctNm': keyword
    })
    run_request(url_pps, params)

def log(msg):
    try:
        with open('debug_result.txt', 'a', encoding='utf-8') as f:
            f.write(str(msg) + '\n')
    except:
        pass

def run_request(url, params):
    try:
        response = requests.get(url, params=params)
        log(f"URL: {response.url}")
        log(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                # Log first 200 chars to check if it's XML
                log(f"Raw Body: {response.text[:200]}")
                
                data = response.json()
                if 'response' in data:
                    header = data['response'].get('header', {})
                    result_code = header.get('resultCode')
                    result_msg = header.get('resultMsg')
                    log(f"Result: {result_code} - {result_msg}")
                    
                    if result_code == '00':
                        body = data['response'].get('body', {})
                        count = body.get('totalCount', 0)
                        log(f"Items Found: {count}")
                        if int(count) > 0:
                            items = body.get('items', {}).get('item', [])
                            if not isinstance(items, list): items = [items]
                            for item in items[:2]:
                                log(f"  > [{item.get('cntrctCnclsDt')}] {item.get('cntrctNm')} ({item.get('cntrctAmt')}원)")
            except json.JSONDecodeError:
                log("JSON Decode Error. Response might be XML or HTML error.")
            except Exception as e:
                log(f"Parse/Logic Error: {e}")
        else:
            log(f"HTTP Error: {response.status_code}")
            log(f"Response: {response.text[:200]}")
            
    except Exception as e:
        log(f"Request Error: {e}")

if __name__ == "__main__":
    # Remove old log
    if os.path.exists('debug_result.txt'):
        try:
            os.remove('debug_result.txt')
        except:
            pass

    # Dates
    end_dt = datetime.now()
    start_dt_short = end_dt - timedelta(days=5) # 5 Days (Very short)
    
    # Formats: YYYYMMDD and YYYYMMDDHHMM
    s_date_short_hm = start_dt_short.strftime('%Y%m%d') + "0000"
    e_date_short_hm = end_dt.strftime('%Y%m%d') + "2359"

    common_params = {
        'serviceKey': API_KEY,
        'numOfRows': 5,
        'pageNo': 1,
        'type': 'json',
    }
    
    # Test D: Standard API, inqryDiv='6' (Item Name), 5 Day Range, prdctNm
    log(f"\n[Test D] Standard API, inqryDiv='6', 5 Day Range, prdctNm")
    url_standard = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
    params = common_params.copy()
    params.update({
        'inqryDiv': '6', 
        'inqryBgnDt': s_date_short_hm,
        'inqryEndDt': e_date_short_hm,
        'prdctNm': "영향평가" 
    })
    run_request(url_standard, params)
    
    # Test E: PPSSrch API, inqryDiv='1', YYYYMMDDHHMM, cntrctNm
    log(f"\n[Test E] PPSSrch API, inqryDiv='1', YYYYMMDDHHMM, cntrctNm")
    url_pps = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServcPPSSrch"
    params = common_params.copy()
    params.update({
        'inqryDiv': '1',
        'inqryBgnDt': s_date_short_hm,
        'inqryEndDt': e_date_short_hm,
        'cntrctNm': "영향평가"
    })
    run_request(url_pps, params)
    
    # Test G: Bid Search API (PPSSrch) with keyword
    log(f"\n[Test G] Bid Search API, inqryDiv='1', Bid Name Search")
    url_bid = "http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch"
    params = common_params.copy()
    params.update({
        'inqryDiv': '1',
        'inqryBgnDt': s_date_short_hm,
        'inqryEndDt': e_date_short_hm,
        'bidNtceNm': "영향평가" # Bid Name
    })
    run_request(url_bid, params)
    
    # Test I: Contract PPSSrch API, inqryDiv='1', bidNtceNm params (Maybe it uses Bid Name?)
    log(f"\n[Test I] Contract PPSSrch API, inqryDiv='1', bidNtceNm")
    url_pps = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServcPPSSrch"
    params = common_params.copy()
    params.update({
        'inqryDiv': '1', 
        'inqryBgnDt': s_date_short_hm,
        'inqryEndDt': e_date_short_hm,
        'bidNtceNm': "영향평가" 
    })
    run_request(url_pps, params)
    
    # Test J: Standard Contract API, inqryDiv='6', 1 Day Range
    log(f"\n[Test J] Standard Contract API, inqryDiv='6', 1 Day Range")
    start_dt_1day = end_dt - timedelta(days=1)
    s_date_1day = start_dt_1day.strftime('%Y%m%d') + "0000"
    params = common_params.copy()
    params.update({
        'inqryDiv': '6', 
        'inqryBgnDt': s_date_1day,
        'inqryEndDt': e_date_short_hm, # 1 day diff roughly
        'prdctNm': "영향평가" 
    })
    run_request(url_standard, params)
    
    # Test K: Contract PPSSrch API with 'prdctNm'? (Product name)
    log(f"\n[Test K] Contract PPSSrch API, inqryDiv='1', prdctNm")
    params = common_params.copy()
    params.update({
        'inqryDiv': '1', 
        'inqryBgnDt': s_date_short_hm,
        'inqryEndDt': e_date_short_hm,
        'prdctNm': "영향평가" 
    })
    run_request(url_pps, params)








