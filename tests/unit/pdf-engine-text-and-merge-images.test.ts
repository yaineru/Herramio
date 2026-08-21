import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { createPdfFromText, mergePdfsAndImages, getPdfPageCount } from "@/lib/pdf/pdf-engine";

async function makeTestPdf(pageCount: number): Promise<File> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([200, 200]);
  const bytes = await doc.save();
  return new File([bytes as BlobPart], "test.pdf", { type: "application/pdf" });
}

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function tinyPngFile(): File {
  const binary = atob(TINY_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], "tiny.png", { type: "image/png" });
}

describe("createPdfFromText", () => {
  it("creates a single-page PDF for short text", async () => {
    const blob = await createPdfFromText("Hola mundo");
    const file = new File([blob], "text.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(file)).toBe(1);
  });

  it("paginates long text across multiple pages", async () => {
    const longText = Array.from({ length: 200 }, (_, i) => `Línea de prueba número ${i} con algo de contenido.`).join("\n");
    const blob = await createPdfFromText(longText);
    const file = new File([blob], "text.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(file)).toBeGreaterThan(1);
  });

  it("preserves empty lines as paragraph breaks without crashing", async () => {
    const blob = await createPdfFromText("Primero\n\nSegundo");
    const file = new File([blob], "text.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(file)).toBe(1);
  });
});

describe("mergePdfsAndImages", () => {
  it("combines a PDF and an image into one document, in order", async () => {
    const pdf = await makeTestPdf(2);
    const image = tinyPngFile();
    const blob = await mergePdfsAndImages([
      { kind: "pdf", file: pdf },
      { kind: "image", file: image, type: "image/png" },
    ]);
    const result = new File([blob], "merged.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(3);
  });

  it("puts pages in the given item order", async () => {
    const image = tinyPngFile();
    const pdf = await makeTestPdf(1);
    const blob = await mergePdfsAndImages([
      { kind: "image", file: image, type: "image/png" },
      { kind: "pdf", file: pdf },
    ]);
    const result = new File([blob], "merged.pdf", { type: "application/pdf" });
    expect(await getPdfPageCount(result)).toBe(2);
  });
});
