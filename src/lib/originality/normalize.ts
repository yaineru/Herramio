/**
 * Text normalization for comparison — never mutates the stored "raw" text,
 * only produces a second, comparison-friendly version. Both are always
 * stored (document_chunks.text = raw, .normalized_text = this output).
 */
export function normalizeText(raw: string): string {
  return raw
    .normalize("NFKC")
    // Curly quotes/apostrophes and en/em dashes → their plain ASCII
    // equivalents, so "café" quoted two different ways in two documents
    // still compares equal.
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
