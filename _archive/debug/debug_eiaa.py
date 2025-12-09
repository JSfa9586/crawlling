import requests
from bs4 import BeautifulSoup
import re

url = "https://www.eiaa.or.kr/page/s6/s8.php"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

try:
    print(f"Fetching {url}...")
    response = requests.get(url, headers=headers)
    response.encoding = 'utf-8' # Try utf-8 first
    
    print(f"Status Code: {response.status_code}")
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all links like the crawler does
    links = []
    for a in soup.find_all('a', href=True):
        if 'cf=view' in a['href'] or 'seq=' in a['href']:
            title = a.get_text(strip=True)
            if title and len(title) > 2:
                links.append(a)
    
    print(f"Found {len(links)} links.")
    
    for i, link in enumerate(links[:3]): # Check first 3
        print(f"\n--- Link {i+1} ---")
        print(f"Title: {link.get_text(strip=True)}")
        
        print(f"Title: {link.get_text(strip=True)}")
        
        # Check parents
        parents = [p.name for p in link.parents]
        print(f"Parents: {parents}")
        
        parent_tr = link.find_parent('tr')
        if parent_tr:
            row_text = parent_tr.get_text(strip=True)
            print(f"Row Text: {row_text}")
            
            # Regex Check
            match = re.search(r'(\d{4}[\.\-]\s*\d{1,2}[\.\-]\s*\d{1,2})', row_text)
            if match:
                print(f"Regex Match: {match.group(1)}")
            else:
                print("Regex Match: FAILED")
        else:
            print("Parent TR not found!")
            # If no TR, look for a common container like 'li' or 'div'
            parent_li = link.find_parent('li')
            if parent_li:
                 print(f"Found Parent LI: {parent_li.get_text(strip=True)[:50]}...")
            
        # Save HTML to file for inspection
        with open('debug_html.txt', 'w', encoding='utf-8') as f:
            # Find a high-level parent (e.g. 3 levels up) to see context
            context_parent = link
            for _ in range(3):
                if context_parent.parent:
                    context_parent = context_parent.parent
            f.write(context_parent.prettify())
        print("Saved debug_html.txt")
        break # Only check first one
            
except Exception as e:
    print(f"Error: {e}")
