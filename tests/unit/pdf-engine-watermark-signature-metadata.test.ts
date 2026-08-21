import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  addWatermark,
  placeSignatureOnPdf,
  readPdfMetadata,
  stripPdfMetadata,
  getPdfPageCount,
} from "@/lib/pdf/pdf-engine";

async function makeTestPdf(pageCount: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 200]);
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

describe("addWatermark", () => {
  it("preserves page count and produces a valid, non-empty PDF", async () => {
    const file = await makeTestPdf(3);
    const blob = await addWatermark(file, "CONFIDENCIAL", 0.3, 40);
    const result = new File([blob], "watermarked.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("clamps opacity into the valid 0-1 range without throwing", async () => {
    const file = await makeTestPdf(1);
    await expect(addWatermark(file, "TEST", 5, 30)).resolves.toBeInstanceOf(Blob);
    await expect(addWatermark(file, "TEST", -1, 30)).resolves.toBeInstanceOf(Blob);
  });
});

describe("placeSignatureOnPdf", () => {
  it("embeds a signature on the requested page for every position", async () => {
    const file = await makeTestPdf(2);
    for (const position of ["bottom-left", "bottom-center", "bottom-right"] as const) {
      const blob = await placeSignatureOnPdf(file, tinyPngBytes(), 0, position);
      const result = new File([blob], "signed.pdf", { type: "application/pdf" });
      expect(await getPdfPageCount(result)).toBe(2);
    }
  });

  it("rejects an out-of-range page index", async () => {
    const file = await makeTestPdf(1);
    await expect(placeSignatureOnPdf(file, tinyPngBytes(), 5, "bottom-right")).rejects.toThrow();
  });
});

describe("readPdfMetadata / stripPdfMetadata", () => {
  it("reads back metadata that was set on the document", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]);
    doc.setTitle("Mi documento");
    doc.setAuthor("Ana");
    doc.setKeywords(["uno", "dos"]);
    const bytes = await doc.save();
    const file = new File([bytes as BlobPart], "meta.pdf", { type: "application/pdf" });

    const meta = await readPdfMetadata(file);
    expect(meta.title).toBe("Mi documento");
    expect(meta.author).toBe("Ana");
    expect(meta.keywords).toEqual(["uno", "dos"]);
  });

  it("returns empty values for a document with no metadata", async () => {
    const file = await makeTestPdf(1);
    const meta = await readPdfMetadata(file);
    expect(meta.title).toBe("");
    expect(meta.keywords).toEqual([]);
  });

  it("clears all metadata fields after stripping", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]);
    doc.setTitle("Secreto");
    doc.setAuthor("Alguien");
    const bytes = await doc.save();
    const file = new File([bytes as BlobPart], "meta.pdf", { type: "application/pdf" });

    const cleaned = await stripPdfMetadata(file);
    const cleanedFile = new File([cleaned], "cleaned.pdf", { type: "application/pdf" });
    const meta = await readPdfMetadata(cleanedFile);
    expect(meta.title).toBe("");
    expect(meta.author).toBe("");
  });
});
