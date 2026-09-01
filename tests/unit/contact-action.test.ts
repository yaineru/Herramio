import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The contact form's server-side contract.
 *
 * This replaced a `mailto:` link to a mailbox that did not exist: every
 * message was lost, and the sender was shown their mail client opening as
 * if it had worked. Two failures — a dead address, and a UI reporting a
 * success it could not know about.
 *
 * So the property that matters most here is not validation. It is that
 * "sent" is returned ONLY when a row was confirmed written, and never on
 * the strength of a status code.
 */

const { insert, select, single, from, createAdminClient, getCurrentUser, checkRateLimit, headers } = vi.hoisted(() => {
  const single = vi.fn();
  const select = vi.fn(() => ({ single }));
  // Typed with its parameter so `insert.mock.calls[0][0]` is the row, not
  // an empty tuple — the assertions below inspect exactly what gets stored.
  const insert = vi.fn((row: Record<string, unknown>) => ({ select, row }));
  const from = vi.fn(() => ({ insert }));
  return {
    single,
    select,
    insert,
    from,
    createAdminClient: vi.fn(() => ({ from })),
    getCurrentUser: vi.fn(),
    checkRateLimit: vi.fn(),
    headers: vi.fn(),
  };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/rate-limit/check", () => ({ checkRateLimit }));
vi.mock("next/headers", () => ({ headers }));

const { submitContactAction } = await import("@/lib/contact/actions");

const idle = { status: "idle" as const, message: null };

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = {
  email: "alguien@example.com",
  message: "Hola, el conversor de PDF me da un error al subir un archivo grande.",
  topic: "problema",
};

beforeEach(() => {
  getCurrentUser.mockReset().mockResolvedValue(null);
  checkRateLimit.mockReset().mockResolvedValue(true);
  headers.mockReset().mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.9" }));
  single.mockReset().mockResolvedValue({ data: { id: "row-1" }, error: null });
  insert.mockClear();
  from.mockClear();
  // mockReset, not mockClear: one test replaces the implementation with a
  // throw, and mockClear only wipes the call history — leaving that throw
  // in place for every test after it.
  createAdminClient.mockReset().mockImplementation(() => ({ from }));
});

describe('"enviado" is only ever said about a row that exists', () => {
  it("confirms only after reading the inserted row back", async () => {
    const result = await submitContactAction(idle, form(valid));
    expect(result.status).toBe("sent");
    // The success path reads the id back rather than trusting the absence
    // of an error — the exact mistake the mailto version made.
    expect(select).toHaveBeenCalled();
  });

  it("reports failure when the insert errors", async () => {
    single.mockResolvedValue({ data: null, error: { code: "23514", message: "check violation" } });
    const result = await submitContactAction(idle, form(valid));
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/problema al enviar/i);
  });

  it("reports failure when the insert succeeds but returns no row", async () => {
    // PostgREST can answer a write it did not perform with a success
    // status. No id means nothing was stored, whatever the status said.
    single.mockResolvedValue({ data: null, error: null });
    expect((await submitContactAction(idle, form(valid))).status).toBe("error");
  });

  it("reports failure rather than throwing when the client blows up", async () => {
    createAdminClient.mockImplementation(() => {
      throw new Error("connection refused");
    });
    const result = await submitContactAction(idle, form(valid));
    expect(result.status).toBe("error");
  });

  it("never claims an email was sent, because none is", async () => {
    const result = await submitContactAction(idle, form(valid));
    expect(result.message).not.toMatch(/correo enviado|te enviamos|email enviado/i);
    expect(result.message).toMatch(/enviado/i);
  });
});

describe("validation happens on the server, not in the browser", () => {
  it("rejects a missing email and points at the field", async () => {
    const result = await submitContactAction(idle, form({ ...valid, email: "" }));
    expect(result.status).toBe("error");
    expect(result.field).toBe("email");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects an address with no domain", async () => {
    expect((await submitContactAction(idle, form({ ...valid, email: "alguien@localhost" }))).field).toBe("email");
  });

  it("rejects an address with no @", async () => {
    expect((await submitContactAction(idle, form({ ...valid, email: "alguien.example.com" }))).field).toBe("email");
  });

  it("rejects a message too short to act on", async () => {
    const result = await submitContactAction(idle, form({ ...valid, message: "hola" }));
    expect(result.field).toBe("message");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects a message over the column limit instead of letting Postgres do it", async () => {
    const result = await submitContactAction(idle, form({ ...valid, message: "x".repeat(4001) }));
    expect(result.field).toBe("message");
    expect(insert).not.toHaveBeenCalled();
  });

  it("falls back to 'otro' for a topic outside the CHECK constraint", async () => {
    // A forged topic must not reach the database and fail there — the
    // constraint is the backstop, not the validation.
    await submitContactAction(idle, form({ ...valid, topic: "'; drop table --" }));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ topic: "otro" }));
  });
});

describe("what gets stored, and what does not", () => {
  it("stores the message as text, never interpreted", async () => {
    const hostile = '<img src=x onerror="alert(1)"> ¿me ayudas con esto?';
    await submitContactAction(idle, form({ ...valid, message: hostile }));
    // Stored verbatim. Safety comes from React escaping it on render, not
    // from mangling what the person actually wrote.
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ message: hostile }));
  });

  it("attributes to the signed-in user when there is one", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-42", email: "yo@example.com" });
    await submitContactAction(idle, form(valid));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "user-42" }));
  });

  it("sends user_id explicitly as null when anonymous", async () => {
    // Omitting the column makes the insert policy reject the row; sending
    // null passes. Verified against the live table.
    await submitContactAction(idle, form(valid));
    const payload = insert.mock.calls[0][0];
    expect("user_id" in payload).toBe(true);
    expect(payload.user_id).toBeNull();
  });

  it("never lets the submitter choose the status", async () => {
    await submitContactAction(idle, form({ ...valid, status: "resolved" }));
    expect(insert).toHaveBeenCalledWith(expect.not.objectContaining({ status: expect.anything() }));
  });

  it("stores nothing beyond what was asked for", async () => {
    await submitContactAction(idle, form({ ...valid, name: "Ana" }));
    const payload = insert.mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual(["email", "message", "name", "page_path", "topic", "user_id"]);
  });
});

describe("spam protection", () => {
  it("refuses once the hourly limit is reached", async () => {
    checkRateLimit.mockResolvedValue(false);
    const result = await submitContactAction(idle, form(valid));
    expect(result.status).toBe("error");
    expect(insert).not.toHaveBeenCalled();
  });

  it("buckets anonymous senders by IP", async () => {
    await submitContactAction(idle, form(valid));
    expect(checkRateLimit).toHaveBeenCalledWith("contact:ip:203.0.113.9", 6, 3600);
  });

  it("buckets signed-in senders by user id, not IP", async () => {
    // Otherwise a shared network address throttles everyone behind it.
    getCurrentUser.mockResolvedValue({ id: "user-42", email: "yo@example.com" });
    await submitContactAction(idle, form(valid));
    expect(checkRateLimit).toHaveBeenCalledWith("contact:user:user-42", 6, 3600);
  });
});
