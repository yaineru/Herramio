"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getEntitlements } from "@/lib/auth/entitlements";
import { checkUsageLimit } from "@/lib/plans/limits";
import { isSupportedMimeType } from "@/lib/originality/extract";
import { getMonthlyAnalysisCount } from "@/lib/originality/queries";
import { runOriginalityPipeline } from "@/lib/originality/pipeline";
import { hasExpectedMagicBytes, sanitizeFilename } from "@/lib/originality/validate";

export interface UploadActionState {
  error: string | null;
}

const BUCKET = "originality-documents";

export async function uploadDocumentAction(_prev: UploadActionState, formData: FormData): Promise<UploadActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión para analizar un documento." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Selecciona un archivo." };

  if (!isSupportedMimeType(file.type)) {
    return { error: "Formato no soportado. Usa PDF, DOCX o TXT." };
  }

  const entitlements = await getEntitlements();
  const maxSizeMb = readNumericMetadata(entitlements.metadata, "originality_max_file_size_mb");
  if (maxSizeMb !== null && file.size > maxSizeMb * 1024 * 1024) {
    return { error: `El archivo supera el tamaño máximo de tu plan (${maxSizeMb} MB).` };
  }

  const monthlyCount = await getMonthlyAnalysisCount(user.id);
  const limit = checkUsageLimit(entitlements, "originality_analyses_per_month", monthlyCount);
  if (!limit.allowed) {
    return {
      error: `Alcanzaste el límite de ${limit.limit} análisis este mes en tu plan. Espera al próximo mes o mejora tu plan.`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasExpectedMagicBytes(bytes, file.type)) {
    return { error: "El archivo no parece ser del tipo que indica su extensión." };
  }

  const documentId = randomUUID();
  const storagePath = `${user.id}/${documentId}/${sanitizeFilename(file.name)}`;
  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    console.error("No se pudo subir el documento:", uploadError);
    return { error: "No se pudo subir el archivo. Inténtalo de nuevo." };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: user.id,
    original_filename: file.name,
    mime_type: file.type,
    file_size_bytes: file.size,
    storage_path: storagePath,
    status: "uploaded",
  });
  if (insertError) {
    console.error("No se pudo registrar el documento:", insertError);
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { error: "No se pudo registrar el documento. Inténtalo de nuevo." };
  }

  // Runs after the response is sent (Next.js's `after()` — no external
  // job queue). Fine for the document sizes this feature currently
  // accepts (capped by originality_max_file_size_mb); a genuinely async
  // job system is the honest next step if that stops being true — see
  // ORIGINALITY.md.
  after(() => runOriginalityPipeline(documentId));

  redirect(`/originalidad/${documentId}`);
}

export async function deleteDocumentAction(documentId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion?next=/originalidad");

  const supabase = await createClient();
  const { data: document } = await supabase.from("documents").select("storage_path, user_id").eq("id", documentId).maybeSingle();
  // RLS already prevents reading another user's row, but the ownership
  // check below is what actually gates deletion — workspace members can
  // *see* a shared document, never delete it (see documents_delete_own).
  if (!document || document.user_id !== user.id) redirect("/originalidad");

  await supabase.storage.from(BUCKET).remove([document.storage_path]);
  // Row delete cascades to chunks/citations/references/matches/report.
  await supabase.from("documents").delete().eq("id", documentId);

  redirect("/originalidad");
}

function readNumericMetadata(metadata: Record<string, unknown>, key: string): number | null {
  const raw = metadata[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

export interface DocumentStatusSnapshot {
  status: string;
  failureReason: string | null;
}

/** Lightweight poll target for DocumentStatusPoller — RLS-scoped like every other read, returns null rather than leaking a "not found vs not yours" distinction. */
export async function getDocumentStatusAction(documentId: string): Promise<DocumentStatusSnapshot | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("documents").select("status, failure_reason").eq("id", documentId).maybeSingle();
  if (!data) return null;
  return { status: data.status, failureReason: data.failure_reason };
}
