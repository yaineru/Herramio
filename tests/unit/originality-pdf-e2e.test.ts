import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { extractPdfTextServer } from "@/lib/originality/extract/pdf";
import { stripRunningHeaders } from "@/lib/originality/extract/running-headers";
import { normalizeText } from "@/lib/originality/normalize";
import { chunkText } from "@/lib/originality/chunk";
import { detectCitations, detectReferences } from "@/lib/originality/citations";
import { buildCitationGraph } from "@/lib/originality/citation-graph";
import { compareChunks } from "@/lib/originality/similarity";

/**
 * End-to-end pass over the real QA document, exercising the same code the
 * server runs: extract -> normalize -> chunk -> citations -> references ->
 * similarity.
 *
 * This exists because every other originality test feeds the engine
 * hand-written strings. A real PDF is the only thing that catches
 * extraction-shaped bugs: ligatures, headers repeating on every page,
 * hyphenation, reference lines wrapped mid-entry. The fixture is a
 * purpose-built document containing original prose, one attributed
 * citation, three references, and two deliberately-similar passages.
 */

const FIXTURE = join(process.cwd(), "tests/fixtures/herramio_originalidad_prueba.pdf");

let pages: string[];
let fullText: string;

beforeAll(async () => {
  const bytes = new Uint8Array(readFileSync(FIXTURE));
  const result = await extractPdfTextServer(bytes);
  pages = result.pages;
  // Same order the extraction layer applies it in: strip boilerplate, then join.
  fullText = stripRunningHeaders(pages).join("\n\n");
}, 60_000);

describe("PDF extraction on the real QA document", () => {
  it("extracts both pages with substantive text", () => {
    expect(pages).toHaveLength(2);
    expect(pages[0].length).toBeGreaterThan(2000);
    expect(pages[1].length).toBeGreaterThan(1000);
  });

  it("preserves accented Spanish characters rather than mangling them", () => {
    // A broken encoding path turns these into "informaci�n" or drops them.
    expect(fullText).toContain("información");
    expect(fullText).toContain("evaluación");
    expect(fullText).toContain("académica");
  });

  it("keeps section headings intact across the page break", () => {
    for (const heading of ["Resumen", "1. Introducción", "5. Conclusión", "8. Referencias"]) {
      expect(fullText, heading).toContain(heading);
    }
  });
});

describe("chunking the real document", () => {
  it("produces multiple chunks that together retain the document's substance", () => {
    const chunks = chunkText(fullText);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    for (const chunk of chunks) {
      expect(chunk.text.trim().length).toBeGreaterThan(0);
      expect(chunk.normalizedText.length).toBeGreaterThan(0);
    }
  });

  it("emits chunks in strict document order", () => {
    const chunks = chunkText(fullText);
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].sequence).toBe(chunks[i - 1].sequence + 1);
      expect(chunks[i].wordCount).toBeGreaterThan(0);
    }
  });
});

describe("citation and reference detection on real content", () => {
  it("finds the attributed UNESCO (2023) citation", () => {
    const citations = detectCitations(fullText);
    expect(citations.length).toBeGreaterThan(0);
    expect(citations.some((c) => /UNESCO/i.test(c.rawText))).toBe(true);
  });

  it("finds all three bibliography entries", () => {
    const refs = detectReferences(fullText);
    expect(refs.length).toBeGreaterThanOrEqual(3);
    const joined = refs.map((r) => r.rawText).join(" | ");
    expect(joined).toMatch(/UNESCO/i);
    expect(joined).toMatch(/Luckin/i);
    expect(joined).toMatch(/Russell/i);
  });

  it("builds a citation graph without crashing on real, messy input", () => {
    const citations = detectCitations(fullText).map((c, i) => ({
      id: i + 1,
      documentId: "qa",
      chunkId: null,
      rawText: c.rawText,
      styleGuess: c.styleGuess,
      createdAt: new Date().toISOString(),
    }));
    const references = detectReferences(fullText).map((r, i) => ({
      id: i + 1,
      documentId: "qa",
      rawText: r.rawText,
      verificationStatus: "unverified" as const,
      matchedUrl: null,
      matchedDoi: null,
      matchedTitle: null,
      parsedAuthor: r.parsedAuthor,
      parsedYear: r.parsedYear,
      parsedTitle: r.parsedTitle,
      createdAt: new Date().toISOString(),
    }));

    const graph = buildCitationGraph(citations, references);
    // Every citation is accounted for as either resolved or orphan —
    // nothing may silently vanish from the graph.
    expect(graph.entries.length + graph.orphanCitations.length).toBeGreaterThanOrEqual(citations.length);
  });
});

describe("similarity on the document's own planted passages", () => {
  it("scores the deliberately-similar passage above the unrelated one", () => {
    // Section 7 was written to echo the Resumen. The bibliography was not.
    const resumen = extractSection(fullText, "Resumen", "1. Introducción");
    const similar = extractSection(fullText, "7. Fragmento deliberadamente similar", "8. Referencias");
    const unrelated = extractSection(fullText, "8. Referencias", "Nota de prueba");

    const plantedScore = compareChunks(normalizeText(resumen), normalizeText(similar)).score;
    const unrelatedScore = compareChunks(normalizeText(resumen), normalizeText(unrelated)).score;

    expect(plantedScore).toBeGreaterThan(unrelatedScore);
    // The bibliography shares essentially no phrasing with the abstract.
    expect(unrelatedScore).toBeLessThan(0.05);
  });

  it("scores a passage against itself as a full match", () => {
    const section = extractSection(fullText, "3. Riesgos y desafíos", "4. Cita y atribución");
    const normalized = normalizeText(section);
    expect(compareChunks(normalized, normalized).score).toBeGreaterThan(0.99);
  });
});

function extractSection(text: string, from: string, to: string): string {
  const start = text.indexOf(from);
  const end = text.indexOf(to, start + from.length);
  if (start === -1 || end === -1) throw new Error(`Section not found in fixture: ${from} .. ${to}`);
  return text.slice(start + from.length, end).trim();
}

describe("running header removal on the real document", () => {
  it("strips the repeated page header from the analysed text", () => {
    // The raw extraction carries "Herramio - documento de prueba ... Página N"
    // at the top of both pages. Template boilerplate like this must not
    // reach the chunks, or two documents sharing a template would appear
    // similar to each other on the strength of the header alone.
    const raw = pages.join("\n\n");
    expect(raw).toMatch(/Página 1/);
    expect(fullText).not.toMatch(/documento de prueba para análisis de originalidad Página/);
  });

  it("keeps the document's real content after stripping", () => {
    expect(fullText).toContain("Análisis de la inteligencia artificial");
    expect(fullText).toContain("8. Referencias");
    // Losing more than a few percent would mean the stripper ate real text.
    expect(fullText.length).toBeGreaterThan(pages.join("\n\n").length * 0.9);
  });
});
