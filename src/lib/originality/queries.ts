import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  OriginalityChunk,
  OriginalityCitation,
  OriginalityDocument,
  OriginalityReference,
  OriginalityReport,
  OriginalitySimilarityMatch,
} from "@/lib/originality/types";
import type { DocumentRow } from "@/lib/supabase/database.types";

function toDocument(row: DocumentRow): OriginalityDocument {
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    storagePath: row.storage_path,
    status: row.status,
    failureReason: row.failure_reason,
    pageCount: row.page_count,
    wordCount: row.word_count,
    language: row.language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Every document this user can see — their own, plus their workspace's (RLS-enforced, this just orders/shapes it). */
export const getDocumentsForCurrentUser = cache(async (): Promise<OriginalityDocument[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(toDocument);
});

export const getDocumentById = cache(async (documentId: string): Promise<OriginalityDocument | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).maybeSingle();
  if (error || !data) return null;
  return toDocument(data);
});

export const getDocumentChunks = cache(async (documentId: string): Promise<OriginalityChunk[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_chunks")
    .select("*")
    .eq("document_id", documentId)
    .order("sequence", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    sequence: row.sequence,
    pageNumber: row.page_number,
    text: row.text,
    normalizedText: row.normalized_text,
    wordCount: row.word_count,
  }));
});

export const getDocumentCitations = cache(async (documentId: string): Promise<OriginalityCitation[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("citations").select("*").eq("document_id", documentId);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    chunkId: row.chunk_id,
    rawText: row.raw_text,
    styleGuess: row.style_guess,
  }));
});

export const getDocumentReferences = cache(async (documentId: string): Promise<OriginalityReference[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("document_references").select("*").eq("document_id", documentId);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    rawText: row.raw_text,
    parsedAuthor: row.parsed_author,
    parsedYear: row.parsed_year,
    parsedTitle: row.parsed_title,
    verificationStatus: row.verification_status,
    matchedDoi: row.matched_doi,
    matchedTitle: row.matched_title,
    matchedUrl: row.matched_url,
  }));
});

export const getDocumentMatches = cache(async (documentId: string): Promise<OriginalitySimilarityMatch[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("similarity_matches")
    .select("*")
    .eq("document_id", documentId)
    .order("similarity_score", { ascending: false });
  if (error || !data) return [];

  // Two simple queries instead of a nested/embedded select — this
  // project's Supabase client types are hand-written (no live schema
  // introspection yet, see the top-of-file note), and an embedded select
  // needs an accurate `Relationships` declaration to type-check safely.
  // Filenames only, never the matched document's actual content.
  const matchedDocumentIds = [...new Set(data.map((row) => row.matched_document_id).filter((id): id is string => id !== null))];
  const filenameById = new Map<string, string>();
  if (matchedDocumentIds.length > 0) {
    const { data: matchedDocs } = await supabase
      .from("documents")
      .select("id, original_filename")
      .in("id", matchedDocumentIds);
    for (const doc of matchedDocs ?? []) filenameById.set(doc.id, doc.original_filename);
  }

  return data.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    chunkId: row.chunk_id,
    matchedDocumentId: row.matched_document_id,
    matchedSourceId: row.matched_source_id,
    matchType: row.match_type,
    similarityScore: row.similarity_score,
    matchedText: row.matched_text,
    matchedDocumentFilename: row.matched_document_id ? (filenameById.get(row.matched_document_id) ?? null) : null,
  }));
});

export const getReportForDocument = cache(async (documentId: string): Promise<OriginalityReport | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("originality_reports")
    .select("*")
    .eq("document_id", documentId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    documentId: data.document_id,
    similarityIndex: data.similarity_index,
    exactRatio: data.exact_ratio,
    nearExactRatio: data.near_exact_ratio,
    semanticRatio: data.semantic_ratio,
    citationCount: data.citation_count,
    referenceCount: data.reference_count,
    engineVersion: data.engine_version,
    status: data.status,
    createdAt: data.created_at,
  };
});

/** How many documents this user has uploaded since the start of the current calendar month — the basis for the originality_analyses_per_month entitlement. */
export const getMonthlyAnalysisCount = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  return count ?? 0;
});
