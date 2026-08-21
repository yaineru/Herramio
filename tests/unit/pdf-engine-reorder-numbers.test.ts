import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { reorderPdfPages, addPageNumbers, getPdfPageCount } from "@/lib/pdf/pdf-engine";

async function makeTestPdf(pageCount: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([100, 100]);
  const bytes = await doc.save();
  return new File([bytes as BlobPart], "test.pdf", { type: "application/pdf" });
}

describe("reorderPdfPages", () => {
  it("reorders pages according to the given 0-based indices", async () => {
    const file = await makeTestPdf(3);
    const blob = await reorderPdfPages(file, [2, 0, 1]);
    const result = new File([blob], "result.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });

  it("duplicates a page when its index repeats", async () => {
    const file = await makeTestPdf(2);
    const blob = await reorderPdfPages(file, [0, 0, 1]);
    const result = new File([blob], "result.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });
});

describe("addPageNumbers", () => {
  it("preserves page count and produces a valid PDF for each position", async () => {
    const file = await makeTestPdf(3);
    for (const position of ["bottom-center", "bottom-right", "top-right"] as const) {
      const blob = await addPageNumbers(file, position, 1);
      const result = new File([blob], "numbered.pdf", { type: "application/pdf" });
      expect(await getPdfPageCount(result)).toBe(3);
      expect(blob.size).toBeGreaterThan(0);
    }
  });

  it("respects a custom starting number", async () => {
    const file = await makeTestPdf(2);
    const blob = await addPageNumbers(file, "bottom-center", 5);
    expect(blob.size).toBeGreaterThan(0);
  });
});
