-- ============================================================================
--  Sunnystep AI — Demo Dataset Seed
-- ----------------------------------------------------------------------------
--  Mirrors src/lib/demoSeed.ts (the in-app "Load Demo Data" button).
--  Plain PostgreSQL — safe to paste into the Supabase SQL Editor, or run via
--  `supabase db reset` (this file lives in supabase/seed/ and is auto-applied).
--
--  HOW TO APPLY
--    Option A (local):  supabase db reset            -- wipes + re-seeds
--    Option B (remote): paste this file into the Supabase SQL Editor and run.
--    Option C (app):    click "Demo Tools → Load Demo Data" in the UI.
--
--  DEMO ACCOUNT
--    These tables have NO user_id column, so the demo data is workspace-global
--    and visible to every signed-in user. To create a dedicated demo login:
--      1. Supabase Dashboard → Authentication → Users → "Invite / Add user"
--         email:  demo@sunnystep.ai
--         password: SunnystepDemo2024!   (store in a password manager)
--      2. Sign in with those credentials, then run this seed (any of A/B/C).
--    For production isolation, add a `user_id` column + RLS (see HANDOFF).
-- ============================================================================

-- Fixed demo identifiers (must match src/lib/demoSeed.ts)
--   c1..c6 = campaigns, t1..t3 = ab_tests

-- ---------------------------------------------------------------------------
-- 1. Clear any prior demo rows (idempotent re-seed)
-- ---------------------------------------------------------------------------
delete from agent_revenue      where campaign_id in ('d0c0a000-0000-4000-8000-0000000000c1','d0c0a000-0000-4000-8000-0000000000c2','d0c0a000-0000-4000-8000-0000000000c3','d0c0a000-0000-4000-8000-0000000000c4','d0c0a000-0000-4000-8000-0000000000c5','d0c0a000-0000-4000-8000-0000000000c6');
delete from campaigns          where id          in ('d0c0a000-0000-4000-8000-0000000000c1','d0c0a000-0000-4000-8000-0000000000c2','d0c0a000-0000-4000-8000-0000000000c3','d0c0a000-0000-4000-8000-0000000000c4','d0c0a000-0000-4000-8000-0000000000c5','d0c0a000-0000-4000-8000-0000000000c6');
delete from ab_test_variants   where test_id     in ('d0c0b000-0000-4000-8000-0000000000b1','d0c0b000-0000-4000-8000-0000000000b2','d0c0b000-0000-4000-8000-0000000000b3');
delete from ab_tests           where id          in ('d0c0b000-0000-4000-8000-0000000000b1','d0c0b000-0000-4000-8000-0000000000b2','d0c0b000-0000-4000-8000-0000000000b3');
delete from agent_notifications where title ilike 'Demo:%';

-- ---------------------------------------------------------------------------
-- 2. Campaigns
-- ---------------------------------------------------------------------------
insert into campaigns (id, name, type, status, agent_name, sent_count, open_rate, conversion_rate, revenue, start_date, end_date)
values
  ('d0c0a000-0000-4000-8000-0000000000c1', 'Spring Sale — Email Blast',     'email',    'completed', 'Campaign Agent',       45000, 0.32, 0.085, 124500, current_date - 14, current_date - 2),
  ('d0c0a000-0000-4000-8000-0000000000c2', 'Cart Recovery — SMS',           'sms',      'active',    'Abandoned Cart Agent', 12000, 0.41, 0.121,  48200, current_date - 10, null),
  ('d0c0a000-0000-4000-8000-0000000000c3', 'WhatsApp VIP Drop',             'whatsapp', 'completed', 'Lifecycle Agent',       8500, 0.55, 0.108,  31800, current_date - 12, current_date - 3),
  ('d0c0a000-0000-4000-8000-0000000000c4', 'Web Push Flash Sale',           'web_push', 'active',    'Creative Agent',        22000, 0.18, 0.086,  62400, current_date - 9,  null),
  ('d0c0a000-0000-4000-8000-0000000000c5', 'Summer Launch — Email',         'email',    'active',    'Campaign Agent',        38000, 0.29, 0.078,  98200, current_date - 6,  null),
  ('d0c0a000-0000-4000-8000-0000000000c6', 'Browse Abandon — SMS',          'sms',      'completed', 'Abandoned Cart Agent',  9000, 0.44, 0.130,  39600, current_date - 15, current_date - 5)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. A/B tests
-- ---------------------------------------------------------------------------
insert into ab_tests (id, name, description, status, test_type, start_date, end_date, winning_variant, confidence_level, updated_at)
values
  ('d0c0b000-0000-4000-8000-0000000000b1', 'CNY Email Subject Line Test', 'Testing different subject lines for Chinese New Year campaign', 'completed', 'email', current_date - 14, current_date - 2, 'Variant B',        97.2, now()),
  ('d0c0b000-0000-4000-8000-0000000000b2', 'Cart Reminder Timing Test',   'Testing optimal timing for abandoned cart reminders',          'running',   'email', current_date - 5,  null,            null,              82.5, now()),
  ('d0c0b000-0000-4000-8000-0000000000b3', 'Welcome Series CTA Button',   'Testing CTA button colors and text for welcome emails',        'completed', 'email', current_date - 21, current_date - 7,  'Coral + Action Text', 99.1, now())
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. A/B test variants
-- ---------------------------------------------------------------------------
insert into ab_test_variants (test_id, variant_name, is_control, impressions, conversions, conversion_rate, revenue)
values
  ('d0c0b000-0000-4000-8000-0000000000b1', 'Control',             true,  15000, 1200, 8.0,  24000),
  ('d0c0b000-0000-4000-8000-0000000000b1', 'Variant A',           false, 15000, 1380, 9.2,  27600),
  ('d0c0b000-0000-4000-8000-0000000000b1', 'Variant B',           false, 15000, 1650, 11.0, 33000),
  ('d0c0b000-0000-4000-8000-0000000000b2', '1 Hour',              true,  3200,  384,  12.0, 7680),
  ('d0c0b000-0000-4000-8000-0000000000b2', '4 Hours',             false, 3200,  448,  14.0, 8960),
  ('d0c0b000-0000-4000-8000-0000000000b2', '24 Hours',            false, 3200,  320,  10.0, 6400),
  ('d0c0b000-0000-4000-8000-0000000000b3', 'Blue + Shop Now',     true,  8500,  595,  7.0,  11900),
  ('d0c0b000-0000-4000-8000-0000000000b3', 'Coral + Action Text', false, 8500,  935,  11.0, 18700);

-- ---------------------------------------------------------------------------
-- 5. Agent notifications (clearly prefixed so they can be removed)
-- ---------------------------------------------------------------------------
insert into agent_notifications (agent_name, action_type, title, description, status)
values
  ('Campaign Agent',        'campaign_launched', 'Demo: Flash Sale Campaign Started', 'Email blast sent to 8,450 VIP customers',          'success'),
  ('Abandoned Cart Agent',  'cart_recovered',    'Demo: Cart Recovered',              'Customer #7234 completed $189 purchase after reminder', 'success'),
  ('Lifecycle Agent',       'segment_created',   'Demo: New Segment Identified',      '342 customers matched ''High LTV at Risk'' criteria', 'info'),
  ('Creative Agent',        'ab_winner',         'Demo: A/B Test Winner',            'Subject line B won with 34% higher open rate',      'success'),
  ('Campaign Agent',        'budget_alert',      'Demo: Budget Threshold Reached',   'Daily ad spend at 85% of limit',                   'warning'),
  ('Abandoned Cart Agent',  'reminder_sent',     'Demo: Cart Reminder Sent',          'Personalized SMS to customer with $245 cart',      'info'),
  ('Lifecycle Agent',       'churn_prevented',   'Demo: Churn Risk Mitigated',        'Win-back offer accepted by dormant customer',      'success'),
  ('Creative Agent',        'content_blocked',   'Demo: Content Flagged',             'Discount claim exceeded brand guidelines',         'error');

-- ---------------------------------------------------------------------------
-- 6. 14 days of agent revenue history (synthesized per agent)
-- ---------------------------------------------------------------------------
insert into agent_revenue (agent_name, campaign_id, date, revenue, conversions, actions_taken, cost)
select
  a.agent_name,
  a.campaign_id,
  (current_date - g.d) as date,
  (a.base * (0.8 + 0.4 * random()))::int                                  as revenue,
  ((a.base * (0.8 + 0.4 * random())) / a.aov)::int                        as conversions,
  (((a.base * (0.8 + 0.4 * random())) / a.aov) * (2 + random() * 2))::int as actions_taken,
  ((a.base * (0.8 + 0.4 * random())) / a.roi)::int                        as cost
from (values
  ('Campaign Agent',       'd0c0a000-0000-4000-8000-0000000000c1'::uuid, 8900, 140, 7.2),
  ('Abandoned Cart Agent', 'd0c0a000-0000-4000-8000-0000000000c2'::uuid, 3500, 165, 4.75),
  ('Lifecycle Agent',      'd0c0a000-0000-4000-8000-0000000000c3'::uuid, 4840, 130, 4.65),
  ('Creative Agent',       'd0c0a000-0000-4000-8000-0000000000c4'::uuid, 1870, 120, 2.85)
) as a(agent_name, campaign_id, base, aov, roi)
cross join generate_series(0, 13) as g(d);
