#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
해양수산부 산하기관 공지사항 및 입찰 크롤러 (최종버전)
최근 7일간의 게시물 수집 (Asia/Seoul 시간 기준)
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import pytz
import time
import pandas as pd
from urllib.parse import urljoin
import re

class MarineMinistryJejCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        self.seoul_tz = pytz.timezone('Asia/Seoul')
        self.today = datetime.now(self.seoul_tz)
        self.seven_days_ago = self.today - timedelta(days=6)  # 오늘 포함 7일
        self.results = []
        self.seen_links = set()  # 중복 제거용
        self.crawl_status = []  # 크롤링 결과 추적

        # 해양수산부 본부 게시판 정보
        self.mof_base_url = "https://www.mof.go.kr"
        self.mof_boards = {
            '공지사항': {'menuSeq': 375, 'bbsSeq': 9},
            '입찰': {'menuSeq': 379, 'bbsSeq': 13},
            '인사': {'menuSeq': 380, 'bbsSeq': 14}
        }

    def extract_title(self, elem):
        """제목 추출 (title 속성과 텍스트 중 적절한 것 선택)"""
        title_attr = elem.get('title', '').strip()
        text_content = elem.get_text(strip=True)

        # title 속성이 "XXX번글" 형태이면 무시
        if title_attr and re.match(r'^\d+번글$', title_attr):
            return text_content

        # title 속성에 "게시글 바로가기" 등이 포함되어 있으면 제거
        if title_attr:
            title_attr = title_attr.replace('[게시글 바로가기]', '').strip()
            # "게시글 상세 열람" 같은 일반적인 문구도 제거
            if title_attr in ['게시글 상세 열람', '상세보기', '바로가기']:
                return text_content

        # title 속성이 있고 유효하면 사용, 없으면 텍스트 사용
        return title_attr or text_content

    def parse_date(self, date_str):
        """다양한 날짜 형식 파싱"""
        date_str = date_str.strip().rstrip('.')  # 마지막 점 제거

        formats = [
            '%Y-%m-%d', '%Y.%m.%d', '%Y/%m/%d',
            '%Y-%m-%d %H:%M:%S', '%Y.%m.%d %H:%M:%S',
            '%Y-%m-%d %H:%M', '%Y.%m.%d %H:%M',
        ]

        for fmt in formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                return self.seoul_tz.localize(dt)
            except:
                continue

        return None
    
    def is_within_7days(self, date_obj):
        """7일 이내 게시물인지 확인"""
        if not date_obj:
            return False
        return date_obj >= self.seven_days_ago.replace(hour=0, minute=0, second=0, microsecond=0)
    
    def add_result(self, org_type, org_name, board_type, title, date_obj, link):
        """중복 체크 후 결과 추가 (URL 정규화 포함)"""
        # 제주도청 링크 정규화 (curPage 파라미터 제거)
        if 'jeju.go.kr' in link and 'curPage=' in link:
            link = re.sub(r'curPage=\d+&', '', link)
            link = re.sub(r'[?&]curPage=\d+', '', link)
            link = re.sub(r'\?&', '?', link)

        if link in self.seen_links:
            return False

        self.seen_links.add(link)
        self.results.append({
            '기관구분': org_type,
            '기관명': org_name,
            '게시판': board_type,
            '제목': title,
            '작성일': date_obj.strftime('%Y-%m-%d'),
            '링크': link
        })
        return True
    
    def crawl_mof_board(self, org_type, org_name, url, board_type):
        """해양수산청 게시판 크롤링"""
        print(f"\n{'='*60}")
        print(f"크롤링 시작: {org_name} - {board_type}")
        print(f"URL: {url}")

        page = 1
        has_recent_posts = True
        collected_count = 0

        while has_recent_posts and page <= 5:
            try:
                page_url = f"{url}&page={page}"
                print(f"\n{page}페이지 크롤링 중...")
                
                response = requests.get(page_url, headers=self.headers, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                table = soup.find('table')
                if not table:
                    print(f"  게시판 테이블을 찾을 수 없습니다.")
                    return 0, "게시판 구조 오류"

                rows = table.select('tbody tr')
                if not rows:
                    print(f"  게시물이 없습니다.")
                    return 0, "게시판 구조 오류"
                
                page_has_recent = False
                
                for row in rows:
                    try:
                        tds = row.find_all('td')
                        if len(tds) < 3:
                            continue
                        
                        # 제목 찾기
                        title_elem = None
                        for td in tds:
                            a_tag = td.find('a', href=True)
                            if a_tag and 'board' in a_tag.get('href', ''):
                                title_elem = a_tag
                                break
                        
                        if not title_elem:
                            continue

                        # 제목 추출
                        title = self.extract_title(title_elem)
                        link = title_elem.get('href', '')
                        if link and not link.startswith('http'):
                            link = urljoin(url, link)
                        
                        # 날짜 찾기
                        date_str = None
                        for td in tds:
                            td_class = td.get('class', [])
                            if 't-date' in td_class or 'date' in td_class:
                                date_str = td.get_text(strip=True)
                                break
                        
                        if not date_str:
                            for td in tds:
                                text = td.get_text(strip=True)
                                if re.match(r'\d{4}[-./]\d{2}[-./]\d{2}', text):
                                    date_str = text
                                    break
                        
                        if not date_str:
                            continue
                        
                        date_obj = self.parse_date(date_str)
                        if not date_obj:
                            continue
                        
                        if self.is_within_7days(date_obj):
                            page_has_recent = True
                            if self.add_result(org_type, org_name, board_type, title, date_obj, link):
                                collected_count += 1
                                print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        continue

                if not page_has_recent:
                    print(f"  {page}페이지에 최근 7일 게시물 없음. 크롤링 종료.")
                    has_recent_posts = False
                else:
                    page += 1
                    time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                return collected_count, "접속 오류"

        if collected_count > 0:
            return collected_count, f"성공 ({collected_count}건)"
        else:
            return 0, "7일 이내 게시물 없음"
    
    def crawl_koem_board(self, url, board_type):
        """해양환경공단 게시판 크롤링"""
        org_name = "해양환경공단"
        print(f"\n{'='*60}")
        print(f"크롤링 시작: {org_name} - {board_type}")
        print(f"URL: {url}")

        page = 1
        has_recent_posts = True
        collected_count = 0

        while has_recent_posts and page <= 5:
            try:
                page_url = f"{url}&curPage={page}"
                print(f"\n{page}페이지 크롤링 중...")
                
                response = requests.get(page_url, headers=self.headers, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                board_items = soup.select('table tbody tr, ul.board_list li')

                if not board_items:
                    print(f"  게시물이 없습니다.")
                    return 0, "게시판 구조 오류"
                
                page_has_recent = False
                
                for item in board_items:
                    try:
                        if item.name == 'tr':
                            tds = item.find_all('td')
                            if len(tds) < 3:
                                continue
                            
                            title_elem = item.find('a', href=True)
                            if not title_elem:
                                continue

                            # 제목 추출
                            title = self.extract_title(title_elem)
                            link = title_elem.get('href', '')
                            if link and not link.startswith('http'):
                                link = urljoin(url, link)
                            
                            date_str = None
                            for td in tds:
                                text = td.get_text(strip=True)
                                if re.match(r'\d{4}[-./]\d{2}[-./]\d{2}', text):
                                    date_str = text
                                    break
                        else:
                            title_elem = item.select_one('a.subject, a.title')
                            if not title_elem:
                                continue

                            # title 속성이 있으면 전체 제목 사용, 없으면 텍스트 사용
                            title = title_elem.get('title', '').strip() or title_elem.get_text(strip=True)
                            link = title_elem.get('href', '')
                            if link and not link.startswith('http'):
                                link = urljoin(url, link)
                            
                            date_elem = item.select_one('span.date, p.date')
                            date_str = date_elem.get_text(strip=True) if date_elem else None
                        
                        if not date_str:
                            continue
                        
                        date_obj = self.parse_date(date_str)
                        if not date_obj:
                            continue
                        
                        if self.is_within_7days(date_obj):
                            page_has_recent = True
                            if self.add_result('공단', org_name, board_type, title, date_obj, link):
                                collected_count += 1
                                print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        continue

                if not page_has_recent:
                    print(f"  {page}페이지에 최근 7일 게시물 없음. 크롤링 종료.")
                    has_recent_posts = False
                else:
                    page += 1
                    time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                return collected_count, "접속 오류"

        if collected_count > 0:
            return collected_count, f"성공 ({collected_count}건)"
        else:
            return 0, "7일 이내 게시물 없음"
    
    def crawl_port_authority_board(self, org_name, url, board_type):
        """항만공사 게시판 크롤링"""
        print(f"\n{'='*60}")
        print(f"크롤링 시작: {org_name} - {board_type}")
        print(f"URL: {url}")

        page = 1
        has_recent_posts = True
        collected_count = 0

        while has_recent_posts and page <= 5:
            try:
                if 'currentPageNo' in url:
                    page_url = re.sub(r'currentPageNo=\d+', f'currentPageNo={page}', url)
                elif '?' in url:
                    page_url = f"{url}&page={page}"
                else:
                    page_url = f"{url}?page={page}"

                print(f"\n{page}페이지 크롤링 중...")

                response = requests.get(page_url, headers=self.headers, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')

                board_items = soup.select('table tbody tr, ul.board_list li, div.board_list li')

                if not board_items:
                    print(f"  게시물이 없습니다.")
                    return 0, "게시판 구조 오류"

                page_has_recent = False

                for item in board_items:
                    try:
                        title_elem = item.find('a', href=True)
                        if not title_elem:
                            continue

                        # 제목 추출
                        title = self.extract_title(title_elem)
                        link = title_elem.get('href', '')
                        
                        # 울산항만공사 링크 처리 (view.do 변환)
                        if 'upa.or.kr' in url:
                            p_idx = title_elem.get('data-req-get-p-idx')
                            if p_idx:
                                # list.do -> view.do 변환 및 idx 파라미터 추가
                                base_view_url = url.split('?')[0].replace('list.do', 'view.do')
                                # 기존 파라미터 유지 (bcIdx, mid 등)
                                if '?' in url:
                                    params = url.split('?')[1]
                                    link = f"{base_view_url}?{params}&idx={p_idx}"
                                else:
                                    link = f"{base_view_url}?idx={p_idx}"
                            elif link and not link.startswith('http'):
                                link = urljoin(url, link)
                        elif link and not link.startswith('http'):
                            link = urljoin(url, link)

                        date_str = None
                        if item.name == 'tr':
                            tds = item.find_all('td')
                            for td in tds:
                                td_class = td.get('class', [])
                                text = td.get_text(strip=True)
                                if 'date' in td_class or re.match(r'\d{4}[-./]\d{2}[-./]\d{2}', text):
                                    date_str = text
                                    break
                        else:
                            date_elem = item.select_one('span.date, p.date, .date')
                            date_str = date_elem.get_text(strip=True) if date_elem else None

                        if not date_str:
                            continue

                        date_obj = self.parse_date(date_str)
                        if not date_obj:
                            continue

                        if self.is_within_7days(date_obj):
                            page_has_recent = True
                            if self.add_result('항만공사', org_name, board_type, title, date_obj, link):
                                collected_count += 1
                                print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        continue

                if not page_has_recent:
                    print(f"  {page}페이지에 최근 7일 게시물 없음. 크롤링 종료.")
                    has_recent_posts = False
                else:
                    page += 1
                    time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                return collected_count, "접속 오류"

        if collected_count > 0:
            return collected_count, f"성공 ({collected_count}건)"
        else:
            return 0, "7일 이내 게시물 없음"

    def crawl_jeju_board(self, url, board_type):
        """제주특별자치도 게시판 크롤링"""
        org_name = "제주특별자치도"
        print(f"\n{'='*60}")
        print(f"크롤링 시작: {org_name} - {board_type}")
        print(f"URL: {url}")

        page = 1
        has_recent_posts = True
        collected_count = 0
        max_pages = 5

        while has_recent_posts and page <= max_pages:
            try:
                # 제주도청 게시판 URL 파라미터 구조
                # page=1일 때는 curPage를 추가하지 않음 (웹사이트가 href에 curPage를 포함시키므로)
                if page == 1:
                    # 첫 페이지는 curPage 없이 요청
                    if 'curPage' in url:
                        page_url = re.sub(r'[?&]curPage=\d+', '', url)
                        page_url = re.sub(r'\?&', '?', page_url)
                        page_url = re.sub(r'\?$', '', page_url)
                    else:
                        page_url = url
                else:
                    # page=2부터 curPage 추가
                    if 'curPage' in url:
                        page_url = re.sub(r'curPage=\d+', f'curPage={page}', url)
                    elif '?' in url:
                        page_url = f"{url}&curPage={page}"
                    else:
                        page_url = f"{url}?curPage={page}"

                print(f"\n{page}페이지 크롤링 중...")

                response = requests.get(page_url, headers=self.headers, timeout=30)
                response.raise_for_status()
                response.encoding = 'utf-8'
                soup = BeautifulSoup(response.text, 'html.parser')

                # 제주도청 게시판 구조: table.table-list tbody tr
                rows = soup.select('table.table-list tbody tr')

                if not rows:
                    print(f"  게시물이 없습니다.")
                    return 0, "게시판 구조 오류"

                page_has_recent = False

                for row in rows:
                    try:
                        tds = row.find_all('td')
                        if len(tds) < 5:
                            continue

                        # 게시물 번호 (공지사항 제외)
                        num_text = tds[0].get_text(strip=True)
                        if '공지' in num_text or not num_text.isdigit():
                            continue

                        # 제목 (TD[1])
                        title_td = tds[1]
                        title_elem = title_td.find('a', href=True)
                        if not title_elem:
                            continue

                        # 제목 추출 (title 속성에 전체 제목이 있음)
                        title = title_elem.get('title', '').strip() or title_elem.get_text(strip=True)
                        # "N" 라벨 제거
                        title = re.sub(r'\s*N\s*$', '', title).strip()

                        # 링크 생성 (base URL에서 쿼리 파라미터 제외하여 curPage 오염 방지)
                        link = title_elem.get('href', '')
                        if link and not link.startswith('http'):
                            # base URL에서 쿼리 파라미터 제거
                            base_url = 'https://www.jeju.go.kr'
                            link = urljoin(base_url, link)

                        # 날짜 (TD[4])
                        date_str = tds[4].get_text(strip=True) if len(tds) > 4 else None

                        if not date_str:
                            continue

                        date_obj = self.parse_date(date_str)
                        if not date_obj:
                            continue

                        if self.is_within_7days(date_obj):
                            page_has_recent = True
                            if self.add_result('지자체', org_name, board_type, title, date_obj, link):
                                collected_count += 1
                                print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        continue

                if not page_has_recent:
                    print(f"  {page}페이지에 최근 7일 게시물 없음. 크롤링 종료.")
                    has_recent_posts = False
                else:
                    page += 1
                    time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                return collected_count, "접속 오류"

        if collected_count > 0:
            return collected_count, f"성공 ({collected_count}건)"
        else:
            return 0, "7일 이내 게시물 없음"

    def crawl_mof_main_board(self, board_name):
        """해양수산부 본부 게시판 크롤링"""
        print(f"\n{'='*60}")
        print(f"크롤링 시작: 해양수산부 본부 - {board_name}")

        board_info = self.mof_boards.get(board_name)
        if not board_info:
            return 0, "게시판 정보 없음"

        url = f"{self.mof_base_url}/doc/ko/selectDocList.do"
        page = 1
        collected_count = 0
        seen_ids = set()
        max_pages = 5

        while page <= max_pages:
            try:
                print(f"\n{page}페이지 크롤링 중...")

                params = {
                    'menuSeq': board_info['menuSeq'],
                    'bbsSeq': board_info['bbsSeq'],
                    'pageIndex': page
                }

                response = requests.get(url, params=params, headers=self.headers, timeout=30)
                response.raise_for_status()
                response.encoding = 'utf-8'

                soup = BeautifulSoup(response.text, 'html.parser')
                rows = soup.select('table tbody tr')

                if not rows:
                    print(f"  게시물을 찾을 수 없습니다.")
                    return collected_count, "게시판 구조 오류" if collected_count == 0 else f"성공 ({collected_count}건)"

                page_has_recent = False

                for row in rows:
                    try:
                        # 번호 (공지글 제외)
                        num_td = row.select_one('td:nth-of-type(1)')
                        if not num_td or '공지' in num_td.get_text(strip=True):
                            continue

                        # 제목과 링크
                        title_td = row.select_one('td:nth-of-type(2)')
                        if not title_td:
                            continue

                        title_link = title_td.select_one('a')
                        if not title_link:
                            continue

                        title = title_link.get_text(strip=True)

                        # 링크 추출
                        onclick = title_link.get('onclick', '')
                        match = re.search(r"fn_selectDoc\('(\d+)'\)", onclick)
                        if not match:
                            match = re.search(r"fnSelectDoc\('(\d+)'\)", onclick)

                        if match:
                            article_seq = match.group(1)
                            link = f"{self.mof_base_url}/doc/ko/selectDoc.do?menuSeq={board_info['menuSeq']}&bbsSeq={board_info['bbsSeq']}&docSeq={article_seq}"
                        else:
                            continue

                        # 중복 체크
                        if link in seen_ids:
                            continue

                        # 작성일
                        date_td = row.select_one('td:nth-of-type(5)')
                        if not date_td:
                            continue

                        date_str = date_td.get_text(strip=True).rstrip('.')
                        date_obj = self.parse_date(date_str)

                        if not date_obj:
                            continue

                        if self.is_within_7days(date_obj):
                            page_has_recent = True
                            seen_ids.add(link)

                            if self.add_result('본부', '해양수산부', board_name, title, date_obj, link):
                                collected_count += 1
                                print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        continue

                if not page_has_recent:
                    print(f"  {page}페이지에 최근 7일 게시물 없음. 크롤링 종료.")
                    break
                else:
                    page += 1
                    time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                return collected_count, "접속 오류" if collected_count == 0 else f"성공 ({collected_count}건)"

        if collected_count > 0:
            return collected_count, f"성공 ({collected_count}건)"
        else:
            return 0, "7일 이내 게시물 없음"

    def crawl_busanpa_board(self, url, board_type):
        """부산항만공사 전용 크롤링 (div.board.list 구조)"""
        org_name = "부산항만공사"
        print(f"\n{'='*60}")
        print(f"크롤링 시작: {org_name} - {board_type}")
        print(f"URL: {url}")

        page = 1
        collected_count = 0
        seen_ids = set()
        max_pages = 5

        while page <= max_pages:
            try:
                # mCode 파라미터로 페이지 구분
                page_url = f"{url}&page={page}"
                print(f"\n{page}페이지 크롤링 중...")

                response = requests.get(page_url, headers=self.headers, timeout=30)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')

                # div.board.list 안의 ul.row 찾기
                board_div = soup.select_one('div.board.list')
                if not board_div:
                    print(f"  게시판을 찾을 수 없습니다.")
                    return collected_count, "게시판 구조 오류" if collected_count == 0 else f"성공 ({collected_count}건)"

                rows = board_div.select('ul.row')
                if not rows or len(rows) <= 1:  # 첫 행은 헤더
                    print(f"  게시물이 없습니다.")
                    return collected_count, "게시판 구조 오류" if collected_count == 0 else f"성공 ({collected_count}건)"

                page_has_recent = False

                # 첫 행은 헤더이므로 건너뛰기
                for row in rows[1:]:
                    try:
                        # 공지사항 제외
                        if row.select_one('mark'):
                            continue

                        # 제목과 링크
                        title_a = row.select_one('a')
                        if not title_a:
                            continue

                        title = title_a.get_text(strip=True)
                        onclick = title_a.get('onclick', '')
                        href = title_a.get('href', '')
                        
                        link = None
                        
                        # 1. href에서 링크 추출 (우선순위)
                        if href and 'mode=view' in href:
                             link = f"https://www.busanpa.com/kor/Board.do{href}"
                        
                        # 2. onclick에서 ID 추출 (백업)
                        if not link:
                            match = re.search(r"view\('(\d+)'\)", onclick)
                            if match:
                                post_id = match.group(1)
                                link = f"https://www.busanpa.com/kor/Board.do?mCode={url.split('mCode=')[1].split('&')[0]}&mode=view&nttId={post_id}"

                        if not link:
                            continue

                        # 중복 체크
                        if link in seen_ids:
                            continue

                        # 날짜 (li 태그 중 날짜 형식이 있는 것 찾기)
                        date_str = None
                        for li in row.select('li'):
                            text = li.get_text(strip=True)
                            if re.match(r'\d{4}[-./]\d{2}[-./]\d{2}', text):
                                date_str = text
                                break
                        
                        if not date_str:
                            continue

                        date_obj = self.parse_date(date_str)

                        if not date_obj:
                            continue
                        
                        if self.is_within_7days(date_obj):
                            page_has_recent = True
                            seen_ids.add(link)

                            if self.add_result('항만공사', org_name, board_type, title, date_obj, link):
                                collected_count += 1
                                print(f"  ✓ [{date_obj.strftime('%Y-%m-%d')}] {title}")

                    except Exception as e:
                        continue

                if not page_has_recent:
                    print(f"  {page}페이지에 최근 7일 게시물 없음. 크롤링 종료.")
                    break
                else:
                    page += 1
                    time.sleep(1)

            except Exception as e:
                print(f"  페이지 크롤링 오류: {e}")
                return collected_count, "접속 오류" if collected_count == 0 else f"성공 ({collected_count}건)"

        if collected_count > 0:
            return collected_count, f"성공 ({collected_count}건)"
        else:
            return 0, "7일 이내 게시물 없음"

    def run(self):
        """전체 크롤링 실행"""
        print(f"\n{'#'*60}")
        print(f"해양수산부 산하기관 크롤링 시작")
        print(f"기준일: {self.today.strftime('%Y-%m-%d')}")
        print(f"수집기간: {self.seven_days_ago.strftime('%Y-%m-%d')} ~ {self.today.strftime('%Y-%m-%d')}")
        print(f"{'#'*60}")
        
        # 어업관리단 데이터 (기관명, 인사발령URL)
        fishery_units = [
            ("동해어업관리단", "https://eastship.mof.go.kr/ko/board.do?menuIdx=265"),
            ("남해어업관리단", "https://southship.mof.go.kr/ko/board.do?menuIdx=766"),
        ]

        # 어업관리단 크롤링
        for org_name, personnel_url in fishery_units:
            count, status = self.crawl_mof_board("어업관리단", org_name, personnel_url, "인사발령")
            self.crawl_status.append({"기관구분": "어업관리단", "기관명": org_name, "게시판": "인사발령", "상태": status})
            time.sleep(2)

        # 지방청 데이터 (기관명, 입찰URL, 공지사항URL, 인사발령URL or None)
        regional_offices = [
            ("부산지방해양수산청", "https://busan.mof.go.kr/ko/board.do?menuIdx=4469", "https://busan.mof.go.kr/ko/board.do?menuIdx=4468", "https://busan.mof.go.kr/ko/board.do?menuIdx=4470"),
            ("인천지방해양수산청", "https://incheon.mof.go.kr/ko/board.do?menuIdx=1690", "https://incheon.mof.go.kr/ko/board.do?menuIdx=1688", "https://incheon.mof.go.kr/ko/board.do?menuIdx=1693"),
            ("여수지방해양수산청", "https://yeosu.mof.go.kr/ko/board.do?menuIdx=3808", "https://yeosu.mof.go.kr/ko/board.do?menuIdx=3807", "https://yeosu.mof.go.kr/ko/board.do?menuIdx=4148"),
            ("마산지방해양수산청", "https://masan.mof.go.kr/ko/board.do?menuIdx=2309", "https://masan.mof.go.kr/ko/board.do?menuIdx=2307", "https://masan.mof.go.kr/ko/board.do?menuIdx=2314"),
            ("울산지방해양수산청", "https://ulsan.mof.go.kr/ko/board.do?menuIdx=872", "https://ulsan.mof.go.kr/ko/board.do?menuIdx=868", "https://ulsan.mof.go.kr/ko/board.do?menuIdx=877"),
            ("동해지방해양수산청", "https://donghae.mof.go.kr/ko/board.do?menuIdx=2534", "https://donghae.mof.go.kr/ko/board.do?menuIdx=2532", "https://donghae.mof.go.kr/ko/board.do?menuIdx=2539"),
            ("군산지방해양수산청", "https://gunsan.mof.go.kr/ko/board.do?menuIdx=1113", "https://gunsan.mof.go.kr/ko/board.do?menuIdx=1111", "https://gunsan.mof.go.kr/ko/board.do?menuIdx=1120"),
            ("목포지방해양수산청", "https://mokpo.mof.go.kr/ko/board.do?menuIdx=1314", "https://mokpo.mof.go.kr/ko/board.do?menuIdx=1312", None),
            ("포항지방해양수산청", "https://pohang.mof.go.kr/ko/board.do?menuIdx=2853", "https://pohang.mof.go.kr/ko/board.do?menuIdx=2848", "https://pohang.mof.go.kr/ko/board.do?menuIdx=2858"),
            ("평택지방해양수산청", "https://pyeongtaek.mof.go.kr/ko/board.do?menuIdx=2125", "https://pyeongtaek.mof.go.kr/ko/board.do?menuIdx=2122", "https://pyeongtaek.mof.go.kr/ko/board.do?menuIdx=2129"),
            ("대산지방해양수산청", "https://daesan.mof.go.kr/ko/board.do?menuIdx=3018", "https://daesan.mof.go.kr/ko/board.do?menuIdx=3016", "https://daesan.mof.go.kr/ko/board.do?menuIdx=3021"),
        ]

        # 지방청 크롤링
        for office_data in regional_offices:
            org_name = office_data[0]
            bid_url = office_data[1]
            notice_url = office_data[2]
            personnel_url = office_data[3] if len(office_data) > 3 else None

            count, status = self.crawl_mof_board("지방청", org_name, notice_url, "공지사항")
            self.crawl_status.append({"기관구분": "지방청", "기관명": org_name, "게시판": "공지사항", "상태": status})
            time.sleep(2)
            
            if bid_url != notice_url:
                count, status = self.crawl_mof_board("지방청", org_name, bid_url, "입찰")
                self.crawl_status.append({"기관구분": "지방청", "기관명": org_name, "게시판": "입찰", "상태": status})
                time.sleep(2)

            # 인사발령 게시판이 있는 경우만 크롤링
            if personnel_url:
                count, status = self.crawl_mof_board("지방청", org_name, personnel_url, "인사발령")
                self.crawl_status.append({"기관구분": "지방청", "기관명": org_name, "게시판": "인사발령", "상태": status})
                time.sleep(2)

        # 해양환경공단
        count, status = self.crawl_koem_board("https://www.koem.or.kr/site/koem/ex/board/List.do?cbIdx=236", "공지사항")
        self.crawl_status.append({"기관구분": "공단", "기관명": "해양환경공단", "게시판": "공지사항", "상태": status})

        # 항만공사 - 부산항만공사 (전용 함수)
        count, status = self.crawl_busanpa_board("https://www.busanpa.com/kor/Board.do?mCode=MN1439", "공지사항")
        self.crawl_status.append({"기관구분": "항만공사", "기관명": "부산항만공사", "게시판": "공지사항", "상태": status})
        time.sleep(2)
        count, status = self.crawl_busanpa_board("https://www.busanpa.com/kor/Board.do?mCode=MN1259", "입찰")
        self.crawl_status.append({"기관구분": "항만공사", "기관명": "부산항만공사", "게시판": "입찰", "상태": status})
        time.sleep(2)

        # 항만공사 - 일반 (인천, 울산)
        port_authorities = [
            ("인천항만공사", None, "https://www.icpa.or.kr/article/list.do?boardKey=213&menuKey=397&currentPageNo=1"),
            ("울산항만공사", "https://www.upa.or.kr/portal/board/post/list.do?bcIdx=685&mid=0605080100", "https://www.upa.or.kr/portal/board/post/list.do?bcIdx=676&mid=0601000000"),
        ]

        for org_name, bid_url, notice_url in port_authorities:
            count, status = self.crawl_port_authority_board(org_name, notice_url, "공지사항")
            self.crawl_status.append({"기관구분": "항만공사", "기관명": org_name, "게시판": "공지사항", "상태": status})
            time.sleep(2)
            if bid_url and bid_url != notice_url:
                count, status = self.crawl_port_authority_board(org_name, bid_url, "입찰")
                self.crawl_status.append({"기관구분": "항만공사", "기관명": org_name, "게시판": "입찰", "상태": status})
                time.sleep(2)

        # 여수광양항만공사 (JavaScript 동적 로딩으로 크롤링 불가)
        self.crawl_status.append({"기관구분": "항만공사", "기관명": "여수광양항만공사", "게시판": "공지사항", "상태": "JavaScript 렌더링 필요 (미지원)"})

        # 해양수산부 본부
        for board_name in ['공지사항', '입찰', '인사']:
            count, status = self.crawl_mof_main_board(board_name)
            self.crawl_status.append({"기관구분": "본부", "기관명": "해양수산부", "게시판": board_name, "상태": status})
            time.sleep(2)

        # 지자체 - 제주특별자치도
        jeju_boards = [
            ("공지사항", "https://www.jeju.go.kr/news/news/news.htm"),
            ("입법,고시,공고", "https://www.jeju.go.kr/news/news/law/jeju2.htm"),
        ]

        for board_type, board_url in jeju_boards:
            count, status = self.crawl_jeju_board(board_url, board_type)
            self.crawl_status.append({"기관구분": "지자체", "기관명": "제주특별자치도", "게시판": board_type, "상태": status})
            time.sleep(2)

        # 결과 저장
        if self.results:
            df = pd.DataFrame(self.results)
            df = df.sort_values(['기관구분', '기관명', '게시판', '작성일'], ascending=[True, True, True, False])
            
            # CSV 저장
            csv_filename = f'marine_ministry_posts_{self.today.strftime("%Y%m%d")}.csv'
            df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
            
            # Excel 저장
            excel_filename = f'marine_ministry_posts_{self.today.strftime("%Y%m%d")}.xlsx'
            df.to_excel(excel_filename, index=False, engine='openpyxl')
            
            print(f"\n{'#'*60}")
            print(f"크롤링 완료!")
            print(f"총 {len(self.results)}건의 게시물 수집")
            print(f"CSV 파일: {csv_filename}")
            print(f"Excel 파일: {excel_filename}")
            print(f"{'#'*60}\n")
            
            # 통계 출력
            print("\n[ 기관별 통계 ]")
            stats = df.groupby(['기관구분', '기관명', '게시판']).size().reset_index(name='게시물수')
            print(stats.to_string(index=False))
        else:
            print(f"\n{'#'*60}")
            print("크롤링 완료!")
            print(f"총 0건의 게시물 수집")
            print(f"{'#'*60}\n")

        # 크롤링 상태 요약 출력
        if self.crawl_status:
            print(f"\n{'='*80}")
            print("[ 전체 크롤링 상태 요약 ]")
            print(f"{'='*80}")
            status_df = pd.DataFrame(self.crawl_status)
            print(status_df.to_string(index=False))
            print(f"{'='*80}\n")

        if self.results:
            return csv_filename, excel_filename
        else:
            return None, None

if __name__ == "__main__":
    crawler = MarineMinistryJejCrawler()
    crawler.run()
