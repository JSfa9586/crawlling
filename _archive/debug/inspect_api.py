
import requests
import urllib.parse

API_KEY = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="
API_URL = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

def inspect_api():
    params = {
        'numOfRows': '1',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': '202501010000',
        'inqryEndDt': '202501312359',
        'bsnsDivCd': '5',
        'serviceKey': API_KEY
    }
    
    # Try 1: Standard encoding
    try:
        print("--- Attempt 1: Standard Requests ---")
        qp = urllib.parse.urlencode({k:v for k,v in params.items() if k != 'serviceKey'})
        full_url = f"{API_URL}?{qp}&serviceKey={urllib.parse.quote(API_KEY)}"
        print(f"URL: {full_url}")
        res = requests.get(full_url, timeout=10)
        print(f"Status: {res.status_code}")
        print(f"Content: {res.text[:500]}")
    except Exception as e:
        print(f"Error 1: {e}")

    # Try 2: Unquoted key (sometimes required for public data portal)
    try:
        print("\n--- Attempt 2: Unquoted Key ---")
        full_url_2 = f"{API_URL}?{qp}&serviceKey={API_KEY}"
        print(f"URL: {full_url_2}")
        res = requests.get(full_url_2, timeout=10)
        print(f"Status: {res.status_code}")
        print(f"Content: {res.text[:500]}")
    except Exception as e:
        print(f"Error 2: {e}")

if __name__ == "__main__":
    inspect_api()
