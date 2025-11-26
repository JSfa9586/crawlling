from marine_ministry_crawler_final import MarineMinistryJejCrawler
import sys

# Redirect stdout to file
sys.stdout = open('verify_incheon_output.txt', 'w', encoding='utf-8')

def verify_incheon():
    crawler = MarineMinistryJejCrawler()
    print("Verifying Port Authorities Configuration...")
    
    # Manually run the port_authorities loop logic
    port_authorities = [
        ("인천항만공사", None, "https://www.icpa.or.kr/article/list.do?boardKey=213&menuKey=397&currentPageNo=1"),
        ("울산항만공사", "https://www.upa.or.kr/portal/board/post/list.do?bcIdx=685&mid=0605080100", "https://www.upa.or.kr/portal/board/post/list.do?bcIdx=676&mid=0601000000"),
    ]

    for org_name, bid_url, notice_url in port_authorities:
        print(f"\nChecking {org_name}...")
        print(f"  Notice URL: {notice_url}")
        print(f"  Bid URL: {bid_url}")
        
        # Simulate the check
        if bid_url and bid_url != notice_url:
            print(f"  -> Will crawl Bid Board for {org_name}")
        else:
            print(f"  -> Will SKIP Bid Board for {org_name}")

if __name__ == "__main__":
    verify_incheon()
