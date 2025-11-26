from marine_ministry_crawler_final import MarineMinistryJejCrawler
import sys
import pandas as pd

# Redirect stdout to file to avoid encoding issues
sys.stdout = open('verify_all_output.txt', 'w', encoding='utf-8')

def verify_all():
    crawler = MarineMinistryJejCrawler()
    print("Starting verification of ALL sites...")
    
    # We will run the standard run() method which crawls everything
    # and prints a summary at the end.
    try:
        crawler.run()
    except Exception as e:
        print(f"Global execution error: {e}")

    print("\n" + "="*50)
    print("VERIFICATION SUMMARY")
    print("="*50)
    
    # Check crawl_status
    if crawler.crawl_status:
        df = pd.DataFrame(crawler.crawl_status)
        print(df.to_string(index=False))
        
        # Identify potential issues
        print("\nPotential Issues:")
        for status in crawler.crawl_status:
            msg = status['상태']
            if "오류" in msg or "0건" in msg:
                 # 0 posts might be normal, but worth noting
                print(f"  - {status['기관명']} ({status['게시판']}): {msg}")
    else:
        print("No crawl status available.")

if __name__ == "__main__":
    verify_all()
