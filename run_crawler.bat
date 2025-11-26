@echo off
chcp 65001 > nul
setlocal

echo ========================================================
echo [환경영향평가협회 크롤링 및 업로드 - 로컬 실행]
echo ========================================================

:: 1. 환경 변수 설정
if "%EIAA_USER_ID%"=="" set /p EIAA_USER_ID="EIAA 아이디를 입력하세요: "
if "%EIAA_PASSWORD%"=="" set /p EIAA_PASSWORD="EIAA 비밀번호를 입력하세요: "

:: 2. 크롤러 실행
echo.
echo [1/2] 크롤러 실행 중...
python eiaa_crawler.py

if %ERRORLEVEL% NEQ 0 (
    echo [오류] 크롤링 중 문제가 발생했습니다.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. 업로드 스크립트 실행
echo.
echo [2/2] 구글 시트 업로드 중...
python upload_to_gsheet.py

if %ERRORLEVEL% NEQ 0 (
    echo [오류] 업로드 중 문제가 발생했습니다.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo [성공] 모든 작업이 완료되었습니다!
echo ========================================================
pause
