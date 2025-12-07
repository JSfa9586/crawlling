import requests
import json
import urllib.parse
import os

# API Key - Using the one from previous logs
# Note: The raw key from environment variables usually needs to be passed as-is to the serviceKey parameter.
# requests.get(params=...) will url-encode it. G2B API often expects the DECODED key if passed via params, 
# or the ENCODED key if passed via string concatenation.
# Since g2b_crawler.py uses requests params with os.environ key, we will do the same.

# Key from logs: YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ==
# This looks like it might be Base64 encoded (ends with ==). 
# If this is the "Encoding" key provided by the portal, we should use the decoded version for `requests` params.
# If this is the "Decoding" key, we use it as is.
# Let's try to assume it's the one that works in the crawler. 
# The crawler gets it from env `G2B_API_KEY`.
# Let's try both if one fails, but first let's try passing it directly as the crawler does.

API_KEY = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="
URL = "http://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoServcPPSSrch"

params = {
    "serviceKey": API_KEY, # requests will encode this.
    "pageNo": "1",
    "numOfRows": "5",
    "inqryDiv": "1",
    "inqryBgnDt": "202412010000",
    "inqryEndDt": "202412062359",
    "prdctClsfcNoNm": "환경",
    "type": "json"
}

print(f"Requesting {URL} with params...")

try:
    response = requests.get(URL, params=params)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            items = data.get('response', {}).get('body', {}).get('items', [])
            
            if items:
                print(f"Found {len(items)} items.")
                first_item = items[0]
                keys = sorted(list(first_item.keys()))
                # print("--- ALL KEYS ---")
                # for k in keys:
                #    print(k)
                print("--- DATE FIELDS (ending with 'Dt') ---")
                for k in keys:
                    if 'Dt' in k:
                        print(f"{k}: {first_item.get(k, '')}")
            else:
                print("No items found. Response body:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                
        except json.JSONDecodeError:
            print("Failed to decode JSON. Raw response:")
            print(response.text[:1000]) # Print first 1000 chars
    else:
        print("Error response:")
        print(response.text)

except Exception as e:
    print(f"An error occurred: {e}")
