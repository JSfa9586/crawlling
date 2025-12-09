
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
    start_dt_short = end_dt - timedelta(days=30) # 30 Days (Extended)
    
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
    
    try:
        response = requests.get(url_bid, params=params)
        log(f"URL: {response.url}")
        
        if response.status_code == 200:
            data = response.json()
            body = data.get('response', {}).get('body', {})
            items = body.get('items')
            
            final_list = []
            if isinstance(items, list):
                final_list = items
            elif isinstance(items, dict):
                item_val = items.get('item')
                if isinstance(item_val, list):
                    final_list = item_val
                elif item_val:
                    final_list = [item_val]
            
            if len(final_list) > 0:
                first_item = final_list[0]
                log("\n[First Bid Item Keys & Values]:")
                for k, v in first_item.items():
                    log(f"  {k}: {v}")
            else:
                log("No items found.")
                
    except Exception as e:
        log(f"Error in Test G: {e}")
    
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

    # Test L: Bridge Test (Bid Search -> Contract Search by BidNo)
    log(f"\n[Test L] Bridge Test: Find '신평농공단지' Bid -> Query Contract API with BidNo")
    # 1. Search Bid
    url_bid = "http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch"
    params = common_params.copy()
    params.update({
        'inqryDiv': '1',
        'inqryBgnDt': s_date_short_hm,
        'inqryEndDt': e_date_short_hm,
        'bidNtceNm': "신평농공단지"
    })
    
    bid_no = None
    try:
        resp = requests.get(url_bid, params=params)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('response', {}).get('body', {}).get('items')
            if items:
                # Handle items being dict or list
                item_list = []
                if isinstance(items, list): 
                    item_list = items
                elif isinstance(items, dict):
                     val = items.get('item')
                     if isinstance(val, list): item_list = val
                     elif val: item_list = [val]
                
                if len(item_list) > 0:
                    bid_no = item_list[0].get('bidNtceNo')
                    log(f"Found BidNo: {bid_no}")
    except Exception as e:
        log(f"Bid Search Failed: {e}")

    # 2. Query Contract API (Standard)
    if bid_no:
        url_contract_std = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
        # Try inqryDiv = '2' (Bid Notice No based?) - Checking docs or standard usage
        # Actually standard API params:
        # inqryDiv: 1(Date), 2(Contract No), 3(Bid Notice No), ... check docs or assumption
        # Let's try 3 for Bid Notice No, or 2.
        
        # Trial 1: inqryDiv=2, bidNtceNo
        log(f"Querying Standard Contract API (Div=2) with BidNo: {bid_no}")
        params_c = common_params.copy()
        params_c.update({
            'inqryDiv': '2',
            'bidNtceNo': bid_no
        })
        run_request(url_contract_std, params_c)
        
        # Trial 2: inqryDiv=3, bidNtceNo
        log(f"Querying Standard Contract API (Div=3) with BidNo: {bid_no}")
        params_c['inqryDiv'] = '3'
        run_request(url_contract_std, params_c)
        
    else:
        log("Could not find BidNo for testing Contract Bridge.")

    # Test M: Standard Contract API with Keyword and Date
    log(f"\n[Test M] Standard Contract API with Keyword '신평농공단지'")
    url_standard = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
    params_m = common_params.copy()
    params_m.update({
        'inqryDiv': '1',
        'inqryBgnDt': s_date_short_hm, # 30 days
        'inqryEndDt': e_date_short_hm,
        'cntrctNm': "신평농공단지"
    })
    run_request(url_standard, params_m)

    # Test N: Standard Contract API with BidNo + Date (Fixing Test L)
    if bid_no:
        log(f"\n[Test N] Standard Contract API with BidNo + Date")
        url_standard = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
        params_n = common_params.copy()
        params_n.update({
            'inqryDiv': '2', # Try 2 (Contract No) or 3 (Bid No)? Let's try 3 first as logical guess
            'inqryBgnDt': s_date_short_hm,
            'inqryEndDt': e_date_short_hm,
            'bidNtceNo': bid_no
        })
        
        # Trial 1: Div=3 (BidNo?)
        params_n['inqryDiv'] = '3'
        log(f"Querying Div=3 with Date...")
        run_request(url_standard, params_n)
        
        # Trial 2: Div=2 (ContractNo? maybe map?)
        params_n['inqryDiv'] = '2' 
        log(f"Querying Div=2 with Date...")
        run_request(url_standard, params_n)








