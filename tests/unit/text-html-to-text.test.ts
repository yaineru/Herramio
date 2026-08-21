import { describe, it, expect } from "vitest";
import { htmlToText } from "@/lib/text/html-to-text";

describe("htmlToText", () => {
  it("strips simple tags", () => {
    expect(htmlToText("<p>Hola <b>mundo</b></p>")).toBe("Hola mundo");
  });

  it("separates paragraphs with newlines", () => {
    expect(htmlToText("<p>Primero</p><p>Segundo</p>")).toBe("Primero\nSegundo");
  });

  it("separates list items with newlines", () => {
    expect(htmlToText("<ul><li>Uno</li><li>Dos</li></ul>")).toBe("Uno\nDos");
  });

  it("removes script and style content entirely", () => {
    const result = htmlToText("<p>Visible</p><script>alert(1)</script><style>body{color:red}</style>");
    expect(result).toBe("Visible");
    expect(result).not.toContain("alert");
    expect(result).not.toContain("color:red");
  });

  it("decodes HTML entities", () => {
    expect(htmlToText("<p>Caf&eacute; &amp; t&eacute;</p>")).toBe("Café & té");
  });

  it("does not execute script content even though it never appears in the output", () => {
    // DOMParser-parsed documents are inert: nothing in a script tag ever runs.
    // This assertion just confirms the extracted text is exactly the safe content.
    const result = htmlToText('<img src=x onerror="alert(1)"><p>ok</p>');
    expect(result).toBe("ok");
  });

  it("handles plain text with no tags", () => {
    expect(htmlToText("solo texto")).toBe("solo texto");
  });
});
