# Add New Service to Kognitrix AI

You are adding a new AI service to the Kognitrix AI platform. The user will provide the service details as arguments: $ARGUMENTS

If no arguments provided, read `agent-team/backlog/features.json` and pick the FIRST feature with status "pending".

## STEP 0: CHECK FOR DUPLICATES — DO THIS FIRST

Before doing anything else, fetch the current list of services from Supabase to ensure you don't add a duplicate.
Read `.env.local` to get `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run:
```bash
curl -s "<SUPABASE_URL>/rest/v1/services?select=slug,name,category,credit_cost&order=created_at" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```
This returns all existing services. Also read `src/types/index.ts` to check `SERVICES_CONFIG`.

**STOP if the service slug already exists** in either Supabase or SERVICES_CONFIG. Inform the user that the service is already present and ask if they want a different one.

If the user gave no arguments and the backlog is empty, pick a service that does NOT already exist in the list above.

---

## BEFORE WRITING ANY CODE

Read these reference files to understand exact patterns:
1. `src/types/index.ts` — SERVICES_CONFIG structure
2. `src/app/api/v1/generate/content/route.ts` — reference API route pattern
3. `src/lib/openai/services/content.ts` — reference OpenAI service pattern
4. `src/lib/api-auth.ts` — auth chain: authenticateApiRequest → checkRateLimit → checkCredits → validateInput
5. `src/lib/mcp/tools.ts` — MCP tool definitions
6. `src/lib/mcp/server.ts` — MCP tool dispatch (handleToolCall switch + imports)
7. `src/app/dashboard/services/[slug]/page.tsx` — playground switch cases
8. `src/app/dashboard/services/page.tsx` — icon imports + iconMap
9. `src/app/page.tsx` — homepage services array, icon imports, "X AI services" count references
10. `src/app/dashboard/billing/page.tsx` — "All X services" text in plan cards
11. `src/app/(marketing)/pricing/page.tsx` — "All X AI services" in plan features
12. `src/app/(marketing)/services/page.tsx` — "X AI Services" badge

## COMPLETE CHECKLIST — ALL 12 STEPS REQUIRED

Missing ANY step means the service is broken. Do every single one.

### 1. Service Config — `src/types/index.ts`
Add entry to `SERVICES_CONFIG` array:
```typescript
{
  name: "AI <Name>",
  slug: "<slug>",
  description: "<long description>",
  short_description: "<one liner>",
  category: "<content|code|data|image|legal|seo|workflow>",
  credit_cost: <N>,
  is_active: true,
  icon: "<LucideIconName>",
  endpoint: "/api/v1/generate/<slug>",
}
```

### 2. OpenAI Service — `src/lib/openai/services/<slug>.ts`
Create new file. Export async function. Return `{ result, tokens, cost }`.
Follow exact pattern from `content.ts` — use `getOpenAIClient()`, model `gpt-4o`, calculate cost as `tokens * 0.000005`.

### 3. API Route — `src/app/api/v1/generate/<slug>/route.ts`
Create POST handler following EXACT pattern from `content/route.ts`:
```
authenticateApiRequest → checkRateLimit → checkCredits → validateInput(body, "<primary_field>") → service function → deductCredits → Response.json
```
- Use `validateInput(body, "field")` — this handles max-length, null bytes, AND content safety scanning
- Truncate large text to 500 chars in `requestPayload` before passing to `deductCredits()`
- Wrap everything in try/catch with `errorResponse(error)`

### 4. MCP Tool Definition — `src/lib/mcp/tools.ts`
Add to `MCP_TOOLS` array:
```typescript
{
  name: "kognitrix_<action>",
  description: "<what it does>. Costs <N> credits.",
  inputSchema: {
    type: "object",
    properties: { ... },
    required: ["<primary_field>"],
  },
}
```

### 5. MCP Server Handler — `src/lib/mcp/server.ts`
TWO changes:
1. Add import at top: `import { <functionName> } from "@/lib/openai/services/<slug>";`
2. Add case in `handleToolCall()` switch before `default`:
```typescript
case "kognitrix_<action>": {
  return await executeService(id, "<slug>", <creditCost>, user, ip, async () => {
    return await <functionName>(args as unknown as Parameters<typeof <functionName>>[0]);
  });
}
```

### 6. Dashboard Playground — `src/app/dashboard/services/[slug]/page.tsx`
FOUR changes in this file:
1. **`handleSubmit()` switch** — Add case with correct body field mapping:
   ```typescript
   case "<slug>":
     body = { <primary_field>: prompt, <extra_field>: extraField || "<default>" };
     break;
   ```
2. **`getExtraFieldConfig()` switch** — Add case if service has an extra parameter:
   ```typescript
   case "<slug>":
     return { label: "<Label>", placeholder: "<options>" };
   ```
3. **Placeholder ternary** — Add slug-specific placeholder text in the textarea
4. **Label condition** — If service uses "Input Text" instead of "Prompt", add slug to the condition on the label

### 7. Dashboard Services Page — `src/app/dashboard/services/page.tsx`
TWO changes:
1. Import icon from lucide-react (add to the import destructure)
2. Add icon to `iconMap` Record

### 8. Homepage — `src/app/page.tsx`
FOUR changes:
1. Import icon from lucide-react (add to the import destructure)
2. Add entry to `services` array: `{ icon: <Icon>, name: "AI <Name>", desc: "<short>", credits: <N> }`
3. Count ALL references to "X AI services" or "X services" in the file and update the number:
   - Hero section text
   - Stats bar value
   - Pricing table features (Free Trial, Starter, Pro)
   - CTA section text
4. Search for the OLD count number and replace with NEW count everywhere

### 9. Dashboard Billing Page — `src/app/dashboard/billing/page.tsx`
Search for "All X services" and update the count to match the new total number of services.

### 10. Marketing Pricing Page — `src/app/(marketing)/pricing/page.tsx`
Search for "All X AI services" in each plan's features array and update the count.

### 11. Marketing Services Page — `src/app/(marketing)/services/page.tsx`
Search for "X AI Services" badge text and update the count.

### 12. Push to Supabase — NO SQL migration file
Do NOT create a SQL migration file. Instead, read `.env.local` to get the Supabase URL and service role key, then insert the service directly via REST API:
```bash
curl -s -X POST "<SUPABASE_URL>/rest/v1/services" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"name":"AI <Name>","slug":"<slug>","description":"<desc>","short_description":"<short>","category":"<cat>","credit_cost":<N>,"icon":"<Icon>","endpoint":"/api/v1/generate/<slug>"}'
```
If you get a duplicate key error (23505), the service already exists — that's fine.

### 13. Verify Build
```bash
npm run build
```
Fix ALL TypeScript errors before proceeding. Common issues:
- Missing icon import (TypeScript catches this)
- Wrong field name in playground switch vs API route validation

## FILES THAT WORK AUTOMATICALLY (no changes needed)
These use Supabase joins and auto-refresh caches:
- `src/app/dashboard/page.tsx` — recent activity shows service names automatically
- `src/app/dashboard/usage/page.tsx` — usage logs show service names automatically
- `src/app/api/me/usage/route.ts` — joins services table automatically
- `src/lib/credits.ts` — service UUID cache auto-refreshes on miss

## AFTER ALL FILES ARE DONE
1. Run `npm run build` — must pass with zero errors
2. If on a feature branch, commit all files and push
3. Update `agent-team/backlog/features.json` if applicable — set status to "in_progress" or "pr_created"

## QUALITY RULES
- Use `validateInput(body, "<field>")` — NEVER do custom manual validation
- Truncate large text fields to 500 chars in `requestPayload` before logging
- Follow exact patterns from existing services — read first, write second
- TypeScript strict — no `any` types
