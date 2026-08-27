import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getToolById } from "@/lib/tools/registry";

const ACTIVE_STATUSES = ["trialing", "active", "past_due"] as const;

export interface AdminMetrics {
  /** Total registered accounts (one `profiles` row per signup). */
  totalUsers: number;
  /** Personal (non-team) active subscriptions, grouped by plan id. */
  personalSubscriptionsByPlan: { planId: string; count: number }[];
  /** Active team (workspace-owned) subscriptions, grouped by plan id. */
  teamSubscriptionsByPlan: { planId: string; count: number }[];
  /** Subscriptions currently past_due — recognized revenue at risk, not yet lost. */
  pastDueCount: number;
  /** Estimated monthly recurring revenue in cents, from active + trialing subscriptions only (past_due excluded — not confirmed collected). */
  mrrCents: number;
  /**
   * The currency `mrrCents` is denominated in, or null when the
   * contributing plans do not agree on one.
   *
   * Null is a real outcome, not a defensive nicety: adding COP cents to
   * USD cents produces a number with no meaning, and displaying it under
   * either symbol would be a lie. The panel says so instead of picking.
   */
  mrrCurrency: string | null;
  recentWebhookEvents: { provider: string; eventId: string; eventType: string; receivedAt: string }[];
  topTools: { toolId: string; toolName: string; count: number }[];
  originality: {
    totalDocuments: number;
    documentsByStatus: { status: string; count: number }[];
    /** Total across all completed analyses — a rough proxy for extraction/comparison cost incurred. */
    totalWordsProcessed: number;
    analysesLast30Days: number;
  };
}

function bucketByPlan(rows: { plan_id: string }[]): { planId: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.plan_id, (counts.get(row.plan_id) ?? 0) + 1);
  return [...counts.entries()].map(([planId, count]) => ({ planId, count })).sort((a, b) => b.count - a.count);
}

/**
 * Read-only aggregate view for /admin. Uses the service-role client
 * deliberately — this is exactly the "cross-user data a single RLS-scoped
 * request can't see" case `admin.ts` exists for — but every caller of this
 * function MUST have already checked `isCurrentUserAdmin()` first; this
 * function itself performs no authorization.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const admin = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [usersResult, subsResult, plansResult, webhooksResult, usageResult, documentsResult] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("user_id, workspace_id, plan_id, billing_interval, status")
      .in("status", ACTIVE_STATUSES),
    admin.from("plans").select("id, monthly_price_cents, annual_price_cents, currency"),
    admin
      .from("webhook_events")
      .select("provider, event_id, event_type, received_at")
      .order("received_at", { ascending: false })
      .limit(20),
    admin.from("tool_usage").select("tool_id, count").gte("usage_date", thirtyDaysAgo),
    admin.from("documents").select("status, word_count, created_at"),
  ]);

  const subs = subsResult.data ?? [];
  const plans = new Map((plansResult.data ?? []).map((p) => [p.id, p]));

  const personalSubs = subs.filter((s) => s.user_id !== null);
  const teamSubs = subs.filter((s) => s.workspace_id !== null);
  const pastDueCount = subs.filter((s) => s.status === "past_due").length;

  let mrrCents = 0;
  const mrrCurrencies = new Set<string>();
  for (const sub of subs) {
    if (sub.status === "past_due") continue; // not confirmed collected — excluded from MRR, tracked separately
    const plan = plans.get(sub.plan_id);
    if (!plan) continue;
    if (sub.billing_interval === "year" && plan.annual_price_cents) {
      mrrCents += Math.round(plan.annual_price_cents / 12);
      mrrCurrencies.add(plan.currency);
    } else if (plan.monthly_price_cents) {
      mrrCents += plan.monthly_price_cents;
      mrrCurrencies.add(plan.currency);
    }
  }
  // One currency or none. Two would mean the sum above is meaningless, and
  // the panel is told that rather than being handed a number to mislabel.
  const mrrCurrency = mrrCurrencies.size === 1 ? [...mrrCurrencies][0] : null;

  const usageTotals = new Map<string, number>();
  for (const row of usageResult.data ?? []) {
    usageTotals.set(row.tool_id, (usageTotals.get(row.tool_id) ?? 0) + row.count);
  }
  const topTools = [...usageTotals.entries()]
    .map(([toolId, count]) => ({ toolId, toolName: getToolById(toolId)?.name ?? toolId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const documents = documentsResult.data ?? [];
  const statusCounts = new Map<string, number>();
  for (const doc of documents) statusCounts.set(doc.status, (statusCounts.get(doc.status) ?? 0) + 1);
  const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return {
    totalUsers: usersResult.count ?? 0,
    personalSubscriptionsByPlan: bucketByPlan(personalSubs),
    teamSubscriptionsByPlan: bucketByPlan(teamSubs),
    pastDueCount,
    mrrCents,
    mrrCurrency,
    recentWebhookEvents: (webhooksResult.data ?? []).map((e) => ({
      provider: e.provider,
      eventId: e.event_id,
      eventType: e.event_type,
      receivedAt: e.received_at,
    })),
    topTools,
    originality: {
      totalDocuments: documents.length,
      documentsByStatus: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
      totalWordsProcessed: documents.reduce((sum, d) => sum + (d.word_count ?? 0), 0),
      analysesLast30Days: documents.filter((d) => new Date(d.created_at).getTime() >= thirtyDaysAgoMs).length,
    },
  };
}
