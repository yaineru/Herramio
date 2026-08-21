import { describe, it, expect } from "vitest";
import { parseUrlParts, parseQueryString } from "@/lib/dev/url-parts";

describe("parseUrlParts", () => {
  it("parses protocol, host, port, path and query params", () => {
    const result = parseUrlParts("https://example.com:8080/path/to/page?a=1&b=two#section");
    expect(result).not.toBeNull();
    expect(result?.protocol).toBe("https");
    expect(result?.hostname).toBe("example.com");
    expect(result?.port).toBe("8080");
    expect(result?.pathname).toBe("/path/to/page");
    expect(result?.hash).toBe("#section");
    expect(result?.queryParams).toEqual([
      { key: "a", value: "1" },
      { key: "b", value: "two" },
    ]);
  });

  it("returns an empty port when none is specified", () => {
    const result = parseUrlParts("https://example.com/");
    expect(result?.port).toBe("");
  });

  it("returns null for an invalid URL", () => {
    expect(parseUrlParts("not a url")).toBeNull();
    expect(parseUrlParts("")).toBeNull();
  });
});

describe("parseQueryString", () => {
  it("parses a query string with a leading question mark", () => {
    expect(parseQueryString("?x=1&y=2")).toEqual([
      { key: "x", value: "1" },
      { key: "y", value: "2" },
    ]);
  });

  it("parses a query string without a leading question mark", () => {
    expect(parseQueryString("x=1&y=2")).toEqual([
      { key: "x", value: "1" },
      { key: "y", value: "2" },
    ]);
  });

  it("decodes percent-encoded values", () => {
    expect(parseQueryString("q=hola%20mundo")).toEqual([{ key: "q", value: "hola mundo" }]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseQueryString("")).toEqual([]);
    expect(parseQueryString("?")).toEqual([]);
  });
});
