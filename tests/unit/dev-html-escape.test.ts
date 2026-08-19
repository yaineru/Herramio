import { describe, it, expect } from "vitest";
import { escapeHtml, unescapeHtml } from "@/lib/dev/html-escape";

describe("escapeHtml", () => {
  it("escapes the 5 reserved HTML characters", () => {
    expect(escapeHtml(`<div class="a">'b' & c</div>`)).toBe(
      "&lt;div class=&quot;a&quot;&gt;&#39;b&#39; &amp; c&lt;/div&gt;",
    );
  });
  it("leaves plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

describe("unescapeHtml", () => {
  it("round-trips escaped HTML back to the original", () => {
    const original = `<div class="a">'b' & c</div>`;
    expect(unescapeHtml(escapeHtml(original))).toBe(original);
  });
  it("converts &nbsp; to a regular space", () => {
    expect(unescapeHtml("a&nbsp;b")).toBe("a b");
  });
});
