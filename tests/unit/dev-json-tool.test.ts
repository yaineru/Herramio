import { describe, it, expect } from "vitest";
import { formatJson, minifyJson } from "@/lib/dev/json-tool";

describe("formatJson", () => {
  it("pretty-prints valid JSON with the given indent", () => {
    const result = formatJson('{"a":1,"b":[1,2]}', 2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });
  it("returns an error for invalid JSON", () => {
    const result = formatJson("{invalid");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });
});

describe("minifyJson", () => {
  it("removes whitespace from valid JSON", () => {
    const result = minifyJson('{\n  "a": 1\n}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe('{"a":1}');
  });
  it("returns an error for invalid JSON", () => {
    const result = minifyJson("not json");
    expect(result.ok).toBe(false);
  });
});
