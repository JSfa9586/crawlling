#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 뉴스 및 프로모션 크롤러 v3
- Playwright를 활용한 웹 크롤링
- 구글 검색, Product Hunt, AppSumo, Futurepedia, Reddit 크롤링
- GPT를 활용한 관련성 검증 (필터링)
- 헤드리스 모드로 백그라운드 실행
"""

from playwright.sync_api import sync_playwright
from openai import OpenAI
import pandas as pd
from datetime import datetime, timedelta
import pytz
import time
import re
import os

# OpenAI API 설정 (환경 변수에서 가져옴)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')


def verify_relevance_with_gpt(items, batch_size=10):
    """
    GPT를 사용하여 수집된 항목들의 관련성을 검증합니다.
    
    관련 기준:
    - 새로운 AI 앱/도구 출시 소식
    - 기존 AI 도구의 신기능 업데이트
    - AI 도구 할인/프로모션 정보 (가격 정보 포함)
    
    비관련 기준:
    - 규제, 정책, 법률 관련 뉴스
    - 시장 분석, 투자 뉴스
    - 일반 AI 기술 논의
    """
    if not items:
        return []
    
    client = OpenAI(api_key=OPENAI_API_KEY)
    verified_items = []
    
    print(f"\n[GPT 검증] {len(items)}개 항목 관련성 검증 중...")
    
    # 배치 처리
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        
        # 제목 목록 생성
        titles_text = "\n".join([f"{j+1}. [{item['분류']}] {item['제목']}" for j, item in enumerate(batch)])
        
        prompt = f"""다음 뉴스/게시물 제목들을 분석하여 다음 기준에 부합하는지 판정해주세요.

## 관련성 있음 (PASS)
- 새로운 AI 앱, 도구, 서비스 출시 소식
- 기존 AI 도구(ChatGPT, Claude, Midjourney 등)의 신기능 업데이트
- AI 도구 할인, 프로모션, 세일 정보

## 관련성 없음 (FAIL)
- AI 규제, 정책, 법률 관련 뉴스
- 시장 분석, 투자, 기업 인수 뉴스
- AI 기술 일반 논의, 학술 연구
- AI의 사회적 영향, 윤리 논쟁

## 항목 목록:
{titles_text}

## 응답 형식:
각 항목에 대해 PASS 또는 FAIL만 답변해주세요.
예시: 1:PASS, 2:FAIL, 3:PASS
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 AI 뉴스 관련성 판정 전문가입니다. 간결하게 PASS/FAIL만 답변합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.1
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # 결과 파싱
            for j, item in enumerate(batch):
                idx = j + 1
                if f"{idx}:PASS" in result_text or f"{idx}: PASS" in result_text:
                    verified_items.append(item)
                elif f"{idx}:FAIL" not in result_text and f"{idx}: FAIL" not in result_text:
                    # 명확하지 않은 경우 포함
                    verified_items.append(item)
            
            print(f"  - 배치 {i//batch_size + 1}: {len(batch)}개 중 {len([1 for j, item in enumerate(batch) if f'{j+1}:PASS' in result_text or f'{j+1}: PASS' in result_text])}개 통과")
            
        except Exception as e:
            print(f"  [WARN] GPT 검증 실패 (배치 {i//batch_size + 1}): {e}")
            # 실패시 모든 항목 유지
            verified_items.extend(batch)
        
        time.sleep(0.5)  # Rate limit 방지
    
    print(f"  → 최종 {len(verified_items)}개 항목 통과 (원본 {len(items)}개)")
    return verified_items



class AINewsCrawlerV2:
    """AI 뉴스 및 프로모션 크롤러 (Playwright 버전)"""
    
    def __init__(self):
        self.results = []
        self.seoul_tz = pytz.timezone('Asia/Seoul')
        self.today = datetime.now(self.seoul_tz)
        
    def add_result(self, source, category, title, description, link, date_str=""):
        """결과 추가 (중복 체크)"""
        # 링크로 중복 체크
        if any(r['링크'] == link for r in self.results):
            return False
        
        # 제목으로도 중복 체크
        if any(r['제목'] == title for r in self.results):
            return False
            
        self.results.append({
            '분류': category,
            '출처': source,
            '제목': title[:100] if title else '',
            '내용': description[:200] + '...' if len(description) > 200 else description,
            '링크': link,
            '작성일': date_str if date_str else self.today.strftime('%Y-%m-%d'),
        })
        return True
    
    def crawl_google_search(self, page, query, category):
        """구글 검색 크롤링"""
        print(f"  [구글] 검색 중: {query}")
        
        try:
            # 구글 검색 페이지로 이동
            page.goto(f"https://www.google.com/search?q={query}&tbm=nws", timeout=30000)
            page.wait_for_load_state('networkidle', timeout=15000)
            time.sleep(2)
            
            # 뉴스 결과 추출
            articles = page.query_selector_all('div[data-hveid] a[href^="http"]:not([href*="google.com"])')
            
            count = 0
            for article in articles[:30]:  # 상위 30개로 증가
                try:
                    href = article.get_attribute('href')
                    title_elem = article.query_selector('div[role="heading"]')
                    title = title_elem.inner_text() if title_elem else article.inner_text()
                    
                    if href and title and len(title) > 5:
                        if self.add_result('구글뉴스', category, title.strip(), '', href):
                            count += 1
                except:
                    continue
            
            print(f"    → {count}건 수집")
            return count
            
        except Exception as e:
            print(f"    [ERROR] 구글 검색 실패: {e}")
            return 0
    
    def crawl_product_hunt(self, page):
        """Product Hunt AI 카테고리 크롤링"""
        print(f"  [Product Hunt] AI 제품 수집 중...")
        
        try:
            page.goto("https://www.producthunt.com/topics/artificial-intelligence", timeout=30000)
            page.wait_for_load_state('networkidle', timeout=15000)
            time.sleep(3)
            
            # 제품 카드 추출
            products = page.query_selector_all('[data-test="product-item"], div[class*="styles_item"]')
            
            count = 0
            for product in products[:15]:
                try:
                    # 제목 및 링크
                    link_elem = product.query_selector('a[href*="/posts/"]')
                    if not link_elem:
                        link_elem = product.query_selector('a')
                    
                    if link_elem:
                        href = link_elem.get_attribute('href')
                        if href and not href.startswith('http'):
                            href = 'https://www.producthunt.com' + href
                        
                        title = link_elem.inner_text().strip()
                        
                        # 설명 추출
                        desc_elem = product.query_selector('p, [class*="tagline"]')
                        desc = desc_elem.inner_text().strip() if desc_elem else ''
                        
                        if title and href and len(title) > 3:
                            if self.add_result('ProductHunt', 'AI 신제품', title, desc, href):
                                count += 1
                except:
                    continue
            
            print(f"    → {count}건 수집")
            return count
            
        except Exception as e:
            print(f"    [ERROR] Product Hunt 크롤링 실패: {e}")
            return 0
    
    def crawl_appsumo(self, page):
        """AppSumo AI 할인 크롤링"""
        print(f"  [AppSumo] AI 할인 상품 수집 중...")
        
        try:
            page.goto("https://appsumo.com/search/?query=AI", timeout=30000)
            page.wait_for_load_state('networkidle', timeout=15000)
            time.sleep(3)
            
            # 상품 카드 추출
            products = page.query_selector_all('[data-testid="product-card"], div[class*="ProductCard"]')
            
            if len(products) == 0:
                # 대체 셀렉터
                products = page.query_selector_all('a[href*="/products/"]')
            
            count = 0
            for product in products[:20]:
                try:
                    # 링크 추출
                    if product.get_attribute('href'):
                        href = product.get_attribute('href')
                    else:
                        link_elem = product.query_selector('a[href*="/products/"]')
                        href = link_elem.get_attribute('href') if link_elem else None
                    
                    if href and not href.startswith('http'):
                        href = 'https://appsumo.com' + href
                    
                    # 제목 추출
                    title_elem = product.query_selector('h3, h2, [class*="title"]')
                    title = title_elem.inner_text().strip() if title_elem else product.inner_text().strip()[:50]
                    
                    # 가격 추출
                    price_elem = product.query_selector('[class*="price"], span:has-text("$")')
                    price = price_elem.inner_text().strip() if price_elem else ''
                    
                    if title and href and '/products/' in href:
                        desc = f"할인가: {price}" if price else "AppSumo 할인 제공"
                        if self.add_result('AppSumo', 'AI 할인', title, desc, href):
                            count += 1
                except:
                    continue
            
            print(f"    → {count}건 수집")
            return count
            
        except Exception as e:
            print(f"    [ERROR] AppSumo 크롤링 실패: {e}")
            return 0
    
    def crawl_futurepedia(self, page):
        """Futurepedia 최신 AI 도구 크롤링"""
        print(f"  [Futurepedia] 최신 AI 도구 수집 중...")
        
        try:
            page.goto("https://www.futurepedia.io/ai-tools?sort=newest", timeout=30000)
            page.wait_for_load_state('networkidle', timeout=15000)
            time.sleep(2)
            
            # 도구 카드 추출
            tools = page.query_selector_all('a[href*="/tool/"]')
            
            count = 0
            seen_hrefs = set()
            for tool in tools[:30]:
                try:
                    href = tool.get_attribute('href')
                    if href in seen_hrefs:
                        continue
                    seen_hrefs.add(href)
                    
                    if not href.startswith('http'):
                        href = 'https://www.futurepedia.io' + href
                    
                    # 제목 추출
                    title_elem = tool.query_selector('h3, h2, span[class*="name"]')
                    title = title_elem.inner_text().strip() if title_elem else tool.inner_text().strip()
                    
                    # 설명 추출
                    parent = tool.query_selector('xpath=..')
                    desc_elem = parent.query_selector('p') if parent else None
                    desc = desc_elem.inner_text().strip() if desc_elem else ''
                    
                    if title and href and len(title) > 2 and '/tool/' in href:
                        if self.add_result('Futurepedia', 'AI 신규 도구', title, desc, href):
                            count += 1
                except:
                    continue
            
            print(f"    → {count}건 수집")
            return count
            
        except Exception as e:
            print(f"    [ERROR] Futurepedia 크롤링 실패: {e}")
            return 0
    
    def crawl_reddit(self, page):
        """Reddit AI 커뮤니티 크롤링"""
        print(f"  [Reddit] AI 커뮤니티 게시물 수집 중...")
        
        try:
            # r/artificial 서브레딧
            page.goto("https://www.reddit.com/r/artificial/new/", timeout=30000)
            page.wait_for_load_state('networkidle', timeout=15000)
            time.sleep(3)
            
            # 게시물 추출
            posts = page.query_selector_all('a[data-click-id="body"], shreddit-post a[href*="/comments/"]')
            
            count = 0
            seen_titles = set()
            for post in posts[:20]:
                try:
                    href = post.get_attribute('href')
                    if not href or '/comments/' not in href:
                        continue
                    
                    if not href.startswith('http'):
                        href = 'https://www.reddit.com' + href
                    
                    title = post.inner_text().strip()
                    if title in seen_titles or len(title) < 10:
                        continue
                    seen_titles.add(title)
                    
                    if self.add_result('Reddit', 'AI 커뮤니티', title, '', href):
                        count += 1
                except:
                    continue
            
            print(f"    → {count}건 수집")
            return count
            
        except Exception as e:
            print(f"    [ERROR] Reddit 크롤링 실패: {e}")
            return 0
    
    def save_results(self):
        """결과를 CSV 파일로 저장"""
        if not self.results:
            print("[INFO] 수집된 데이터가 없습니다.")
            return None
        
        df = pd.DataFrame(self.results)
        
        # 날짜별 파일명
        date_str = self.today.strftime('%Y%m%d')
        filename = f"ai_news_{date_str}.csv"
        
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"\n[OK] 저장 완료: {filename} ({len(df)}건)")
        
        return filename
    
    def run(self):
        """전체 크롤링 실행"""
        print("=" * 60)
        print(f"AI 뉴스 크롤러 v2 (Playwright) 시작")
        print(f"실행 시간: {self.today.strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        with sync_playwright() as p:
            # 헤드리스 모드로 브라우저 실행
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport={'width': 1920, 'height': 1080}
            )
            page = context.new_page()
            
            print("\n[1/5] 구글 뉴스 검색")
            # 구글 검색 - AI 신제품
            google_queries = [
                ("new AI app launch 2024", "AI 신제품"),
                ("ChatGPT new feature", "AI 업데이트"),
                ("Claude AI update", "AI 업데이트"),
                ("Midjourney update", "AI 업데이트"),
                ("AI tool discount deal", "AI 할인"),
            ]
            for query, category in google_queries:
                self.crawl_google_search(page, query, category)
                time.sleep(2)
            
            print("\n[2/5] Product Hunt 크롤링")
            self.crawl_product_hunt(page)
            
            print("\n[3/5] AppSumo 크롤링")
            self.crawl_appsumo(page)
            
            print("\n[4/5] Futurepedia 크롤링")
            self.crawl_futurepedia(page)
            
            print("\n[5/5] Reddit 크롤링")
            self.crawl_reddit(page)
            
            browser.close()
        
        # GPT 관련성 검증
        print("\n[6/6] GPT 관련성 검증")
        original_count = len(self.results)
        self.results = verify_relevance_with_gpt(self.results)
        filtered_count = original_count - len(self.results)
        print(f"  → {filtered_count}건 필터링됨")
        
        # 결과 저장
        filename = self.save_results()
        
        print("\n" + "=" * 60)
        print(f"크롤링 완료! 총 {len(self.results)}건 수집 (GPT 검증 통과)")
        
        # 카테고리별 통계
        categories = {}
        for r in self.results:
            cat = r['분류']
            categories[cat] = categories.get(cat, 0) + 1
        
        print("\n[카테고리별 통계]")
        for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
            print(f"  - {cat}: {count}건")
        
        print("=" * 60)
        
        return filename



if __name__ == "__main__":
    crawler = AINewsCrawlerV2()
    crawler.run()
