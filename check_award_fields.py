import requests
import urllib.parse
import json

api_key = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="

# 2024년 11월
s_str = "202411010000"
e_str = "202411302359"

# 낙찰정보서비스
base_url = "http://apis.data.go.kr/1230000/as/ScsbidInfoService"
endpoint = "getScsbidListSttusServcPPSSrch"

url = f"{base_url}/{endpoint}"

params = {
    'numOfRows': '5',
    'pageNo': '1',
    'type': 'json',
    'inqryDiv': '1',
    'inqryBgnDt': s_str,
    'inqryEndDt': e_str,
    'bidNtceNm': '어촌뉴딜'
}

qp = urllib.parse.urlencode(params)
full_url = f"{url}?{qp}&serviceKey={urllib.parse.quote(api_key)}"

print("=== 낙찰정보서비스 응답 필드 확인 ===")
print("공동사(공동수급체) 및 지분율 정보 포함 여부 검증")
print()

try:
    res = requests.get(full_url, timeout=15)
    
    if res.status_code == 200:
        data = res.json()
        
        items = data.get('response', {}).get('body', {}).get('items', {})
        if items:
            item_list = items if isinstance(items, list) else (items.get('item', []) if items.get('item') else [])
            if not isinstance(item_list, list):
                item_list = [item_list]
            
            if item_list:
                first = item_list[0]
                print(f"[첫 번째 결과 - 전체 필드 목록]")
                print(f"공고명: {first.get('bidNtceNm', 'N/A')}")
                print()
                print("=== 모든 필드 ===")
                for key, value in first.items():
                    print(f"  {key}: {value}")
                
                print()
                print("=== 공동사/지분율 관련 필드 검색 ===")
                keywords = ['corp', 'rate', 'share', 'joint', 'partner', 'ratio', 'jv', 'consortium', '지분', '공동', '업체']
                found = []
                for key, value in first.items():
                    key_lower = key.lower()
                    for kw in keywords:
                        if kw in key_lower:
                            found.append((key, value))
                            break
                
                if found:
                    print("발견된 관련 필드:")
                    for key, value in found:
                        print(f"  {key}: {value}")
                else:
                    print("공동사/지분율 관련 필드가 응답에 없음")
except Exception as e:
    print(f"예외: {e}")

print()
print("테스트 완료")
