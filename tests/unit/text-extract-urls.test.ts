import { describe, it, expect } from "vitest";
import { extractUrls } from "@/lib/text/extract-urls";

describe("extractUrls", () => {
  it("finds URLs scattered across free text", () => {
    const text = "Visita https://herramio.com o http://ejemplo.org/pagina para más info.";
    expect(extractUrls(text)).toEqual(["http://ejemplo.org/pagina", "https://herramio.com"]);
  });

  it("deduplicates repeated URLs", () => {
    const text = "https://a.com y https://a.com de nuevo";
    expect(extractUrls(text)).toEqual(["https://a.com"]);
  });

  it("trims trailing punctuation from a URL at the end of a sentence", () => {
    expect(extractUrls("Mira esto: https://ejemplo.com.")).toEqual(["https://ejemplo.com"]);
  });

  it("sorts results alphabetically", () => {
    expect(extractUrls("https://z.com https://a.com")).toEqual(["https://a.com", "https://z.com"]);
  });

  it("returns an empty array when there are no URLs", () => {
    expect(extractUrls("No hay enlaces aquí.")).toEqual([]);
  });

  it("ignores URLs without an http(s) scheme", () => {
    expect(extractUrls("visita www.ejemplo.com o ejemplo.com")).toEqual([]);
  });
});
