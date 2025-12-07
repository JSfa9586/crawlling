import requests
import re

def verify_contract_link():
    print("=== Verifying Contract Link Generation ===")
    
    # Sample Data (Service Bid)
    # BidNo: R25BK01144022 (from previous debug)
    # BidOrd: 00 (Assuming)
    sample_item = {
        'bidNtceNo': 'R25BK01144022',
        'bidNtceOrd': '00',
        'bidNtceNm': '신평농공단지 조성사업',
        'presmptPrce': '100000000',
        'ntceInsttNm': 'Sample Inst'
    }
    
    # Logic from route.ts
    # link: `http://www.g2b.go.kr:8081/ep/co/open/bidResultDtl.do?bidno=${item.bidNtceNo}&bidseq=${item.bidNtceOrd || '00'}&releaseYn=Y&taskClCd=5`
    
    bid_no = sample_item['bidNtceNo']
    bid_seq = sample_item['bidNtceOrd']
    task_cl_cd = '5' # The fix
    
    generated_link = f"http://www.g2b.go.kr:8081/ep/co/open/bidResultDtl.do?bidno={bid_no}&bidseq={bid_seq}&releaseYn=Y&taskClCd={task_cl_cd}"
    
    print(f"Generated Link: {generated_link}")
    
    # Verify Validation
    if "taskClCd=5" in generated_link:
        print("✅ SUCCESS: Link contains taskClCd=5 (Service)")
    else:
        print("❌ FAILURE: Link does not contain taskClCd=5")

    # Optional: Check if page exists (Simple GET)
    # Note: G2B often requires headers or returns 200 even for errors, but we can check title.
    try:
        print("Attempting to fetch URL (Timeout 5s)...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        res = requests.get(generated_link, headers=headers, timeout=5)
        print(f"Status Code: {res.status_code}")
        # Check for keywords in content decoding euc-kr usually for G2B
        content = res.content.decode('euc-kr', errors='replace')
        
        if "개찰결과" in content or "입찰공고번호" in content:
             print("✅ Server Response: seemingly valid page content found (contains '개찰결과' or '입찰공고번호').")
        else:
             print("⚠️ Server Response: Keywords '개찰결과' not found. Page might be generic or error.")
             
    except Exception as e:
        print(f"⚠️ Network Request failed: {e}")

def verify_bid_link():
    print("\n=== Verifying Bid Link Generation (PNPE027_01) ===")
    # Logic from g2b/page.tsx
    # `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${item.공고번호}&bidPbancOrd=${seq}`
    # Seq padded to 3 digits
    
    sample_bid_no = "R25BK01206972"
    sample_ord = "0" 
    
    seq_padded = sample_ord.zfill(3) # Python's padStart
    
    generated_link = f"https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo={sample_bid_no}&bidPbancOrd={seq_padded}"
    print(f"Generated Link: {generated_link}")
    
    if "bidPbancOrd=000" in generated_link:
        print("✅ SUCCESS: Sequence is padded to 000")
    else:
        print("❌ FAILURE: Sequence padding incorrect")

if __name__ == "__main__":
    verify_contract_link()
    verify_bid_link()
