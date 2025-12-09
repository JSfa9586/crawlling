import zipfile
import re
import os

def search_in_xml(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as zf:
            xml_content = zf.read('word/document.xml').decode('utf-8')
            # Simply search for "http" to be safe and print larger chunk
            idx = 0
            while True:
                idx = xml_content.find("http", idx)
                if idx == -1: break
                
                start = max(0, idx - 10)
                end = min(len(xml_content), idx + 500)
                print(f"RAW XML CONTEXT: {xml_content[start:end]}")
                idx += 50  # skip a bit to avoid overlap
    except Exception as e:
        print(f"Error: {e}")

files = [
    r"C:\AI\251118 크롤링\공공데이터포탈api가이드\251209 해역이용협의 정보서비스 활용가이드.docx",
    r"C:\AI\251118 크롤링\공공데이터포탈api가이드\251209 해역이용협의_평가대행자_정보_서비스_활용_가이드.docx",
    r"C:\AI\251118 크롤링\공공데이터포탈api가이드\251209 해역이용_영향평가정보_서비스_활용_가이드.docx"
]

for f in files:
    print(f"--- Processing: {os.path.basename(f)} ---")
    if not os.path.exists(f):
        print("File not found!")
        continue
        
    search_in_xml(f)
    print("\n" + "="*50 + "\n")
