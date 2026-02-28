#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Feature Developer Agent (Standalone)
    Implements the next feature from the backlog and creates a PR.

.NOTES
    Can be run independently or as part of the weekly cycle.
    Always creates a feature branch and PR - NEVER pushes to main.
#>

$ErrorActionPreference = "Continue"
$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$McpConfig = Join-Path $ProjectPath "agent-team\mcp-config.json"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "feature-dev-$Date.log"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

Set-Location $ProjectPath

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogFile -Value "[$timestamp] Feature Developer Agent started"

# Ensure we're on main and up to date (suppress git stderr)
$null = git checkout main 2>&1
$null = git pull origin main 2>&1

$prompt = @"
You are the Feature Developer Agent for Kognitrix AI. Today is $Date.

CRITICAL RULES - READ FIRST:
- NEVER push to main branch
- ALWAYS create a new feature branch
- Run npm run build before committing
- ONE feature per run
- Follow existing code patterns EXACTLY

TASKS:
1. Read agent-team/backlog/features.json - find the FIRST "pending" feature
2. Read CLAUDE.md for all project conventions
3. Read market research report if available: agent-team/reports/market-research-$Date.md
4. Study existing patterns by reading these reference files:
   - src/types/index.ts (SERVICES_CONFIG array)
   - src/lib/openai/services/seo.ts (reference OpenAI service)
   - src/app/api/v1/generate/content/route.ts (reference API route using validateInput)
   - src/lib/mcp/tools.ts (MCP tool definitions)
   - src/lib/mcp/server.ts (MCP handleToolCall switch)
   - src/app/dashboard/services/[slug]/page.tsx (playground switch cases)
   - src/app/dashboard/services/page.tsx (icon imports + iconMap)
   - src/app/page.tsx lines 1-25 (homepage services array + icon imports)
   - src/lib/api-auth.ts (auth + validateInput function)
5. Create branch: git checkout -b feature/<slug-from-backlog>
6. Implement ALL 9 files (every one is required):
   [1] src/types/index.ts — add SERVICES_CONFIG entry
   [2] src/lib/openai/services/<slug>.ts — create OpenAI service, return { result, tokens, cost }
   [3] src/app/api/v1/generate/<slug>/route.ts — create API route using validateInput(body, "<field>")
   [4] src/lib/mcp/tools.ts — add MCP tool definition to MCP_TOOLS array
   [5] src/lib/mcp/server.ts — add case in handleToolCall switch + import service function
   [6] src/app/dashboard/services/[slug]/page.tsx — add switch cases (handleSubmit, getExtraFieldConfig, placeholder, label)
   [7] src/app/dashboard/services/page.tsx — import icon from lucide-react, add to iconMap
   [8] src/app/page.tsx — import icon, add to services array, update ALL "X AI services" count references
   [9] supabase/migrations/NNN_add_<slug>.sql — create migration file AND push to Supabase via REST API:
       export `$(grep -v '^#' .env.local | grep -E '^[A-Z]' | grep -v ' ' | xargs) 2>/dev/null
       curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/services" with SUPABASE_SERVICE_ROLE_KEY
7. Run: npm run build (fix ALL errors before proceeding)
8. Commit: git add <every changed file> && git commit -m "feat: add <service name> (F00X)"
9. Push: git push -u origin feature/<slug>
10. Create PR: gh pr create --title "feat: <name>" --body "## Summary ... ## Files Changed ... ## Test Plan ..."
11. Update agent-team/backlog/features.json - set status to "pr_created", add pr_url
12. Use the Write tool to save your report to: agent-team/reports/feature-dev-$Date.md

If the build fails, fix the errors and try again. Do not create a PR with broken code.
If ANY of the 9 files are missing, the feature is NOT complete. Go back and add them.
"@

try {
    Write-Host "Running Feature Developer Agent..."
    $env:CLAUDECODE = $null
    $result = claude -p $prompt --max-turns 30 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools "WebSearch WebFetch Read Write Edit Glob Grep Bash mcp__web-fetch__fetch" 2>&1
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] Completed successfully"
    Add-Content -Path $LogFile -Value "[$timestamp2] Output: $($result | Out-String)"
    Write-Host "Feature Development complete. Check GitHub for new PR."
} catch {
    $timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp2] ERROR: $_"
    Write-Host "Feature Development failed: $_"
} finally {
    # Always return to main
    $null = git checkout main 2>&1
}
