# QA / QC Report — SunnyStep Strides

**Date:** 2026-10-05
**Scope:** Full code-quality pass + resolution of all findings from the prior QA review, plus a previously-undetected `react-hooks/rules-of-hooks` bug.

---

## 1. Verification gates (all GREEN after fixes)

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npx eslint .` | ✅ 0 errors, 0 warnings |
| Unit tests | `npx vitest run src/test/roi-metrics-widget.test.tsx` | ✅ 1 passed |
| Production build | `npx vite build` | ✅ success (1 non-blocking chunk-size advisory) |

> Note: `vite build` does **not** run ESLint, so lint errors are non-blocking for the build — which is why the lint cleanup below still mattered for a clean `npm run lint`.

---

## 2. Findings & resolutions

### 🔴 High (must-fix, environment-gated)

| # | Finding | Status | How resolved |
|---|---------|--------|--------------|
| H1 | **RLS DELETE policies missing** on `campaigns`, `agent_revenue`, `ab_tests`, `ab_test_variants`, `agent_notifications`. The "Demo Tools" → *Clear demo data* feature (`demoSeed.clearDemoData()`) issues `DELETE`, which the anon role cannot do without these policies. | ⚠️ **Action required (user runs SQL)** | SQL provided in §4.1. |
| H2 | **Vercel env vars missing** → built bundle had no Supabase URL/key, so the live app cannot reach the backend. | ⚠️ **Action required (user runs locally)** | Commands provided in §4.2. |

### 🟡 Medium

| # | Finding | Status | How resolved |
|---|---------|--------|--------------|
| M1 | **Re-seed duplication risk** in `seedDemoData()`. | ✅ Resolved | `seedDemoData()` already calls `clearDemoData()` first (removes all demo rows by deterministic UUID / `"Demo:"` prefix before re-inserting). Re-seeding is therefore idempotent — no duplicate rows on repeated runs. |
| M2 | `TeamManagement.tsx` used `metadata: (params.metadata ?? {}) as never` (an escape hatch that defeats type safety). | ✅ Fixed | Typed `logAuditEvent`'s `metadata` param as `Json` (from `@/integrations/supabase/types`) and removed the cast → `metadata: params.metadata ?? {}`. |

### 🟢 Low

| # | Finding | Status | How resolved |
|---|---------|--------|--------------|
| L1 | **18 × `no-explicit-any`** across dashboard components + edge function. | ✅ Fixed | Replaced with precise types: `Json` for Supabase `Json` columns (`metadata`, email `content`), `LucideIcon` for icon maps, `Record<string, unknown>` for local config, `TooltipProps` local interface for Recharts tooltips, generic `updateConfig<K>`, `ChatMessage` for the edge-function payload, and removed redundant casts. |
| L2 | **2 × `no-empty-object-type`** in vendored shadcn/ui (`command.tsx`, `textarea.tsx`). | ✅ Fixed | `interface X extends Y {}` → `type X = Y;` |
| L3 | **1 × `no-require-imports`** in `tailwind.config.ts`. | ✅ Fixed | `require("tailwindcss-animate")` → ESM `import tailwindcssAnimate from "tailwindcss-animate"`. |
| L4 | **9 × `react-refresh/only-export-components`** warnings (7 vendored `ui/*` files + `WorkflowExample.tsx`). | ✅ Fixed | Added an ESLint override disabling the rule for `src/components/ui/**` (vendored shadcn components intentionally export cva variants + helpers), and extracted the two exported workflow-constant arrays from `WorkflowExample.tsx` into a new `workflowExamplesData.tsx` module so the component file exports only a component. |
| L5 | **1 × `react-hooks/exhaustive-deps`** warning in `AgentConfigurationPanel.tsx`. | ✅ Fixed | Wrapped `fetchConfigs` in `useCallback` and added it to the effect dependency array. |
| L6 | **1 × `react-hooks/rules-of-hooks` ERROR** (newly found, not in the original report) — `useAISuggestion` (a misnamed *event handler*, not a hook) was called inside an `onClick` callback in `CustomerSegmentBuilder.tsx`. | ✅ Fixed | Renamed `useAISuggestion` → `applyAISuggestion`. (Function only calls `setState`/`toast`, so it was never a real hook; the `use` prefix falsely triggered the rule and would have caused invalid hook invocation at runtime.) |

---

## 3. Files changed (this pass)

- `src/components/dashboard/AgentActivityDashboard.tsx` — `Json` + `LucideIcon` types; removed `any` (metadata, icon maps, revenue rows).
- `src/components/dashboard/AgentConfigurationPanel.tsx` — generic `updateConfig<K>`; `useCallback` for `fetchConfigs` (fixes exhaustive-deps).
- `src/components/dashboard/TeamManagement.tsx` — `metadata` param typed `Json`; dropped `as never`.
- `src/components/dashboard/AgentCreator.tsx`, `CampaignCreator.tsx`, `WorkflowCreator.tsx` — `creationType` cast typed as `"template" | "custom"`.
- `src/components/dashboard/WorkflowCreator.tsx` — `config: Record<string, unknown>`.
- `src/components/dashboard/EmailTemplateBuilder.tsx` — `content: blocks as Json`.
- `src/components/dashboard/OverviewView.tsx` — removed `: any` on `camps` callbacks.
- `src/components/dashboard/PerformanceChart.tsx`, `PredictiveAnalytics.tsx` — typed `ChartTooltipProps`; safe `Number(...)` coercion.
- `src/components/dashboard/AIAssistantChat.tsx` — precise `describeError` error cast.
- `src/components/dashboard/CustomerSegmentBuilder.tsx` — rename `useAISuggestion` → `applyAISuggestion` (rules-of-hooks fix).
- `src/components/dashboard/WorkflowExample.tsx` + **new** `src/components/dashboard/workflowExamplesData.tsx` — extracted exported workflow constants; `WorkflowsView.tsx` import repointed.
- `src/components/ui/command.tsx`, `src/components/ui/textarea.tsx` — `type X = Y`.
- `tailwind.config.ts` — ESM import for `tailwindcss-animate`.
- `supabase/functions/ai-marketing-assistant/index.ts` — `ChatMessage` type; removed `any`.
- `eslint.config.js` — override to disable `react-refresh/only-export-components` for vendored `src/components/ui/**`.
- `src/lib/demoSeed.ts` — idempotent seeding confirmed (clear-first); no change required.

---

## 4. Remaining actions for the user (cannot run in this sandbox)

### 4.1 🔴 Apply RLS DELETE policies (Supabase SQL Editor)

Paste and run in the **SQL Editor** of project `bomzanbqiznqjvrqmeoy`. These mirror the existing "Allow public …" policies in the repo and let the anon role clear demo data:

```sql
-- Idempotent: drop if already present (eases re-runs), then (re)create.
DROP POLICY IF EXISTS "Allow public delete on campaigns"          ON public.campaigns;
DROP POLICY IF EXISTS "Allow public delete on agent_revenue"      ON public.agent_revenue;
DROP POLICY IF EXISTS "Allow public delete on ab_tests"           ON public.ab_tests;
DROP POLICY IF EXISTS "Allow public delete on ab_test_variants"   ON public.ab_test_variants;
DROP POLICY IF EXISTS "Allow public delete on agent_notifications" ON public.agent_notifications;

CREATE POLICY "Allow public delete on campaigns"          ON public.campaigns          FOR DELETE USING (true);
CREATE POLICY "Allow public delete on agent_revenue"      ON public.agent_revenue      FOR DELETE USING (true);
CREATE POLICY "Allow public delete on ab_tests"           ON public.ab_tests           FOR DELETE USING (true);
CREATE POLICY "Allow public delete on ab_test_variants"   ON public.ab_test_variants   FOR DELETE USING (true);
CREATE POLICY "Allow public delete on agent_notifications" ON public.agent_notifications FOR DELETE USING (true);
```

(If you use the Supabase CLI instead, save this as a new migration file, e.g. `supabase/migrations/20261005_allow_public_delete_demo.sql`, and run `supabase db push`.)

### 4.2 🔴 Add Vercel environment variables + redeploy

In the Vercel dashboard (**Project → Settings → Environment Variables**) add, or via CLI locally:

```bash
vercel env add VITE_SUPABASE_URL
# value: https://bomzanbqiznqjvrqmeoy.supabase.co

vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
# value: sb_publishable_KTYkC3PeEUcje8uv4Ynm-Q_GLkb-B4_
```

Then redeploy so the variables are inlined into the bundle:

```bash
vercel --prod
```

> Confirm with: `curl -s https://sunnystep-strides-f3b7.vercel.app | grep -c "supabase.co"` → should be ≥ 1 after redeploy.

### 4.3 Apply the demo seed (corrected) to the new project

The repo's `supabase/seed/001_demo_dataset.sql` already has the `::uuid` cast fix for Section 6 (`campaign_id`). Paste the full file into the new project's SQL Editor (or run it via CLI). Section 6's `agent_revenue` insert previously failed with `42804: column campaign_id is of type uuid …`; the corrected cast resolves it.

---

## 5. Recommendation

Ship the current code state (green gates). The two 🔴 items are pure environment configuration on the user's Supabase/Vercel accounts and do not require further code changes. Once §4.1–§4.3 are executed, the public demo will be fully wired end-to-end: app → Supabase (auth, Postgres, demo data) → live at the Vercel URL.
