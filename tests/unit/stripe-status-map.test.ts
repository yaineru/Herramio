import { describe, it, expect } from "vitest";
import { mapStripeSubscriptionStatus } from "@/lib/stripe/status-map";

describe("mapStripeSubscriptionStatus", () => {
  it("passes through statuses that exist in our schema unchanged", () => {
    expect(mapStripeSubscriptionStatus("trialing")).toBe("trialing");
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("incomplete");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("unpaid");
  });

  it("collapses incomplete_expired and paused to canceled", () => {
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("paused")).toBe("canceled");
  });

  it("falls back to incomplete for any unrecognized status", () => {
    expect(mapStripeSubscriptionStatus("some_future_stripe_status")).toBe("incomplete");
  });
});
