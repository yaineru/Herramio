import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { removePdfPages, rotatePdfPages, getPdfPageCount } from "@/lib/pdf/pdf-engine";

async function makeTestPdf(pageCount: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([100, 100]);
  const bytes = await doc.save();
  return new File([bytes as BlobPart], "test.pdf", { type: "application/pdf" });
}

describe("removePdfPages", () => {
  it("removes the given 0-based page indices", async () => {
    const file = await makeTestPdf(5);
    const blob = await removePdfPages(file, [1, 3]);
    const result = new File([blob], "result.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });

  it("keeps all pages when nothing is removed", async () => {
    const file = await makeTestPdf(4);
    const blob = await removePdfPages(file, []);
    const result = new File([blob], "result.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(4);
  });
});

describe("rotatePdfPages", () => {
  it("rotates a single page by the given degrees", async () => {
    const file = await makeTestPdf(3);
    const blob = await rotatePdfPages(file, [0], 90);
    const bytes = await blob.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPage(0).getRotation().angle).toBe(90);
    expect(doc.getPage(1).getRotation().angle).toBe(0);
  });

  it("rotates every page when passed 'all'", async () => {
    const file = await makeTestPdf(2);
    const blob = await rotatePdfPages(file, "all", 180);
    const bytes = await blob.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPage(0).getRotation().angle).toBe(180);
    expect(doc.getPage(1).getRotation().angle).toBe(180);
  });

  it("accumulates rotation on top of an existing angle", async () => {
    const file = await makeTestPdf(1);
    const once = await rotatePdfPages(file, "all", 90);
    const twice = await rotatePdfPages(new File([once], "r.pdf", { type: "application/pdf" }), "all", 90);
    const doc = await PDFDocument.load(await twice.arrayBuffer());
    expect(doc.getPage(0).getRotation().angle).toBe(180);
  });
});
