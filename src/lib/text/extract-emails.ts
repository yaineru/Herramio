const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Extracts every email-looking substring from free text, deduplicated (case-insensitive) and sorted alphabetically. */
export function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) ?? [];
  const seen = new Map<string, string>();
  for (const match of matches) {
    const key = match.toLowerCase();
    if (!seen.has(key)) seen.set(key, match);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
