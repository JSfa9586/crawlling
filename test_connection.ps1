$bidNo = "R25BK01144022"
$bidSeq = "000"
$taskClCd = "5"

$urls = @(
    "http://www.g2b.go.kr:8081/ep/co/open/bidResultDtl.do?bidno=$bidNo&bidseq=$bidSeq&releaseYn=Y&taskClCd=$taskClCd",
    "https://www.g2b.go.kr/ep/co/open/bidResultDtl.do?bidno=$bidNo&bidseq=$bidSeq&releaseYn=Y&taskClCd=$taskClCd",
    "http://www.g2b.go.kr/ep/co/open/bidResultDtl.do?bidno=$bidNo&bidseq=$bidSeq&releaseYn=Y&taskClCd=$taskClCd"
)

foreach ($url in $urls) {
    Write-Host "Testing: $url"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  ✅ Status: $($response.StatusCode)"
    } catch {
        Write-Host "  ❌ Failed: $($_.Exception.Message)"
    }
}
