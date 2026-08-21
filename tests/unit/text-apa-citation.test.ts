import { describe, it, expect } from "vitest";
import { buildApaCitation } from "@/lib/text/apa-citation";

describe("buildApaCitation", () => {
  it("builds a book citation", () => {
    const result = buildApaCitation({
      type: "book",
      authors: "García, M.",
      year: "2020",
      title: "El aprendizaje digital",
      publisher: "Editorial Norte",
    });
    expect(result).toEqual({ ok: true, value: "García, M. (2020). El aprendizaje digital. Editorial Norte." });
  });

  it("builds a website citation", () => {
    const result = buildApaCitation({
      type: "website",
      authors: "Pérez, J.",
      year: "2023",
      title: "Cómo aprender a programar",
      siteName: "CodeBlog",
      url: "https://codeblog.example.com/aprender",
    });
    expect(result).toEqual({
      ok: true,
      value: "Pérez, J. (2023). Cómo aprender a programar. CodeBlog. https://codeblog.example.com/aprender",
    });
  });

  it("builds a journal article citation with volume, issue and pages", () => {
    const result = buildApaCitation({
      type: "journal",
      authors: "López, A., & Ruiz, B.",
      year: "2019",
      title: "Efectos del sueño en el aprendizaje",
      journalName: "Revista de Psicología",
      volume: "12",
      issue: "3",
      pages: "45-60",
    });
    expect(result).toEqual({
      ok: true,
      value: "López, A., & Ruiz, B. (2019). Efectos del sueño en el aprendizaje. Revista de Psicología, 12(3), 45-60.",
    });
  });

  it("rejects a book missing the publisher", () => {
    const result = buildApaCitation({ type: "book", authors: "A.", year: "2020", title: "T" });
    expect(result.ok).toBe(false);
  });

  it("rejects a website missing the URL", () => {
    const result = buildApaCitation({ type: "website", authors: "A.", year: "2020", title: "T" });
    expect(result.ok).toBe(false);
  });

  it("rejects missing required base fields", () => {
    expect(buildApaCitation({ type: "book", authors: "", year: "2020", title: "T", publisher: "P" }).ok).toBe(false);
    expect(buildApaCitation({ type: "book", authors: "A.", year: "", title: "T", publisher: "P" }).ok).toBe(false);
  });
});
