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
import re  # 정규표현식 모듈 추가

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
        """게시글 정보 추출 (하이브리드 방식: 링크 -> 부모 행 -> 정규표현식 날짜 검색)"""
        posts = []
        
        # 1. 먼저 게시글 링크를 모두 찾습니다.
        links = []
        for a in soup.find_all('a', href=True):
            if 'cf=view' in a['href'] or 'seq=' in a['href']:
                title = a.get_text(strip=True)
                if title and len(title) > 2:
                    links.append(a)
        
        print(f"[DEBUG] '{board_name}' - 발견된 링크 수: {len(links)}")
        
        for i, link in enumerate(links):
            title = link.get_text(strip=True)
            href = link['href']
            
            # 날짜 추출 (Regex로 행 전체에서 검색)
            date = "날짜없음"
            parent_row = link.find_parent('tr')
            
            # TR이 없으면 DIV 기반 레이아웃인지 확인 (rt-rwd-list-con)
            if not parent_row:
                parent_row = link.find_parent('div', class_=re.compile('rt-rwd-list-con'))
            
            if parent_row:
                row_text = parent_row.get_text(strip=True)
                
                # 디버깅: 첫 3개 행의 텍스트 출력 (문제 해결용)
                if i < 3:
                     print(f"[DEBUG] Row {i} Text: {row_text[:100]}...") # 너무 길면 자름

                # 1. YYYY.MM.DD 또는 YYYY-MM-DD 패턴 검색 (가장 강력함)
                # \s*는 구분자 사이에 공백이 있어도 허용
                match = re.search(r'(\d{4}[\.\-]\s*\d{1,2}[\.\-]\s*\d{1,2})', row_text)
                if match:
                    date = match.group(1).replace(' ', '') # 공백 제거
                else:
                    # 2. YY.MM.DD 패턴 검색 (예비용)
                    match = re.search(r'(\d{2}[\.\-]\s*\d{1,2}[\.\-]\s*\d{1,2})', row_text)
                    if match:
                         date = match.group(1).replace(' ', '')

            # URL 구성
            full_url = href
            if not full_url.startswith('http'):
                if full_url.startswith('?'):
                    board_path = board_name_to_path(board_name)
                    full_url = f"{self.base_url}{board_path}{full_url}"
                elif full_url.startswith('/'):
                    full_url = f"{self.base_url}{full_url}"
                else:
                    full_url = f"{self.base_url}/{full_url}"
            
            # 중복 제거
            if any(p['링크'] == full_url for p in posts):
                continue
                
            posts.append({
                '기관구분': '관련협회',
                '기관명': '(사)환경영향평가협회',
                '게시판': board_name,
                '제목': title,
                '등록일': date,
                '링크': full_url
            })
            
        print(f"[DEBUG] '{board_name}' - 추출된 게시글 수: {len(posts)}")
        return posts
    
    def save_to_csv(self, data, filename=None):
        """CSV 파일로 저장"""
        if filename is None:
            filename = f"eiaa_boards_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        # utf-8-sig: 엑셀에서 한글 깨짐 방지
        with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
            # 헤더 변경: 작성일 -> 등록일
            fieldnames = ['기관구분', '기관명', '게시판', '제목', '등록일', '링크']
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
