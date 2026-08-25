import type { PlanId, BillingInterval } from "@/lib/supabase/database.types";

export type { PlanId, BillingInterval };

// The only plan ids any code path is allowed to special-case — "is this
// the free plan" (redirect/upgrade-CTA logic) and "is this a team
// subscription" (workspace requirement) are real branches in the code.
// Everything else about a plan (name, price, which features it grants) is
// pure data; adding a new plan (e.g. a time-boxed "pro_founding" offer) is
// a row insert, never a change to this file.
export const FREE_PLAN_ID: PlanId = "free";
export const PRO_PLAN_ID: PlanId = "pro";
export const TEAM_PLAN_ID: PlanId = "team";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  // Either can be null (a plan need not be offered on both intervals) —
  // the free plan has neither.
  monthlyPriceCents: number | null;
  annualPriceCents: number | null;
  currency: string;
  adsEnabled: boolean;
  higherLimits: boolean;
  premiumTools: boolean;
  teamsEnabled: boolean;
  maxTeamMembers: number | null;
  // Escape hatch for plan-specific values that don't warrant their own
  // column (daily tool-usage limits, feature flags for one-off premium
  // features, etc.) — read via Entitlements.metadata, never re-derived.
  metadata: Record<string, unknown>;
  providerPriceIdMonthly: string | null;
  providerPriceIdAnnual: string | null;
}

/** What a plan grants — the "what can the user do" side, always derived from a Plan, never set independently. */
export interface Entitlements {
  planId: PlanId;
  planName: string;
  adsEnabled: boolean;
  higherLimits: boolean;
  premiumTools: boolean;
  teamsEnabled: boolean;
  maxTeamMembers: number | null;
  metadata: Record<string, unknown>;
}

export function entitlementsFromPlan(plan: Plan): Entitlements {
  return {
    planId: plan.id,
    planName: plan.name,
    adsEnabled: plan.adsEnabled,
    higherLimits: plan.higherLimits,
    premiumTools: plan.premiumTools,
    teamsEnabled: plan.teamsEnabled,
    maxTeamMembers: plan.maxTeamMembers,
    metadata: plan.metadata,
  };
}

/**
 * Used only when the plans table can't be reached (migration not yet run,
 * transient DB error) — never as a stand-in for "user hasn't paid". An
 * unauthenticated or unresolved user is always treated as Free, which is
 * the safe direction to fail in (shows ads, doesn't unlock anything).
 */
export const FALLBACK_FREE_ENTITLEMENTS: Entitlements = {
  planId: FREE_PLAN_ID,
  planName: "Gratis",
  adsEnabled: true,
  higherLimits: false,
  premiumTools: false,
  teamsEnabled: false,
  maxTeamMembers: null,
  metadata: {},
};
