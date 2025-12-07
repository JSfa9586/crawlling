import requests
import urllib.parse
from datetime import datetime, timedelta

api_key = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="

end_dt = datetime.now()
start_dt = end_dt - timedelta(days=365)  # 1 year
s_str = start_dt.strftime('%Y%m%d') + "0000"
e_str = end_dt.strftime('%Y%m%d') + "2359"

keyword = "지세포"

url = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

# Search more pages
for page in range(1, 21):  # Check 20 pages (500 items each = 10,000 items)
    params = {
        'numOfRows': '500',
        'pageNo': str(page),
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': s_str,
        'inqryEndDt': e_str,
        'bsnsDivCd': '5'  # Service only
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{url}?{qp}&serviceKey={urllib.parse.quote(api_key)}"
    
    print(f"Checking page {page}...", end=" ")
    
    res = requests.get(full_url)
    if res.status_code != 200:
        print(f"Error: {res.status_code}")
        continue
        
    data = res.json()
    raw_items = data.get('response', {}).get('body', {}).get('items')
    
    items = []
    if isinstance(raw_items, list):
        items = raw_items
    elif raw_items and raw_items.get('item'):
        items = raw_items['item'] if isinstance(raw_items['item'], list) else [raw_items['item']]
    
    # Search for keyword in ALL fields
    matches = []
    for i in items:
        for k, v in i.items():
            if v and keyword in str(v):
                matches.append((k, i))
                break
    
    if matches:
        print(f"FOUND {len(matches)} matches!")
        for field, m in matches[:3]:
            print(f"  - Field '{field}': {m.get('cntrctNm')}")
            print(f"    Link: {m.get('cntrctDtlInfoUrl')}")
        break
    else:
        print(f"No matches ({len(items)} items)")

print("Search complete.")
