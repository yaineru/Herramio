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
 * OpenAlex adapter. Researched, not guessed: OpenAlex now requires a free
 * account and API key for production use (it previously did not), so the
 * adapter is written but stays inactive until a key exists. It throws
 * rather than returning empty results, so a misconfiguration is loud
 * instead of silently reporting "no sources found".
 */
export class OpenAlexSearchProvider implements SearchProvider {
  readonly name = "openalex";
  readonly kind: SourceKind = "academic";

  constructor(private readonly apiKey: string | null) {}

  async search(): Promise<SourceCandidate[]> {
    if (!this.apiKey) throw new SourceProviderNotConfiguredError(this.name);
    throw new SourceProviderNotConfiguredError(this.name);
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
 * Returns the configured search providers. Empty today, which the report
 * surfaces as "no external sources were consulted" — an accurate
 * statement, not a failure.
 */
export function getSearchProviders(): SearchProvider[] {
  return [];
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
