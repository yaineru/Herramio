import { describe, it, expect, vi, beforeEach } from "vitest";

const { rpc, createAdminClient } = vi.hoisted(() => {
  const rpc = vi.fn();
  const createAdminClient = vi.fn(() => ({ rpc }));
  return { rpc, createAdminClient };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));

import { checkRateLimit } from "@/lib/rate-limit/check";

describe("checkRateLimit", () => {
  beforeEach(() => {
    rpc.mockReset();
    createAdminClient.mockClear();
  });

  it("allows the request when the RPC returns true", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await checkRateLimit("auth:signin:a@b.com", 10, 900)).toBe(true);
    expect(rpc).toHaveBeenCalledWith("check_and_record_rate_limit", {
      p_bucket: "auth:signin:a@b.com",
      p_max_events: 10,
      p_window_seconds: 900,
    });
  });

  it("blocks the request when the RPC returns false", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await checkRateLimit("auth:signin:a@b.com", 10, 900)).toBe(false);
  });

  it("fails open (allows) on an RPC error — a DB hiccup must never lock out real users", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "connection reset" } });
    expect(await checkRateLimit("auth:signin:a@b.com", 10, 900)).toBe(true);
  });

  it("fails open when the RPC call itself throws", async () => {
    rpc.mockRejectedValue(new Error("network error"));
    expect(await checkRateLimit("auth:signin:a@b.com", 10, 900)).toBe(true);
  });
});
