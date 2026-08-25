import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BillingInterval, Plan, PlanId } from "@/lib/plans/types";

function toPlan(row: {
  id: PlanId;
  name: string;
  description: string;
  monthly_price_cents: number | null;
  annual_price_cents: number | null;
  currency: string;
  ads_enabled: boolean;
  higher_limits: boolean;
  premium_tools: boolean;
  teams_enabled: boolean;
  max_team_members: number | null;
  metadata: Record<string, unknown>;
  provider_price_id_monthly: string | null;
  provider_price_id_annual: string | null;
}): Plan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    monthlyPriceCents: row.monthly_price_cents,
    annualPriceCents: row.annual_price_cents,
    currency: row.currency,
    adsEnabled: row.ads_enabled,
    higherLimits: row.higher_limits,
    premiumTools: row.premium_tools,
    teamsEnabled: row.teams_enabled,
    maxTeamMembers: row.max_team_members,
    metadata: row.metadata,
    providerPriceIdMonthly: row.provider_price_id_monthly,
    providerPriceIdAnnual: row.provider_price_id_annual,
  };
}

/**
 * All active plans, ordered for display on the pricing page. Cached per
 * request (React `cache`) — the pricing page, the nav plan badge, and the
 * account page can all call this without tripling the DB round trip.
 */
export const getActivePlans = cache(async (): Promise<Plan[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(toPlan);
});

export const getPlanById = cache(async (planId: PlanId): Promise<Plan | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();
  if (error || !data) return null;
  return toPlan(data);
});

/**
 * Resolves a provider's price id back to our plan — checking both the
 * monthly and annual columns, since a webhook payload only carries the
 * price id, not which interval it belongs to. Not cached: used by the
 * webhook route, which runs once per event, never within a request that
 * would benefit from memoization.
 */
export async function getPlanByProviderPriceId(
  providerPriceId: string,
): Promise<{ plan: Plan; interval: BillingInterval } | null> {
  const supabase = await createClient();

  const { data: monthlyMatch } = await supabase
    .from("plans")
    .select("*")
    .eq("provider_price_id_monthly", providerPriceId)
    .maybeSingle();
  if (monthlyMatch) return { plan: toPlan(monthlyMatch), interval: "month" };

  const { data: annualMatch } = await supabase
    .from("plans")
    .select("*")
    .eq("provider_price_id_annual", providerPriceId)
    .maybeSingle();
  if (annualMatch) return { plan: toPlan(annualMatch), interval: "year" };

  return null;
}
