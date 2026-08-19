import { describe, it, expect } from "vitest";
import { computeHash, HASH_ALGORITHMS } from "@/lib/dev/hash";

describe("computeHash", () => {
  it("computes a known SHA-256 digest", async () => {
    const result = await computeHash("hello", "SHA-256");
    expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("computes a known SHA-1 digest", async () => {
    const result = await computeHash("hello", "SHA-1");
    expect(result).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  it("produces a hex string of the correct length for each algorithm", async () => {
    const lengths: Record<string, number> = { "SHA-1": 40, "SHA-256": 64, "SHA-384": 96, "SHA-512": 128 };
    for (const algo of HASH_ALGORITHMS) {
      const result = await computeHash("test", algo);
      expect(result).toHaveLength(lengths[algo]);
      expect(result).toMatch(/^[0-9a-f]+$/);
    }
  });

  it("does not offer MD5", () => {
    expect(HASH_ALGORITHMS).not.toContain("MD5");
  });
});
