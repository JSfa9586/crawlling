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
    r"C:\AI\251118 크롤링\공공데이터포탈api가이드\251209 해역이용_영향평가정보_서비스_활용_가이드.docx"
]

for f in files:
    print(f"--- Processing: {os.path.basename(f)} ---")
    content = extract_text_from_docx(f)
    print(f"Content Length: {len(content)}")
    if "영향평가" in f:
        print("DUMPING SECOND FILE CONTENT:")
        print(content[:5000])
    
    endpoints = re.findall(r'\bget[a-zA-Z0-9]+\b', content)
    print("Endpoints Found:", list(set(endpoints)))
    print("\n" + "="*50 + "\n")
