import sys
import requests
from bs4 import BeautifulSoup
import re

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def debug_busanpa():
    url = "https://www.busanpa.com/kor/Board.do?mCode=MN1259"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    with open('debug_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"Fetching URL: {url}\n")
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        board_div = soup.select_one('div.board.list')
        if not board_div:
            f.write("Board div not found!\n")
            return

        rows = board_div.select('ul.row')
        f.write(f"Found {len(rows)} rows (including header)\n")

        for i, row in enumerate(rows):
            if i == 0: continue  # Skip header
            if i > 5: break # Only check first 5 rows

import sys
import requests
from bs4 import BeautifulSoup
import re

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def debug_busanpa():
    url = "https://www.busanpa.com/kor/Board.do?mCode=MN1259"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    with open('debug_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"Fetching URL: {url}\n")
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        board_div = soup.select_one('div.board.list')
        if not board_div:
            f.write("Board div not found!\n")
            return

        rows = board_div.select('ul.row')
        f.write(f"Found {len(rows)} rows (including header)\n")

        for i, row in enumerate(rows):
            if i == 0: continue  # Skip header
            if i > 5: break # Only check first 5 rows

            f.write(f"\nRow {i}:\n")
            
            # Check for mark (Notice)
            is_notice = bool(row.select_one('mark'))
            f.write(f"  Is Notice (mark): {is_notice}\n")

            # Title extraction
            title_li = row.select_one('li.grid-5')
            if title_li:
                a_tag = title_li.select_one('a')
                if a_tag:
                    title = a_tag.get_text(strip=True)
                    href = a_tag.get('href', '')
                    onclick = a_tag.get('onclick', '')
                    f.write(f"  Title: {title}\n")
                    f.write(f"  Link href: {href}\n")
                    f.write(f"  Link onclick: {onclick}\n")
                else:
                    f.write("  Title: No 'a' tag found in li.grid-5\n")
            else:
                f.write("  Title: No li.grid-5 found\n")

            # List items inspection
            lis = row.select('li')
            for idx, li in enumerate(lis):
                text = li.get_text(strip=True)
                is_date = bool(re.match(r'\d{4}-\d{2}-\d{2}', text))
                is_number = bool(re.match(r'^\d+$', text))
                f.write(f"  li[{idx}] class={li.get('class')}: IsDate={is_date}, IsNumber={is_number}, Text={text}\n")

if __name__ == "__main__":
    debug_busanpa()
