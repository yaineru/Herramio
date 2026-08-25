import "server-only";
import { getEntitlements } from "@/lib/auth/entitlements";

/**
 * THE single decision point for "does this visitor see ads". Every AdSlot
 * render should go through this — never re-check pathname, plan id, or
 * auth state locally. Combines with NEXT_PUBLIC_ADS_ENABLED (the existing
 * global kill switch from MONETIZATION.md): even a Free user sees no ads
 * if the site-wide flag is off (e.g. before AdSense approval).
 */
export async function shouldShowAds(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "true") return false;
  const entitlements = await getEntitlements();
  return entitlements.adsEnabled;
}
