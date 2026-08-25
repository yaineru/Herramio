"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Invisible: fires a named GA4 event once on mount. Takes a plain event
 * name (a string, not a function) specifically so a Server Component page
 * can render this directly — functions aren't serializable across the
 * Server → Client boundary, but a string prop is.
 */
export function AnalyticsPageEvent({ event, params }: { event: string; params?: Record<string, string | number | boolean> }) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
