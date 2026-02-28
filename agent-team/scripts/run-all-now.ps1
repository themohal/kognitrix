#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Run All Agents NOW (Manual Trigger)

.PARAMETER Agent
    Specific agent to run. Options: all, research, develop, review, business, support
    Default: all

.EXAMPLE
    .\run-all-now.ps1
    .\run-all-now.ps1 -Agent research
    .\run-all-now.ps1 -Agent develop
#>

param(
    [ValidateSet("all", "research", "develop", "review", "business", "support")]
    [string]$Agent = "all"
)

$ErrorActionPreference = "Continue"
$ScriptsDir = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai\agent-team\scripts"
$LogDir = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai\agent-team\logs"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  KOGNITRIX AI - MANUAL AGENT RUN" -ForegroundColor Cyan
Write-Host "  Agent: $Agent" -ForegroundColor Cyan
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

function Run-Agent {
    param([string]$ScriptName, [string]$Label)
    Write-Host "Running $Label..." -ForegroundColor Yellow

    # Launch in a NEW powershell process that does NOT inherit CLAUDECODE
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptsDir\$ScriptName`""
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $false

    # Remove CLAUDECODE from the child environment entirely
    $psi.EnvironmentVariables.Remove("CLAUDECODE")

    $proc = [System.Diagnostics.Process]::Start($psi)
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()

    if ($stdout) { Write-Host $stdout }
    if ($stderr) { Write-Host $stderr -ForegroundColor Red }
    Write-Host "$Label done (exit: $($proc.ExitCode))" -ForegroundColor Green
    Write-Host ""
}

switch ($Agent) {
    "all" {
        Write-Host "[1/5] Market Research" -ForegroundColor Cyan
        Run-Agent "run-market-research.ps1" "Market Research"

        Write-Host "[2/5] Feature Development" -ForegroundColor Cyan
        Run-Agent "run-feature-dev.ps1" "Feature Developer"

        Write-Host "[3/5] Code Review" -ForegroundColor Cyan
        Run-Agent "run-code-review.ps1" "Code Reviewer"

        Write-Host "[4/5] Business Review" -ForegroundColor Cyan
        Run-Agent "run-business-review.ps1" "Business Analyst"

        Write-Host "[5/5] Support Check" -ForegroundColor Cyan
        Run-Agent "run-support-check.ps1" "Support Agent"
    }
    "research" { Run-Agent "run-market-research.ps1" "Market Research" }
    "develop"  { Run-Agent "run-feature-dev.ps1" "Feature Developer" }
    "review"   { Run-Agent "run-code-review.ps1" "Code Reviewer" }
    "business" { Run-Agent "run-business-review.ps1" "Business Analyst" }
    "support"  { Run-Agent "run-support-check.ps1" "Support Agent" }
}

$elapsed = (Get-Date) - $startTime
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  COMPLETE! Elapsed: $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Reports: agent-team\reports\" -ForegroundColor Gray
Write-Host "  Logs:    agent-team\logs\" -ForegroundColor Gray
Write-Host "  PRs:     gh pr list --state open" -ForegroundColor Gray
