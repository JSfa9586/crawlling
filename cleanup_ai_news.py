#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
구글 시트 AI소식 데이터 정리
- 기존 데이터를 GPT로 검증하여 관련 없는 항목 삭제
"""

import gspread
from google.oauth2.service_account import Credentials
from openai import OpenAI
import time
import os
import glob

# 설정 (환경 변수에서 가져옴)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID', '1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw')


def get_credentials():
    """구글 인증 정보 가져오기"""
    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    
    # JSON 파일 찾기
    json_files = glob.glob('gen-lang-client-*.json')
    if json_files:
        credentials = Credentials.from_service_account_file(json_files[0], scopes=scopes)
        print(f"[INFO] 인증 파일 사용: {json_files[0]}")
        return credentials
    else:
        raise Exception("인증 파일을 찾을 수 없습니다.")


def verify_with_gpt(items, batch_size=10):
    """GPT로 관련성 검증"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    results = []  # (row_index, pass/fail)
    
    print(f"\n[GPT 검증] {len(items)}개 항목 검증 중...")
    
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        
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
            
            pass_count = 0
            for j, item in enumerate(batch):
                idx = j + 1
                is_pass = f"{idx}:PASS" in result_text or f"{idx}: PASS" in result_text
                is_fail = f"{idx}:FAIL" in result_text or f"{idx}: FAIL" in result_text
                
                if is_pass:
                    results.append((item['row_index'], True))
                    pass_count += 1
                elif is_fail:
                    results.append((item['row_index'], False))
                else:
                    # 불명확한 경우 유지
                    results.append((item['row_index'], True))
                    pass_count += 1
            
            print(f"  - 배치 {i//batch_size + 1}: {len(batch)}개 중 {pass_count}개 통과")
            
        except Exception as e:
            print(f"  [WARN] GPT 검증 실패: {e}")
            for item in batch:
                results.append((item['row_index'], True))
        
        time.sleep(0.5)
    
    return results


def main():
    print("=" * 60)
    print("구글 시트 AI소식 데이터 정리")
    print("=" * 60)
    
    # 인증
    credentials = get_credentials()
    client = gspread.authorize(credentials)
    spreadsheet = client.open_by_key(SPREADSHEET_ID)
    
    # AI소식 워크시트 가져오기
    try:
        worksheet = spreadsheet.worksheet('AI소식')
    except:
        print("[ERROR] 'AI소식' 워크시트를 찾을 수 없습니다.")
        return
    
    # 모든 데이터 가져오기
    all_data = worksheet.get_all_values()
    
    if len(all_data) <= 1:
        print("[INFO] 데이터가 없습니다.")
        return
    
    headers = all_data[0]
    rows = all_data[1:]
    
    print(f"[INFO] 기존 데이터: {len(rows)}건")
    
    # 컬럼 인덱스 찾기
    try:
        title_idx = headers.index('제목')
        category_idx = headers.index('분류')
    except ValueError:
        print("[ERROR] 필수 컬럼(제목, 분류)을 찾을 수 없습니다.")
        return
    
    # 검증할 항목 준비
    items = []
    for i, row in enumerate(rows):
        items.append({
            'row_index': i + 2,  # 헤더가 1행이므로 +2
            '제목': row[title_idx] if title_idx < len(row) else '',
            '분류': row[category_idx] if category_idx < len(row) else '',
        })
    
    # GPT 검증
    results = verify_with_gpt(items)
    
    # 삭제할 행 찾기 (역순으로 정렬)
    rows_to_delete = [r[0] for r in results if not r[1]]
    rows_to_delete.sort(reverse=True)
    
    print(f"\n[INFO] 삭제 대상: {len(rows_to_delete)}건")
    
    if rows_to_delete:
        print("[삭제 중...]")
        for row_idx in rows_to_delete:
            try:
                worksheet.delete_rows(row_idx)
                print(f"  - 행 {row_idx} 삭제")
                time.sleep(0.3)  # API 레이트 리밋 방지
            except Exception as e:
                print(f"  [WARN] 행 {row_idx} 삭제 실패: {e}")
    
    # 최종 결과
    final_count = len(rows) - len(rows_to_delete)
    print(f"\n[완료] 최종 데이터: {final_count}건 (삭제: {len(rows_to_delete)}건)")
    print("=" * 60)


if __name__ == "__main__":
    main()
