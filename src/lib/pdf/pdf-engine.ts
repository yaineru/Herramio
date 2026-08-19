export const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB per file
export const MAX_IMAGE_FOR_PDF_BYTES = 15 * 1024 * 1024;

/** Dynamically imported so pdf-lib never ships in the bundle of pages that don't need it. */
async function getPdfLib() {
  return import("pdf-lib");
}

export async function getPdfPageCount(file: File): Promise<number> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

/** Merges PDFs in the given order into a single downloadable PDF. */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const { PDFDocument } = await getPdfLib();
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const outBytes = await merged.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

/** Extracts each group of 0-based page indices into its own PDF blob. */
export async function splitPdfByGroups(file: File, groups: number[][]): Promise<Blob[]> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);

  const results: Blob[] = [];
  for (const indices of groups) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    pages.forEach((page) => out.addPage(page));
    const outBytes = await out.save();
    results.push(new Blob([outBytes as BlobPart], { type: "application/pdf" }));
  }
  return results;
}

export type ImageForPdf = { file: File; type: "image/jpeg" | "image/png" };

/** Builds a single PDF with one image per page, sized to the image's native pixel dimensions. */
export async function imagesToPdf(images: ImageForPdf[]): Promise<Blob> {
  const { PDFDocument } = await getPdfLib();
  const doc = await PDFDocument.create();

  for (const { file, type } of images) {
    const bytes = await file.arrayBuffer();
    const embedded = type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    const page = doc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
  }

  const outBytes = await doc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}
