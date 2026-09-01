export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Fires a GA4 event. No-ops safely when analytics isn't loaded (dev, ad
 * blockers, or consent declined) so callers never need to guard this.
 */
export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export const AnalyticsEvents = {
  qrGenerated: (tool: string) => trackEvent("qr_generated", { tool }),
  qrDownloaded: (tool: string, format: "png" | "svg") =>
    trackEvent(format === "png" ? "qr_download_png" : "qr_download_svg", { tool, format }),
  // Wire event name is "tool_view" (not "tool_opened") to match the event
  // taxonomy every other tool_* event follows — only the GA4 string changed
  // here, callers keep using AnalyticsEvents.toolOpened(...).
  toolOpened: (tool: string) => trackEvent("tool_view", { tool }),
  copyLink: (tool: string) => trackEvent("tool_copied", { tool }),
  shareClicked: (tool: string, channel: string) =>
    trackEvent("share_clicked", { tool, channel }),
  blogArticleView: (slug: string) => trackEvent("blog_article_view", { slug }),
  // Generic, non-QR-specific tool lifecycle events (calculators, image/PDF
  // tools...). Kept separate from the QR-specific events above instead of
  // overloading them with meanings they weren't designed for.
  toolUsed: (tool: string) => trackEvent("tool_used", { tool }),
  toolDownloaded: (tool: string, format?: string) => trackEvent("tool_downloaded", { tool, format }),
  toolError: (tool: string, reason?: string) => trackEvent("tool_error", { tool, reason }),
  favoriteAdded: (tool: string) => trackEvent("favorite_added", { tool }),
  favoriteRemoved: (tool: string) => trackEvent("favorite_removed", { tool }),
  searchUsed: (query: string, resultsCount: number) =>
    trackEvent("search_used", { query, results_count: resultsCount }),
  searchResultClicked: (tool: string, query: string) =>
    trackEvent("search_result_clicked", { tool, query }),
  categorySelected: (category: string) => trackEvent("category_selected", { category }),
  ctaClicked: (cta: string) => trackEvent("cta_clicked", { cta }),

  // Monetization funnel. All fired client-side (GA4 only has a browser
  // integration in this project — see MONETIZATION.md for why
  // subscription_active/subscription_cancelled aren't in this list: those
  // are only known server-side, from the payment webhook, and firing them
  // from anywhere client-reachable would mean trusting client state for a
  // billing fact, which this project deliberately never does).
  signupStarted: () => trackEvent("signup_started"),
  signupCompleted: () => trackEvent("signup_completed"),
  pricingViewed: () => trackEvent("pricing_viewed"),
  paywallShown: (reason: string) => trackEvent("paywall_shown", { reason }),
  checkoutStarted: (planId: string, interval: string) => trackEvent("checkout_started", { plan_id: planId, interval }),
  // Fired on return from the processor's checkout — reflects that the user
  // came back claiming success, NOT that the subscription is confirmed
  // active (only the webhook knows that; see /admin for real MRR/counts).
  checkoutReturnedSuccess: (planId: string) => trackEvent("checkout_completed", { plan_id: planId }),

  // Originality analysis funnel. analysisStarted/Completed/Failed are
  // fired client-side off an OBSERVED status change from polling the
  // document's real row (see DocumentStatusPoller) — never fired
  // optimistically before the server has actually recorded that status.
  originalityViewed: () => trackEvent("originality_viewed"),
  // Beta feedback channel. Three events, no more: opened tells us whether
  // people notice it at all, submitted whether they finish, and failed
  // whether we are losing messages. Anything finer would be telemetry for
  // its own sake.
  // Contact is tracked separately from feedback on purpose: "I need to
  // reach someone" and "this could be better" are different intents, and
  // merging them would hide which one is actually happening.
  contactOpened: () => trackEvent("contact_opened"),
  contactSubmitted: (topic: string) => trackEvent("contact_submitted", { topic }),
  contactFailed: () => trackEvent("contact_failed"),
  feedbackOpened: (pagePath: string) => trackEvent("feedback_opened", { page_path: pagePath }),
  feedbackSubmitted: (kind: string) => trackEvent("feedback_submitted", { kind }),
  feedbackFailed: () => trackEvent("feedback_failed"),
  documentUploadStarted: () => trackEvent("document_upload_started"),
  documentUploaded: (documentId: string) => trackEvent("document_uploaded", { document_id: documentId }),
  analysisStarted: (documentId: string) => trackEvent("analysis_started", { document_id: documentId }),
  analysisCompleted: (documentId: string) => trackEvent("analysis_completed", { document_id: documentId }),
  analysisFailed: (documentId: string) => trackEvent("analysis_failed", { document_id: documentId }),
  reportViewed: (documentId: string) => trackEvent("report_viewed", { document_id: documentId }),
  sourceClicked: (documentId: string, matchId: number) =>
    trackEvent("source_clicked", { document_id: documentId, match_id: matchId }),
  upgradeFromOriginality: () => trackEvent("upgrade_from_originality"),
};
