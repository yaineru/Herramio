// Combining diacritical marks block (U+0300–U+036F), built from code points
// rather than a literal regex range to avoid any ambiguity from invisible
// combining characters sitting directly in source code.
const COMBINING_DIACRITICS = new RegExp(
  `[${String.fromCodePoint(0x0300)}-${String.fromCodePoint(0x036f)}]`,
  "g",
);

/** Converts text to a URL-safe slug: lowercase, no accents, words joined by single hyphens. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
