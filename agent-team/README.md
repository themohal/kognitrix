# Kognitrix AI - Autonomous Agent Team

## Overview
This system runs an autonomous AI agent team that manages the Kognitrix AI SaaS platform as a business. The agents handle market research, feature development, code review, business analysis, and customer support.

**Key principle: All code changes go through Pull Requests for human review. Nothing is auto-merged.**

## Agent Team

| Agent | Role | Schedule | Script |
|-------|------|----------|--------|
| Market Researcher | Research AI market trends, identify new features | 1st of month (via monthly cycle) | `run-market-research.ps1` |
| Feature Developer | Implement features from backlog, create PRs | 1st of month (via monthly cycle) | `run-feature-dev.ps1` |
| Code Reviewer | Review PRs for quality, security, correctness | 8th of month | `run-code-review.ps1` |
| Business Analyst | Analyze metrics, pricing, competitive landscape | 28th of month | `run-business-review.ps1` |
| Support Agent | Audit support quality, improve docs/FAQ | 8th of month | `run-support-check.ps1` |

## Quick Start

### 1. Manual Run (Test First)
```powershell
# Run everything now
.\agent-team\scripts\run-all-now.ps1

# Or run a specific agent
.\agent-team\scripts\run-all-now.ps1 -Agent research
.\agent-team\scripts\run-all-now.ps1 -Agent develop
.\agent-team\scripts\run-all-now.ps1 -Agent review
.\agent-team\scripts\run-all-now.ps1 -Agent business
.\agent-team\scripts\run-all-now.ps1 -Agent support
```

### 2. Install Scheduler (Automatic)
```powershell
# Run as Administrator
.\agent-team\scripts\setup-scheduler.ps1
```

### 3. Check Status
```powershell
# View scheduled tasks
Get-ScheduledTask -TaskPath '\KognitrixAI\'

# View logs
Get-Content agent-team\logs\monthly-cycle-*.log -Tail 50

# View reports
ls agent-team\reports\
```

### 4. Uninstall Scheduler
```powershell
# Run as Administrator
.\agent-team\scripts\uninstall-scheduler.ps1
```

## Monthly Cycle Flow

```
1st of Month, 09:00
  |
  v
[Market Research Agent]
  - Search web for AI trends
  - Analyze competitors
  - Write research report to agent-team/reports/
  |
  v
[Feature Developer Agent]
  - Read backlog + research report
  - Pick highest priority pending feature
  - Create feature branch
  - Implement ALL 9 required files
  - Run build to verify
  - Push branch + create PR
  |
  v
[Code Review Agent] (also runs 8th of month)
  - Review open PRs
  - Check build, types, security, patterns
  - Approve or request changes
  |
  v
[YOU - Human CEO]
  - Review PR on GitHub
  - Merge if approved
  - Vercel auto-deploys to production
```

## Feature Backlog
The feature backlog lives in `backlog/features.json`. It contains pre-planned features ordered by priority. The Feature Developer picks the next "pending" feature each month.

### Feature Status Flow
```
pending -> in_progress -> pr_created -> merged (by human) -> deployed (auto by Vercel)
```

## Directory Structure
```
agent-team/
  config.json          # Team configuration
  README.md            # This file
  backlog/
    features.json      # Feature backlog (ordered by priority)
  scripts/
    run-all-now.ps1    # Manual: run all agents now
    run-monthly-feature.ps1  # Full monthly pipeline
    run-market-research.ps1  # Market research only
    run-feature-dev.ps1      # Feature development only
    run-code-review.ps1      # Code review only
    run-business-review.ps1  # Business analysis only
    run-support-check.ps1    # Support audit only
    setup-scheduler.ps1      # Install Windows Task Scheduler tasks
    uninstall-scheduler.ps1  # Remove all scheduled tasks
  logs/                # Execution logs (auto-generated, git-ignored)
  reports/             # Agent reports (auto-generated)
```

## Prerequisites
- **Claude Code CLI** installed and authenticated (`claude` command available in PATH)
- **GitHub CLI** installed and authenticated (`gh` command available)
- **Node.js** 18+ with npm
- **Git** configured with SSH access to themohal/kognitrix
- **PowerShell** 5.1+ (comes with Windows)
- **Windows Task Scheduler** (comes with Windows)

## Safety Guarantees
1. Agents NEVER push directly to `main` branch
2. All code changes go through Pull Requests
3. PRs are NEVER auto-merged - human review required
4. Build must pass before PR creation
5. Feature developer creates only 1 feature per run
6. All activity is logged in `agent-team/logs/`
7. All analysis is saved in `agent-team/reports/`

## Troubleshooting

### Task not running
```powershell
# Check task status
Get-ScheduledTask -TaskPath '\KognitrixAI\' | Format-Table TaskName, State, LastRunTime
```

### Claude Code not found
Ensure `claude` is in your system PATH. Test with:
```powershell
claude --version
```

### PR creation fails
Ensure GitHub CLI is authenticated:
```powershell
gh auth status
```

### Build fails during feature development
The Feature Developer will attempt to fix build errors. Check the logs:
```powershell
Get-Content agent-team\logs\feature-dev-*.log -Tail 100
```
