import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

def debug_koem():
    url = "https://www.koem.or.kr/site/koem/ex/board/List.do?cbIdx=236"
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
            
            link = raw_href
            bcIdx = None
            
            if not link or 'javascript' in link or link == '#':
                match = re.search(r"fn_view\('(\d+)'\)", onclick) or re.search(r"view\('(\d+)'\)", onclick)
                if match:
                    bcIdx = match.group(1)
                    link = f"https://www.koem.or.kr/site/koem/ex/board/View.do?cbIdx=236&bcIdx={bcIdx}"
            
            if link and not link.startswith('http') and not link.startswith('javascript'):
                link = urljoin(url, link)
                
            print(f"  Resolved link: {link}")
            
            # Verify if the link works
            try:
                print(f"  Checking normal link...")
                link_response = requests.get(link, headers=headers, timeout=10)
                print(f"  Status Code: {link_response.status_code}")
                
                if bcIdx:
                    # Test with .0 to reproduce user error
                    bad_link = f"https://www.koem.or.kr/site/koem/ex/board/View.do?cbIdx=236.0&bcIdx={bcIdx}.0"
                    print(f"  Checking bad link (with .0): {bad_link}")
                    bad_response = requests.get(bad_link, headers=headers, timeout=10)
                    print(f"  Status Code: {bad_response.status_code}")
                    if bad_response.status_code != 200:
                        print("  -> Confirmed: .0 causes failure!")
                    else:
                        # Check content length or title to see if it's an error page
                        if len(bad_response.text) < 1000 or "Error" in bad_response.text:
                             print("  -> Confirmed: .0 causes error page or short content!")
                        else:
                             print("  -> Strange: .0 link seems to work?")

            except Exception as e:
                print(f"  Link check failed: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_koem()
