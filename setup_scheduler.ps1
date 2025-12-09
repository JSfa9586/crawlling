
$TaskName = "G2B_Auto_Collector"
$ScriptPath = "c:\AI\251118 크롤링\auto_collector.py"
$PythonPath = "python"
$WorkDir = "c:\AI\251118 크롤링"

# Trigger: Daily at 01:00 AM
try {
    $Trigger = New-ScheduledTaskTrigger -Daily -At "01:00am"
    
    # Action: Run Python script (Quote script path to handle spaces)
    $Action = New-ScheduledTaskAction -Execute $PythonPath -Argument "`"$ScriptPath`"" -WorkingDirectory $WorkDir
    
    # Settings: Allow running on demand, stop if runs longer than 23 hours
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 23)
    
    # Register Task
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Daily G2B Contract Collection (2025->2005)" -Force
    
    Write-Host "Task '$TaskName' registered successfully to run daily at 01:00 AM."
}
catch {
    Write-Error "Failed to register task: $_"
    exit 1
}
