import { describe, it, expect } from "vitest";
import { parseUserAgent } from "@/lib/dev/user-agent";

describe("parseUserAgent", () => {
  it("detects Chrome on Windows", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const result = parseUserAgent(ua);
    expect(result.browser).toBe("Chrome");
    expect(result.browserVersion).toBe("120.0.0.0");
    expect(result.os).toBe("Windows 10/11");
  });

  it("detects Firefox on Linux", () => {
    const ua = "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0";
    const result = parseUserAgent(ua);
    expect(result.browser).toBe("Firefox");
    expect(result.os).toBe("Linux");
  });

  it("detects Safari on macOS", () => {
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
    const result = parseUserAgent(ua);
    expect(result.browser).toBe("Safari");
    expect(result.os).toBe("macOS");
  });

  it("detects Edge over the underlying Chrome engine", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    const result = parseUserAgent(ua);
    expect(result.browser).toBe("Edge");
  });

  it("detects Android and iOS", () => {
    expect(parseUserAgent("Mozilla/5.0 (Linux; Android 13)").os).toBe("Android");
    expect(parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)").os).toBe("iOS");
  });

  it("falls back to unknown for an unrecognized string", () => {
    const result = parseUserAgent("SomeUnknownAgent/1.0");
    expect(result.browser).toBe("Desconocido");
    expect(result.os).toBe("Desconocido");
  });
});
