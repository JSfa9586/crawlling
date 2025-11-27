@echo off
chcp 65001 > nul
setlocal

:: 로그 파일 설정
set LOG_FILE=crawler_log.txt
echo [%DATE% %TIME%] 자동 크롤링 시작 >> %LOG_FILE%

:: 환경 변수 설정
set EIAA_USER_ID=seco1229
set EIAA_PASSWORD=seco9308

:: 1. EIAA 크롤러 실행
echo [%DATE% %TIME%] EIAA 크롤러 실행... >> %LOG_FILE%
python eiaa_crawler.py >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] [ERROR] EIAA 크롤링 실패 >> %LOG_FILE%
)

:: 2. 법제처 크롤러 실행
echo [%DATE% %TIME%] 법제처 크롤러 실행... >> %LOG_FILE%
python moleg_crawler.py >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] [ERROR] 법제처 크롤링 실패 >> %LOG_FILE%
)

:: 3. 구글 시트 업로드
echo [%DATE% %TIME%] 구글 시트 업로드... >> %LOG_FILE%
python upload_to_gsheet.py >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] [ERROR] 업로드 실패 >> %LOG_FILE%
)

echo [%DATE% %TIME%] 작업 완료 >> %LOG_FILE%
echo ---------------------------------------- >> %LOG_FILE%
