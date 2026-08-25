"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsEvents } from "@/lib/analytics";

/** Invisible: fires checkout_completed when the visitor lands back on /cuenta with ?checkout=exito — a return-from-checkout signal, not proof the subscription is active (see AnalyticsEvents.checkoutReturnedSuccess). */
export function CheckoutReturnTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("checkout") === "exito") {
      AnalyticsEvents.checkoutReturnedSuccess("unknown");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
