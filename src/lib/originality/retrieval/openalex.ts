import "server-only";
import { checkUrlSafety, FETCH_LIMITS } from "@/lib/originality/retrieval/url-guard";
import type { SourceCandidate } from "@/lib/originality/retrieval/providers";

/**
 * OpenAlex adapter — a free, open index of ~250M scholarly works.
 *
 * Access model, established by making real requests rather than by
 * reading a changelog: as of this writing the API answers 200 with no
 * credential, with or without the `mailto` politeness parameter. Public
 * write-ups claim a key became mandatory in February 2026; that is not
 * what the live API does today, so the adapter works keyless and treats
 * 401/403 as "not configured" rather than crashing. If a key does become
 * required, OPENALEX_API_KEY is read here and the failure is already
 * handled.
 *
 * `mailto` is sent when configured. It costs nothing, it is what the
 * project asked for, and it is the courtesy identifier OpenAlex has always
 * used to separate well-behaved clients from anonymous traffic.
 *
 * Nothing here fabricates a source. A request that fails returns an empty
 * candidate list and records why, because in an academic-integrity report
 * an invented source is worse than no source: a human may act on it.
 */

const BASE_URL = "https://api.openalex.org";

/** OpenAlex's own relevance_score is returned but never used as confidence — see SourceRanker. */
interface OpenAlexAuthorship {
  author?: { display_name?: string | null } | null;
}

interface OpenAlexWork {
  id?: string | null;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_year?: number | null;
  relevance_score?: number | null;
  authorships?: OpenAlexAuthorship[] | null;
  primary_location?: { landing_page_url?: string | null; source?: { display_name?: string | null } | null } | null;
  best_oa_location?: { landing_page_url?: string | null } | null;
  abstract_inverted_index?: Record<string, number[]> | null;
}

export interface OpenAlexResult {
  candidates: SourceCandidate[];
  /** Populated when the lookup could not run. The report states this rather than showing zero results as fact. */
  unavailableReason: string | null;
  requestCount: number;
}

function mailtoParam(): string {
  const mailto = (process.env.OPENALEX_MAILTO ?? "").trim();
  return mailto ? `&mailto=${encodeURIComponent(mailto)}` : "";
}

function authHeaders(): Record<string, string> {
  const key = (process.env.OPENALEX_API_KEY ?? "").trim();
  return key ? { Authorization: `Bearer ${key}` } : {};
}

/**
 * OpenAlex ships abstracts as an inverted index (word -> positions) for
 * licensing reasons. Reconstructing it gives a snippet to compare against;
 * it is capped because the report stores evidence, not whole abstracts.
 */
export function reconstructAbstract(index: Record<string, number[]> | null | undefined, maxChars = 600): string | null {
  if (!index) return null;
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word;
  }
  const text = words.filter(Boolean).join(" ").trim();
  if (!text) return null;
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}

/** Normalises one OpenAlex work into the shared SourceCandidate shape. */
export function toCandidate(work: OpenAlexWork): SourceCandidate {
  const title = (work.display_name ?? work.title ?? "").trim() || null;
  const landing = work.primary_location?.landing_page_url ?? work.best_oa_location?.landing_page_url ?? null;
  return {
    // Prefer the DOI resolver as the canonical URL: it is stable, whereas
    // a landing page moves when a publisher reorganises its site.
    url: work.doi ?? landing ?? work.id ?? null,
    title,
    snippet: reconstructAbstract(work.abstract_inverted_index),
    doi: work.doi ? work.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") : null,
    authors: (work.authorships ?? [])
      .map((a) => a?.author?.display_name?.trim())
      .filter((n): n is string => Boolean(n))
      .slice(0, 10),
    publishedYear: typeof work.publication_year === "number" ? work.publication_year : null,
    kind: "academic",
    providerRelevance: typeof work.relevance_score === "number" ? work.relevance_score : null,
    providerName: "openalex",
  };
}

async function request(url: string): Promise<{ ok: true; json: unknown } | { ok: false; reason: string }> {
  // The URL is built here from a fixed base, but it still goes through the
  // same guard every outbound request uses — a single code path for
  // egress is what makes the SSRF rules enforceable rather than aspirational.
  const safety = checkUrlSafety(url);
  if (!safety.safe) return { ok: false, reason: `blocked_by_guard: ${safety.reason}` };

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", ...authHeaders() },
      signal: AbortSignal.timeout(FETCH_LIMITS.timeoutMs),
    });

    if (response.status === 401 || response.status === 403) return { ok: false, reason: "not_configured" };
    if (response.status === 429) return { ok: false, reason: "rate_limited" };
    if (!response.ok) return { ok: false, reason: `http_${response.status}` };

    return { ok: true, json: await response.json() };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? `network: ${error.message}` : "network" };
  }
}

/** Full-text search over titles, abstracts and full text where available. */
export async function searchOpenAlex(query: string, limit = 5): Promise<OpenAlexResult> {
  const trimmed = query.trim();
  if (!trimmed) return { candidates: [], unavailableReason: "empty_query", requestCount: 0 };

  const url =
    `${BASE_URL}/works?search=${encodeURIComponent(trimmed)}` +
    `&per_page=${Math.min(Math.max(limit, 1), 25)}` +
    `&select=id,doi,display_name,publication_year,relevance_score,authorships,primary_location,best_oa_location,abstract_inverted_index` +
    mailtoParam();

  const result = await request(url);
  if (!result.ok) return { candidates: [], unavailableReason: result.reason, requestCount: 1 };

  const works = (result.json as { results?: OpenAlexWork[] })?.results ?? [];
  return { candidates: works.map(toCandidate), unavailableReason: null, requestCount: 1 };
}

/** Direct DOI lookup — exact, and far cheaper than a search when a DOI is already known. */
export async function lookupOpenAlexByDoi(doi: string): Promise<OpenAlexResult> {
  const clean = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  if (!clean) return { candidates: [], unavailableReason: "empty_doi", requestCount: 0 };

  const url = `${BASE_URL}/works/https://doi.org/${encodeURIComponent(clean)}?${mailtoParam().slice(1)}`;
  const result = await request(url);
  if (!result.ok) {
    // A DOI that simply is not in OpenAlex is a legitimate answer, not a
    // failure, and must not be reported as an outage.
    if (result.reason === "http_404") return { candidates: [], unavailableReason: null, requestCount: 1 };
    return { candidates: [], unavailableReason: result.reason, requestCount: 1 };
  }

  const work = result.json as OpenAlexWork;
  return { candidates: work?.id ? [toCandidate(work)] : [], unavailableReason: null, requestCount: 1 };
}
