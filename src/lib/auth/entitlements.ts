import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPlanById } from "@/lib/plans/queries";
import { entitlementsFromPlan, FALLBACK_FREE_ENTITLEMENTS, FREE_PLAN_ID, type Entitlements } from "@/lib/plans/types";
import type { PlanId } from "@/lib/supabase/database.types";

const ACTIVE_STATUSES = ["trialing", "active", "past_due"] as const;

/**
 * Resolves which plan actually applies to a user: their own subscription
 * first (a personal Pro plan), then — if they don't have one — any
 * workspace they belong to that has an active Team subscription. A user
 * who is a member (not just owner) of a paying team gets that team's
 * entitlements while using the app, matching the product spec's
 * "authenticated/free → ads, pro/team → no ads" rule.
 *
 * `past_due` is treated as still-active on purpose: Stripe gives a payment
 * a grace period before actually canceling, and this project shouldn't
 * invent a stricter cutoff than the payment provider's own dunning flow.
 */
async function resolvePlanId(userId: string): Promise<PlanId> {
  const supabase = await createClient();

  const { data: personalSub } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", userId)
    .in("status", ACTIVE_STATUSES)
    .maybeSingle();
  if (personalSub) return personalSub.plan_id;

  const { data: memberships } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", userId);
  if (memberships && memberships.length > 0) {
    const workspaceIds = memberships.map((m) => m.workspace_id);
    const { data: teamSub } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .in("workspace_id", workspaceIds)
      .in("status", ACTIVE_STATUSES)
      .limit(1)
      .maybeSingle();
    if (teamSub) return teamSub.plan_id;
  }

  return FREE_PLAN_ID;
}

/**
 * THE central "what can this user do" function. Every feature gate in the
 * app (ads, usage limits, premium tools, teams) should read from this —
 * never re-derive plan logic locally. Server-side only: the client never
 * decides its own entitlements, it only reflects what this function
 * already resolved.
 */
export const getEntitlements = cache(async (): Promise<Entitlements> => {
  const user = await getCurrentUser();
  if (!user) return FALLBACK_FREE_ENTITLEMENTS;

  const planId = await resolvePlanId(user.id);
  const plan = await getPlanById(planId);
  if (!plan) return FALLBACK_FREE_ENTITLEMENTS;

  return entitlementsFromPlan(plan);
});
