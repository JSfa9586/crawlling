from marine_ministry_crawler_final import MarineMinistryJejCrawler
import sys

# Redirect stdout to file
sys.stdout = open('verify_mof_output.txt', 'w', encoding='utf-8')

def verify_mof():
    crawler = MarineMinistryJejCrawler()
    print("Verifying MOF Main Board Crawling...")
    
    # Check MOF Main Boards
    boards = ['공지사항', '입찰', '인사']
    for board in boards:
        print(f"\nChecking {board}...")
        count, status = crawler.crawl_mof_main_board(board)
        print(f"Result: {status}")
        print(f"Collected {count} posts.")
        
        if count > 0:
            print("Sample posts:")
            for result in crawler.results[-count:]:
                print(f"  - [{result['작성일']}] {result['제목']} ({result['링크']})")

if __name__ == "__main__":
    verify_mof()
