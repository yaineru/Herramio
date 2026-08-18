"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const REF_STORAGE_KEY = "qr-toolkit-ref-source";

/**
 * Captures ?ref=instagram / ?ref=tiktok / etc. so growth campaigns are
 * attributable without any backend — stored client-side and reported once
 * per session as a GA4 event.
 */
export function ReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    const alreadyTracked = window.sessionStorage.getItem(REF_STORAGE_KEY);
    window.localStorage.setItem(REF_STORAGE_KEY, ref);
    if (alreadyTracked === ref) return;

    window.sessionStorage.setItem(REF_STORAGE_KEY, ref);
    trackEvent("campaign_landing", { ref_source: ref });
  }, []);

  return null;
}
