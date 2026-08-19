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
};
