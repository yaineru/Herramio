import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { cropPdfPages, insertBlankPage, getPdfPageCount } from "@/lib/pdf/pdf-engine";

async function makeTestPdf(pageCount: number, size: [number, number] = [200, 400]): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage(size);
  const bytes = await doc.save();
  return new File([bytes as BlobPart], "test.pdf", { type: "application/pdf" });
}

describe("cropPdfPages", () => {
  it("shrinks the crop box by the given percentage margins", async () => {
    const file = await makeTestPdf(1, [200, 400]);
    const blob = await cropPdfPages(file, { top: 10, bottom: 10, left: 25, right: 25 });
    const doc = await PDFDocument.load(await blob.arrayBuffer());
    const box = doc.getPage(0).getCropBox();
    expect(box.x).toBeCloseTo(50); // 25% of 200
    expect(box.width).toBeCloseTo(100); // 200 - 50 - 50
    expect(box.y).toBeCloseTo(40); // 10% of 400
    expect(box.height).toBeCloseTo(320); // 400 - 40 - 40
  });

  it("preserves page count", async () => {
    const file = await makeTestPdf(3);
    const blob = await cropPdfPages(file, { top: 5, bottom: 5, left: 5, right: 5 });
    const result = new File([blob], "cropped.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });

  it("rejects margins outside 0-49", async () => {
    const file = await makeTestPdf(1);
    await expect(cropPdfPages(file, { top: 50, bottom: 0, left: 0, right: 0 })).rejects.toThrow();
    await expect(cropPdfPages(file, { top: -1, bottom: 0, left: 0, right: 0 })).rejects.toThrow();
  });
});

describe("insertBlankPage", () => {
  it("increases the page count by one", async () => {
    const file = await makeTestPdf(3);
    const blob = await insertBlankPage(file, 1);
    const result = new File([blob], "with-blank.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(4);
  });

  it("matches the size of the reference page", async () => {
    const file = await makeTestPdf(2, [150, 300]);
    const blob = await insertBlankPage(file, 0);
    const doc = await PDFDocument.load(await blob.arrayBuffer());
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBe(150);
    expect(height).toBe(300);
  });

  it("allows inserting at the very end", async () => {
    const file = await makeTestPdf(2);
    const blob = await insertBlankPage(file, 2);
    const result = new File([blob], "end.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });

  it("rejects an out-of-range position", async () => {
    const file = await makeTestPdf(2);
    await expect(insertBlankPage(file, 5)).rejects.toThrow();
    await expect(insertBlankPage(file, -1)).rejects.toThrow();
  });
});
