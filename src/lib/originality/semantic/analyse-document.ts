import "server-only";
import { cosineSimilarity, EmbeddingCache, SEMANTIC_MATCH_THRESHOLD } from "@/lib/originality/semantic/engine";
import { embedChunks, isWorthEmbedding, type EmbeddableChunk } from "@/lib/originality/semantic/embed-chunks";
import { getEmbeddingProvider } from "@/lib/originality/semantic/resolve";
import { STORED_EMBEDDING_DIMENSIONS } from "@/lib/originality/semantic/provider";

/**
 * The semantic half of the analysis: embed this document's chunks, compare
 * them against the corpus's stored vectors, and report which pairs look
 * derived.
 *
 * Two deliberate choices worth stating.
 *
 * The comparison runs in process rather than through the
 * match_document_chunks RPC. That function is SECURITY DEFINER and
 * re-applies the caller's own visibility with auth.uid(), which is exactly
 * right for a request made by a signed-in user and useless here: the
 * pipeline is a background job holding a service-role client, so auth.uid()
 * is null and the RPC would correctly return nothing. The corpus is
 * already scoped by the caller to this user's own documents (or their
 * workspace's) and capped, so comparing those vectors directly is both
 * correct and bounded.
 *
 * Failure never fails the analysis. An embedding provider is a paid
 * network call with its own outages; when it breaks, the honest outcome is
 * a complete lexical report that says semantic analysis was unavailable —
 * not a failed upload, and never a fabricated zero.
 */

export interface SemanticMatch {
  chunkId: number;
  matchedChunkId: number;
  matchedDocumentId: string;
  similarity: number;
}

export interface CorpusEmbedding {
  chunkId: number;
  documentId: string;
  vector: number[];
}

export interface SemanticAnalysisResult {
  /** Vectors generated for this document, ready to persist. */
  embeddings: { chunkId: number; vector: number[] }[];
  matches: SemanticMatch[];
  /** How many vectors the provider actually produced. Feeds cost tracking. */
  embeddingsGenerated: number;
  model: string | null;
  /** Set when semantic analysis could not run; the report must say so. */
  unavailableReason: string | null;
}

const UNAVAILABLE = (reason: string): SemanticAnalysisResult => ({
  embeddings: [],
  matches: [],
  embeddingsGenerated: 0,
  model: null,
  unavailableReason: reason,
});

export async function analyseSemantically(
  chunks: EmbeddableChunk[],
  corpus: CorpusEmbedding[],
): Promise<SemanticAnalysisResult> {
  const provider = getEmbeddingProvider();
  if (!provider) return UNAVAILABLE("no_provider_configured");

  const worthEmbedding = chunks.filter(isWorthEmbedding);
  if (worthEmbedding.length === 0) return UNAVAILABLE("no_chunk_long_enough");

  let embeddings: { chunkId: number; vector: number[] }[];
  let embeddingsGenerated = 0;

  try {
    const result = await embedChunks(provider, worthEmbedding, new EmbeddingCache());
    embeddings = result.embeddings;
    embeddingsGenerated = result.providerCallCount;
  } catch (error) {
    // Deliberately swallowed into a reason string. See the note above: a
    // provider outage degrades the report, it does not break the upload.
    console.error("Semantic analysis failed; continuing with the lexical engine only.", error);
    return UNAVAILABLE(error instanceof Error ? `provider_error: ${error.message}` : "provider_error");
  }

  const matches: SemanticMatch[] = [];
  for (const { chunkId, vector } of embeddings) {
    if (vector.length !== STORED_EMBEDDING_DIMENSIONS) continue;
    for (const candidate of corpus) {
      if (candidate.vector.length !== vector.length) continue;
      const similarity = cosineSimilarity(vector, candidate.vector);
      if (similarity < SEMANTIC_MATCH_THRESHOLD) continue;
      matches.push({
        chunkId,
        matchedChunkId: candidate.chunkId,
        matchedDocumentId: candidate.documentId,
        similarity,
      });
    }
  }

  return {
    embeddings,
    matches,
    embeddingsGenerated,
    model: provider.metadata.model,
    unavailableReason: null,
  };
}
