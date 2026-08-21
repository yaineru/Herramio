const URL_RE = /\bhttps?:\/\/[^\s<>"')\]]+/g;

/** Extracts every http(s) URL from free text, deduplicated and sorted alphabetically. Trailing punctuation is trimmed off each match. */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_RE) ?? [];
  const cleaned = matches.map((url) => url.replace(/[.,;:!?]+$/, ""));
  const unique = Array.from(new Set(cleaned));
  return unique.sort((a, b) => a.localeCompare(b));
}
