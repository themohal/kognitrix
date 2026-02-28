#Requires -Version 5.1
#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Kognitrix AI - Remove All Scheduled Tasks
    Cleanly removes all agent team scheduled tasks from Windows Task Scheduler.
#>

$ErrorActionPreference = "Stop"
$TaskFolder = "\KognitrixAI"

Write-Host "Removing all Kognitrix AI scheduled tasks..." -ForegroundColor Yellow

try {
    $tasks = Get-ScheduledTask -TaskPath "$TaskFolder\" -ErrorAction SilentlyContinue
    if ($tasks) {
        foreach ($task in $tasks) {
            Unregister-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath -Confirm:$false
            Write-Host "  Removed: $($task.TaskName)" -ForegroundColor Green
        }
        Write-Host "All tasks removed successfully." -ForegroundColor Green
    } else {
        Write-Host "No Kognitrix AI tasks found." -ForegroundColor Gray
    }
} catch {
    Write-Host "Error removing tasks: $_" -ForegroundColor Red
}
