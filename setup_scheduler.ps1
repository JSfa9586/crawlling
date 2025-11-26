$TaskName = "EIAA_Crawler_Daily"
$ScriptPath = "c:\AI\251118 크롤링\run_crawler_auto.bat"
$WorkDir = "c:\AI\251118 크롤링"
$Time = "09:00" # 매일 오전 9시 실행

Write-Host "작업 스케줄러 등록을 시작합니다..." -ForegroundColor Cyan

# 기존 작업이 있으면 삭제
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# 작업 동작 정의 (배치 파일 실행)
$Action = New-ScheduledTaskAction -Execute $ScriptPath -WorkingDirectory $WorkDir

# 작업 트리거 정의 (매일 08, 11, 15, 20시)
$Trigger1 = New-ScheduledTaskTrigger -Daily -At "08:00"
$Trigger2 = New-ScheduledTaskTrigger -Daily -At "11:00"
$Trigger3 = New-ScheduledTaskTrigger -Daily -At "15:00"
$Trigger4 = New-ScheduledTaskTrigger -Daily -At "20:00"
$Triggers = @($Trigger1, $Trigger2, $Trigger3, $Trigger4)

# 작업 설정 (배터리 모드에서도 실행, 실패 시 재시도 등)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# 작업 등록
try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Triggers -Settings $Settings -Description "환경영향평가협회 크롤링 자동화 작업"
    Write-Host "✅ 작업이 성공적으로 등록되었습니다!" -ForegroundColor Green
    Write-Host "   - 작업명: $TaskName"
    Write-Host "   - 실행 시간: 매일 08:00, 11:00, 15:00, 20:00"
    Write-Host "   - 실행 파일: $ScriptPath"
} catch {
    Write-Host "❌ 작업 등록 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "관리자 권한으로 실행해 보세요." -ForegroundColor Yellow
}

Read-Host "엔터 키를 누르면 종료합니다..."
