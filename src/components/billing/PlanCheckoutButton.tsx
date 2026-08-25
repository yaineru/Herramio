"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createCheckoutSessionAction } from "@/lib/billing/actions";
import { AnalyticsEvents } from "@/lib/analytics";
import type { BillingInterval, PlanId } from "@/lib/supabase/database.types";

export function PlanCheckoutButton({
  planId,
  interval,
  isCurrent,
  isFree,
}: {
  planId: PlanId;
  interval: BillingInterval;
  isCurrent: boolean;
  isFree: boolean;
}) {
  if (isCurrent) {
    return (
      <Button className="w-full" size="sm" variant="outline" disabled>
        Tu plan actual
      </Button>
    );
  }

  if (isFree) {
    return (
      <Link href="/registro">
        <Button className="w-full" size="sm" variant="outline">
          Empezar gratis
        </Button>
      </Link>
    );
  }

  return (
    <form
      action={createCheckoutSessionAction.bind(null, planId, interval)}
      onSubmit={() => AnalyticsEvents.checkoutStarted(planId, interval)}
    >
      <Button type="submit" className="w-full" size="sm">
        Suscribirme
      </Button>
    </form>
  );
}
