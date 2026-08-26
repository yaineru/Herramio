import "server-only";
import type { SourceQuery } from "@/lib/originality/retrieval/query-generator";

/**
 * Source-retrieval provider contracts.
 *
 * Same rule as the embedding layer, for the same reason: a provider with
 * no real implementation returns null and the report says so. Nothing here
 * ever invents a "source found" — a fabricated source in an academic
 * integrity report is worse than no source at all, because a human may act
 * on it.
 */

export type SourceKind = "academic" | "web" | "internal";

export interface SourceCandidate {
  url: string | null;
  title: string | null;
  /** Snippet returned by the provider. Evidence only — never treated as the full source text. */
  snippet: string | null;
  doi: string | null;
  authors: string[];
  publishedYear: number | null;
  kind: SourceKind;
  /** The provider's own relevance figure, if it supplies one. Deliberately NOT used as confidence — see SourceRanker. */
  providerRelevance: number | null;
  providerName: string;
}

export interface SearchProvider {
  readonly name: string;
  readonly kind: SourceKind;
  search(query: SourceQuery): Promise<SourceCandidate[]>;
}

export class SourceProviderNotConfiguredError extends Error {
  constructor(providerName: string) {
    super(`El proveedor de búsqueda "${providerName}" no está configurado.`);
    this.name = "SourceProviderNotConfiguredError";
  }
}

/**
 * OpenAlex — a free, open index of ~250M scholarly works, verified live
 * rather than assumed. Public write-ups claim a key became mandatory in
 * February 2026; the live API answers 200 with no credential today, so
 * this runs keyless and degrades if that changes.
 *
 * One constraint learned by testing it against the QA document's own
 * three references, and it shapes how this provider may be used:
 *
 *   OpenAlex full-text search is a TOPIC-RELEVANCE engine, not an exact
 *   title matcher. Searching the exact title of the UNESCO guidance
 *   returned three plausible, well-ranked papers on generative AI in
 *   education — and not the UNESCO document, which is in the index and
 *   which a DOI lookup finds instantly.
 *
 * So its results are CANDIDATES to be scored by our own similarity, never
 * verifications. Treating a top hit as "the source" would reproduce the
 * Crossref score bug this project already fixed once, where a confident
 * ranking was mistaken for a correct identification.
 */
export class OpenAlexSearchProvider implements SearchProvider {
  readonly name = "openalex";
  readonly kind: SourceKind = "academic";

  constructor(private readonly maxResults = 5) {}

  async search(query: SourceQuery): Promise<SourceCandidate[]> {
    const { searchOpenAlex } = await import("@/lib/originality/retrieval/openalex");
    const result = await searchOpenAlex(query.text, this.maxResults);
    if (result.unavailableReason) {
      // Loud, not silent: "we could not ask" must never be recorded as
      // "we asked and there was nothing".
      throw new SourceProviderNotConfiguredError(`${this.name} (${result.unavailableReason})`);
    }
    return result.candidates;
  }
}

/** Generic web-search adapter. No provider selected yet — every serious option requires a paid account. */
export class WebSearchProvider implements SearchProvider {
  readonly name = "web";
  readonly kind: SourceKind = "web";

  constructor(private readonly apiKey: string | null) {}

  async search(): Promise<SourceCandidate[]> {
    if (!this.apiKey) throw new SourceProviderNotConfiguredError(this.name);
    throw new SourceProviderNotConfiguredError(this.name);
  }
}

/**
 * Returns the configured search providers.
 *
 * OpenAlex is opt-in via ORIGINALITY_ACADEMIC_SEARCH=openalex rather than
 * on by default. Turning it on changes every analysis from "no outbound
 * calls" to "one call per generated query", and that is a product
 * decision with a latency cost, not a flag to flip implicitly.
 */
export function getSearchProviders(): SearchProvider[] {
  const enabled = (process.env.ORIGINALITY_ACADEMIC_SEARCH ?? "").trim().toLowerCase();
  return enabled === "openalex" ? [new OpenAlexSearchProvider()] : [];
}

export function isExternalRetrievalAvailable(): boolean {
  return getSearchProviders().length > 0;
}

/**
 * Collapses candidates that point at the same work. Providers routinely
 * return the same paper under several URLs (publisher, mirror, preprint),
 * and counting those as separate corroborating sources would overstate
 * the evidence.
 */
export function deduplicateCandidates(candidates: SourceCandidate[]): SourceCandidate[] {
  const seen = new Map<string, SourceCandidate>();

  for (const candidate of candidates) {
    // DOI first — the only globally stable identifier here. Falling back
    // to a normalized URL, then to a normalized title.
    const key =
      candidate.doi?.toLowerCase() ??
      normalizeUrlForDedup(candidate.url) ??
      candidate.title?.toLowerCase().replace(/\s+/g, " ").trim() ??
      null;
    if (!key) continue;

    const existing = seen.get(key);
    // Keep whichever copy carries more usable metadata.
    if (!existing || metadataRichness(candidate) > metadataRichness(existing)) {
      seen.set(key, candidate);
    }
  }

  return [...seen.values()];
}

function normalizeUrlForDedup(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    // Tracking parameters and fragments don't change the underlying work.
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

function metadataRichness(c: SourceCandidate): number {
  return [c.doi, c.title, c.snippet, c.url, c.publishedYear].filter(Boolean).length + c.authors.length;
}
