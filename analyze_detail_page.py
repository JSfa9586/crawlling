"""
상세페이지에서 계약업체 정보 테이블 찾기
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def get_chrome_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--log-level=3')
    return webdriver.Chrome(options=options)

url = "https://www.g2b.go.kr/link/FIUA027_01/single/?ctrtNo=R25TE09777401&ctrtChgOrd=00&prcmBsneSeCd=조070003&srchName=ctrtCrst&openUrl=Y"

result = []
driver = get_chrome_driver()
try:
    driver.get(url)
    time.sleep(5)  # 더 오래 대기
    
    result.append(f"URL: {url}")
    result.append(f"페이지 타이틀: {driver.title}")
    result.append(f"페이지 소스 길이: {len(driver.page_source)}")
    
    # 페이지 소스에서 지분율 문자열 위치 찾기
    source = driver.page_source
    if '지분율' in source:
        idx = source.find('지분율')
        result.append(f"\n'지분율' 문자열 발견 위치: {idx}")
        result.append(f"주변 텍스트: {source[max(0,idx-100):idx+200]}")
    else:
        result.append("'지분율' 문자열을 찾을 수 없음")
    
    # 모든 테이블 헤더 출력
    result.append("\n\n=== 모든 테이블 헤더 ===")
    tables = driver.find_elements(By.TAG_NAME, 'table')
    for i, table in enumerate(tables):
        headers = table.find_elements(By.TAG_NAME, 'th')
        header_texts = [th.text.strip() for th in headers if th.text.strip()]
        if header_texts:
            result.append(f"테이블 {i}: {header_texts[:8]}...")
            
finally:
    driver.quit()

# 결과 파일로 저장
with open('table_analysis.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result))

print("완료!")
