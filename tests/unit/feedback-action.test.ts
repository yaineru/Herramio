import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Beta feedback submission.
 *
 * The behaviour worth protecting is that a message is hard to lose. The
 * most valuable comment in a beta usually comes from someone about to
 * give up, so nothing here may reject a submission for a reason the
 * person could not have anticipated — and nothing may quietly report
 * success when the write failed.
 */

const insert = vi.fn();
const rpc = vi.fn();
const getCurrentUser = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ insert }), rpc }),
}));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.7, 10.0.0.1"]]),
}));

const { submitFeedbackAction } = await import("@/lib/feedback/actions");

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const idle = { status: "idle" as const, message: null };

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ error: null });
  // The rate limiter's RPC: true means "within the limit".
  rpc.mockReset().mockResolvedValue({ data: true, error: null });
  getCurrentUser.mockReset().mockResolvedValue(null);
});

describe("submitFeedbackAction", () => {
  it("stores a message from an anonymous visitor", async () => {
    // Requiring an account would lose exactly the feedback that matters
    // most: the person who bounced before signing up.
    const result = await submitFeedbackAction(idle, form({ message: "El informe no carga", kind: "problem" }));
    expect(result.status).toBe("sent");
    expect(insert).toHaveBeenCalledOnce();
    expect(insert.mock.calls[0][0]).toMatchObject({ user_id: null, kind: "problem", message: "El informe no carga" });
  });

  it("attaches the signed-in user", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-1", email: "a@b.c" });
    await submitFeedbackAction(idle, form({ message: "Sugerencia concreta" }));
    expect(insert.mock.calls[0][0].user_id).toBe("user-1");
  });

  it("records the page so a vague message is still useful", async () => {
    // "No entiendo esto" means different things on /precios and on a
    // report, and the path is often worth more than the words.
    await submitFeedbackAction(idle, form({ message: "No entiendo esto", pagePath: "/originalidad/abc" }));
    expect(insert.mock.calls[0][0].page_path).toBe("/originalidad/abc");
  });

  it("never stores document content or extra personal data", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-1", email: "persona@ejemplo.com" });
    await submitFeedbackAction(idle, form({ message: "Algo", pagePath: "/cuenta" }));
    const row = insert.mock.calls[0][0];
    // context stays empty: a feedback box must not become a
    // data-collection surface nobody agreed to.
    expect(row.context).toEqual({});
    expect(JSON.stringify(row)).not.toContain("persona@ejemplo.com");
  });

  it("defaults an unknown kind instead of rejecting the message", async () => {
    await submitFeedbackAction(idle, form({ message: "Texto válido", kind: "cualquier-cosa" }));
    expect(insert.mock.calls[0][0].kind).toBe("comment");
  });

  it("trims whitespace before deciding the message is empty", async () => {
    const result = await submitFeedbackAction(idle, form({ message: "     " }));
    expect(result.status).toBe("error");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a message that is too long, naming the limit", async () => {
    const result = await submitFeedbackAction(idle, form({ message: "a".repeat(4001) }));
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/4000/);
    expect(insert).not.toHaveBeenCalled();
  });

  it("reports a database failure instead of pretending it worked", async () => {
    // Silently swallowing this would make the person think we heard them.
    insert.mockResolvedValue({ error: { code: "23514", message: "violates check constraint" } });
    const result = await submitFeedbackAction(idle, form({ message: "Mensaje válido" }));
    expect(result.status).toBe("error");
  });

  it("does not leak database detail into the user-facing message", async () => {
    insert.mockResolvedValue({ error: { code: "42P01", message: 'relation "public.feedback" does not exist' } });
    const result = await submitFeedbackAction(idle, form({ message: "Mensaje válido" }));
    expect(result.message).not.toMatch(/relation|constraint|public\./);
  });

  it("survives the client throwing", async () => {
    insert.mockRejectedValue(new Error("network down"));
    const result = await submitFeedbackAction(idle, form({ message: "Mensaje válido" }));
    expect(result.status).toBe("error");
  });

  it("rate limits by IP for anonymous senders", async () => {
    await submitFeedbackAction(idle, form({ message: "Mensaje válido" }));
    // First entry of x-forwarded-for, not the proxy hop after it.
    expect(rpc.mock.calls[0][1].p_bucket).toBe("feedback:ip:203.0.113.7");
  });

  it("rate limits by user id once signed in", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-9" });
    await submitFeedbackAction(idle, form({ message: "Mensaje válido" }));
    expect(rpc.mock.calls[0][1].p_bucket).toBe("feedback:user:user-9");
  });

  it("turns a rate-limit hit into a retryable message, not a lost one", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const result = await submitFeedbackAction(idle, form({ message: "Mensaje válido" }));
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/int[eé]ntalo/i);
    expect(insert).not.toHaveBeenCalled();
  });
});
