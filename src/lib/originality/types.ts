import type {
  CitationStyle,
  DocumentStatus,
  MatchType,
  OriginalityReportStatus,
  ReferenceVerificationStatus,
  SourceType,
} from "@/lib/supabase/database.types";

export type { CitationStyle, DocumentStatus, MatchType, OriginalityReportStatus, ReferenceVerificationStatus, SourceType };

export interface OriginalityDocument {
  id: string;
  userId: string;
  workspaceId: string | null;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  storagePath: string;
  status: DocumentStatus;
  failureReason: string | null;
  pageCount: number | null;
  wordCount: number | null;
  language: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OriginalityChunk {
  id: number;
  documentId: string;
  sequence: number;
  pageNumber: number | null;
  text: string;
  normalizedText: string;
  wordCount: number;
}

export interface OriginalityCitation {
  id: number;
  documentId: string;
  chunkId: number | null;
  rawText: string;
  styleGuess: CitationStyle | null;
}

export interface OriginalityReference {
  id: number;
  documentId: string;
  rawText: string;
  parsedAuthor: string | null;
  parsedYear: string | null;
  parsedTitle: string | null;
  verificationStatus: ReferenceVerificationStatus;
  matchedDoi: string | null;
  matchedTitle: string | null;
  matchedUrl: string | null;
}

export interface OriginalitySimilarityMatch {
  id: number;
  documentId: string;
  chunkId: number;
  matchedDocumentId: string | null;
  matchedSourceId: number | null;
  matchType: MatchType;
  similarityScore: number;
  matchedText: string;
  /** Populated for internal matches only (the other document's own filename — never its full content). Null for anything else. */
  matchedDocumentFilename?: string | null;
}

export interface OriginalityReport {
  id: string;
  documentId: string;
  similarityIndex: number;
  exactRatio: number;
  nearExactRatio: number;
  semanticRatio: number;
  citationCount: number;
  referenceCount: number;
  engineVersion: string;
  status: OriginalityReportStatus;
  createdAt: string;
}
