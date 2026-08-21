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

/** Returns a copy of the PDF with the given 0-based page indices removed. */
export async function removePdfPages(file: File, pageIndicesToRemove: number[]): Promise<Blob> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();

  const toRemove = new Set(pageIndicesToRemove);
  const keep = Array.from({ length: total }, (_, i) => i).filter((i) => !toRemove.has(i));

  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, keep);
  pages.forEach((page) => out.addPage(page));

  const outBytes = await out.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

/** Rotates the given 0-based page indices (or every page) by the given degrees, added to whatever rotation the page already had. */
export async function rotatePdfPages(
  file: File,
  pageIndices: number[] | "all",
  degrees: 90 | 180 | 270,
): Promise<Blob> {
  const { PDFDocument, degrees: toDegrees } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const total = doc.getPageCount();

  const targets = pageIndices === "all" ? Array.from({ length: total }, (_, i) => i) : pageIndices;
  for (const index of targets) {
    const page = doc.getPage(index);
    const current = page.getRotation().angle;
    page.setRotation(toDegrees((current + degrees) % 360));
  }

  const outBytes = await doc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

/** Rebuilds the PDF with pages in the given 0-based order — repeated indices duplicate that page. */
export async function reorderPdfPages(file: File, order: number[]): Promise<Blob> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);

  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order);
  pages.forEach((page) => out.addPage(page));

  const outBytes = await out.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

export type PageNumberPosition = "bottom-center" | "bottom-right" | "top-right";

/** Stamps a running page number onto every page, starting from `startNumber`. */
export async function addPageNumbers(
  file: File,
  position: PageNumberPosition,
  startNumber: number,
): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const margin = 24;

  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const text = String(startNumber + i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x: number;
    let y: number;
    if (position === "bottom-center") {
      x = width / 2 - textWidth / 2;
      y = margin / 2;
    } else if (position === "bottom-right") {
      x = width - margin - textWidth;
      y = margin / 2;
    } else {
      x = width - margin - textWidth;
      y = height - margin;
    }

    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.35, 0.35, 0.35) });
  });

  const outBytes = await doc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

/** Stamps a diagonal, semi-transparent text watermark across every page. */
export async function addWatermark(file: File, text: string, opacity: number, fontSize: number): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
      opacity: Math.min(1, Math.max(0, opacity)),
      rotate: degrees(-45),
    });
  });

  const outBytes = await doc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

export type SignaturePosition = "bottom-left" | "bottom-center" | "bottom-right";

/** Embeds a PNG signature image onto the given page (0-based index) at a fixed corner/size. */
export async function placeSignatureOnPdf(
  file: File,
  signaturePng: ArrayBuffer,
  pageIndex: number,
  position: SignaturePosition,
): Promise<Blob> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) throw new Error("Página fuera de rango.");
  const page = pages[pageIndex];

  const signatureImage = await doc.embedPng(signaturePng);
  const margin = 36;
  const targetWidth = 160;
  const targetHeight = (signatureImage.height / signatureImage.width) * targetWidth;
  const { width: pageWidth } = page.getSize();

  let x: number;
  if (position === "bottom-left") x = margin;
  else if (position === "bottom-right") x = pageWidth - margin - targetWidth;
  else x = pageWidth / 2 - targetWidth / 2;

  page.drawImage(signatureImage, { x, y: margin, width: targetWidth, height: targetHeight });

  const outBytes = await doc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
}

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  producer: string;
  creator: string;
}

/** Reads the document-info metadata a PDF carries (title, author, etc.) — none of this is page content, it's separate from what's visible when reading the document. */
export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords()?.split(/\s+/).map((k) => k.trim()).filter(Boolean) ?? [],
    producer: doc.getProducer() ?? "",
    creator: doc.getCreator() ?? "",
  };
}

/** Clears every document-info metadata field from the PDF. */
export async function stripPdfMetadata(file: File): Promise<Blob> {
  const { PDFDocument } = await getPdfLib();
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");
  const outBytes = await doc.save();
  return new Blob([outBytes as BlobPart], { type: "application/pdf" });
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
