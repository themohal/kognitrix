#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Support Agent (Standalone)
    Daily support quality check and documentation improvements.

.NOTES
    Schedule: Daily at 08:00
#>

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$McpConfig = Join-Path $ProjectPath "agent-team\mcp-config.json"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "support-check-$Date.log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

Set-Location $ProjectPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogFile -Value "[$timestamp] Support Agent started"

$prompt = @"
You are the Support Agent for Kognitrix AI. Today is $Date.

TASKS:
1. Read the current support page: src/app/dashboard/support/page.tsx
2. Read the docs page: src/app/(marketing)/docs/page.tsx
3. Read the FAQ section on landing page: src/app/page.tsx
4. Read all API routes in src/app/api/v1/ and check error messages
5. Check if any new services were recently added (read agent-team/backlog/features.json for "pr_created" or "merged" status)
6. For any new services, verify:
   - Documentation is updated
   - Error messages are clear
   - FAQ addresses common questions
7. Search the web for: "common AI API support issues", "SaaS customer support best practices 2026"
8. IMPORTANT: Use the Write tool to save your complete report to the file: agent-team/reports/support-review-$Date.md
   You MUST write the file to disk. Do NOT just output the report as text. Include:
   - Documentation gaps found
   - Error message improvements needed
   - FAQ updates recommended
   - Support page improvements
   - Comparison with competitor support resources

If you find critical documentation gaps, create a feature branch and PR to fix them.
Otherwise, just report findings for human review.
"@

try {
    Write-Host "Running Support Agent..."
    $env:CLAUDECODE = $null
    $result = claude -p $prompt --max-turns 15 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools "WebSearch WebFetch Read Write Edit Glob Grep Bash mcp__web-fetch__fetch" 2>&1
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] Completed successfully"
    Add-Content -Path $LogFile -Value "[$timestamp2] Output: $($result | Out-String)"
    Write-Host "Support Check complete. Report saved to agent-team/reports/"
} catch {
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] ERROR: $_"
    Write-Host "Support Check failed: $_"
}
