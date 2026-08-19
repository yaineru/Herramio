import { describe, it, expect } from "vitest";
import { generateUuids } from "@/lib/dev/uuid";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("generateUuids", () => {
  it("generates the requested count of valid v4 UUIDs", () => {
    const ids = generateUuids(5);
    expect(ids).toHaveLength(5);
    ids.forEach((id) => expect(id).toMatch(UUID_V4_RE));
  });

  it("generates unique values", () => {
    const ids = generateUuids(20);
    expect(new Set(ids).size).toBe(20);
  });

  it("clamps count to at least 1", () => {
    expect(generateUuids(0)).toHaveLength(1);
    expect(generateUuids(-5)).toHaveLength(1);
  });

  it("clamps count to at most 100", () => {
    expect(generateUuids(1000)).toHaveLength(100);
  });
});
