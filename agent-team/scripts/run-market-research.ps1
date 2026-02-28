#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Market Research Agent (Standalone)
    Research AI market trends and update feature backlog recommendations.
#>

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$McpConfig = Join-Path $ProjectPath "agent-team\mcp-config.json"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "market-research-$Date.log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

Set-Location $ProjectPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogFile -Value "[$timestamp] Market Research Agent started"

$prompt = @"
You are the Market Research Agent for Kognitrix AI. Today is $Date.

TASKS:
1. Search the web for: "AI SaaS market trends 2026", "most in-demand AI services 2026", "AI API pricing trends"
2. Research competitors: Jasper AI, Copy.ai, Writesonic, OpenAI direct, Anthropic Claude API, Midjourney API
3. Read our current backlog: agent-team/backlog/features.json
4. Read our business plan: PLAN.md
5. Identify the BEST new feature to add based on:
   - Market demand (search volume, social mentions)
   - Revenue potential (high usage * good margin)
   - Competitive gap (what others don't offer)
   - Implementation feasibility (can build with OpenAI API in 1 day)
6. IMPORTANT: Use the Write tool to save your complete report to the file: agent-team/reports/market-research-$Date.md
   You MUST write the file to disk. Do NOT just output the report as text.

Include specific data points, URLs, and reasoning. This report will be used by the Feature Developer.
Do NOT modify any source code. Research and report only.
"@

try {
    Write-Host "Running Market Research Agent..."
    $env:CLAUDECODE = $null
    $result = claude -p $prompt --max-turns 15 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools "WebSearch WebFetch Read Write Edit Glob Grep Bash mcp__web-fetch__fetch" 2>&1
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] Completed successfully"
    Add-Content -Path $LogFile -Value "[$timestamp2] Output: $($result | Out-String)"
    Write-Host "Market Research complete. Report saved to agent-team/reports/"
} catch {
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] ERROR: $_"
    Write-Host "Market Research failed: $_"
}
