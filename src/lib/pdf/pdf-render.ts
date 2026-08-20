/**
 * PDF page → image rendering, isolated in its own module and only ever
 * imported dynamically from the /pdf-a-jpg page. pdfjs-dist is a much
 * heavier dependency than pdf-lib (it ships a rendering engine + worker),
 * so it must never end up in a shared chunk loaded by other tools.
 */

let workerConfigured = false;

async function getPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerConfigured = true;
  }
  return pdfjsLib;
}

export async function getPdfPageCountViaPdfJs(file: File): Promise<number> {
  const pdfjsLib = await getPdfJs();
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  return pdf.numPages;
}

/** Extracts the plain text of every page, in order. Scanned/image-only PDFs yield empty strings — this reads the PDF's real text layer, it never runs OCR. */
export async function extractPdfText(file: File): Promise<string[]> {
  const pdfjsLib = await getPdfJs();
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pages.push(text.replace(/\s+/g, " ").trim());
  }
  return pages;
}

/** Renders one PDF page to a JPEG blob at the given scale (2 ≈ good print quality). */
export async function renderPdfPageToBlob(
  file: File,
  pageNumber: number,
  scale = 2,
): Promise<Blob> {
  const pdfjsLib = await getPdfJs();
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar este PDF.");

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen."))),
      "image/jpeg",
      0.92,
    );
  });
}
