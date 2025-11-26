@echo off
chcp 65001 > nul
setlocal

:: 로그 파일 설정
set LOG_FILE=crawler_log.txt
echo [%DATE% %TIME%] 크롤링 작업 시작 >> %LOG_FILE%

:: 1. 환경 변수 설정 (run_crawler.bat에서 복사)
set EIAA_USER_ID=seco1229
set EIAA_PASSWORD=seco9308

:: 2. 크롤러 실행
echo [1/2] 크롤러 실행 중... >> %LOG_FILE%
python eiaa_crawler.py >> %LOG_FILE% 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [오류] 크롤링 중 문제가 발생했습니다. >> %LOG_FILE%
    exit /b %ERRORLEVEL%
)

:: 3. 업로드 스크립트 실행
echo [2/2] 구글 시트 업로드 중... >> %LOG_FILE%
python upload_to_gsheet.py >> %LOG_FILE% 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [오류] 업로드 중 문제가 발생했습니다. >> %LOG_FILE%
    exit /b %ERRORLEVEL%
)

echo [성공] 모든 작업이 완료되었습니다. >> %LOG_FILE%
echo -------------------------------------------------------- >> %LOG_FILE%
