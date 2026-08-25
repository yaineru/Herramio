import { describe, it, expect } from "vitest";
import { mapMercadoPagoSubscriptionStatus } from "@/lib/mercadopago/status-map";

describe("mapMercadoPagoSubscriptionStatus", () => {
  it("maps known PreApproval statuses", () => {
    expect(mapMercadoPagoSubscriptionStatus("pending")).toBe("incomplete");
    expect(mapMercadoPagoSubscriptionStatus("authorized")).toBe("active");
    expect(mapMercadoPagoSubscriptionStatus("paused")).toBe("past_due");
    expect(mapMercadoPagoSubscriptionStatus("cancelled")).toBe("canceled");
  });

  it("falls back to incomplete for undefined or unrecognized status", () => {
    expect(mapMercadoPagoSubscriptionStatus(undefined)).toBe("incomplete");
    expect(mapMercadoPagoSubscriptionStatus("")).toBe("incomplete");
    expect(mapMercadoPagoSubscriptionStatus("some_future_status")).toBe("incomplete");
  });
});
