import "server-only";
import { PDFParse } from "pdf-parse";

/**
 * Server-side PDF text extraction. Uses `pdf-parse` (which wraps
 * pdfjs-dist + @napi-rs/canvas), NOT a direct `pdfjs-dist` import — a
 * direct import was the first version of this file, and it crashed on
 * Vercel's real serverless runtime with `DOMMatrix is not defined`
 * (confirmed via an actual Vercel preview deployment, not assumed).
 * `pdfjs-dist` expects a `DOMMatrix`-providing canvas implementation for
 * some internal transform math even during plain text extraction, and
 * that global doesn't exist in Vercel's Node runtime. `pdf-parse` bundles
 * `@napi-rs/canvas` (prebuilt native binaries, not a JS polyfill) to
 * supply it correctly — verified fixed against the same real deployment
 * after switching (see PRODUCTION.md).
 *
 * `lineEnforce`/`lineThreshold` reconstruct line/paragraph breaks from
 * text-item vertical spacing — this replaces an earlier hand-rolled
 * heuristic that did the same thing manually; pdf-parse's version is
 * built-in and battle-tested rather than project-specific code.
 */
export async function extractPdfTextServer(bytes: Uint8Array): Promise<{ pages: string[] }> {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText({ pageJoiner: "" });
    return { pages: result.pages.map((p) => p.text.trim()) };
  } finally {
    await parser.destroy();
  }
}
