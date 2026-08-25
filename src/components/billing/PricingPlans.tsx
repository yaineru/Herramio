"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrencyFromCents } from "@/lib/plans/format";
import { PlanCheckoutButton } from "@/components/billing/PlanCheckoutButton";
import { FREE_PLAN_ID, PRO_PLAN_ID, type Plan } from "@/lib/plans/types";
import type { BillingInterval } from "@/lib/supabase/database.types";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// Presentation-only bullet copy per plan — never price/business logic, just
// how each plan's real boolean features (ads_enabled, higher_limits, etc.)
// get described to a visitor. Keep in sync with what the plan actually does.
const PLAN_FEATURES: Record<string, string[]> = {
  [FREE_PLAN_ID]: ["Acceso a todas las herramientas", "Con anuncios", "Límites estándar"],
  [PRO_PLAN_ID]: ["Sin anuncios", "Límites más altos", "Historial y favoritos", "Acceso anticipado a herramientas nuevas"],
  team: ["Todo lo de Pro", "Espacio de equipo (hasta 5 personas)", "Invita a tu equipo", "Gestión de miembros"],
};

export function PricingPlans({ plans, currentPlanId }: { plans: Plan[]; currentPlanId: string }) {
  const anyAnnual = plans.some((p) => p.annualPriceCents !== null);
  const [interval, setInterval] = useState<BillingInterval>("month");

  useEffect(() => {
    AnalyticsEvents.pricingViewed();
  }, []);

  return (
    <div>
      {anyAnnual && (
        <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setInterval("month")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              interval === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setInterval("year")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              interval === "year" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
            )}
          >
            Anual
          </button>
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isFree = plan.id === FREE_PLAN_ID;
          const isHighlighted = plan.id === PRO_PLAN_ID;

          // Fall back to whichever interval the plan actually offers, e.g.
          // Team currently has no annual price.
          const effectiveInterval: BillingInterval =
            interval === "year" && plan.annualPriceCents === null ? "month" : interval;
          const priceCents = effectiveInterval === "year" ? plan.annualPriceCents : plan.monthlyPriceCents;

          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col p-6", isHighlighted && "border-emerald-500 ring-1 ring-emerald-500/30")}
            >
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              <p className="mt-4">
                <span className="text-3xl font-bold text-slate-900">
                  {isFree || priceCents === null ? "Gratis" : formatCurrencyFromCents(priceCents, plan.currency)}
                </span>
                {!isFree && priceCents !== null && (
                  <span className="text-sm text-slate-500">/{effectiveInterval === "month" ? "mes" : "año"}</span>
                )}
              </p>

              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
                {(PLAN_FEATURES[plan.id] ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <PlanCheckoutButton planId={plan.id} interval={effectiveInterval} isCurrent={isCurrent} isFree={isFree} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
