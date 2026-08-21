import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { addCoverPage, getPdfPageCount } from "@/lib/pdf/pdf-engine";

async function makeTestPdf(pageCount: number, size: [number, number] = [200, 400]): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage(size);
  const bytes = await doc.save();
  return new File([bytes as BlobPart], "test.pdf", { type: "application/pdf" });
}

// A real 1x1 transparent PNG, valid enough for pdf-lib's embedPng to accept.
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function tinyPngBytes(): ArrayBuffer {
  const binary = atob(TINY_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

describe("addCoverPage", () => {
  it("increases the page count by one", async () => {
    const file = await makeTestPdf(2);
    const blob = await addCoverPage(file, tinyPngBytes(), "image/png");
    const result = new File([blob], "with-cover.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });

  it("sizes the new cover page like the original first page", async () => {
    const file = await makeTestPdf(1, [150, 300]);
    const blob = await addCoverPage(file, tinyPngBytes(), "image/png");
    const doc = await PDFDocument.load(await blob.arrayBuffer());
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBe(150);
    expect(height).toBe(300);
  });
});
