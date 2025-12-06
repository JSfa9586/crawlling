@echo off
chcp 65001 > nul
setlocal

echo ========================================================
echo [통합 크롤링 및 업로드 - 로컬 실행]
echo ========================================================

:: 1. 환경 변수 설정
set EIAA_USER_ID=seco1229
set EIAA_PASSWORD=seco9308

if "%EIAA_USER_ID%"=="" set /p EIAA_USER_ID="EIAA 아이디를 입력하세요: "
if "%EIAA_PASSWORD%"=="" set /p EIAA_PASSWORD="EIAA 비밀번호를 입력하세요: "

:: 2. EIAA 크롤러 실행
echo.
echo [1/4] 환경영향평가협회 크롤러 실행 중...
python eiaa_crawler.py
if %ERRORLEVEL% NEQ 0 (
    echo [오류] EIAA 크롤링 실패.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. 법제처 크롤러 실행
echo.
echo [2/4] 법제처(관련법령) 크롤러 실행 중...
python moleg_crawler.py
if %ERRORLEVEL% NEQ 0 (
    echo [오류] 법제처 크롤링 실패.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. AI 뉴스 크롤러 실행
echo.
echo [3/4] AI 뉴스/프로모션 크롤러 실행 중...
python ai_news_crawler.py
if %ERRORLEVEL% NEQ 0 (
    echo [오류] AI 뉴스 크롤링 실패.
    pause
    exit /b %ERRORLEVEL%
)

:: 5. 업로드 스크립트 실행
echo.
echo [4/4] 구글 시트 업로드 중...
python upload_to_gsheet.py
if %ERRORLEVEL% NEQ 0 (
    echo [오류] 업로드 실패.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo [성공] 모든 작업이 완료되었습니다!
echo ========================================================
pause

