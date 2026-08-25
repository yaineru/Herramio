import type { OriginalityCitation, OriginalityReference } from "@/lib/originality/types";

export interface CitationGraphEntry {
  citation: OriginalityCitation;
  /** The bibliography entry this in-text citation appears to point to, or null when none matched. */
  matchedReference: OriginalityReference | null;
}

export interface CitationGraph {
  entries: CitationGraphEntry[];
  /** In-text citations with no apparent matching bibliography entry — worth the author's review, never an accusation. */
  orphanCitations: OriginalityCitation[];
  /** Bibliography entries never cited anywhere in the text. Common and often legitimate (a "further reading" list), so phrased as a note, not a problem. */
  uncitedReferences: OriginalityReference[];
}

const STOPWORD_SURNAMES = new Set(["the", "this", "these", "those", "and", "et", "al", "in", "of", "for"]);

/**
 * Extracts the surname(s) and year from an in-text citation's raw text.
 * Numeric styles ([12]) carry no author information, so they return null
 * and are excluded from matching entirely rather than guessed at.
 */
function parseCitation(rawText: string): { surname: string; year: string } | null {
  const yearMatch = rawText.match(/(\d{4})/);
  if (!yearMatch) return null;

  const surnameMatch = rawText.match(/([A-ZÀ-Ý][\wÀ-ÿ'-]{1,})/);
  if (!surnameMatch) return null;

  const surname = surnameMatch[1].toLowerCase();
  if (STOPWORD_SURNAMES.has(surname)) return null;

  return { surname, year: yearMatch[1] };
}

function referenceMatchesCitation(reference: OriginalityReference, surname: string, year: string): boolean {
  // Year must agree — it's the single most reliable discriminator between
  // two works by the same author.
  const referenceYear = reference.parsedYear ?? reference.rawText.match(/(\d{4})/)?.[1];
  if (referenceYear !== year) return false;

  const haystack = `${reference.parsedAuthor ?? ""} ${reference.rawText}`.toLowerCase();
  return haystack.includes(surname);
}

/**
 * Links in-text citations to bibliography entries by surname + year.
 *
 * Deliberately conservative: only author-year citations participate.
 * Numeric styles ([12]) are skipped rather than matched by position,
 * because position-based guessing produces confident-looking wrong
 * answers — and the whole point of this feature is helping an author
 * check their own work, where a wrong "missing reference" warning is
 * worse than no warning at all.
 */
export function buildCitationGraph(
  citations: OriginalityCitation[],
  references: OriginalityReference[],
): CitationGraph {
  const entries: CitationGraphEntry[] = [];
  const orphanCitations: OriginalityCitation[] = [];
  const usedReferenceIds = new Set<number>();

  for (const citation of citations) {
    const parsed = parseCitation(citation.rawText);
    if (!parsed) {
      // Not matchable (numeric style, or no parseable author/year) — not
      // an orphan, just outside what this analysis can speak to.
      entries.push({ citation, matchedReference: null });
      continue;
    }

    const matched = references.find((r) => referenceMatchesCitation(r, parsed.surname, parsed.year)) ?? null;
    entries.push({ citation, matchedReference: matched });

    if (matched) usedReferenceIds.add(matched.id);
    else orphanCitations.push(citation);
  }

  return {
    entries,
    orphanCitations,
    uncitedReferences: references.filter((r) => !usedReferenceIds.has(r.id)),
  };
}
