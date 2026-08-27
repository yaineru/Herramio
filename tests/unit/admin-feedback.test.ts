import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Admin-side feedback access.
 *
 * The security property under test: the admin client bypasses RLS by
 * design, so the `isCurrentUserAdmin()` check IS the boundary. If any of
 * these functions could run for a non-admin, every user's feedback would
 * be readable and writable by anyone who found the endpoint. A Server
 * Action is a public HTTP endpoint, so "the button is only rendered for
 * admins" protects nothing.
 */

const isCurrentUserAdmin = vi.fn();
const select = vi.fn();
const update = vi.fn();

vi.mock("@/lib/admin/auth", () => ({ isCurrentUserAdmin }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ select, update }) }),
}));

const { listFeedback, getFeedbackCounts, setFeedbackStatus, NotAuthorisedError, STATUS_ORDER } = await import(
  "@/lib/admin/feedback"
);

/** Mirrors the PostgREST builder chain the queries actually use. */
function selectChain(rows: unknown[] | null, error: unknown = null) {
  const chain = {
    order: () => chain,
    limit: () => chain,
    eq: () => chain,
    then: (resolve: (v: unknown) => unknown) => resolve({ data: rows, error }),
  };
  return chain;
}

beforeEach(() => {
  isCurrentUserAdmin.mockReset().mockResolvedValue(true);
  select.mockReset().mockReturnValue(selectChain([]));
  update.mockReset();
});

describe("authorisation is checked in every function, not just the page", () => {
  it("listFeedback refuses a non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(listFeedback()).rejects.toThrow(NotAuthorisedError);
    expect(select).not.toHaveBeenCalled();
  });

  it("getFeedbackCounts refuses a non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(getFeedbackCounts()).rejects.toThrow(NotAuthorisedError);
    expect(select).not.toHaveBeenCalled();
  });

  it("setFeedbackStatus refuses a non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(setFeedbackStatus("some-id", "reviewed")).rejects.toThrow(NotAuthorisedError);
    expect(update).not.toHaveBeenCalled();
  });

  it("refuses an anonymous visitor exactly as it refuses a signed-in non-admin", async () => {
    // isCurrentUserAdmin returns false for both; there is no third path
    // where "no user" is treated more leniently than "wrong user".
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(listFeedback()).rejects.toThrow(NotAuthorisedError);
    await expect(setFeedbackStatus("id", "resolved")).rejects.toThrow(NotAuthorisedError);
  });

  it("checks authorisation BEFORE touching the database", async () => {
    // Ordering matters: a check after the query would still have read the
    // data, and a leak that is discarded is still a leak.
    isCurrentUserAdmin.mockResolvedValue(false);
    await listFeedback().catch(() => {});
    expect(select).not.toHaveBeenCalled();
  });
});

describe("listFeedback", () => {
  it("returns rows for an admin", async () => {
    const rows = [{ id: "1", status: "new", kind: "problem", message: "hola" }];
    select.mockReturnValue(selectChain(rows));
    expect(await listFeedback()).toEqual(rows);
  });

  it("returns an empty list rather than throwing when the query fails", async () => {
    // The admin panel showing an empty inbox is better than a 500 that
    // takes the whole page down with it.
    select.mockReturnValue(selectChain(null, { code: "PGRST" }));
    expect(await listFeedback()).toEqual([]);
  });
});

describe("getFeedbackCounts", () => {
  it("counts each status separately", async () => {
    select.mockReturnValue(
      selectChain([{ status: "new" }, { status: "new" }, { status: "reviewed" }, { status: "resolved" }]),
    );
    expect(await getFeedbackCounts()).toEqual({ total: 4, new: 2, reviewed: 1, resolved: 1 });
  });

  it("returns zeroes when the query fails", async () => {
    select.mockReturnValue(selectChain(null, { code: "PGRST" }));
    expect(await getFeedbackCounts()).toEqual({ total: 0, new: 0, reviewed: 0, resolved: 0 });
  });
});

describe("setFeedbackStatus", () => {
  function updateChain(row: unknown, error: unknown = null) {
    const chain = {
      eq: () => chain,
      select: () => chain,
      maybeSingle: async () => ({ data: row, error }),
    };
    return chain;
  }

  it("accepts only the statuses the schema allows", async () => {
    // The CHECK constraint would reject anything else anyway, but failing
    // here keeps the error legible instead of surfacing as a 400 from
    // PostgREST.
    for (const status of STATUS_ORDER) {
      update.mockReturnValue(updateChain({ id: "1", status }));
      await expect(setFeedbackStatus("1", status)).resolves.toMatchObject({ status });
    }
  });

  it("rejects a status the schema does not define", async () => {
    // @ts-expect-error deliberately invalid, mirroring a forged form post
    await expect(setFeedbackStatus("1", "archived")).rejects.toThrow(/no válido/i);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns null when the id matched nothing", async () => {
    // PostgREST answers an update that matched no rows with success and
    // an empty body, so "no error" is not evidence anything changed.
    update.mockReturnValue(updateChain(null));
    expect(await setFeedbackStatus("no-existe", "reviewed")).toBeNull();
  });

  it("returns null rather than throwing on a database error", async () => {
    update.mockReturnValue(updateChain(null, { code: "23514" }));
    expect(await setFeedbackStatus("1", "reviewed")).toBeNull();
  });
});
