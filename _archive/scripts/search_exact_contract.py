import requests
import urllib.parse
from datetime import datetime

api_key = "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE/mQLxG5XmvzCSqdQ=="

# 2024년 11월 (사용자 제공 정보)
s_str = "202411010000"
e_str = "202411302359"

# 사용자가 제공한 정확한 계약명
full_name = "2022년 서산시(간월도항), 홍성군(어사항) 어촌뉴딜사업 기본 및 실시설계용역"

# 다양한 키워드로 테스트
keywords = ["어촌뉴딜", "서산시", "간월도항", "홍성군", "어사항"]

url = "http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc"

print("=== 계약 검색 테스트 ===")
print(f"대상 계약명: {full_name}")
print()

for keyword in keywords:
    params = {
        'numOfRows': '100',
        'pageNo': '1',
        'type': 'json',
        'inqryDiv': '1',  # 날짜 기반
        'inqryBgnDt': s_str,
        'inqryEndDt': e_str,
        'prdctNm': keyword,  # 키워드
        'bsnsDivCd': '5'  # 용역만
    }
    
    qp = urllib.parse.urlencode(params)
    full_url = f"{url}?{qp}&serviceKey={urllib.parse.quote(api_key)}"
    
    print(f"테스트: prdctNm='{keyword}'")
    
    try:
        res = requests.get(full_url)
        if res.status_code == 200:
            data = res.json()
            
            # 에러 체크
            if 'nkoneps.com.response.ResponseError' in data:
                print(f"  ❌ API 에러: {data['nkoneps.com.response.ResponseError']['header']['resultMsg']}")
                continue
            
            total = data.get('response', {}).get('body', {}).get('totalCount', 0)
            print(f"  결과 수: {total}")
            
            if total and int(total) > 0:
                items = data.get('response', {}).get('body', {}).get('items', [])
                if isinstance(items, list):
                    item_list = items
                elif items and items.get('item'):
                    item_list = items['item'] if isinstance(items['item'], list) else [items['item']]
                else:
                    item_list = []
                
                # 검색결과에서 계약명 확인
                for item in item_list[:5]:
                    name = item.get('cntrctNm', '없음')
                    if '서산' in name or '홍성' in name or '어촌' in name or '간월' in name:
                        print(f"  ✅ 발견! {name}")
                        print(f"     링크: {item.get('cntrctDtlInfoUrl', '없음')}")
        else:
            print(f"  HTTP 에러: {res.status_code}")
    except Exception as e:
        print(f"  예외: {e}")
    
    print()

print("검색 완료")
