/**
 * demoSeed.ts — one-click demo dataset loader.
 *
 * The six data tables targeted here (campaigns, agent_revenue, ab_tests,
 * ab_test_variants, agent_notifications) have NO `user_id` column in the
 * current schema, so they are workspace-global. This module follows the exact
 * pattern already used by `demoMode.ts`: it writes through the public/anon
 * Supabase client. That keeps the app "showcase-ready" with zero backend setup.
 *
 * NOTE ON RLS: because these tables carry no ownership column, row-level
 * security (if enabled) must be permissive for the anon role, otherwise the
 * inserts below will be rejected. The auth/backend task that adds `user_id`
 * + per-row RLS is tracked in ENGINEERING_HANDOFF.md. For a pure demo this is
 * acceptable; for production the seed must run with the service role.
 *
 * Demo rows are tagged with fixed UUIDs (campaigns / ab_tests) or a "Demo:"
 * title prefix (notifications) so they can be removed cleanly and idempotently
 * via `clearDemoData()`.
 */

import { supabase } from "@/integrations/supabase/client";

/* ------------------------------------------------------------------ */
/* Fixed demo identifiers (valid UUIDs, deterministic across reloads)   */
/* ------------------------------------------------------------------ */

const DEMO_CAMPAIGN_IDS = [
  "d0c0a000-0000-4000-8000-0000000000c1",
  "d0c0a000-0000-4000-8000-0000000000c2",
  "d0c0a000-0000-4000-8000-0000000000c3",
  "d0c0a000-0000-4000-8000-0000000000c4",
  "d0c0a000-0000-4000-8000-0000000000c5",
  "d0c0a000-0000-4000-8000-0000000000c6",
] as const;

const DEMO_TEST_IDS = [
  "d0c0b000-0000-4000-8000-0000000000b1",
  "d0c0b000-0000-4000-8000-0000000000b2",
  "d0c0b000-0000-4000-8000-0000000000b3",
] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function nowISO(): string {
  return new Date().toISOString();
}

/** Deterministic PRNG so the generated revenue numbers are stable per run. */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Static demo rows                                                    */
/* ------------------------------------------------------------------ */

const CAMPAIGN_ROWS = [
  {
    id: DEMO_CAMPAIGN_IDS[0],
    name: "Spring Sale — Email Blast",
    type: "email",
    status: "completed",
    agent_name: "Campaign Agent",
    sent_count: 45000,
    open_rate: 0.32,
    conversion_rate: 0.085,
    revenue: 124500,
    start_date: daysAgoISO(14),
    end_date: daysAgoISO(2),
  },
  {
    id: DEMO_CAMPAIGN_IDS[1],
    name: "Cart Recovery — SMS",
    type: "sms",
    status: "active",
    agent_name: "Abandoned Cart Agent",
    sent_count: 12000,
    open_rate: 0.41,
    conversion_rate: 0.121,
    revenue: 48200,
    start_date: daysAgoISO(10),
    end_date: null,
  },
  {
    id: DEMO_CAMPAIGN_IDS[2],
    name: "WhatsApp VIP Drop",
    type: "whatsapp",
    status: "completed",
    agent_name: "Lifecycle Agent",
    sent_count: 8500,
    open_rate: 0.55,
    conversion_rate: 0.108,
    revenue: 31800,
    start_date: daysAgoISO(12),
    end_date: daysAgoISO(3),
  },
  {
    id: DEMO_CAMPAIGN_IDS[3],
    name: "Web Push Flash Sale",
    type: "web_push",
    status: "active",
    agent_name: "Creative Agent",
    sent_count: 22000,
    open_rate: 0.18,
    conversion_rate: 0.086,
    revenue: 62400,
    start_date: daysAgoISO(9),
    end_date: null,
  },
  {
    id: DEMO_CAMPAIGN_IDS[4],
    name: "Summer Launch — Email",
    type: "email",
    status: "active",
    agent_name: "Campaign Agent",
    sent_count: 38000,
    open_rate: 0.29,
    conversion_rate: 0.078,
    revenue: 98200,
    start_date: daysAgoISO(6),
    end_date: null,
  },
  {
    id: DEMO_CAMPAIGN_IDS[5],
    name: "Browse Abandon — SMS",
    type: "sms",
    status: "completed",
    agent_name: "Abandoned Cart Agent",
    sent_count: 9000,
    open_rate: 0.44,
    conversion_rate: 0.13,
    revenue: 39600,
    start_date: daysAgoISO(15),
    end_date: daysAgoISO(5),
  },
];

const ABTEST_ROWS = [
  {
    id: DEMO_TEST_IDS[0],
    name: "CNY Email Subject Line Test",
    description: "Testing different subject lines for Chinese New Year campaign",
    status: "completed",
    test_type: "email",
    start_date: daysAgoISO(14),
    end_date: daysAgoISO(2),
    winning_variant: "Variant B",
    confidence_level: 97.2,
    updated_at: nowISO(),
  },
  {
    id: DEMO_TEST_IDS[1],
    name: "Cart Reminder Timing Test",
    description: "Testing optimal timing for abandoned cart reminders",
    status: "running",
    test_type: "email",
    start_date: daysAgoISO(5),
    end_date: null,
    winning_variant: null,
    confidence_level: 82.5,
    updated_at: nowISO(),
  },
  {
    id: DEMO_TEST_IDS[2],
    name: "Welcome Series CTA Button",
    description: "Testing CTA button colors and text for welcome emails",
    status: "completed",
    test_type: "email",
    start_date: daysAgoISO(21),
    end_date: daysAgoISO(7),
    winning_variant: "Coral + Action Text",
    confidence_level: 99.1,
    updated_at: nowISO(),
  },
];

const VARIANT_ROWS = [
  // Test 1
  { test_id: DEMO_TEST_IDS[0], variant_name: "Control", is_control: true, impressions: 15000, conversions: 1200, conversion_rate: 8.0, revenue: 24000 },
  { test_id: DEMO_TEST_IDS[0], variant_name: "Variant A", is_control: false, impressions: 15000, conversions: 1380, conversion_rate: 9.2, revenue: 27600 },
  { test_id: DEMO_TEST_IDS[0], variant_name: "Variant B", is_control: false, impressions: 15000, conversions: 1650, conversion_rate: 11.0, revenue: 33000 },
  // Test 2
  { test_id: DEMO_TEST_IDS[1], variant_name: "1 Hour", is_control: true, impressions: 3200, conversions: 384, conversion_rate: 12.0, revenue: 7680 },
  { test_id: DEMO_TEST_IDS[1], variant_name: "4 Hours", is_control: false, impressions: 3200, conversions: 448, conversion_rate: 14.0, revenue: 8960 },
  { test_id: DEMO_TEST_IDS[1], variant_name: "24 Hours", is_control: false, impressions: 3200, conversions: 320, conversion_rate: 10.0, revenue: 6400 },
  // Test 3
  { test_id: DEMO_TEST_IDS[2], variant_name: "Blue + Shop Now", is_control: true, impressions: 8500, conversions: 595, conversion_rate: 7.0, revenue: 11900 },
  { test_id: DEMO_TEST_IDS[2], variant_name: "Coral + Action Text", is_control: false, impressions: 8500, conversions: 935, conversion_rate: 11.0, revenue: 18700 },
];

const NOTIF_ROWS = [
  { title: "Demo: Flash Sale Campaign Started", action_type: "campaign_launched", agent_name: "Campaign Agent", description: "Email blast sent to 8,450 VIP customers", status: "success" },
  { title: "Demo: Cart Recovered", action_type: "cart_recovered", agent_name: "Abandoned Cart Agent", description: "Customer #7234 completed $189 purchase after reminder", status: "success" },
  { title: "Demo: New Segment Identified", action_type: "segment_created", agent_name: "Lifecycle Agent", description: "342 customers matched 'High LTV at Risk' criteria", status: "info" },
  { title: "Demo: A/B Test Winner", action_type: "ab_winner", agent_name: "Creative Agent", description: "Subject line B won with 34% higher open rate", status: "success" },
  { title: "Demo: Budget Threshold Reached", action_type: "budget_alert", agent_name: "Campaign Agent", description: "Daily ad spend at 85% of limit", status: "warning" },
  { title: "Demo: Cart Reminder Sent", action_type: "reminder_sent", agent_name: "Abandoned Cart Agent", description: "Personalized SMS to customer with $245 cart", status: "info" },
  { title: "Demo: Churn Risk Mitigated", action_type: "churn_prevented", agent_name: "Lifecycle Agent", description: "Win-back offer accepted by dormant customer", status: "success" },
  { title: "Demo: Content Flagged", action_type: "content_blocked", agent_name: "Creative Agent", description: "Discount claim exceeded brand guidelines", status: "error" },
];

/** Per-agent daily revenue baselines used to synthesize 14 days of history. */
const REVENUE_AGENTS = [
  { agent_name: "Campaign Agent", campaign_id: DEMO_CAMPAIGN_IDS[0], base: 8900, aov: 140, roi: 7.2 },
  { agent_name: "Abandoned Cart Agent", campaign_id: DEMO_CAMPAIGN_IDS[1], base: 3500, aov: 165, roi: 4.75 },
  { agent_name: "Lifecycle Agent", campaign_id: DEMO_CAMPAIGN_IDS[2], base: 4840, aov: 130, roi: 4.65 },
  { agent_name: "Creative Agent", campaign_id: DEMO_CAMPAIGN_IDS[3], base: 1870, aov: 120, roi: 2.85 },
];

const REVENUE_DAYS = 14;

function buildRevenueRows() {
  const rows: {
    agent_name: string;
    campaign_id: string;
    date: string;
    revenue: number;
    conversions: number;
    actions_taken: number;
    cost: number;
  }[] = [];

  REVENUE_AGENTS.forEach((agent, ai) => {
    const rand = mulberry32(1000 + ai * 97);
    for (let d = REVENUE_DAYS - 1; d >= 0; d--) {
      const date = daysAgoISO(d);
      const revenue = Math.round(agent.base * (0.8 + 0.4 * rand()));
      const conversions = Math.round(revenue / agent.aov);
      const actions = Math.round(conversions * (2 + rand() * 2));
      const cost = Math.round(revenue / agent.roi);
      rows.push({
        agent_name: agent.agent_name,
        campaign_id: agent.campaign_id,
        date,
        revenue,
        conversions,
        actions_taken: actions,
        cost,
      });
    }
  });

  return rows;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface SeedResult {
  ok: boolean;
  error?: string;
}

/**
 * Best-effort removal of all demo rows so re-seeding is idempotent. Each delete
 * is awaited and its `.error` unwrapped; `PostgrestFilterBuilder` is thenable but
 * typing a bare `Promise` array confuses the compiler, so we await inline.
 */
export async function clearDemoData(): Promise<SeedResult> {
  const errors: string[] = [];

  const deletes: { error?: { message?: string } | null }[] = [];

  deletes.push(
    await supabase.from("agent_revenue").delete().in("campaign_id", DEMO_CAMPAIGN_IDS as unknown as string[])
  );
  deletes.push(
    await supabase.from("campaigns").delete().in("id", DEMO_CAMPAIGN_IDS as unknown as string[])
  );
  deletes.push(
    await supabase.from("ab_test_variants").delete().in("test_id", DEMO_TEST_IDS as unknown as string[])
  );
  deletes.push(
    await supabase.from("ab_tests").delete().in("id", DEMO_TEST_IDS as unknown as string[])
  );
  deletes.push(
    await supabase.from("agent_notifications").delete().like("title", "Demo:%")
  );

  deletes.forEach((r) => {
    if (r.error) errors.push(r.error.message ?? "delete failed");
  });

  if (errors.length > 0) {
    return { ok: false, error: errors.join("; ") };
  }
  return { ok: true };
}

/** Inserts the full demo dataset. Clears any prior demo data first. */
export async function seedDemoData(): Promise<SeedResult> {
  try {
    // Idempotent: remove prior demo rows before re-inserting.
    await clearDemoData();

    const revenueRows = buildRevenueRows();

    // Insert parent rows first (FK targets), then dependent rows.
    const parentRes = await Promise.all([
      supabase.from("campaigns").upsert(CAMPAIGN_ROWS, { onConflict: "id" }),
      supabase.from("ab_tests").upsert(ABTEST_ROWS, { onConflict: "id" }),
    ]);

    const childRes = await Promise.all([
      supabase.from("ab_test_variants").insert(VARIANT_ROWS),
      supabase.from("agent_revenue").insert(revenueRows),
      supabase.from("agent_notifications").insert(NOTIF_ROWS),
    ]);

    const errors = [...parentRes, ...childRes]
      .map((r) => r.error?.message)
      .filter((m): m is string => Boolean(m));

    if (errors.length > 0) {
      return { ok: false, error: errors.join("; ") };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error while seeding demo data",
    };
  }
}

/** True when the demo campaign rows are present in the workspace. */
export async function hasDemoData(): Promise<boolean> {
  const { count, error } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .in("id", DEMO_CAMPAIGN_IDS as unknown as string[]);

  if (error) return false;
  return (count ?? 0) > 0;
}
