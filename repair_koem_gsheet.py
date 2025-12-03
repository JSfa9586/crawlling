import pandas as pd
from marine_ministry_crawler_final import MarineMinistryJejCrawler
from upload_to_gsheet import GoogleSheetsUploader
import os
import time
import re

class KoemRepairCrawler(MarineMinistryJejCrawler):
    def is_within_7days(self, date_obj):
        # Override to allow older posts for repair
        return True

    def crawl_koem_board_deep(self, url, board_type, max_pages=20):
        # Modified version of crawl_koem_board to allow custom page limit
        print(f"Crawling KOEM deeply (max {max_pages} pages)...")
        
        # We can reuse the existing method but we need to ensure the loop continues
        # The existing method has a hardcoded 'page <= 5' and 'is_within_7days' check inside.
        # Since we can't easily change the hardcoded 5 limit without copying code,
        # we will copy the method logic here or just call it multiple times if it accepted a start page?
        # No, it initializes page=1.
        # So we have to copy the logic or monkey patch.
        # Copying is safer to avoid side effects.
        
        # Actually, let's just copy the logic from the file since I have it in context.
        # Or better, I'll just use the `crawl_koem_board` but I need to patch the loop limit.
        # The loop is `while has_recent_posts and page <= 5:`.
        # I can't easily patch the local variable `max_pages` inside the function.
        # So I will reimplement `crawl_koem_board` here.
        
        self.results = [] # Reset results
        self.seen_links = set()
        
        import requests
        from bs4 import BeautifulSoup
        import re
        from urllib.parse import urljoin
        
        page = 1
        collected_count = 0
        
        while page <= max_pages:
            try:
                page_url = f"{url}&curPage={page}"
                print(f"\n{page}페이지 크롤링 중...")
                
                response = requests.get(page_url, headers=self.headers, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                board_items = soup.select('table tbody tr, ul.board_list li')

                if not board_items:
                    print(f"  게시물이 없습니다.")
                    break
                
                page_has_items = False
                
                for item in board_items:
                    try:
                        if item.name == 'tr':
                            tds = item.find_all('td')
                            if len(tds) < 3: continue
                            
                            title_elem = item.find('a', href=True)
                            if not title_elem: continue

                            title = self.extract_title(title_elem)
                            link = title_elem.get('href', '')
                            onclick = title_elem.get('onclick', '')

                            if not link or 'javascript' in link or link == '#':
                                match = re.search(r"fn_view\('(\d+)'\)", onclick) or re.search(r"view\('(\d+)'\)", onclick)
                                if match:
                                    bcIdx = match.group(1)
                                    link = f"https://www.koem.or.kr/site/koem/ex/board/View.do?cbIdx=236&bcIdx={bcIdx}"
                            
                            if link and not link.startswith('http') and not link.startswith('javascript'):
                                link = urljoin(url, link)
                            
                            date_str = None
                            for td in tds:
                                text = td.get_text(strip=True)
                                if re.match(r'\d{4}[-./]\d{2}[-./]\d{2}', text):
                                    date_str = text
                                    break
                        else:
                            # List item logic
                            title_elem = item.select_one('a.subject, a.title')
                            if not title_elem: continue

                            title = title_elem.get('title', '').strip() or title_elem.get_text(strip=True)
                            link = title_elem.get('href', '')
                            onclick = title_elem.get('onclick', '')

                            if not link or 'javascript' in link or link == '#':
                                match = re.search(r"fn_view\('(\d+)'\)", onclick) or re.search(r"view\('(\d+)'\)", onclick)
                                if match:
                                    bcIdx = match.group(1)
                                    link = f"https://www.koem.or.kr/site/koem/ex/board/View.do?cbIdx=236&bcIdx={bcIdx}"

                            if link and not link.startswith('http') and not link.startswith('javascript'):
                                link = urljoin(url, link)
                            
                            date_elem = item.select_one('span.date, p.date')
                            date_str = date_elem.get_text(strip=True) if date_elem else None
                        
                        if not date_str: continue
                        
                        date_obj = self.parse_date(date_str)
                        if not date_obj: continue
                        
                        # Always add result (no date check)
                        page_has_items = True
                        if self.add_result('공단', '해양환경공단', board_type, title, date_obj, link):
                            collected_count += 1
                            print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        print(f"Error parsing item: {e}")
                        continue

                if not page_has_items:
                    print(f"  {page}페이지에 게시물 없음. 종료.")
                    break
                
                page += 1
                time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                break
        
        return self.results

def repair_koem_links():
    # 1. Crawl correct data (SKIPPED due to network block)
    # crawler = KoemRepairCrawler()
    # print("Collecting correct KOEM links...")
    # crawled_data = crawler.crawl_koem_board_deep("https://www.koem.or.kr/site/koem/ex/board/List.do?cbIdx=236", "공지사항", max_pages=10)
    
    # if not crawled_data:
    #     print("No data collected. Aborting.")
    #     return

    # crawled_df = pd.DataFrame(crawled_data)
    # print(f"Collected {len(crawled_df)} items.")

    # 2. Load Google Sheet data
    CREDENTIALS_FILE = os.getenv('GOOGLE_CREDENTIALS_FILE', 'gen-lang-client-0556505482-e847371ea87e.json')
    if not os.path.exists(CREDENTIALS_FILE):
        # Fallback for local dev
        import glob
        json_files = glob.glob('gen-lang-client-*.json')
        if json_files: CREDENTIALS_FILE = json_files[0]

    SPREADSHEET_ID = '1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw'
    
    uploader = GoogleSheetsUploader(CREDENTIALS_FILE, SPREADSHEET_ID)
    if not uploader.authenticate():
        return

    sheet_name = '크롤링 결과'
    try:
        worksheet = uploader.spreadsheet.worksheet(sheet_name)
    except:
        print("Worksheet not found.")
        return

    all_values = worksheet.get_all_values()
    if not all_values:
        print("Sheet is empty.")
        return

    headers = all_values[0]
    data_rows = all_values[1:]
    
    # Map headers to indices
    try:
        idx_org = headers.index('기관명')
        idx_board = headers.index('게시판')
        idx_title = headers.index('제목')
        idx_date = headers.index('작성일')
        idx_link = headers.index('링크')
    except ValueError as e:
        print(f"Header not found: {e}")
        return

    print("Inspecting and fixing KOEM links...")
    updates = []
    
    for i, row in enumerate(data_rows):
        if len(row) <= idx_link: continue
        
        org = row[idx_org]
        board = row[idx_board]
        link = row[idx_link]
        
        if org == '해양환경공단' and board == '공지사항':
            # Check for .0 in parameters
            if '.0' in link:
                new_link = re.sub(r'(\d+)\.0', r'\1', link)
                if new_link != link:
                    print(f"Fixing row {i+2}:")
                    print(f"  Old: {link}")
                    print(f"  New: {new_link}")
                    
                    updates.append({
                        'range': f'{chr(65+idx_link)}{i+2}',
                        'values': [[new_link]]
                    })

    if updates:
        print(f"Updating {len(updates)} rows...")
        batch_data = []
        for update in updates:
            batch_data.append(update)
        
        worksheet.batch_update(batch_data)
        print("Update complete.")
    else:
        print("No updates needed.")

if __name__ == "__main__":
    repair_koem_links()
