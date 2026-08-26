export interface DetectedCitation {
  rawText: string;
  styleGuess: "apa" | "vancouver" | "ieee" | "unknown";
}

export interface DetectedReference {
  rawText: string;
  parsedAuthor: string | null;
  parsedYear: string | null;
  parsedTitle: string | null;
}

// APA parenthetical: (Smith, 2021), (Smith & Jones, 2021), (Smith et al., 2021a)
const APA_PARENTHETICAL =
  /\(([A-ZÀ-Ý][\wÀ-ÿ'-]+(?:\s(?:et al\.|(?:&|y)\s[A-ZÀ-Ý][\wÀ-ÿ'-]+))?),?\s(\d{4}[a-z]?)\)/g;
// APA narrative: Smith (2021), Smith and Jones (2021)
const APA_NARRATIVE = /\b([A-ZÀ-Ý][\wÀ-ÿ'-]+(?:\s(?:and|y)\s[A-ZÀ-Ý][\wÀ-ÿ'-]+)?)\s\((\d{4}[a-z]?)\)/g;
// Numeric bracket — Vancouver/IEEE style: [12], [3, 7], [3-5]
const NUMERIC_BRACKET = /\[(\d{1,3}(?:\s*[,\-]\s*\d{1,3})*)\]/g;

/**
 * Finds citation-SHAPED text via pattern matching — this does not verify
 * that a citation actually corresponds to a real, correctly-attributed
 * source. Every result is "detected", never "verified"; see
 * ORIGINALITY.md for why that distinction is load-bearing for this
 * feature's credibility.
 */
export function detectCitations(text: string): DetectedCitation[] {
  const results: DetectedCitation[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(APA_PARENTHETICAL)) {
    addUnique(results, seen, match[0], "apa");
  }
  for (const match of text.matchAll(APA_NARRATIVE)) {
    addUnique(results, seen, match[0], "apa");
  }
  for (const match of text.matchAll(NUMERIC_BRACKET)) {
    addUnique(results, seen, match[0], /,/.test(match[1]) || /-/.test(match[1]) ? "ieee" : "vancouver");
  }

  return results;
}

function addUnique(results: DetectedCitation[], seen: Set<string>, rawText: string, styleGuess: DetectedCitation["styleGuess"]) {
  if (seen.has(rawText)) return;
  seen.add(rawText);
  results.push({ rawText, styleGuess });
}

// Matches the heading as a whole line, OR at the end of a line after a
// sentence boundary (". References") — PDF text extraction sometimes
// merges the last body sentence and the following heading onto one
// logical line, and the heading is what actually matters here, not
// whatever precedes it.
const REFERENCES_HEADING = /(?:^|\.\s+)(references|bibliography|referencias|bibliograf[ií]a)\s*$/i;
// Numbered-bibliography label: "[1] ", "(1) ", "1. ", "1) ". IEEE and
// Vancouver number every entry this way, and those are among the most
// common styles in engineering and medical writing. Stripped before the
// entry pattern runs, because REFERENCE_ENTRY anchors on an author-like
// token at the start of the line — without this, an entire numbered
// bibliography matched nothing and the report claimed the document had no
// references at all. `rawText` still keeps the original, unstripped line:
// Crossref verification searches on it, and the number is harmless there
// while a truncated entry would not be.
const REFERENCE_LABEL = /^\s*(?:\[\d{1,3}\]|\(\d{1,3}\)|\d{1,3}[.)])\s+/;
// Loose heuristic: a reference entry usually starts with an author-like
// token and contains a 4-digit year, often parenthesized.
const REFERENCE_ENTRY = /^([A-ZÀ-Ý][\wÀ-ÿ,.\s&'-]{2,80}?)\.?\s*\(?(\d{4})\)?\.?\s*(.*)$/;

/**
 * Best-effort only: finds a References/Bibliografía heading LINE anywhere
 * in the document's raw text, then treats subsequent lines that look like
 * bibliography entries as references. Operates on the flat line stream
 * (not on already-grouped paragraph chunks) deliberately — PDF text
 * extraction doesn't reliably reproduce paragraph boundaries, so a
 * heading can end up sharing a chunk with adjacent text; a line is a much
 * more reliable unit to search on. Never invents author/year/title when
 * the pattern doesn't clearly provide one — leaves the field null instead.
 */
// The heading as it survives chunking. chunkText() collapses every run of
// whitespace to a single space, so by the time a chunk exists the heading
// is no longer on a line of its own — it reads "...académica. 8.
// Referencias [1] UNESCO (2023)...". REFERENCES_HEADING anchors on end of
// line and therefore cannot match there, which is why the first version of
// this guard silently did nothing.
//
// Matching a bare "Referencias" mid-sentence would be far too eager, so
// this requires the heading to be followed by something that actually
// opens a bibliography entry: a numeric label, or a "Surname," / "Surname
// (Year)" opener. "consultamos varias referencias durante el estudio"
// does not qualify.
const REFERENCES_HEADING_INLINE =
  /(?:^|[.\d]\s+)(references|bibliography|referencias|bibliograf[ií]a)\s+(?=\[\d|\(\d|\d{1,3}[.)]\s|[A-ZÀ-Ý][\wÀ-ÿ'-]+,|[A-ZÀ-Ý][\wÀ-ÿ'-]+\s\()/i;

/**
 * Returns the part of `text` that precedes the bibliography, and whether a
 * heading was found at all.
 *
 * The pipeline uses this to stop looking for in-text citations once the
 * reference list starts. Without the boundary every entry is counted twice
 * over — "UNESCO (2023). Guidance for..." matches the APA narrative
 * pattern and "[1]" matches the numeric one — so the QA document, which
 * has exactly one in-text citation, reported five, and the citation graph
 * then derived its orphan and uncited counts from those phantoms.
 *
 * A citation is in-text by definition; a line in the reference list is a
 * reference. Truncating rather than dropping the whole chunk matters
 * because the chunk holding the heading usually starts with real body
 * prose, and any citations in that part are genuine.
 */
export function splitAtReferencesHeading(text: string): { body: string; foundHeading: boolean } {
  const lines = text.split(/\n/);
  const lineIndex = lines.findIndex((line) => REFERENCES_HEADING.test(line.trim()));
  if (lineIndex !== -1) return { body: lines.slice(0, lineIndex).join("\n"), foundHeading: true };

  const inline = text.match(REFERENCES_HEADING_INLINE);
  if (inline && inline.index !== undefined) return { body: text.slice(0, inline.index), foundHeading: true };

  return { body: text, foundHeading: false };
}

export function detectReferences(fullText: string): DetectedReference[] {
  const lines = fullText.split(/\n+/).map((line) => line.trim());
  const headingIndex = lines.findIndex((line) => REFERENCES_HEADING.test(line));
  if (headingIndex === -1) return [];

  const results: DetectedReference[] = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (line.length < 15) continue;
    const match = line.replace(REFERENCE_LABEL, "").match(REFERENCE_ENTRY);
    if (!match) continue;
    results.push({
      rawText: line,
      parsedAuthor: match[1]?.trim() || null,
      parsedYear: match[2] || null,
      parsedTitle: match[3]?.trim() || null,
    });
  }
  return results;
}

/**
 * Finds the in-text citations across a document's chunks, stopping at the
 * bibliography.
 *
 * The boundary is stateful, which is why it lives here rather than being
 * re-derived per chunk: a long reference list spans several chunks and
 * only the first one carries the heading. Detecting per chunk would let
 * every later chunk contribute phantom citations again — the exact bug
 * this function exists to prevent.
 *
 * Returns the chunk index alongside each citation so the caller can
 * attach it to the right stored row.
 */
export function detectInTextCitations(chunkTexts: string[]): { chunkIndex: number; citation: DetectedCitation }[] {
  const found: { chunkIndex: number; citation: DetectedCitation }[] = [];
  let pastReferences = false;

  for (const [chunkIndex, text] of chunkTexts.entries()) {
    if (pastReferences) break;
    const { body, foundHeading } = splitAtReferencesHeading(text);
    if (foundHeading) pastReferences = true;
    for (const citation of detectCitations(body)) found.push({ chunkIndex, citation });
  }

  return found;
}
