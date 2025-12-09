import zipfile
import re
import os

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as zf:
            xml_content = zf.read('word/document.xml').decode('utf-8')
            text = re.sub('<[^>]+>', ' ', xml_content)
            text = re.sub(r'\s+', ' ', text).strip()
            return text
    except Exception as e:
        return f"Error reading {docx_path}: {e}"

files = [
    r"C:\AI\251118 크롤링\공공데이터포탈api가이드\251209 해역이용협의 정보서비스 활용가이드.docx",
    r"C:\AI\251118 크롤링\공공데이터포탈api가이드\251209 해역이용협의_평가대행자_정보_서비스_활용_가이드.docx"
]

for f in files:
    print(f"--- Processing: {os.path.basename(f)} ---")
    content = extract_text_from_docx(f)
    
    # URL 찾기
    urls = re.findall(r'https?://[^\s]+', content)
    print("Found URLs:", list(set(urls))[:5])
    
    # Endpoint 찾기 (get...)
    endpoints = re.findall(r'get[a-zA-Z]+', content)
    print("Potential Endpoints:", list(set(endpoints)))
    
    # 파라미터 힌트 (sidoNm, sigunguNm 등)
    params = re.findall(r'\b[a-z]{3,}[A-Z][a-zA-Z0-9]*\b', content)
    print("Potential Params:", list(set(params))[:10])
    
    print("\n" + "="*50 + "\n")
