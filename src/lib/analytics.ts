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
  toolOpened: (tool: string) => trackEvent("tool_opened", { tool }),
  copyLink: (tool: string) => trackEvent("copy_link", { tool }),
  shareClicked: (tool: string, channel: string) =>
    trackEvent("share_clicked", { tool, channel }),
  blogArticleView: (slug: string) => trackEvent("blog_article_view", { slug }),
};
