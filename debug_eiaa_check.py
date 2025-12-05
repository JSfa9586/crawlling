import requests
from bs4 import BeautifulSoup
import re

url = "https://www.eiaa.or.kr/page/s6/s8.php"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

print(f"Fetching {url}...")
response = requests.get(url, headers=headers)
response.encoding = 'utf-8'

soup = BeautifulSoup(response.text, 'html.parser')

links = []
for a in soup.find_all('a', href=True):
    if 'cf=view' in a['href'] or 'seq=' in a['href']:
        title = a.get_text(strip=True)
        if title and len(title) > 2:
            links.append(a)

print(f"Found {len(links)} posts.")

for i, link in enumerate(links):
    title = link.get_text(strip=True)
    
    # Find parent row
    parent_row = link.find_parent('tr')
    if not parent_row:
        parent_row = link.find_parent('div', class_=re.compile('rt-rwd-list-con'))
    
    date = "Not Found"
    row_text = ""
    if parent_row:
        row_text = parent_row.get_text(strip=True)
        # Regex for date
        match = re.search(r'(\d{4}[\.\-]\s*\d{1,2}[\.\-]\s*\d{1,2})', row_text)
        if match:
            date = match.group(1)
        else:
            # Try YY.MM.DD
            match = re.search(r'(\d{2}[\.\-]\s*\d{1,2}[\.\-]\s*\d{1,2})', row_text)
            if match:
                date = match.group(1)
    
    print(f"[{i+1}] Date: {date} | Title: {title}")
    if "12" in date and "03" in date:
         print(f"*** FOUND DEC 3 POST ***")
