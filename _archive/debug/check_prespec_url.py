import requests
import urllib.parse

api_key = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="

# 사전규격 API 테스트 - URL 필드 확인
url = "http://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService/getPublicPrcureThngInfoThngPPSSrch"

params = {
    'numOfRows': '1',
    'pageNo': '1',
    'type': 'json',
    'inqryDiv': '1',
    'inqryBgnDt': '202411010000',
    'inqryEndDt': '202412072359'
}

qp = urllib.parse.urlencode(params)
full_url = f"{url}?{qp}&serviceKey={urllib.parse.quote(api_key)}"

print("=== 사전규격 API 응답 분석 ===")
res = requests.get(full_url, timeout=15)
if res.status_code == 200:
    data = res.json()
    items = data.get('response', {}).get('body', {}).get('items', {})
    if items:
        first = items[0] if isinstance(items, list) else (items.get('item', [{}])[0] if items.get('item') else {})
        if first:
            print("[URL 관련 필드]")
            for k, v in first.items():
                if 'url' in k.lower() or 'link' in k.lower():
                    print(f"  {k}: {v}")
            
            print()
            print("[등록번호 관련 필드]")
            for k, v in first.items():
                if 'rgst' in k.lower() or 'no' in k.lower():
                    print(f"  {k}: {v}")
else:
    print(f"HTTP Error: {res.status_code}")
    print(res.text[:500])
