import requests
from bs4 import BeautifulSoup

url = "https://opinion.lawmaking.go.kr/gcom/ogLmPp"
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Check for table or specific text
    if "법령 제명" in response.text:
        print("SUCCESS: Found '법령 제명' in response text.")
        
        # Try to find the table
        table = soup.find('table')
        if table:
            print("SUCCESS: Found <table> tag.")
            rows = table.find_all('tr')
            print(f"Found {len(rows)} rows.")
        else:
            print("WARNING: '법령 제명' found but no <table> tag. Structure might be divs.")
            
    else:
        print("FAILURE: Could not find '법령 제명' in response text. Content might be dynamic.")
        print("Response sample:", response.text[:500])
        
except Exception as e:
    print(f"ERROR: {e}")
