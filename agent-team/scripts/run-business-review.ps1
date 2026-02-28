#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Business Analyst Agent (Standalone)
    Weekly business analysis, competitive review, and strategy recommendations.

.NOTES
    Schedule: Every Friday at 17:00
#>

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$McpConfig = Join-Path $ProjectPath "agent-team\mcp-config.json"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "business-review-$Date.log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

Set-Location $ProjectPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogFile -Value "[$timestamp] Business Analyst Agent started"

$prompt = @"
You are the Business Analyst Agent for Kognitrix AI. Today is $Date.

TASKS:
1. Read PLAN.md for full business context (KPIs, pricing, targets)
2. Read src/types/index.ts for current services and pricing (SERVICES_CONFIG, PLANS, CREDIT_PACKS)
3. Read the feature backlog: agent-team/backlog/features.json
4. Check recent PRs and features added: gh pr list --state all --limit 10
5. Search the web for:
   - "AI SaaS pricing benchmarks 2026"
   - "AI API market size 2026"
   - "SaaS customer retention strategies 2026"
   - "AI SaaS churn rate benchmarks"
6. Analyze:
   - Are our prices competitive? Too high? Too low?
   - Which services should we promote more?
   - What credit pack sizes optimize for conversion?
   - What subscription tiers might we be missing?
   - Are we adding the right features to the backlog?
7. IMPORTANT: Use the Write tool to save your complete report to the file: agent-team/reports/business-review-$Date.md
   You MUST write the file to disk. Do NOT just output the report as text.

Include specific recommendations with expected revenue impact.
Do NOT modify any source code. Analysis and recommendations only.
"@

try {
    Write-Host "Running Business Analyst Agent..."
    $env:CLAUDECODE = $null
    $result = claude -p $prompt --max-turns 15 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools "WebSearch WebFetch Read Write Edit Glob Grep Bash mcp__web-fetch__fetch" 2>&1
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] Completed successfully"
    Add-Content -Path $LogFile -Value "[$timestamp2] Output: $($result | Out-String)"
    Write-Host "Business Review complete. Report saved to agent-team/reports/"
} catch {
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] ERROR: $_"
    Write-Host "Business Review failed: $_"
}
