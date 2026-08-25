-- NOTE: this is what was actually applied to the live project (kept as-is
-- deliberately — never edit an already-applied migration). Pricing and
-- structure have since changed via 0003_pricing_and_entitlements_rework.sql
-- — read that file for the current plan rows; this one is history.
insert into public.plans (
  id, name, description, price_cents, currency, billing_interval,
  ads_enabled, higher_limits, premium_tools, teams_enabled, max_team_members,
  provider, provider_product_id, provider_price_id, is_active, sort_order
) values
  (
    'free', 'Gratis', 'Para probar y utilizar nuestras herramientas.',
    0, 'usd', 'month',
    true, false, false, false, null,
    null, null, null, true, 0
  ),
  (
    'pro', 'Pro', 'Para quienes quieren una experiencia sin anuncios y con mayores límites.',
    100, 'usd', 'month',
    false, true, true, false, null,
    null, null, null, true, 1
  ),
  (
    'team', 'Equipos', 'Para pequeños equipos que necesitan trabajar juntos.',
    500, 'usd', 'month',
    false, true, true, true, 5,
    null, null, null, true, 2
  )
on conflict (id) do nothing;
