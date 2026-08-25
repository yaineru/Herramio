import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const getEntitlements = vi.fn();
vi.mock("@/lib/auth/entitlements", () => ({ getEntitlements }));

async function importShouldShowAds() {
  const mod = await import("@/lib/ads/should-show-ads");
  return mod.shouldShowAds;
}

describe("shouldShowAds", () => {
  const originalFlag = process.env.NEXT_PUBLIC_ADS_ENABLED;

  beforeEach(() => {
    vi.resetModules();
    getEntitlements.mockReset();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_ADS_ENABLED = originalFlag;
  });

  it("never shows ads when the site-wide kill switch is off, regardless of plan", async () => {
    process.env.NEXT_PUBLIC_ADS_ENABLED = "false";
    getEntitlements.mockResolvedValue({ adsEnabled: true });
    const shouldShowAds = await importShouldShowAds();
    expect(await shouldShowAds()).toBe(false);
    expect(getEntitlements).not.toHaveBeenCalled();
  });

  it("shows ads for a free-plan user when the kill switch is on", async () => {
    process.env.NEXT_PUBLIC_ADS_ENABLED = "true";
    getEntitlements.mockResolvedValue({ adsEnabled: true });
    const shouldShowAds = await importShouldShowAds();
    expect(await shouldShowAds()).toBe(true);
  });

  it("hides ads for a Pro/Team user even when the kill switch is on", async () => {
    process.env.NEXT_PUBLIC_ADS_ENABLED = "true";
    getEntitlements.mockResolvedValue({ adsEnabled: false });
    const shouldShowAds = await importShouldShowAds();
    expect(await shouldShowAds()).toBe(false);
  });
});
