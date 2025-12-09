import requests
from bs4 import BeautifulSoup

url = "https://opinion.lawmaking.go.kr/gcom/admpp"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')
table = soup.find('table')
rows = table.find_all('tr')[1:]

for i, row in enumerate(rows[:3]):
    cols = row.find_all('td')
    title_col = cols[1]
    print(f"--- Row {i+1} ---")
    print(f"Full Text: {title_col.get_text(strip=True)}")
    print(f"HTML: {title_col}")
