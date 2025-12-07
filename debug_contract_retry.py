import requests
import urllib.parse
from datetime import datetime, timedelta

def log(msg):
    print(msg)

def run():
    log("=== Retrying Contract Search API to find ctrtNo ===")
    
    # Common
    api_key_decoded = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="
    
    # Dates
    end_dt = datetime.now()
    start_dt = end_dt - timedelta(days=90) # 3 Months
    s_str = start_dt.strftime('%Y%m%d') + "0000"
    e_str = end_dt.strftime('%Y%m%d') + "2359"
    
    # Target: Find a contract for keyword like "영향평가" or "폐기물" or "용역"
    keyword = "영향평가" 
    
    # 1. Try getCntrctInfoListServcPPSSrch (Public Portal Search)
    # Docs say: inqryDiv 1:Date, 2:ContractNo, ...
    # Error "08" (Essential Value) usually means missing param for that Div.
    
    url_pps = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServcPPSSrch"
    
    params = {
        'serviceKey': api_key_decoded,
        'numOfRows': 10,
        'pageNo': 1,
        'type': 'json',
        'inqryDiv': '1', # Date based
        'inqryBgnDt': s_str,
        'inqryEndDt': e_str,
        'cntrctNm': keyword # Keyword
    }
    
    # Manual key construct to avoid double encoding issues in requests sometimes
    # But requests handles it if we pass unencoded key? No, keys usually need exact string.
    # Let's use the URL construction method like in route.ts to be safe.
    
    qp = urllib.parse.urlencode({k:v for k,v in params.items() if k != 'serviceKey'})
    full_url = f"{url_pps}?{qp}&serviceKey={urllib.parse.quote(api_key_decoded)}"
    # Wait, api_key_decoded IS decoded. urllib.parse.quote will encode it. Correct.
    
    log(f"Test 1: PPSSrch with Div=1, Date, Keyword='{keyword}'")
    try:
        res = requests.get(full_url)
        print("Status:", res.status_code)
        if res.status_code == 200:
            try:
                data = res.json()
                items = data.get('response', {}).get('body', {}).get('items')
                if items:
                    print(f"✅ FOUND ITEMS! (Count: {len(items) if isinstance(items, list) else 1})")
                    # Inspect first item for unique codes
                    first = items[0] if isinstance(items, list) else items
                    print("Keys:", first.keys())
                    print("cntrctNo:", first.get('cntrctNo'))
                    print("cntrctNm:", first.get('cntrctNm'))
                    print("prcmBsneSeCd (Business Code?):", first.get('prcmBsneSeCd')) # Checking if this exists
                else:
                     print("❌ No items found (Response 200 but empty items)")
                     print("Raw:", str(data)[:300])
            except:
                print("JSON Parse Error:", res.text[:200])
        else:
            print("HTTP Error")
    except Exception as e:
        print("Exception:", e)

    # 2. Try getCntrctInfoListServc (Standard) - Does it support text search?
    # Usually supports 'prdctNm' (Product Name) not 'cntrctNm'?
    # Or 'cntrctNm' exists?
    
    url_std = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"
    
    params_std = params.copy()
    # Remove cntrctNm, try prdctNm?
    del params_std['cntrctNm']
    params_std['prdctNm'] = keyword
    
    qp_std = urllib.parse.urlencode({k:v for k,v in params_std.items() if k != 'serviceKey'})
    full_url_std = f"{url_std}?{qp_std}&serviceKey={urllib.parse.quote(api_key_decoded)}"
    
    log(f"\nTest 2: Standard API with Div=1, Date, prdctNm='{keyword}'")
    try:
        res = requests.get(full_url_std)
        print("Status:", res.status_code)
        if res.status_code == 200:
             try:
                data = res.json()
                items = data.get('response', {}).get('body', {}).get('items')
                if items:
                    print(f"✅ FOUND ITEMS! (Count: {len(items) if isinstance(items, list) else 1})")
                    first = items[0] if isinstance(items, list) else items
                    
                    print("\n[Item Keys Dump]:")
                    for k, v in first.items():
                        print(f"  {k}: {v}")
                else:
                     print("❌ No items found")
                     print("Raw:", str(data)[:300])
             except: pass
    except: pass

if __name__ == "__main__":
    run()
