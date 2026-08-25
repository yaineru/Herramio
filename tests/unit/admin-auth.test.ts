import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));

async function importIsCurrentUserAdmin() {
  const mod = await import("@/lib/admin/auth");
  return mod.isCurrentUserAdmin;
}

describe("isCurrentUserAdmin", () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.resetModules();
    getCurrentUser.mockReset();
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  });

  it("denies an anonymous visitor (no user)", async () => {
    process.env.ADMIN_EMAILS = "owner@herramio.com";
    getCurrentUser.mockResolvedValue(null);
    const isCurrentUserAdmin = await importIsCurrentUserAdmin();
    expect(await isCurrentUserAdmin()).toBe(false);
  });

  it("denies a logged-in user whose email is not on the allowlist — no amount of being 'a real user' grants admin", async () => {
    process.env.ADMIN_EMAILS = "owner@herramio.com";
    getCurrentUser.mockResolvedValue({ email: "attacker@evil.com" });
    const isCurrentUserAdmin = await importIsCurrentUserAdmin();
    expect(await isCurrentUserAdmin()).toBe(false);
  });

  it("allows a user whose email is on the allowlist", async () => {
    process.env.ADMIN_EMAILS = "owner@herramio.com, second@herramio.com";
    getCurrentUser.mockResolvedValue({ email: "second@herramio.com" });
    const isCurrentUserAdmin = await importIsCurrentUserAdmin();
    expect(await isCurrentUserAdmin()).toBe(true);
  });

  it("matches case-insensitively", async () => {
    process.env.ADMIN_EMAILS = "owner@herramio.com";
    getCurrentUser.mockResolvedValue({ email: "OWNER@herramio.com" });
    const isCurrentUserAdmin = await importIsCurrentUserAdmin();
    expect(await isCurrentUserAdmin()).toBe(true);
  });

  it("denies everyone when ADMIN_EMAILS is unset — never an implicit admin", async () => {
    delete process.env.ADMIN_EMAILS;
    getCurrentUser.mockResolvedValue({ email: "anyone@herramio.com" });
    const isCurrentUserAdmin = await importIsCurrentUserAdmin();
    expect(await isCurrentUserAdmin()).toBe(false);
  });
});
