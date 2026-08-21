import { describe, it, expect } from "vitest";
import { HTTP_STATUS_CODES, searchHttpStatusCodes, getHttpStatusByCode } from "@/lib/dev/http-status";

describe("HTTP_STATUS_CODES", () => {
  it("has unique codes", () => {
    const codes = HTTP_STATUS_CODES.map((e) => e.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("has at least one entry per category", () => {
    const categories = new Set(HTTP_STATUS_CODES.map((e) => e.category));
    expect(categories).toEqual(new Set(["1xx", "2xx", "3xx", "4xx", "5xx"]));
  });
});

describe("searchHttpStatusCodes", () => {
  it("returns all codes for an empty query", () => {
    expect(searchHttpStatusCodes("")).toEqual(HTTP_STATUS_CODES);
  });

  it("finds a code by its number", () => {
    const result = searchHttpStatusCodes("404");
    expect(result.some((e) => e.code === 404)).toBe(true);
  });

  it("finds a code by name, case-insensitively", () => {
    const result = searchHttpStatusCodes("not found");
    expect(result.some((e) => e.code === 404)).toBe(true);
  });

  it("finds codes by a word in the description", () => {
    const result = searchHttpStatusCodes("autenticación");
    expect(result.some((e) => e.code === 401)).toBe(true);
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchHttpStatusCodes("xyzxyzxyz")).toEqual([]);
  });
});

describe("getHttpStatusByCode", () => {
  it("returns the matching entry", () => {
    expect(getHttpStatusByCode(200)?.name).toBe("OK");
  });

  it("returns undefined for an unknown code", () => {
    expect(getHttpStatusByCode(999)).toBeUndefined();
  });
});
