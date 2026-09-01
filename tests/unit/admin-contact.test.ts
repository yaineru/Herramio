import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Admin-side access to contact messages.
 *
 * `contact_messages` has NO row-level read policy at all — not even "read
 * your own" — so the service-role client used here is the only way those
 * rows can be reached, and `isCurrentUserAdmin()` IS the security
 * boundary. It carries more weight than the equivalent check on feedback,
 * because these rows contain email addresses.
 *
 * A Server Action is a public HTTP endpoint, so "the button only renders
 * for admins" protects nothing.
 */

const isCurrentUserAdmin = vi.fn();
const select = vi.fn();
const update = vi.fn();

vi.mock("@/lib/admin/auth", () => ({ isCurrentUserAdmin }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ select, update }) }),
}));

const { listContactMessages, getContactCounts, setContactStatus, NotAuthorisedError, CONTACT_STATUS_ORDER } =
  await import("@/lib/admin/contact");

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

function updateChain(row: unknown, error: unknown = null) {
  const chain = {
    eq: () => chain,
    select: () => chain,
    maybeSingle: async () => ({ data: row, error }),
  };
  return chain;
}

beforeEach(() => {
  isCurrentUserAdmin.mockReset().mockResolvedValue(true);
  select.mockReset().mockReturnValue(selectChain([]));
  update.mockReset();
});

describe("every function checks authorisation itself", () => {
  it("listContactMessages refuses a non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(listContactMessages()).rejects.toThrow(NotAuthorisedError);
    expect(select).not.toHaveBeenCalled();
  });

  it("getContactCounts refuses a non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(getContactCounts()).rejects.toThrow(NotAuthorisedError);
    expect(select).not.toHaveBeenCalled();
  });

  it("setContactStatus refuses a non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(setContactStatus("id", "reviewed")).rejects.toThrow(NotAuthorisedError);
    expect(update).not.toHaveBeenCalled();
  });

  it("refuses an anonymous visitor exactly as it refuses a signed-in non-admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    await expect(listContactMessages()).rejects.toThrow(NotAuthorisedError);
    await expect(setContactStatus("id", "resolved")).rejects.toThrow(NotAuthorisedError);
  });

  it("checks authorisation BEFORE reading any email address", async () => {
    // Ordering matters more here than anywhere else in the codebase: a
    // check after the query would already have pulled every contact's
    // address out of the database, and a leak that is discarded is still
    // a leak.
    isCurrentUserAdmin.mockResolvedValue(false);
    await listContactMessages().catch(() => {});
    expect(select).not.toHaveBeenCalled();
  });
});

describe("listContactMessages", () => {
  it("returns rows for an admin", async () => {
    const rows = [{ id: "1", status: "new", topic: "problema", email: "a@b.co", message: "hola" }];
    select.mockReturnValue(selectChain(rows));
    expect(await listContactMessages()).toEqual(rows);
  });

  it("returns an empty list rather than throwing when the query fails", async () => {
    // An admin panel showing an empty inbox beats a 500 that takes the
    // whole page down.
    select.mockReturnValue(selectChain(null, { code: "PGRST" }));
    expect(await listContactMessages()).toEqual([]);
  });
});

describe("getContactCounts", () => {
  it("counts each status separately, including archived", async () => {
    select.mockReturnValue(
      selectChain([
        { status: "new" },
        { status: "new" },
        { status: "reviewed" },
        { status: "resolved" },
        { status: "archived" },
      ]),
    );
    expect(await getContactCounts()).toEqual({ total: 5, new: 2, reviewed: 1, resolved: 1, archived: 1 });
  });

  it("returns zeroes when the query fails", async () => {
    select.mockReturnValue(selectChain(null, { code: "PGRST" }));
    expect(await getContactCounts()).toEqual({ total: 0, new: 0, reviewed: 0, resolved: 0, archived: 0 });
  });
});

describe("setContactStatus", () => {
  it("accepts every status the schema allows", async () => {
    for (const status of CONTACT_STATUS_ORDER) {
      update.mockReturnValue(updateChain({ id: "1", status }));
      await expect(setContactStatus("1", status)).resolves.toMatchObject({ status });
    }
  });

  it("rejects a status the schema does not define", async () => {
    // @ts-expect-error deliberately invalid, mirroring a forged form post
    await expect(setContactStatus("1", "borrado")).rejects.toThrow(/no válido/i);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns null when the id matched nothing", async () => {
    // PostgREST answers an update that matched no rows with success and an
    // empty body, so "no error" is not evidence anything changed.
    update.mockReturnValue(updateChain(null));
    expect(await setContactStatus("no-existe", "reviewed")).toBeNull();
  });

  it("returns null rather than throwing on a database error", async () => {
    update.mockReturnValue(updateChain(null, { code: "23514" }));
    expect(await setContactStatus("1", "reviewed")).toBeNull();
  });
});
