import "server-only";

const CROSSREF_ENDPOINT = "https://api.crossref.org/works";
/**
 * Crossref's "polite pool" gives better rate limits in exchange for a
 * contact address they can use if our requests misbehave.
 *
 * Read from the environment, never hardcoded. This used to send
 * hola@herramio.com, an address with no mailbox behind it — which defeats
 * the entire point of the polite pool: Crossref would have had no way to
 * reach us, and we would have looked like a client claiming courtesy it
 * could not honour.
 *
 * When no address is configured we send none and fall back to the
 * anonymous pool. Slightly worse rate limits, honest.
 */
function politePoolContact(): string | null {
  const configured = (process.env.CROSSREF_MAILTO ?? process.env.OPENALEX_MAILTO ?? "").trim();
  return configured.includes("@") ? configured : null;
}
const REQUEST_TIMEOUT_MS = 5000;
// A real, human-plausible reference is never a handful of characters —
// don't waste a request (or risk a nonsense query) on garbage.
const MIN_QUERY_LENGTH = 8;

// Measured against the live API, not guessed: Crossref's
// `query.bibliographic` ALWAYS returns its best fuzzy match with no
// quality floor, and its own `score` field is unusable as confidence — a
// deliberately nonsensical query scored 30.0 while a real paper scored
// 29.8. So a returned work is only accepted when its title genuinely
// resembles what was asked for.
//
// Threshold set deliberately high. Measured on real responses: the true
// paper scores 1.00, while a *fabricated* reference matched to an
// unrelated real paper scored 0.60 and a merely derivative paper scored
// 0.64 — those two are too close to separate safely. Sitting at 0.8 means
// some genuine references get reported "not_found" (a measured example:
// the canonical BERT paper), which is the correct trade for this product:
// "not_found" explicitly does not mean fabricated, but a false "verified"
// would lend credibility to an invented citation, which is exactly the
// harm this feature exists to prevent.
const MIN_TITLE_SIMILARITY = 0.8;

// The top hit is frequently a derivative work that merely shares wording
// (measured: querying the canonical "Attention Is All You Need" returned
// "Text-Guided Attention is All You Need for Zero-Shot Robustness" first).
// Scanning several candidates and keeping the best title match finds the
// real paper instead of rejecting it.
const CANDIDATE_ROWS = 10;

export interface ReferenceVerificationResult {
  status: "verified" | "not_found";
  matchedDoi: string | null;
  matchedTitle: string | null;
  matchedUrl: string | null;
}

interface CrossrefWork {
  DOI?: string;
  title?: string[];
  URL?: string;
}

function significantTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      // Short tokens ("of", "in", "a") match everything and would inflate
      // the score toward false confidence.
      .filter((word) => word.length > 2),
  );
}

/**
 * What fraction of the shorter title's meaningful words appear in the
 * longer one. Containment (not Jaccard) on purpose: the query is often a
 * full bibliography line (author, year, journal) while the response is
 * just a title, and that length asymmetry is expected rather than
 * evidence of a mismatch.
 */
function titleSimilarity(queryText: string, candidateTitle: string): number {
  const queryTokens = significantTokens(queryText);
  const titleTokens = significantTokens(candidateTitle);
  if (queryTokens.size === 0 || titleTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of titleTokens) {
    if (queryTokens.has(token)) overlap++;
  }
  return overlap / Math.min(queryTokens.size, titleTokens.size);
}

/**
 * Checks a detected reference against Crossref's public metadata index —
 * genuinely free, no API key, no account (confirmed against Crossref's
 * own docs before writing this). Only ever reads Crossref's own JSON
 * response; never follows a DOI/URL it returns to fetch third-party
 * content, so this has none of the SSRF surface a general-purpose URL
 * fetcher would (the request target is Crossref's fixed API host, never
 * anything reference- or user-controlled).
 *
 * 'not_found' is a real, honest outcome, not a failure — Crossref's index
 * skews toward DOI-registered journal articles; books, theses, and older
 * or non-English work are commonly absent despite being real. It is
 * NEVER evidence that a reference was fabricated.
 */
export async function verifyReferenceViaCrossref(query: string): Promise<ReferenceVerificationResult> {
  const notFound: ReferenceVerificationResult = {
    status: "not_found",
    matchedDoi: null,
    matchedTitle: null,
    matchedUrl: null,
  };

  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return notFound;

  const url = new URL(CROSSREF_ENDPOINT);
  url.searchParams.set("query.bibliographic", trimmed);
  url.searchParams.set("rows", String(CANDIDATE_ROWS));
  const contact = politePoolContact();
  if (contact) url.searchParams.set("mailto", contact);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    console.error("Crossref lookup failed (treated as not_found, not an error):", error);
    return notFound;
  }

  if (!response.ok) return notFound;

  const body = (await response.json()) as { message?: { items?: CrossrefWork[] } };

  // Pick the candidate whose title best matches the query, not whatever
  // Crossref ranked first — its ranking optimizes for search relevance,
  // which is not the same thing as "is this the work being cited".
  let best: { work: CrossrefWork; title: string; similarity: number } | null = null;
  for (const work of body.message?.items ?? []) {
    const title = work.title?.[0];
    if (!work.DOI || !title) continue;
    const similarity = titleSimilarity(trimmed, title);
    if (!best || similarity > best.similarity) best = { work, title, similarity };
  }

  // The guard that makes this honest: without it, a fabricated reference
  // gets "verified" against whatever unrelated real paper Crossref
  // happened to return.
  if (!best || best.similarity < MIN_TITLE_SIMILARITY) return notFound;

  return {
    status: "verified",
    matchedDoi: best.work.DOI!,
    matchedTitle: best.title,
    matchedUrl: best.work.URL ?? `https://doi.org/${best.work.DOI}`,
  };
}
