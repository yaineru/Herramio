// Matches "#" followed by letters/digits/underscore, including accented
// letters (\p{L} requires the /u flag), so it works for Spanish text too.
const HASHTAG_RE = /#[\p{L}0-9_]+/gu;

/** Extracts every #hashtag from free text, deduplicated (case-insensitively) and sorted alphabetically. */
export function extractHashtags(text: string): string[] {
  const matches = text.match(HASHTAG_RE) ?? [];
  const seen = new Map<string, string>();
  for (const match of matches) {
    const key = match.toLowerCase();
    if (!seen.has(key)) seen.set(key, match);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
