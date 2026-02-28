#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Windows Task Scheduler Setup
    Creates all scheduled tasks for the autonomous agent team (MONTHLY schedule).
    Uses schtasks.exe so no Administrator elevation is needed.

.NOTES
    Author: Kognitrix AI Agent Team
    Requires: Windows Task Scheduler, Claude Code CLI, PowerShell 5.1+
#>

$ErrorActionPreference = "Stop"

$ScriptsDir = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai\agent-team\scripts"
$WorkDir = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  KOGNITRIX AI - MONTHLY TASK SCHEDULER SETUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verify scripts exist
$scripts = @(
    "run-monthly-feature.ps1",
    "run-code-review.ps1",
    "run-support-check.ps1",
    "run-business-review.ps1"
)

foreach ($script in $scripts) {
    $path = Join-Path $ScriptsDir $script
    if (-not (Test-Path $path)) {
        Write-Host "ERROR: Script not found: $path" -ForegroundColor Red
        exit 1
    }
}

Write-Host "All scripts verified." -ForegroundColor Green
Write-Host ""

# Remove old daily/weekly tasks if they exist
$oldTasks = @(
    "KognitrixAI-WeeklyFeatureCycle",
    "KognitrixAI-DailyCodeReview",
    "KognitrixAI-DailySupportCheck",
    "KognitrixAI-WeeklyBusinessReview"
)
foreach ($task in $oldTasks) {
    schtasks /Delete /TN $task /F 2>$null
}

# ============================================================================
# TASK 1: Monthly Feature Cycle - 1st of each month at 09:00
# ============================================================================
Write-Host "Creating Task 1: Monthly Feature Cycle (1st of month, 09:00)..." -ForegroundColor Yellow

$cmd1 = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$ScriptsDir\run-monthly-feature.ps1`""
schtasks /Create /TN "KognitrixAI-MonthlyFeatureCycle" /TR "$cmd1" /SC MONTHLY /D 1 /ST 09:00 /F 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Task created successfully!" -ForegroundColor Green
} else {
    Write-Host "  Failed to create task (exit code: $LASTEXITCODE)" -ForegroundColor Red
}

# ============================================================================
# TASK 2: Monthly Code Review - 8th of each month at 14:00
# ============================================================================
Write-Host "Creating Task 2: Monthly Code Review (8th of month, 14:00)..." -ForegroundColor Yellow

$cmd2 = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$ScriptsDir\run-code-review.ps1`""
schtasks /Create /TN "KognitrixAI-MonthlyCodeReview" /TR "$cmd2" /SC MONTHLY /D 8 /ST 14:00 /F 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Task created successfully!" -ForegroundColor Green
} else {
    Write-Host "  Failed to create task (exit code: $LASTEXITCODE)" -ForegroundColor Red
}

# ============================================================================
# TASK 3: Monthly Support Check - 8th of each month at 08:00
# ============================================================================
Write-Host "Creating Task 3: Monthly Support Check (8th of month, 08:00)..." -ForegroundColor Yellow

$cmd3 = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$ScriptsDir\run-support-check.ps1`""
schtasks /Create /TN "KognitrixAI-MonthlySupportCheck" /TR "$cmd3" /SC MONTHLY /D 8 /ST 08:00 /F 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Task created successfully!" -ForegroundColor Green
} else {
    Write-Host "  Failed to create task (exit code: $LASTEXITCODE)" -ForegroundColor Red
}

# ============================================================================
# TASK 4: Monthly Business Review - 28th of each month at 17:00
# ============================================================================
Write-Host "Creating Task 4: Monthly Business Review (28th of month, 17:00)..." -ForegroundColor Yellow

$cmd4 = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$ScriptsDir\run-business-review.ps1`""
schtasks /Create /TN "KognitrixAI-MonthlyBusinessReview" /TR "$cmd4" /SC MONTHLY /D 28 /ST 17:00 /F 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Task created successfully!" -ForegroundColor Green
} else {
    Write-Host "  Failed to create task (exit code: $LASTEXITCODE)" -ForegroundColor Red
}

# ============================================================================
# VERIFY
# ============================================================================
Write-Host ""
Write-Host "Verifying tasks..." -ForegroundColor Yellow
schtasks /Query /TN "KognitrixAI-MonthlyFeatureCycle" /FO LIST 2>$null | Select-String "TaskName|Status|Next Run"
schtasks /Query /TN "KognitrixAI-MonthlyCodeReview" /FO LIST 2>$null | Select-String "TaskName|Status|Next Run"
schtasks /Query /TN "KognitrixAI-MonthlySupportCheck" /FO LIST 2>$null | Select-String "TaskName|Status|Next Run"
schtasks /Query /TN "KognitrixAI-MonthlyBusinessReview" /FO LIST 2>$null | Select-String "TaskName|Status|Next Run"

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scheduled Tasks Created (MONTHLY):" -ForegroundColor White
Write-Host "  1. MonthlyFeatureCycle    - 1st  at 09:00  (research + develop + review)" -ForegroundColor Gray
Write-Host "  2. MonthlyCodeReview      - 8th  at 14:00  (review open PRs)" -ForegroundColor Gray
Write-Host "  3. MonthlySupportCheck    - 8th  at 08:00  (support quality audit)" -ForegroundColor Gray
Write-Host "  4. MonthlyBusinessReview  - 28th at 17:00  (business analysis)" -ForegroundColor Gray
Write-Host ""
Write-Host "To run a task manually:" -ForegroundColor Yellow
Write-Host "  schtasks /Run /TN `"KognitrixAI-MonthlyFeatureCycle`"" -ForegroundColor Gray
Write-Host ""
Write-Host "Logs:    agent-team\logs\" -ForegroundColor Gray
Write-Host "Reports: agent-team\reports\" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: PRs are created for your review - they are NEVER auto-merged." -ForegroundColor Cyan
