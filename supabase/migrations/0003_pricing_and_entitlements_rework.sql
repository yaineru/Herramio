-- Reworks `plans` from "one price + one interval per row" to "a plan tier
-- can be sold monthly, annually, both, or neither" — and gives it a jsonb
-- escape hatch for future per-plan limits (pdf_daily_limit, etc.) instead
-- of a new migration every time one is needed. Also updates pricing to the
-- current target (Pro US$3.99/mo or US$29.99/yr, Team US$9.99/mo) and adds
-- a normally-hidden "pro_founding" plan for a possible early-adopter offer.
--
-- Written defensively (if exists / if not exists / drop-then-add
-- constraint) so it is safe to run whether starting from the original
-- 0001/0002 shape (already live on this project) or from a fresh install
-- that applied an already-updated 0001/0002 — never assume which.

alter table public.plans
  add column if not exists monthly_price_cents integer,
  add column if not exists annual_price_cents integer,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists provider_price_id_monthly text,
  add column if not exists provider_price_id_annual text;

-- Carry over any already-configured monthly provider price id before the
-- old single-price-id column is dropped below.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'plans' and column_name = 'provider_price_id'
  ) then
    update public.plans
      set provider_price_id_monthly = provider_price_id
      where provider_price_id_monthly is null and provider_price_id is not null;
  end if;
end $$;

-- Current target pricing (researched fee viability documented in
-- MONETIZATION.md) — explicit values, not a backfill from the old
-- price_cents column, since the price itself changed, not just the shape.
update public.plans set monthly_price_cents = 399, annual_price_cents = 2999 where id = 'pro';
update public.plans set monthly_price_cents = 999 where id = 'team';
-- 'free' stays null/null on purpose — it isn't sold at any interval.

alter table public.plans
  drop column if exists price_cents,
  drop column if exists billing_interval,
  drop column if exists provider_price_id;

alter table public.plans drop constraint if exists plans_has_at_least_one_price;
alter table public.plans add constraint plans_has_at_least_one_price check (
  id = 'free' or monthly_price_cents is not null or annual_price_cents is not null
);

comment on column public.plans.metadata is
  'Escape hatch for plan-specific values that do not warrant their own column (daily tool-usage limits, one-off feature flags). Read via Entitlements.metadata — never re-derived elsewhere.';

-- A subscription now also records which interval the customer is on,
-- since the plan row itself no longer fixes a single one.
alter table public.subscriptions add column if not exists billing_interval text;
alter table public.subscriptions drop constraint if exists subscriptions_billing_interval_check;
alter table public.subscriptions add constraint subscriptions_billing_interval_check
  check (billing_interval is null or billing_interval in ('month', 'year'));

-- Mercado Pago is the default processor going forward (see
-- MONETIZATION.md for the researched Colombia comparison); Stripe remains
-- fully supported behind the same BillingProvider interface for a future
-- international-expansion phase. This only changes the default for *new*
-- rows — nothing here touches existing subscription rows' provider value.
alter table public.subscriptions alter column provider set default 'mercadopago';

-- Time-boxed early-adopter offer — inactive by default. Flip
-- `is_active = true` only when actually launching it, per MONETIZATION.md.
insert into public.plans (
  id, name, description, monthly_price_cents, annual_price_cents, currency,
  ads_enabled, higher_limits, premium_tools, teams_enabled, max_team_members, metadata,
  provider, provider_product_id, provider_price_id_monthly, provider_price_id_annual,
  is_active, sort_order
) values (
  'pro_founding', 'Pro fundador', 'Precio especial por tiempo limitado para los primeros usuarios.',
  99, null, 'usd',
  false, true, true, false, null, '{"founding": true}'::jsonb,
  null, null, null, null, false, 1
)
on conflict (id) do nothing;
