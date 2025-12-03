import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

def debug_koem():
    url = "https://www.koem.or.kr/koem/na/ntt/selectNttList.do?mi=1023&bbsId=1003"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    print(f"Target URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        board_items = soup.select('table tbody tr, ul.board_list li')
        
        print(f"Found {len(board_items)} items.")
        
        for i, item in enumerate(board_items[:3]): # Check first 3 items
            print(f"\nItem {i+1}:")
            
            if item.name == 'tr':
                title_elem = item.find('a', href=True)
            else:
                title_elem = item.select_one('a.subject, a.title')
                
            if not title_elem:
                print("  No title element found.")
                continue
                
            title = title_elem.get_text(strip=True)
            print(f"  Title: {title}")

            raw_href = title_elem.get('href', '')
            onclick = title_elem.get('onclick', '')
            print(f"  Raw href: {raw_href}")
            print(f"  Onclick: {onclick}")
            
            link = raw_href
            if not link or 'javascript' in link or link == '#':
                match = re.search(r"fn_view\('(\d+)'\)", onclick) or re.search(r"view\('(\d+)'\)", onclick)
                if match:
                    nttSn = match.group(1)
                    link = f"https://www.koem.or.kr/koem/na/ntt/selectNttInfo.do?mi=1023&bbsId=1003&nttSn={nttSn}"
            
            if link and not link.startswith('http') and not link.startswith('javascript'):
                link = urljoin(url, link)
                
            print(f"  Resolved link: {link}")
            
            # Verify if the link works
            try:
                link_response = requests.get(link, headers=headers, timeout=10)
                print(f"  Status Code: {link_response.status_code}")
                if link_response.status_code != 200:
                    print(f"  Failed URL: {link}")
            except Exception as e:
                print(f"  Link check failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_koem()
