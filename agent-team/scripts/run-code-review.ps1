#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Code Review Agent (Standalone)
    Reviews all open PRs for quality, security, and correctness.

.NOTES
    Schedule: Daily at 14:00
    Reviews but NEVER merges PRs.
#>

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$McpConfig = Join-Path $ProjectPath "agent-team\mcp-config.json"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "code-review-$Date.log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

Set-Location $ProjectPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogFile -Value "[$timestamp] Code Review Agent started"

# Check if there are any open PRs first
$openPRs = gh pr list --state open --json number,title 2>$null
if ([string]::IsNullOrWhiteSpace($openPRs) -or $openPRs -eq "[]") {
    Add-Content -Path $LogFile -Value "[$timestamp] No open PRs to review. Skipping."
    Write-Host "No open PRs to review."
    exit 0
}

$prompt = @"
You are the Code Review Agent for Kognitrix AI. Today is $Date.

TASKS:
1. List all open PRs: gh pr list --state open
2. For EACH open PR:
   a. View the PR: gh pr view <number>
   b. Read the diff: gh pr diff <number>
   c. Checkout the branch and run: npm run build
   d. Review against this checklist:
      - [ ] Build passes without errors
      - [ ] TypeScript strict - no any types, no errors
      - [ ] Follows existing code patterns (compare with similar files)
      - [ ] Input validation present (max size limits, null byte rejection)
      - [ ] Rate limiting applied via checkRateLimit()
      - [ ] Security: no hardcoded secrets, proper auth, no injection risks
      - [ ] API response uses standard format: { success, data, error, credits_used }
      - [ ] MCP tool registered if new service
      - [ ] Credit cost is defined in SERVICES_CONFIG
      - [ ] Commit messages follow feat:/fix:/chore: convention
      - [ ] PR has clear description and test plan
   e. Post review:
      - If ALL checks pass: gh pr review <number> --approve --body "Automated code review passed. All quality checks cleared."
      - If issues found: gh pr review <number> --request-changes --body "Issues found: <list issues>"
3. IMPORTANT: Use the Write tool to save your complete report to the file: agent-team/reports/code-review-$Date.md
   You MUST write the file to disk. Do NOT just output the report as text.
4. Return to main branch when done

NEVER merge PRs. Only review and approve/request-changes.
"@

try {
    Write-Host "Running Code Review Agent..."
    $env:CLAUDECODE = $null
    $result = claude -p $prompt --max-turns 20 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools "WebSearch WebFetch Read Write Edit Glob Grep Bash mcp__web-fetch__fetch" 2>&1
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] Completed successfully"
    Add-Content -Path $LogFile -Value "[$timestamp2] Output: $($result | Out-String)"
    Write-Host "Code Review complete. Check GitHub PR comments."
} catch {
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] ERROR: $_"
    Write-Host "Code Review failed: $_"
} finally {
    $null = git checkout main 2>&1
}
