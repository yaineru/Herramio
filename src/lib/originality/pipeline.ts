import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractDocumentText } from "@/lib/originality/extract";
import { chunkText } from "@/lib/originality/chunk";
import { detectInTextCitations, detectReferences } from "@/lib/originality/citations";
import { compareChunks } from "@/lib/originality/similarity";
import { computeReportScore, ENGINE_VERSION, type ChunkBestMatch } from "@/lib/originality/report-score";
import { verifyReferenceViaCrossref } from "@/lib/originality/providers/crossref";

// Bounds worst-case comparison cost — this is O(newChunks × corpusChunks)
// pure-CPU work (no external calls), but an unbounded corpus would still
// grow linearly with every document ever uploaded. 50 recent documents is
// a generous corpus for "compare against my own / my team's other work"
// without needing pagination logic yet.
const MAX_CORPUS_DOCUMENTS = 50;

// A thesis with 80 references shouldn't turn one upload into 80 outbound
// Crossref calls — cap it, and run the capped set a few at a time rather
// than all at once (politeness, and bounded wall-clock time inside the
// after() background job).
const MAX_REFERENCES_TO_VERIFY = 15;
const VERIFY_CONCURRENCY = 3;

async function verifyReferencesInBatches(
  references: { rawText: string }[],
): Promise<Map<number, Awaited<ReturnType<typeof verifyReferenceViaCrossref>>>> {
  const results = new Map<number, Awaited<ReturnType<typeof verifyReferenceViaCrossref>>>();
  const toVerify = references.slice(0, MAX_REFERENCES_TO_VERIFY);

  for (let i = 0; i < toVerify.length; i += VERIFY_CONCURRENCY) {
    const batch = toVerify.slice(i, i + VERIFY_CONCURRENCY);
    const batchResults = await Promise.all(
      // Always the FULL reference line, never the parsed title. Measured
      // against the live API: the title parser greedily swallows the
      // journal name too ("Attention is all you need. Advances in Neural
      // Information Processing Systems."), and that extra text dilutes
      // the title-similarity score below the acceptance threshold — the
      // canonical paper came back `not_found` from parsedTitle but
      // `verified` from rawText. Crossref's query.bibliographic is built
      // to take a whole bibliographic string, so give it one.
      batch.map((ref) => verifyReferenceViaCrossref(ref.rawText)),
    );
    batch.forEach((_, idx) => results.set(i + idx, batchResults[idx]));
  }

  return results;
}

/**
 * Runs the full pipeline for a document that's already been uploaded to
 * storage with a `documents` row in status 'uploaded'. Always leaves the
 * document in a terminal status ('completed' or 'failed') — never throws
 * out of this function with the row stuck mid-processing.
 */
export async function runOriginalityPipeline(documentId: string): Promise<void> {
  const admin = createAdminClient();

  try {
    const { data: document, error: docError } = await admin.from("documents").select("*").eq("id", documentId).single();
    if (docError || !document) throw new Error(`Documento ${documentId} no encontrado.`);

    await admin.from("documents").update({ status: "processing" }).eq("id", documentId);

    const { data: fileData, error: downloadError } = await admin.storage
      .from("originality-documents")
      .download(document.storage_path);
    if (downloadError || !fileData) throw new Error(`No se pudo descargar el archivo: ${downloadError?.message}`);

    const bytes = new Uint8Array(await fileData.arrayBuffer());
    const extraction = await extractDocumentText(bytes, document.mime_type);

    if (extraction.isEmpty) {
      await admin
        .from("documents")
        .update({
          status: "failed",
          failure_reason:
            "No se pudo extraer texto de este documento. Si es un PDF escaneado (imagen), necesita OCR, que esta versión todavía no soporta.",
        })
        .eq("id", documentId);
      return;
    }

    const wordCount = extraction.text.split(/\s+/).filter(Boolean).length;
    await admin
      .from("documents")
      .update({ status: "analyzing", word_count: wordCount, page_count: extraction.pageCount })
      .eq("id", documentId);

    const chunks = chunkText(extraction.text);
    if (chunks.length === 0) throw new Error("El documento no produjo ningún fragmento analizable.");

    const { data: insertedChunks, error: chunksError } = await admin
      .from("document_chunks")
      .insert(
        chunks.map((c) => ({
          document_id: documentId,
          sequence: c.sequence,
          text: c.text,
          normalized_text: c.normalizedText,
          word_count: c.wordCount,
        })),
      )
      .select("id, sequence, normalized_text");
    if (chunksError || !insertedChunks) throw new Error(`No se pudieron guardar los fragmentos: ${chunksError?.message}`);

    // Citations + references (regex-based, no external calls).
    //
    // Citation detection stops at the bibliography. Everything from the
    // "Referencias" heading onwards is a reference list, and scanning it
    // for citations double-counts every entry: the author-year part
    // matches the APA pattern and the "[1]" label matches the numeric one.
    // Measured on the QA document, that turned one real in-text citation
    // into five, and the citation graph then computed its orphan and
    // uncited counts from the phantoms.
    const allCitations = detectInTextCitations(chunks.map((c) => c.text)).map(({ chunkIndex, citation }) => ({
      ...citation,
      chunkId: insertedChunks[chunkIndex]?.id ?? null,
    }));
    if (allCitations.length > 0) {
      await admin.from("citations").insert(
        allCitations.map((c) => ({
          document_id: documentId,
          chunk_id: c.chunkId,
          raw_text: c.rawText,
          style_guess: c.styleGuess,
        })),
      );
    }

    const references = detectReferences(extraction.text);
    if (references.length > 0) {
      // Real verification against Crossref's free, keyless metadata index
      // — never fabricated, and 'not_found' is stored as exactly that,
      // not as evidence the reference is fake (see ORIGINALITY.md).
      const verifications = await verifyReferencesInBatches(references);

      await admin.from("document_references").insert(
        references.map((r, idx) => {
          const verification = verifications.get(idx);
          return {
            document_id: documentId,
            raw_text: r.rawText,
            parsed_author: r.parsedAuthor,
            parsed_year: r.parsedYear,
            parsed_title: r.parsedTitle,
            verification_status: verification?.status ?? "unverified",
            matched_doi: verification?.matchedDoi ?? null,
            matched_title: verification?.matchedTitle ?? null,
            matched_url: verification?.matchedUrl ?? null,
          };
        }),
      );
    }

    // Internal-corpus comparison: only this user's own other documents, or
    // (if this document belongs to a workspace) other documents in that
    // same workspace — never across unrelated users. This is the only
    // real comparison corpus available without a configured web-search or
    // licensed-database provider; see providers.ts.
    let corpusQuery = admin
      .from("documents")
      .select("id")
      .eq("status", "completed")
      .neq("id", documentId)
      .order("created_at", { ascending: false })
      .limit(MAX_CORPUS_DOCUMENTS);
    corpusQuery = document.workspace_id
      ? corpusQuery.eq("workspace_id", document.workspace_id)
      : corpusQuery.eq("user_id", document.user_id).is("workspace_id", null);
    const { data: corpusDocs } = await corpusQuery;

    const bestMatchPerChunk = new Map<number, ChunkBestMatch>();
    const matchRows: {
      document_id: string;
      chunk_id: number;
      matched_document_id: string;
      match_type: "exact" | "near_exact";
      similarity_score: number;
      matched_text: string;
    }[] = [];

    if (corpusDocs && corpusDocs.length > 0) {
      const corpusDocIds = corpusDocs.map((d) => d.id);
      const { data: corpusChunks } = await admin
        .from("document_chunks")
        .select("id, document_id, text, normalized_text")
        .in("document_id", corpusDocIds);

      for (const chunk of insertedChunks) {
        bestMatchPerChunk.set(chunk.id, { type: null });
        for (const corpusChunk of corpusChunks ?? []) {
          const result = compareChunks(chunk.normalized_text, corpusChunk.normalized_text);
          if (!result.type) continue;

          matchRows.push({
            document_id: documentId,
            chunk_id: chunk.id,
            matched_document_id: corpusChunk.document_id,
            match_type: result.type,
            similarity_score: result.score,
            matched_text: corpusChunk.text,
          });

          const current = bestMatchPerChunk.get(chunk.id)!;
          if (result.type === "exact" || (result.type === "near_exact" && current.type !== "exact")) {
            bestMatchPerChunk.set(chunk.id, { type: result.type });
          }
        }
      }

      if (matchRows.length > 0) await admin.from("similarity_matches").insert(matchRows);
    } else {
      for (const chunk of insertedChunks) bestMatchPerChunk.set(chunk.id, { type: null });
    }

    const score = computeReportScore([...bestMatchPerChunk.values()]);

    await admin.from("originality_reports").insert({
      document_id: documentId,
      similarity_index: score.similarityIndex,
      exact_ratio: score.exactRatio,
      near_exact_ratio: score.nearExactRatio,
      semantic_ratio: score.semanticRatio,
      citation_count: allCitations.length,
      reference_count: references.length,
      engine_version: ENGINE_VERSION,
      status: "completed",
    });

    await admin.from("documents").update({ status: "completed" }).eq("id", documentId);
  } catch (error) {
    console.error(`Originality pipeline failed for document ${documentId}:`, error);
    await admin
      .from("documents")
      .update({
        status: "failed",
        failure_reason: error instanceof Error ? error.message : "Error desconocido durante el análisis.",
      })
      .eq("id", documentId);
  }
}
