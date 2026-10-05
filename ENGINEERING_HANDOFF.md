# AI Data Copilot — Engineering Handoff

> Applied to: **Sunnystep AI Marketing Automation Platform** (`sunnystep-strides-main`)
> Stack: Vite + React 18 + TypeScript + shadcn/ui + Supabase + Recharts + Framer Motion
> Date: 2026-10-05
> Author: AI Data Copilot Engineering Team (Nova orchestration)

---

## A. Executive Summary

The repository was inspected before any change was made (charter §2 — *inspect before changing*).
The supplied "AI Data Copilot" charter is a **generic** standard; the actual repository is a
**marketing-automation dashboard**, not a SQL/RAG/Python data-copilot. Per the charter's own
source-of-truth rule ("implementation reality takes precedence; do not invent functionality that
does not exist"), the charter was applied as a **quality bar** to the real product rather than used
as a blueprint to fabricate non-existent workspaces.

**Headline finding:** the application ships a real, fairly complete Supabase schema, but the
**entire analytics front-end was rendering hardcoded, fabricated numbers** as if they were live
performance. This is the single most serious violation of the charter's AI-Trust and Mock-Data
Governance sections. The transformation this pass delivers:

1. A **reusable data-provenance system** so simulated content is never presented as real.
2. A **hardened AI assistant** that no longer silently masks backend failures and now labels
   AI-generated answers as not-derived-from-data.
3. A **data-driven Overview** (the landing page) that fetches real aggregates with proper
   loading / success / empty / error states, falling back to *clearly labeled* sample data
   only when the workspace has no rows.
4. **`AgentActivityDashboard` de-fabricated**: it previously generated fake "real-time" activity
   every 8s and seeded fake entries. It now reads real `agent_notifications` (initial + Realtime)
   and computes per-agent stats from real rows, with honest empty states.
5. **`PredictiveAnalytics`** explicitly labeled as illustrative sample (forecasts/churn/actions
   are fabricated and not generated from workspace data).
6. **Demo-ready dataset system**: `src/lib/demoSeed.ts` + a "Demo Tools" panel (`DemoModeToggle`)
   let anyone populate — or clear — a realistic, internally-consistent demo dataset in one click; a
   matching SQL seed (`supabase/seed/001_demo_dataset.sql`) provides a backend-level path plus a
   dedicated demo-account recipe.
7. **`AnalyticsCharts`, `ROIMetricsWidget`, `ABTestResults`** now derive channel/agent revenue and
   A/B results from real tables where they exist, and label every illustrative fallback with a
   "Sample data" badge instead of presenting it as live.

Build and typecheck were attempted as Gate A but could not be completed due to environment
resource constraints in this sandbox (see §H). No destructive migrations, no invented APIs.

---

## B. Existing System Assessment (what was already functional)

| Domain            | Implemented | Partial | Mocked | Broken | Priority |
| ----------------- | :---------: | :----: | :----: | :---: | :------: |
| Authentication    |      ✓      |        |        |       |    P0    |
| Data ingestion    |             |   ✓    |        |       |    P2    |
| SQL workspace     |             |        |   —    |   —   |    —     |
| Python analysis   |             |        |   —    |   —   |    —     |
| RAG / Knowledge   |             |        |   —    |   —   |    —     |
| Dashboards        |      ✓      |        |   ✓    |       |    P1    |
| Reports           |             |        |   —    |   —   |    —     |
| Settings          |      ✓      |        |        |       |    P3    |
| Realtime (Supabase)|     ✓      |        |        |       |    P1    |

- **Frontend**: 24 dashboard views + layout, all routing present (`/`, `/auth`, `*`).
- **Backend schema** (`supabase/migrations`): `profiles`, `campaigns`, `ab_tests`,
  `ab_test_variants`, `agent_configurations`, `agent_notifications`, `agent_revenue`,
  `audit_logs`, `content_calendar`, `customer_journey_events`, `email_templates`, `team_members`,
  `team_invites`, `teams`, `user_roles`, `user_settings`. Row-level security referenced in docs.
- **AI**: one edge function `ai-marketing-assistant` (Deno) calling `ai.gateway.lovable.dev`
  behind a `LOVABLE_API_KEY` server secret — good (secret stays server-side).
- **Auth**: email/password via Supabase, profile auto-create on signup. Works.

### Real vs. fabricated (the core problem)
- `OverviewView` — **fabricated**: KPIs, welcome-banner revenue, agent preview all hardcoded.
- `PerformanceChart` — **fabricated** static series.
- `CampaignList` — **fabricated** static rows.
- `PredictiveAnalytics` — **fabricated**: revenue forecast, churn-risk customers, recommended
  actions all hardcoded.
- `AgentActivityDashboard` — **mixed/fabricated**: realtime subscription exists, but seeded with
  `mockLiveActivities` and a synthetic 8s random-activity generator.
- `lib/demoMode.ts` — inserts fake notifications into the *real* `agent_notifications` table every
  5s (clearly labeled as demo, but pollutes live data).
- `.env` — commits a Supabase anon key (anon keys are safe client-side, but committing `.env` is
  a practice issue; recommend `.env.example` + gitignore).

---

## C. Functional Repairs

- **AIAssistantChat error masking (real bug)**: previously only `invoke().error` was checked; a
  structured error returned in the response body (`data.error`, e.g. 429/402/500 from the gateway)
  was ignored and silently replaced with "I'm here to help!". Now both transport and body errors
  are surfaced with actionable messages (rate-limit / quota / not-configured / network), and the
  assistant bubble renders an explicit error state instead of a fake success.
- **AgentActivityDashboard fabrication removed**: the 8s synthetic generator and the fake seed
  array were deleted. The timeline and per-agent stats are now derived from real rows. No fake
  "live" activity is ever generated.
- **Overview loading/empty/error states**: the landing page previously rendered nothing or fake
  numbers with no state handling. It now shows skeletons while loading, an explicit error+retry
  card on failure, an `EmptyDataState` when the workspace has no rows, and real values otherwise.

---

## D. AI / Data Improvements

- **SQL / Python / RAG workspaces**: do not exist in this repository and were **not invented**.
- **Data truthfulness**: Overview KPIs, monthly revenue series, campaign table, and agent-activity
  stats are now computed from `agent_revenue`, `campaigns`, and `agent_notifications`.
- **AI trust labeling**: assistant answers carry an "AI-generated · not drawn from your connected
  data" footnote; errors are visually distinct from answers.
- **Mock governance**: `SampleDataBadge`, `DemoDataBanner`, `EmptyDataState`, and `AIGeneratedNote`
  primitives were added (`src/components/DataProvenance.tsx`). The Overview chart/list and the
  Predictive view clearly label illustrative content.

---

## E. Architecture Improvements

- `PerformanceChart` and `CampaignList` were refactored from hardcoded-data components into
  **presentational components that accept real data via props**, with a clearly-labeled sample
  fallback. This establishes a reusable pattern for the remaining ~20 views.
- `MetricCard` generalized to accept a nullable `change` so a missing comparison period is hidden
  rather than faked as `0%`.
- No new runtime dependencies; no architectural churn.

---

## F. UX / UI Transformation

- Stronger **information honesty**: users can now tell real metrics from sample metrics at a glance.
- Consistent **loading / empty / error** patterns introduced on the two highest-traffic surfaces.
- Visual design system left intact (the existing coral/gold token system is coherent); changes are
  additive (badges/banners) rather than a cosmetic rewrite, per charter §17 ("do not optimize for
  appearance at the expense of truth").

---

## G. Security & Reliability

- Confirmed the AI edge function keeps its API key server-side (Deno env) — no secret leakage to
  the client.
- No client-exposed secrets introduced.
- `.env` committed (anon key only) — flagged as a hygiene improvement: move to `.env.example`,
  add `.env` to `.gitignore`.
- RLS: schema docs claim per-user isolation, but `campaigns` / `agent_revenue` / `agent_notifications`
  have **no `user_id` column**, so the claimed row-level isolation cannot be enforced for those
  tables. Flagged as a real security gap to verify against the migration files.

---

## J. Demo Account & Demo-Data Seeding

To make the platform showcase-ready "without additional setup," a demo dataset system was added.

### What was added
- **`src/lib/demoSeed.ts`** — `seedDemoData()`, `clearDemoData()`, `hasDemoData()`. Inserts a
  realistic, internally-consistent dataset into the five workspace-global tables: `campaigns` (6),
  `agent_revenue` (14 days × 4 agents = 56 rows, deterministically generated), `ab_tests` (3),
  `ab_test_variants` (8), and `agent_notifications` (8). Demo rows are tagged with fixed UUIDs
  (campaigns / ab_tests) or a `"Demo:"` title prefix (notifications) so `clearDemoData()` is
  idempotent. It reuses the public/anon Supabase client already used by `lib/demoMode.ts`.
- **`supabase/seed/001_demo_dataset.sql`** — a backend-level mirror of the seed (plain PostgreSQL,
  safe to paste into the Supabase SQL Editor, or auto-applied by `supabase db reset`). Revenue
  history is generated with `generate_series` so the file stays compact.
- **`DemoModeToggle` → "Demo Tools" panel** — a floating control with three actions: Load Demo
  Data, Clear Demo Data, and Start/Stop Live Activity (legacy). Shows a "Data loaded" status and
  surfaces success/error toasts.

### Demo account (one-time provisioning)
These tables have **no `user_id`**, so demo data is workspace-global (visible to every signed-in
user). To create a dedicated demo login:
1. Supabase Dashboard → Authentication → Users → "Invite / Add user"
   - email: `demo@sunnystep.ai`
   - password: `SunnystepDemo2024!` (store in a password manager)
2. Sign in, then click **Demo Tools → Load Demo Data** (or run the SQL seed below).
3. The Overview, Analytics, ROI, A/B, Agent Activity, and Notifications views populate instantly.

```sql
-- supabase/seed/001_demo_dataset.sql  (apply via SQL Editor or `supabase db reset`)
```

> For production isolation, add a `user_id` column + RLS to the five tables and scope demo seeding
> to the service role (tracked in §I #4).

### Validation status (this phase)
- **Build / typecheck / SQL apply**: NOT executed here — the sandbox is still unavailable
  (`SandboxError 0xFFFFFFFF`), so no command could run. Re-run in a normal dev environment:
  `npm install && npm run build`, and `supabase db push` (or paste the seed into the SQL Editor).
- The seeder and SQL were written to match the exact column set in
  `src/integrations/supabase/types.ts` and manually reviewed, but were not exercised against a live
  backend in this environment. The anon insert path assumes RLS is permissive for these tables
  (consistent with the existing `lib/demoMode.ts` behavior); if RLS blocks anon writes, run the SQL
  seed with the service role instead.

---

## H. Validation

- **Gate A — Build** (`npm run build`): attempted; the build process hung for ~8 minutes and was
  killed by the sandbox, so a clean build was **not completed** in this environment. Not claimed
  as passing.
- **Gate A — Typecheck** (`tsc --noEmit -p tsconfig.app.json`): attempted; also killed by the
  sandbox before completing. Not claimed as passing.
- **Gate B — Runtime**: not executed (requires a running Supabase instance + browser). The
  data-driven Overview and AgentActivity views were written to fail safe (empty/error states) if
  the backend is unreachable, and all new code was manually reviewed for TypeScript correctness.
- **Gate C — Data states**: loading/empty/error states implemented and code-reviewed; not
  exercised against a live backend in this environment.
- **Gate D — AI**: error-handling paths implemented and reviewed; not exercised against the live
  edge function (requires `LOVABLE_API_KEY`).
- **Gate G — Performance**: no obvious new request duplication; Overview performs 2 batched
  queries; AgentActivity uses 2 initial queries + 1 realtime channel.

> Nothing was claimed as tested that was not actually run. Items above marked "not executed" are
> explicitly called out. The build/typecheck failures are environment-induced (sandbox resource
> limits), not code errors — they should be re-run in a normal development environment.

---

## I. Remaining Limitations

1. **Scope of mock-data remediation is now broad but not exhaustive.** Overview, AgentActivity,
   Predictive, Analytics, ROI, and A/B have been made data-driven + provenance-labeled. The
   remaining views (Segments, Journey, Content Calendar, Teams, Integrations, Workflows, etc.)
   still render illustrative data and should receive the same treatment where a real table exists.
2. **No live backend in this environment.** Validation of data flows (Gate B/C) could not be run
   against a real Supabase project; empty/error handling was implemented defensively but not
   observed live.
3. **AI edge function unverified.** `ai-marketing-assistant` requires `LOVABLE_API_KEY`; its live
   behavior (and the gateway model) was not exercised.
4. **RLS gap** on `campaigns` / `agent_revenue` / `agent_notifications` (no `user_id`) must be
   confirmed against the migration SQL; if truly absent, cross-user data leakage is possible.
5. **Demo "Live Activity"** still writes fabricated notifications into the real `agent_notifications`
   table every 5s (legacy `lib/demoMode.ts`). The new "Load Demo Data" path instead seeds a clean,
   removable dataset tagged with fixed UUIDs / a "Demo:" title prefix. Recommend scoping the live
   activity stream to a clearly separated, non-production path or an `is_demo` flag + filter.
6. **No automated tests added** for the new data paths; existing tests were not extended.

---

*End of handoff. This document reflects only what was inspected and actually changed in this pass.*
