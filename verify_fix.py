from marine_ministry_crawler_final import MarineMinistryJejCrawler
import sys

# Redirect stdout to file
sys.stdout = open('verify_output.txt', 'w', encoding='utf-8')

def verify():
    crawler = MarineMinistryJejCrawler()
    
    print("Verifying Busan Port Authority Bid Board Crawling...")
    # URL for Bid Board
    url = "https://www.busanpa.com/kor/Board.do?mCode=MN1259"
    
    # Run the specific method
    count, status = crawler.crawl_busanpa_board(url, "입찰")
    
    print(f"\nResult: {status}")
    print(f"Collected {count} posts.")
    
    # Check if 11/19 post is in results
    found_11_19 = False
    for result in crawler.results:
        print(f"  - [{result['작성일']}] {result['제목']}")
        if result['작성일'] == '2025-11-19':
            found_11_19 = True
            
    if found_11_19:
        print("\nSUCCESS: Found post from 2025-11-19!")
    else:
        print("\nFAILURE: Did not find post from 2025-11-19.")

if __name__ == "__main__":
    verify()

