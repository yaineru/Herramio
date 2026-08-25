import "server-only";
import { extractPdfTextServer } from "@/lib/originality/extract/pdf";
import { extractDocxTextServer } from "@/lib/originality/extract/docx";

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export interface ExtractionResult {
  /** Full document text, page breaks (if known) marked as a blank line — good enough input for chunkText(). */
  text: string;
  pageCount: number | null;
  /** True when extraction produced no usable text — e.g. a scanned PDF with no text layer. Never silently treated as "0 words, nothing to report". */
  isEmpty: boolean;
}

/**
 * Dispatches to the right extractor by MIME type. Never runs OCR — a
 * scanned PDF with no text layer comes back with `isEmpty: true` and the
 * caller must say so plainly, not report a fake 0% similarity as if the
 * document had been analyzed.
 */
export async function extractDocumentText(bytes: Uint8Array, mimeType: string): Promise<ExtractionResult> {
  if (mimeType === "application/pdf") {
    const { pages } = await extractPdfTextServer(bytes);
    const text = pages.join("\n\n");
    return { text, pageCount: pages.length, isEmpty: text.trim().length === 0 };
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const { text } = await extractDocxTextServer(bytes);
    return { text, pageCount: null, isEmpty: text.trim().length === 0 };
  }

  if (mimeType === "text/plain") {
    const text = Buffer.from(bytes).toString("utf-8");
    return { text, pageCount: null, isEmpty: text.trim().length === 0 };
  }

  throw new Error(`Tipo de archivo no soportado: ${mimeType}`);
}
