import requests
import json
import logging

# 설정
NEW_API_KEY = '3aa8be53451db70ab496024bc5e726947aa641a2333bc7a59a420c2b431ff872'
BASE_URL = 'http://apis.data.go.kr/1230000/ao/HrcspSsstndrdInfoService' # 사전규격
ENDPOINT = 'getPublicPrcureThngInfoServc' # 용역 사전규격

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def verify_key_variant(key, variant_name):
    logger.info(f"Testing {variant_name} Key: {key[:5]}...{key[-5:]}")
    params = {
        'serviceKey': key,
        'numOfRows': '1',
        'pageNo': '1',
        'inqryDiv': '1',
        'inqryBgnDt': '202401010000',
        'inqryEndDt': '202401020000',
        'type': 'json'
    }
    url = f"{BASE_URL}/{ENDPOINT}"
    try:
        # requests automatically encodes params values, so for an already encoded key we might need string formatting
        # But 'requests' usually handles unencoded strings fine. 
        # If the key provided is already decoded (hex), requests encoding it IS the right way.
        # If the key provided is encoded (has % sign), requests encoding it AGAIN is wrong.
        # The key provided has NO % signs, so it's likely decoded.
        # However, Public Data Portal sometimes behaves weirdly.
        
        # Method 1: Let requests encode it
        response = requests.get(url, params=params, timeout=10)
        
        # Method 2: Forced unencoded (if we want to send it exactly as is, maybe via string)
        # url_full = f"{url}?serviceKey={key}&numOfRows=1&pageNo=1&inqryDiv=1&inqryBgnDt=202401010000&inqryEndDt=202401020000&type=json"
        
        logger.info(f"[{variant_name}] Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            header = data.get('response', {}).get('header', {})
            if header.get('resultCode') == '00':
                logger.info(f"✅ {variant_name} is VALID")
                return True
            else:
                logger.error(f"❌ {variant_name} API Error: {header.get('resultMsg')}")
        else:
            logger.error(f"❌ {variant_name} HTTP Error: {response.status_code}")
            
    except Exception as e:
        logger.error(f"❌ {variant_name} Exception: {e}")
    return False

def main():
    # 1. Try RAW
    if verify_key_variant(NEW_API_KEY, "RAW"):
        return
        
    # 2. Try URL Encoded
    from urllib.parse import quote, unquote
    encoded_key = quote(NEW_API_KEY)
    if verify_key_variant(encoded_key, "ENCODED"):
        return
        
    # 3. Try URL Decoded (just in case they gave us an encoded one without %, unlikely but...)
    decoded_key = unquote(NEW_API_KEY)
    if decoded_key != NEW_API_KEY:
         if verify_key_variant(decoded_key, "DECODED"):
            return

if __name__ == "__main__":
    main()
