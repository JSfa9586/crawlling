#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
환경영향평가협회 게시판 크롤링 스크립트
- 로그인 기능 포함
- 4개 게시판 크롤링: 공지사항, 행사안내, 경조사, 입찰정보
- 데이터 추출: 제목, 등록일, 링크주소
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
from datetime import datetime
import os

class EIAACrawler:
    def __init__(self, user_id, password):
        self.session = requests.Session()
        self.base_url = "https://www.eiaa.or.kr"
        self.user_id = user_id
        self.password = password
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def login(self):
        """로그인 수행"""
        # 로그인 페이지 접속 (세션 쿠키 획득용)
        login_page_url = f"{self.base_url}/page/mb/login.php"
        # 실제 로그인 처리 URL (Form Action)
        login_action_url = f"{self.base_url}/app/rtmember/user/update.php"
        
        # 로그인 페이지 접속하여 세션 초기화
        try:
            self.session.get(login_page_url, headers=self.headers)
        except Exception as e:
            print(f"로그인 페이지 접속 실패: {e}")
            return False
        
        # 로그인 데이터 (브라우저 분석 결과 반영)
        # Hidden fields: mode='login', pcd=''
        login_data = {
            'mode': 'login',
            'pcd': '',
            'userid': self.user_id,
            'userpw': self.password,
        }
        
        # Referer 및 추가 헤더 설정 (보안 체크 우회용)
        headers = self.headers.copy()
        headers['Referer'] = login_page_url
        headers['Origin'] = self.base_url
        headers['Host'] = 'www.eiaa.or.kr'
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        headers['Accept-Language'] = 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        headers['Cache-Control'] = 'max-age=0'
        headers['Upgrade-Insecure-Requests'] = '1'
        headers['Sec-Fetch-Site'] = 'same-origin'
        headers['Sec-Fetch-Mode'] = 'navigate'
        headers['Sec-Fetch-User'] = '?1'
        headers['Sec-Fetch-Dest'] = 'document'
        
        # 로그인 요청
        try:
            response = self.session.post(
                login_action_url,
                data=login_data,
                headers=headers,
                allow_redirects=True
            )
            
            # 로그인 성공 확인
            # 성공 시 메인 페이지나 이전 페이지로 리다이렉트됨
            # 실패 시 alert 메시지가 포함될 수 있음
            if 'alert' not in response.text and response.status_code == 200:
                print("✓ 로그인 요청 성공 (리다이렉트 확인 필요)")
                # 로그인 여부 확실히 확인하기 위해 마이페이지 등 접근 시도
                return self.check_login_status()
            else:
                print(f"✗ 로그인 실패! Status Code: {response.status_code}")
                # 한글 깨짐 방지 처리
                response.encoding = 'utf-8'
                print(f"응답 내용(일부): {response.text[:500]}")
                return False
        except Exception as e:
            print(f"로그인 요청 중 오류 발생: {e}")
            return False

    def check_login_status(self):
        """로그인 상태 확인"""
        # 마이페이지나 로그인 후 접근 가능한 페이지 확인
        # 여기서는 단순히 메인 페이지에서 '로그아웃' 버튼이 있는지 확인
        try:
            response = self.session.get(self.base_url, headers=self.headers)
            if '로그아웃' in response.text or 'mypage' in response.text.lower():
                print("✓ 최종 로그인 확인 완료!")
                return True
            else:
                print("✗ 최종 로그인 확인 실패")
                return False
        except:
            return False
    
    def crawl_board(self, board_url, board_name, max_pages=1):
        """게시판 크롤링"""
        print(f"\n{'='*50}")
        print(f"[{board_name}] 크롤링 시작...")
        print(f"{'='*50}")
        
        all_posts = []
        
        for page in range(1, max_pages + 1):
            print(f"페이지 {page} 크롤링 중...")
            
            # 페이지 URL 구성
            if page == 1:
                url = f"{self.base_url}{board_url}"
            else:
                # 페이지네이션 파라미터 추가
                if '?' in board_url:
                    url = f"{self.base_url}{board_url}&pg={page}"
                else:
                    url = f"{self.base_url}{board_url}?pg={page}"
            
            try:
                response = self.session.get(url, headers=self.headers)
                response.encoding = 'utf-8' # 한글 깨짐 방지
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 게시글 목록 추출
                posts = self.extract_posts(soup, board_name)
                all_posts.extend(posts)
                
                print(f"  → {len(posts)}개 게시글 추출")
                time.sleep(1)  # 서버 부하 방지
                
            except Exception as e:
                print(f"  ✗ 오류 발생: {e}")
                continue
        
        print(f"\n총 {len(all_posts)}개 게시글 수집 완료!\n")
        return all_posts
    
    def extract_posts(self, soup, board_name):
        """게시글 정보 추출"""
        posts = []
        
        # 게시글 제목이 있는 링크 찾기 (href에 "cf=view" 포함)
        # 브라우저 분석 결과: <a href="?cf=view&seq=...">제목</a> 형태
        
        title_links = []
        for link in soup.find_all('a', href=True):
            if 'cf=view' in link['href'] or 'seq=' in link['href']:
                title_text = link.get_text(strip=True)
                # 빈 제목이나 너무 짧은 제목 제외
                if title_text and len(title_text) > 2:
                    title_links.append({
                        'title': title_text,
                        'url': link['href']
                    })
        
        # 날짜 추출 (YYYY.MM.DD 형식)
        # 브라우저 분석 결과: <td>2025.11.19</td> 형태
        dates = []
        for elem in soup.find_all(['td', 'span', 'div']): # td가 가장 유력하지만 범용성 유지
            text = elem.get_text(strip=True)
            # 날짜 형식 매칭 (예: 2025.11.19)
            if text and len(text) == 10 and text.count('.') == 2:
                try:
                    # 날짜 유효성 검사
                    datetime.strptime(text, '%Y.%m.%d')
                    dates.append(text)
                except:
                    continue
        
        # 제목과 날짜 매칭
        # 보통 제목과 날짜는 같은 행(tr)에 있거나 순서대로 나타남
        # 여기서는 리스트 순서대로 매칭하는 전략 사용 (개수가 맞지 않을 수 있음에 유의)
        
        for i, link_info in enumerate(title_links):
            # 중복 제거 (같은 제목이 여러 번 나타날 수 있음)
            if any(p['제목'] == link_info['title'] and p['링크'] == full_url for p in posts):
                continue
            
            # 날짜 매칭 (순서대로 매칭, 부족하면 '날짜없음')
            # 주의: 공지사항(상단 고정) 등으로 인해 날짜 개수와 제목 개수가 다를 수 있음
            # 보통 날짜가 제목보다 뒤에 나오거나 같은 수로 나옴
            date = dates[i] if i < len(dates) else "날짜없음"
            
            # 전체 URL 구성
            full_url = link_info['url']
            if not full_url.startswith('http'):
                if full_url.startswith('?'):
                    # 현재 게시판 경로 + 쿼리스트링
                    # board_url에서 파일명 부분만 추출하거나, 단순히 base_url + board_path + query
                    # 여기서는 간단히 board_name_to_path 사용
                    board_path = board_name_to_path(board_name)
                    full_url = f"{self.base_url}{board_path}{full_url}"
                elif full_url.startswith('/'):
                    full_url = f"{self.base_url}{full_url}"
                else:
                    full_url = f"{self.base_url}/{full_url}"
            
            posts.append({
                '기관구분': '관련협회',
                '기관명': '(사)환경영향평가협회',
                '게시판': board_name,
                '제목': link_info['title'],
                '작성일': date,
                '링크': full_url
            })
        
        return posts
    
    def save_to_csv(self, data, filename=None):
        """CSV 파일로 저장"""
        if filename is None:
            filename = f"eiaa_boards_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        # utf-8-sig: 엑셀에서 한글 깨짐 방지
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            fieldnames = ['기관구분', '기관명', '게시판', '제목', '작성일', '링크']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"\n✓ 데이터 저장 완료: {filename}")
        return filename

def board_name_to_path(board_name):
    """게시판 이름을 URL 경로로 변환"""
    board_paths = {
        '공지사항': '/page/s6/s8.php',
        '행사안내': '/page/s6/s10.php',
        '경조사': '/page/s5/s7.php',
        '입찰정보': '/page/s5/s11.php'
    }
    return board_paths.get(board_name, '')

def main():
    """메인 실행 함수"""
    print("="*60)
    print("환경영향평가협회 게시판 크롤링 프로그램")
    print("="*60)
    
    # 로그인 정보 (환경 변수에서 로드)
    USER_ID = os.getenv('EIAA_USER_ID')
    PASSWORD = os.getenv('EIAA_PASSWORD')

    if not USER_ID or not PASSWORD:
        print("[ERROR] EIAA_USER_ID 또는 EIAA_PASSWORD 환경 변수가 설정되지 않았습니다.")
        return
    
    # 크롤러 초기화
    crawler = EIAACrawler(USER_ID, PASSWORD)
    
    # 로그인
    if not crawler.login():
        print("로그인에 실패하여 프로그램을 종료합니다.")
        return
    
    # 크롤링할 게시판 정보
    boards = [
        {'url': '/page/s6/s8.php', 'name': '공지사항', 'pages': 2},
        {'url': '/page/s6/s10.php', 'name': '행사안내', 'pages': 1},
        {'url': '/page/s5/s7.php', 'name': '경조사', 'pages': 1},
        {'url': '/page/s5/s11.php', 'name': '입찰정보', 'pages': 2}
    ]
    
    # 전체 데이터 수집
    all_data = []
    
    for board in boards:
        posts = crawler.crawl_board(
            board['url'],
            board['name'],
            max_pages=board['pages']
        )
        all_data.extend(posts)
        time.sleep(2)  # 게시판 간 대기
    
    # CSV 저장
    if all_data:
        crawler.save_to_csv(all_data)
        print(f"\n총 {len(all_data)}개 게시글 크롤링 완료!")
    else:
        print("\n수집된 데이터가 없습니다.")

if __name__ == "__main__":
    main()
