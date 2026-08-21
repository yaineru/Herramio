import { describe, it, expect } from "vitest";
import { markdownToHtml } from "@/lib/text/markdown";

describe("markdownToHtml", () => {
  it("converts headers", () => {
    expect(markdownToHtml("# Título\n## Subtítulo")).toBe("<h1>Título</h1>\n<h2>Subtítulo</h2>");
  });

  it("converts bold and italic", () => {
    expect(markdownToHtml("Esto es **negrita** y esto *cursiva*.")).toBe(
      "<p>Esto es <strong>negrita</strong> y esto <em>cursiva</em>.</p>",
    );
  });

  it("converts inline code and links", () => {
    expect(markdownToHtml("Usa `npm install` o visita [Herramio](https://herramio.com).")).toBe(
      '<p>Usa <code>npm install</code> o visita <a href="https://herramio.com">Herramio</a>.</p>',
    );
  });

  it("converts an unordered list", () => {
    expect(markdownToHtml("- uno\n- dos\n- tres")).toBe("<ul>\n<li>uno</li>\n<li>dos</li>\n<li>tres</li>\n</ul>");
  });

  it("converts an ordered list", () => {
    expect(markdownToHtml("1. primero\n2. segundo")).toBe("<ol>\n<li>primero</li>\n<li>segundo</li>\n</ol>");
  });

  it("converts a blockquote and a horizontal rule", () => {
    expect(markdownToHtml("> una cita\n\n---")).toBe("<blockquote>una cita</blockquote>\n<hr />");
  });

  it("escapes raw HTML in the input instead of executing it", () => {
    expect(markdownToHtml("<script>alert(1)</script>")).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  });

  it("joins consecutive plain lines into one paragraph", () => {
    expect(markdownToHtml("línea uno\nlínea dos")).toBe("<p>línea uno línea dos</p>");
  });

  it("separates paragraphs on a blank line", () => {
    expect(markdownToHtml("primero\n\nsegundo")).toBe("<p>primero</p>\n<p>segundo</p>");
  });
});
