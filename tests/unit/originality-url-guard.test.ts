import { describe, it, expect } from "vitest";
import { checkUrlSafety, assertSafeRedirect, isAllowedContentType } from "@/lib/originality/retrieval/url-guard";

describe("checkUrlSafety — SSRF protection", () => {
  it("allows ordinary public https URLs", () => {
    for (const url of ["https://example.com/paper", "http://example.org/a/b?c=1", "https://example.com:8443/x"]) {
      expect(checkUrlSafety(url).safe, url).toBe(true);
    }
  });

  it("blocks cloud metadata endpoints — the highest-value SSRF target", () => {
    // AWS/GCP/Azure all expose credentials at 169.254.169.254.
    expect(checkUrlSafety("http://169.254.169.254/latest/meta-data/").reason).toBe("private_address");
    expect(checkUrlSafety("http://metadata.google.internal/computeMetadata/v1/").reason).toBe("blocked_host");
  });

  it("blocks localhost and loopback in every spelling", () => {
    for (const url of [
      "http://localhost/",
      "http://localhost:3000/admin",
      "http://127.0.0.1/",
      "http://127.0.0.53/",
      "http://[::1]/",
      "http://anything.localhost/",
    ]) {
      expect(checkUrlSafety(url).safe, url).toBe(false);
    }
  });

  it("blocks every private IPv4 range", () => {
    for (const host of ["10.0.0.1", "172.16.5.4", "172.31.255.255", "192.168.1.1", "100.64.0.1", "0.0.0.0"]) {
      expect(checkUrlSafety(`http://${host}/`).reason, host).toBe("private_address");
    }
  });

  it("allows public IPs that merely look adjacent to private ranges", () => {
    // 172.32.x is public even though 172.16–31 is not; an over-broad rule
    // would silently block legitimate sources.
    for (const host of ["172.32.0.1", "11.0.0.1", "192.169.1.1"]) {
      expect(checkUrlSafety(`http://${host}/`).safe, host).toBe(true);
    }
  });

  it("blocks private IPv6 and IPv4-mapped IPv6 bypasses", () => {
    expect(checkUrlSafety("http://[fd00::1]/").safe).toBe(false);
    expect(checkUrlSafety("http://[fe80::1]/").safe).toBe(false);
    // ::ffff:169.254.169.254 is the metadata endpoint wearing a disguise.
    // Note the URL parser rewrites this to the hex form ::ffff:a9fe:a9fe
    // before the guard ever sees it — an earlier version of the guard only
    // matched the dotted spelling and let this straight through.
    expect(checkUrlSafety("http://[::ffff:169.254.169.254]/").safe).toBe(false);
    expect(checkUrlSafety("http://[::ffff:127.0.0.1]/").safe).toBe(false);
    // The already-normalized hex spelling must be blocked identically.
    expect(checkUrlSafety("http://[::ffff:a9fe:a9fe]/").safe).toBe(false);
    // ...while a genuinely public IPv4-mapped address still passes.
    expect(checkUrlSafety("http://[::ffff:8.8.8.8]/").safe).toBe(true);
  });

  it("blocks non-http schemes used to read local files or internal services", () => {
    for (const url of ["file:///etc/passwd", "gopher://x/", "ftp://example.com/", "data:text/html,hi"]) {
      expect(checkUrlSafety(url).safe, url).toBe(false);
    }
  });

  it("blocks internal service ports while allowing normal web ports", () => {
    expect(checkUrlSafety("http://example.com:6379/").reason).toBe("blocked_port");
    expect(checkUrlSafety("http://example.com:5432/").reason).toBe("blocked_port");
    expect(checkUrlSafety("http://example.com:2375/").reason).toBe("blocked_port");
    expect(checkUrlSafety("https://example.com:8080/").safe).toBe(true);
  });

  it("rejects malformed input instead of throwing", () => {
    expect(checkUrlSafety("not a url").reason).toBe("invalid_url");
    expect(checkUrlSafety("").reason).toBe("invalid_url");
  });
});

describe("assertSafeRedirect — every hop is re-checked", () => {
  it("blocks a public URL that redirects to the metadata endpoint", () => {
    // The classic bypass: only the first URL gets validated.
    const r = assertSafeRedirect("http://169.254.169.254/latest/meta-data/", "https://example.com/start");
    expect(r.safe).toBe(false);
    expect(r.reason).toBe("private_address");
  });

  it("resolves relative redirects against the base before judging them", () => {
    expect(assertSafeRedirect("/next-page", "https://example.com/start").safe).toBe(true);
  });

  it("blocks a redirect to a private host expressed relatively", () => {
    expect(assertSafeRedirect("//127.0.0.1/x", "https://example.com/start").safe).toBe(false);
  });
});

describe("isAllowedContentType", () => {
  it("accepts text content with charset parameters", () => {
    expect(isAllowedContentType("text/html; charset=utf-8")).toBe(true);
    expect(isAllowedContentType("text/plain")).toBe(true);
  });

  it("rejects binaries and anything unspecified", () => {
    for (const t of ["application/pdf", "image/png", "application/octet-stream", "video/mp4", null]) {
      expect(isAllowedContentType(t), String(t)).toBe(false);
    }
  });
});
