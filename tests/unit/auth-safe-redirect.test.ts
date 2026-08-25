import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("safeRedirectPath", () => {
  it("allows a same-site relative path", () => {
    expect(safeRedirectPath("/cuenta", "/fallback")).toBe("/cuenta");
    expect(safeRedirectPath("/precios?checkout=exito", "/fallback")).toBe("/precios?checkout=exito");
  });

  it("rejects a protocol-relative URL (open-redirect attempt)", () => {
    expect(safeRedirectPath("//evil.com/phish", "/fallback")).toBe("/fallback");
  });

  it("rejects an absolute URL to another origin", () => {
    expect(safeRedirectPath("https://evil.com", "/fallback")).toBe("/fallback");
    expect(safeRedirectPath("http://evil.com", "/fallback")).toBe("/fallback");
  });

  it("rejects a path with no leading slash", () => {
    expect(safeRedirectPath("cuenta", "/fallback")).toBe("/fallback");
  });

  it("falls back for non-string input", () => {
    expect(safeRedirectPath(null, "/fallback")).toBe("/fallback");
    expect(safeRedirectPath(undefined, "/fallback")).toBe("/fallback");
    expect(safeRedirectPath(["/cuenta"], "/fallback")).toBe("/fallback");
  });
});
