import requests
import urllib.parse

api_key = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="

# 2024년 11월
s_str = "202411010000"
e_str = "202411302359"

# 낙찰정보서비스 - 키워드 검색 지원 API
base_url = "http://apis.data.go.kr/1230000/as/ScsbidInfoService"
endpoint = "getScsbidListSttusServcPPSSrch"

# 다양한 키워드 테스트
keywords = ["서산시", "홍성군", "간월도", "어사항", "어촌뉴딜"]

print("=== 낙찰정보서비스 키워드 검색 테스트 ===")
print(f"API: {endpoint}")
print(f"기간: 2024년 11월")
print()

for keyword in keywords:
    url = f"{base_url}/{endpoint}"
    
    params = {
        'numOfRows': '50',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',
        'inqryBgnDt': s_str,
        'inqryEndDt': e_str,
        'bidNtceNm': keyword  # 입찰공고명 키워드
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{url}?{qp}&serviceKey={urllib.parse.quote(api_key)}"
    
    print(f"키워드: '{keyword}'")
    
    try:
        res = requests.get(full_url, timeout=15)
        
        if res.status_code == 200:
            data = res.json()
            
            if 'nkoneps.com.response.ResponseError' in data:
                error = data['nkoneps.com.response.ResponseError']['header']
                print(f"  ❌ API 에러: {error['resultCode']} - {error['resultMsg']}")
            else:
                total = data.get('response', {}).get('body', {}).get('totalCount', 0)
                print(f"  결과 수: {total}")
                
                if int(total) > 0:
                    items = data.get('response', {}).get('body', {}).get('items', {})
                    if items:
                        item_list = items if isinstance(items, list) else (items.get('item', []) if items.get('item') else [])
                        if not isinstance(item_list, list):
                            item_list = [item_list]
                        
                        # 사용자가 찾는 계약 검색
                        for item in item_list[:5]:
                            name = item.get('bidNtceNm', '')
                            if '서산' in name or '홍성' in name or '간월' in name or '어사항' in name:
                                print(f"  ✅ 발견! {name}")
                                print(f"     공고번호: {item.get('bidNtceNo', 'N/A')}")
    except Exception as e:
        print(f"  예외: {e}")
    
    print()

print("테스트 완료")
