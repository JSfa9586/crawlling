import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
import os

class MolegCrawler:
    def __init__(self):
        self.base_url = "https://opinion.lawmaking.go.kr"
        self.boards = [
            {
                "name": "(부처)입법예고",
                "url": "https://opinion.lawmaking.go.kr/gcom/ogLmPp",
                "fields": {
                    "title": "법령 제명",
                    "org": "소관부처",
                    "category": "법령분야",
                    "period": "입법의견 접수기간" # 실제 헤더 텍스트 확인 필요
                }
            },
            {
                "name": "(부처)행정예고",
                "url": "https://opinion.lawmaking.go.kr/gcom/admpp",
                "fields": {
                    "title": "행정예고명",
                    "org": "기관",
                    "category": "행정규칙",
                    "period": "접수기간"
                }
            },
            {
                "name": "(지방)입법예고",
                "url": "https://opinion.lawmaking.go.kr/gcom/sgLmPp/list",
                "fields": {
                    "title": "입법예고명",
                    "org": "자치단체",
                    "category": "공고번호",
                    "period": "공고일자"
                }
            }
        ]

    def crawl(self):
        all_data = []
        
        for board in self.boards:
            print(f"[{board['name']}] 크롤링 시작...")
            try:
                response = requests.get(board['url'], timeout=15)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                table = soup.find('table')
                if not table:
                    print(f"  - 테이블을 찾을 수 없습니다.")
                    continue
                
                # 헤더 매핑 확인
                headers = [th.get_text(strip=True) for th in table.find_all('th')]
                # print(f"  - 헤더: {headers}") # 디버깅용
                
                # 데이터 행 추출
                rows = table.find_all('tr')[1:] # 헤더 제외
                
                for row in rows:
                    cols = row.find_all('td')
                    if not cols:
                        continue
                        
                    # 각 게시판별 컬럼 인덱스가 다를 수 있으므로, 헤더 텍스트로 인덱스 찾기 (간소화를 위해 하드코딩 대신 로직 사용 권장하지만, 여기선 순서가 고정적이라 가정하고 처리)
                    # 하지만 안전을 위해 각 보드별로 처리 로직을 분기하거나, 공통 패턴을 찾음.
                    # 관찰 결과:
                    # 1. (부처)입법예고: 번호(0), 법령제명(1), 소관부처(2), 법령분야(3), 접수기간(4)...
                    # 2. (부처)행정예고: 번호(0), 행정예고명(1), 행정규칙(2), 기관(3), 접수기간(4)... -> 순서 다름!
                    # 3. (지방)입법예고: 번호(0), 입법예고명(1), 자치단체(2), 공고번호(3), 공고일자(4)...
                    
                    data = {}
                    link = ""
                    
                    if board['name'] == "(부처)입법예고":
                        # 1: 제목, 2: 소관부처, 3: 법령분야, 4: 접수기간
                        title_col = cols[1]
                        a_tag = title_col.find('a')
                        title = a_tag.get_text(strip=True) if a_tag else title_col.get_text(strip=True)
                        link = self.base_url + a_tag['href'] if a_tag else ""
                        
                        org = cols[2].get_text(strip=True)
                        category = cols[3].get_text(strip=True)
                        period = cols[4].get_text(strip=True)
                        
                    elif board['name'] == "(부처)행정예고":
                        # 1: 제목, 2: 행정규칙, 3: 기관, 4: 접수기간
                        title_col = cols[1]
                        a_tag = title_col.find('a')
                        title = a_tag.get_text(strip=True) if a_tag else title_col.get_text(strip=True)
                        link = self.base_url + a_tag['href'] if a_tag else ""
                        
                        category = cols[2].get_text(strip=True) # 행정규칙
                        org = cols[3].get_text(strip=True)      # 기관
                        period = cols[4].get_text(strip=True)
                        
                    elif board['name'] == "(지방)입법예고":
                        # 1: 제목, 2: 자치단체, 3: 공고번호, 4: 공고일자
                        title_col = cols[1]
                        a_tag = title_col.find('a')
                        title = a_tag.get_text(strip=True) if a_tag else title_col.get_text(strip=True)
                        link = self.base_url + a_tag['href'] if a_tag else ""
                        
                        org = cols[2].get_text(strip=True)
                        category = cols[3].get_text(strip=True) # 공고번호
                        period = cols[4].get_text(strip=True)
                    
                    # 공통 포맷으로 저장
                    all_data.append({
                        '구분': board['name'],
                        '제목': title,
                        '기관': org,
                        '내용': category, # 법령분야/행정규칙/공고번호
                        '기간': period,   # 접수기간/공고일자
                        '링크': link,
                        '수집일': datetime.now().strftime('%Y-%m-%d')
                    })
                    
                print(f"  - {len(rows)}개 데이터 수집 완료")
                
            except Exception as e:
                print(f"  - [ERROR] 크롤링 실패: {e}")
            
            time.sleep(1) # 서버 부하 방지
            
        return all_data

    def save_to_csv(self, data, filename="moleg_data.csv"):
        if not data:
            print("저장할 데이터가 없습니다.")
            return
            
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"데이터가 {filename}에 저장되었습니다.")

if __name__ == "__main__":
    crawler = MolegCrawler()
    data = crawler.crawl()
    crawler.save_to_csv(data)
