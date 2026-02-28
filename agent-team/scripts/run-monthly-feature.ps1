#Requires -Version 5.1
<#
.SYNOPSIS
    Kognitrix AI - Monthly Feature Development Cycle
    Runs the full monthly pipeline: Market Research -> Feature Development -> Code Review -> PR Creation

.NOTES
    Schedule: 1st of each month at 09:00 via Windows Task Scheduler
    Working Directory: kognitrix-ai project root
#>

$ErrorActionPreference = "Continue"

# ============================================================================
# CONFIGURATION
# ============================================================================
$ProjectPath = "C:\Users\User\Desktop\projects\project_5\kognitrix-ai"
$LogDir = Join-Path $ProjectPath "agent-team\logs"
$ReportsDir = Join-Path $ProjectPath "agent-team\reports"
$McpConfig = Join-Path $ProjectPath "agent-team\mcp-config.json"
$ClaudeTools = "WebSearch WebFetch Read Write Edit Glob Grep Bash mcp__web-fetch__fetch"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "monthly-cycle-$Date.log"

# ============================================================================
# HELPERS
# ============================================================================
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$ts] [$Level] $Message"
    Add-Content -Path $LogFile -Value $entry
    Write-Host $entry
}

# ============================================================================
# INITIALIZATION
# ============================================================================
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
if (-not (Test-Path $ReportsDir)) { New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null }

Write-Log "=========================================="
Write-Log "KOGNITRIX AI - MONTHLY FEATURE CYCLE START"
Write-Log "=========================================="

Set-Location $ProjectPath
Write-Log "Working directory: $ProjectPath"

# ============================================================================
# PHASE 1: MARKET RESEARCH
# ============================================================================
Write-Log "--- PHASE 1: MARKET RESEARCH ---"

$researchPrompt = @"
You are the Market Research Agent for Kognitrix AI. Today is $Date.

Your task:
1. Search the web for the latest AI SaaS market trends in 2026
2. Research what AI services are most in-demand right now
3. Check competitor pricing and new features (Jasper, Copy.ai, Writesonic, OpenAI API direct users)
4. Read the current feature backlog at agent-team/backlog/features.json
5. Read src/types/index.ts and count the current SERVICES_CONFIG entries to know how many services exist
6. Read PLAN.md for business context
7. IMPORTANT: Use the Write tool to save your complete report to the file: agent-team/reports/market-research-$Date.md
   You MUST write the file to disk. Do NOT just output the report as text.
8. If you find a better feature opportunity than what's in the backlog, note it in the report

Focus on features that:
- Have 60%+ profit margin
- Can be implemented as a Next.js API route using OpenAI
- Have proven market demand
- Don't duplicate any of our existing services (check SERVICES_CONFIG for the current list)

Write a thorough report with sources. Do NOT modify any code.
"@

try {
    Write-Log "Starting Market Research Agent..."
    $env:CLAUDECODE = $null
    $researchResult = claude -p $researchPrompt --max-turns 15 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools $ClaudeTools 2>&1
    Write-Log "Market Research completed"
} catch {
    Write-Log "Market Research failed: $_" "ERROR"
}

# ============================================================================
# PHASE 2: FEATURE DEVELOPMENT
# ============================================================================
Write-Log "--- PHASE 2: FEATURE DEVELOPMENT ---"

$null = git checkout main 2>&1
$null = git pull origin main 2>&1

$devPrompt = @"
You are the Feature Developer Agent for Kognitrix AI. Today is $Date.

CRITICAL RULES:
- NEVER push to main branch
- ALWAYS create a new feature branch
- Run npm run build before committing
- ONE feature per run
- Follow existing code patterns EXACTLY

TASKS:
1. Read agent-team/backlog/features.json and find the FIRST feature with status "pending"
2. Read CLAUDE.md for project conventions
3. Read any market research report at agent-team/reports/market-research-$Date.md if it exists
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
       curl -X POST "`$NEXT_PUBLIC_SUPABASE_URL/rest/v1/services" with SUPABASE_SERVICE_ROLE_KEY
7. Run: npm run build (fix ALL errors before proceeding)
8. Commit: git add <every changed file> && git commit -m "feat: add <service name> (F00X)"
9. Push: git push -u origin feature/<slug>
10. Create PR: gh pr create --title "feat: <name>" --body "## Summary ... ## Files Changed ... ## Test Plan ..."
11. Update agent-team/backlog/features.json - set status to "pr_created", add pr_url
12. IMPORTANT: Use the Write tool to save your report to: agent-team/reports/feature-dev-$Date.md

If the build fails, fix the errors and try again. Do not create a PR with broken code.
If ANY of the 9 files are missing, the feature is NOT complete. Go back and add them.
"@

try {
    Write-Log "Starting Feature Developer Agent..."
    $env:CLAUDECODE = $null
    $devResult = claude -p $devPrompt --max-turns 30 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools $ClaudeTools 2>&1
    Write-Log "Feature Development completed"
} catch {
    Write-Log "Feature Development failed: $_" "ERROR"
}

# ============================================================================
# PHASE 3: CODE REVIEW
# ============================================================================
Write-Log "--- PHASE 3: CODE REVIEW ---"

$null = git checkout main 2>&1

$reviewPrompt = @"
You are the Code Review Agent for Kognitrix AI. Today is $Date.

TASKS:
1. List open PRs: gh pr list --state open
2. For each open PR, review the diff: gh pr diff <number>
3. Check: build passes, TypeScript correct, security OK, patterns followed, API format standard
4. If review passes: gh pr review <number> --approve --body "Automated review passed"
5. If issues found: gh pr review <number> --request-changes --body "<issues>"
6. IMPORTANT: Use the Write tool to save your complete report to the file: agent-team/reports/code-review-$Date.md
   You MUST write the file to disk. Do NOT just output the report as text.

Do NOT merge any PRs - only review them. Human CEO will merge.
"@

try {
    Write-Log "Starting Code Review Agent..."
    $env:CLAUDECODE = $null
    $reviewResult = claude -p $reviewPrompt --max-turns 20 --permission-mode bypassPermissions --mcp-config $McpConfig --allowedTools $ClaudeTools 2>&1
    Write-Log "Code Review completed"
} catch {
    Write-Log "Code Review failed: $_" "ERROR"
}

# ============================================================================
# COMPLETION
# ============================================================================
$null = git checkout main 2>&1
Write-Log "=========================================="
Write-Log "MONTHLY FEATURE CYCLE COMPLETE"
Write-Log "=========================================="
Write-Log "Check agent-team/reports/ for detailed reports"
Write-Log "Check GitHub PRs: gh pr list --state open"
