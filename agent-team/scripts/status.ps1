<#
.SYNOPSIS
    Kognitrix AI - Agent Team Status Dashboard
    Shows the current status of all agents, scheduled tasks, backlog, and recent activity.
#>

$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$BacklogFile = Join-Path $ProjectPath "agent-team\backlog\features.json"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$ReportsDir = Join-Path $ProjectPath "agent-team\reports"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  KOGNITRIX AI - AGENT TEAM STATUS" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan

# ---- Scheduled Tasks ----
Write-Host ""
Write-Host "SCHEDULED TASKS:" -ForegroundColor Yellow
try {
    $tasks = Get-ScheduledTask -TaskPath "\KognitrixAI\" -ErrorAction SilentlyContinue
    if ($tasks) {
        foreach ($task in $tasks) {
            $info = $task | Get-ScheduledTaskInfo
            $status = switch ($task.State) {
                "Ready"   { "Ready" }
                "Running" { "RUNNING" }
                "Disabled"{ "Disabled" }
                default   { $task.State }
            }
            $lastRun = if ($info.LastRunTime -and $info.LastRunTime -gt [DateTime]::MinValue) {
                $info.LastRunTime.ToString("yyyy-MM-dd HH:mm")
            } else { "Never" }
            $color = if ($task.State -eq "Ready") { "Green" } elseif ($task.State -eq "Running") { "Cyan" } else { "Red" }
            Write-Host "  [$status] $($task.TaskName) | Last: $lastRun" -ForegroundColor $color
        }
    } else {
        Write-Host "  No scheduled tasks found. Run setup-scheduler.ps1 as Admin." -ForegroundColor Red
    }
} catch {
    Write-Host "  Could not read scheduled tasks (may need Admin)." -ForegroundColor Red
}

# ---- Feature Backlog ----
Write-Host ""
Write-Host "FEATURE BACKLOG:" -ForegroundColor Yellow
if (Test-Path $BacklogFile) {
    $backlog = Get-Content $BacklogFile -Raw | ConvertFrom-Json
    $pending = ($backlog.features | Where-Object { $_.status -eq "pending" }).Count
    $inProgress = ($backlog.features | Where-Object { $_.status -eq "in_progress" }).Count
    $prCreated = ($backlog.features | Where-Object { $_.status -eq "pr_created" }).Count
    $merged = ($backlog.features | Where-Object { $_.status -eq "merged" }).Count
    $total = $backlog.features.Count

    Write-Host "  Total: $total | Pending: $pending | In Progress: $inProgress | PR Created: $prCreated | Merged: $merged" -ForegroundColor White

    $nextFeature = $backlog.features | Where-Object { $_.status -eq "pending" } | Select-Object -First 1
    if ($nextFeature) {
        Write-Host "  Next up: $($nextFeature.name) (Priority: $($nextFeature.priority), Credits: $($nextFeature.credit_cost))" -ForegroundColor Green
    }
} else {
    Write-Host "  Backlog file not found." -ForegroundColor Red
}

# ---- Open PRs ----
Write-Host ""
Write-Host "OPEN PULL REQUESTS:" -ForegroundColor Yellow
Set-Location $ProjectPath
try {
    $prs = gh pr list --state open --json number,title,createdAt 2>$null | ConvertFrom-Json
    if ($prs -and $prs.Count -gt 0) {
        foreach ($pr in $prs) {
            Write-Host "  #$($pr.number): $($pr.title) ($($pr.createdAt.Substring(0,10)))" -ForegroundColor White
        }
    } else {
        Write-Host "  No open PRs." -ForegroundColor Gray
    }
} catch {
    Write-Host "  Could not check PRs (gh CLI may not be authenticated)." -ForegroundColor Red
}

# ---- Recent Reports ----
Write-Host ""
Write-Host "RECENT REPORTS:" -ForegroundColor Yellow
if (Test-Path $ReportsDir) {
    $reports = Get-ChildItem $ReportsDir -Filter "*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
    if ($reports) {
        foreach ($report in $reports) {
            Write-Host "  $($report.Name) ($($report.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))" -ForegroundColor White
        }
    } else {
        Write-Host "  No reports yet. Run an agent to generate reports." -ForegroundColor Gray
    }
} else {
    Write-Host "  Reports directory not found." -ForegroundColor Red
}

# ---- Recent Logs ----
Write-Host ""
Write-Host "RECENT LOGS:" -ForegroundColor Yellow
if (Test-Path $LogDir) {
    $logs = Get-ChildItem $LogDir -Filter "*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
    if ($logs) {
        foreach ($log in $logs) {
            $size = [math]::Round($log.Length / 1KB, 1)
            Write-Host "  $($log.Name) (${size}KB, $($log.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))" -ForegroundColor White
        }
    } else {
        Write-Host "  No logs yet." -ForegroundColor Gray
    }
} else {
    Write-Host "  Logs directory not found." -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Quick Commands:" -ForegroundColor Gray
Write-Host "    Run all agents:  .\agent-team\scripts\run-all-now.ps1" -ForegroundColor Gray
Write-Host "    Run one agent:   .\agent-team\scripts\run-all-now.ps1 -Agent develop" -ForegroundColor Gray
Write-Host "    Setup scheduler: .\agent-team\scripts\setup-scheduler.ps1  (Run as Admin)" -ForegroundColor Gray
Write-Host "    Check PRs:       gh pr list --state open" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
