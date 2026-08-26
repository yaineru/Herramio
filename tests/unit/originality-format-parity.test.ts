import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { extractPdfTextServer } from "@/lib/originality/extract/pdf";
import { extractDocxTextServer } from "@/lib/originality/extract/docx";
import { stripRunningHeaders } from "@/lib/originality/extract/running-headers";
import { normalizeText } from "@/lib/originality/normalize";
import { chunkText } from "@/lib/originality/chunk";
import { detectInTextCitations, detectReferences } from "@/lib/originality/citations";
import { compareChunks } from "@/lib/originality/similarity";

/**
 * The same document in all three supported formats.
 *
 * Written after the production QA run, where the three uploads were done
 * by hand. The interesting property is not that each extractor returns
 * *something* — it is that all three return the SAME document, because a
 * user who uploads their thesis as .docx and later as .pdf must not get
 * two different verdicts. A format-specific extraction bug shows up here
 * as a similarity well below 1 between the two extractions.
 */

const DIR = join(process.cwd(), "tests/fixtures");
const NAME = "herramio_originalidad_prueba";

let pdfText: string;
let docxText: string;
let txtText: string;

beforeAll(async () => {
  const pdf = await extractPdfTextServer(new Uint8Array(readFileSync(join(DIR, `${NAME}.pdf`))));
  pdfText = stripRunningHeaders(pdf.pages).join("\n\n");
  const docx = await extractDocxTextServer(new Uint8Array(readFileSync(join(DIR, `${NAME}.docx`))));
  docxText = docx.text;
  txtText = readFileSync(join(DIR, `${NAME}.txt`), "utf8");
}, 60_000);

describe("extraction across PDF, DOCX and TXT", () => {
  it("extracts substantive text from every format", () => {
    for (const [label, text] of [["pdf", pdfText], ["docx", docxText], ["txt", txtText]] as const) {
      expect(text.length, label).toBeGreaterThan(3000);
      expect(text, label).toContain("inteligencia artificial");
    }
  });

  it("preserves accented characters in every format", () => {
    for (const [label, text] of [["pdf", pdfText], ["docx", docxText], ["txt", txtText]] as const) {
      expect(text, label).toContain("información");
      expect(text, label).toContain("académica");
    }
  });

  it("recovers the same document regardless of format", () => {
    // Near-1, not exactly 1: each extractor reconstructs whitespace and
    // line breaks differently, which is expected and harmless. A real
    // format bug (dropped page, mangled encoding, swallowed section)
    // would push this far below the bar.
    const pdfVsDocx = compareChunks(normalizeText(pdfText), normalizeText(docxText)).score;
    const pdfVsTxt = compareChunks(normalizeText(pdfText), normalizeText(txtText)).score;
    expect(pdfVsDocx).toBeGreaterThan(0.9);
    expect(pdfVsTxt).toBeGreaterThan(0.9);
  });
});

describe("pipeline stages behave identically across formats", () => {
  it("finds the same single in-text citation in every format", () => {
    for (const [label, text] of [["pdf", pdfText], ["docx", docxText], ["txt", txtText]] as const) {
      // Same entry point the pipeline uses, so the stateful bibliography
      // boundary is exercised rather than approximated.
      const citations = detectInTextCitations(chunkText(text).map((c) => c.text));
      expect(citations.map((c) => c.citation.rawText), label).toEqual(["UNESCO (2023)"]);
    }
  });

  it("finds all three numbered references in every format", () => {
    for (const [label, text] of [["pdf", pdfText], ["docx", docxText], ["txt", txtText]] as const) {
      const refs = detectReferences(text);
      expect(refs.length, label).toBe(3);
      const joined = refs.map((r) => r.rawText).join(" ");
      expect(joined, label).toMatch(/UNESCO/);
      expect(joined, label).toMatch(/Luckin/);
      expect(joined, label).toMatch(/Russell/);
    }
  });

  it("produces a workable number of chunks in every format", () => {
    for (const [label, text] of [["pdf", pdfText], ["docx", docxText], ["txt", txtText]] as const) {
      const chunks = chunkText(text);
      expect(chunks.length, label).toBeGreaterThanOrEqual(3);
      for (const c of chunks) expect(c.wordCount, label).toBeGreaterThan(0);
    }
  });
});
