#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import glob

# 마크다운 파일 찾기
md_files = glob.glob(r'C:\AI\251118\*.md')

for md_file in md_files:
    filename = os.path.basename(md_file)
    print(f"\n{'='*80}")
    print(f"파일명: {filename}")
    print(f"{'='*80}\n")

    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            # 첫 150줄만 출력
            lines = content.split('\n')[:150]
            print('\n'.join(lines))
    except Exception as e:
        print(f"오류: {e}")

    print("\n" + "="*80 + "\n")
