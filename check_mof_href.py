import requests
from bs4 import BeautifulSoup

def check_mof_href():
    url = "https://www.mof.go.kr/doc/ko/selectDocList.do?menuSeq=375&bbsSeq=9&pageIndex=1"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    rows = soup.select('table tbody tr')
    for i, row in enumerate(rows[:3]):
        title_td = row.select_one('td:nth-of-type(2)')
        if title_td:
            a_tag = title_td.select_one('a')
            if a_tag:
                print(f"Row {i}:")
                print(f"  Text: {a_tag.get_text(strip=True)}")
                print(f"  Href: {a_tag.get('href')}")
                print(f"  Onclick: {a_tag.get('onclick')}")

if __name__ == "__main__":
    check_mof_href()
