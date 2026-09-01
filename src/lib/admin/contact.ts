import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin/auth";
import type { ContactMessageRow, ContactStatus, ContactTopic } from "@/lib/supabase/database.types";

/**
 * Admin-side reads and writes for contact messages.
 *
 * Every function re-checks `isCurrentUserAdmin()` itself rather than
 * trusting that a page already did. `contact_messages` has NO row-level
 * read policy at all — not even "read your own" — so the only way to see
 * these rows is the service-role client used here. That makes this
 * authorisation check the entire security boundary, and it holds more
 * weight than the equivalent in the feedback module because these rows
 * contain email addresses.
 */

export const CONTACT_STATUS_ORDER: readonly ContactStatus[] = ["new", "reviewed", "resolved", "archived"];

export const CONTACT_TOPIC_LABELS: Record<ContactTopic, string> = {
  problema: "Algo no funciona",
  herramienta: "Falta una herramienta",
  privacidad: "Privacidad o datos",
  otro: "Otro",
};

export interface ContactCounts {
  total: number;
  new: number;
  reviewed: number;
  resolved: number;
  archived: number;
}

export class NotAuthorisedError extends Error {
  constructor() {
    super("Solo un administrador puede ver los mensajes de contacto.");
    this.name = "NotAuthorisedError";
  }
}

async function requireAdmin(): Promise<void> {
  if (!(await isCurrentUserAdmin())) throw new NotAuthorisedError();
}

export interface ContactFilters {
  status?: ContactStatus | "all";
  topic?: ContactTopic | "all";
  limit?: number;
}

export async function listContactMessages(filters: ContactFilters = {}): Promise<ContactMessageRow[]> {
  await requireAdmin();

  const admin = createAdminClient();
  let query = admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(filters.limit ?? 100, 500));

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.topic && filters.topic !== "all") query = query.eq("topic", filters.topic);

  const { data, error } = await query;
  if (error) {
    console.error("admin contact list failed", { code: error.code });
    return [];
  }
  return data ?? [];
}

export async function getContactCounts(): Promise<ContactCounts> {
  await requireAdmin();

  const admin = createAdminClient();
  // Only the status column: counting does not require reading anybody's
  // email or message.
  const { data, error } = await admin.from("contact_messages").select("status");
  if (error || !data) {
    console.error("admin contact counts failed", { code: error?.code });
    return { total: 0, new: 0, reviewed: 0, resolved: 0, archived: 0 };
  }

  const counts: ContactCounts = { total: data.length, new: 0, reviewed: 0, resolved: 0, archived: 0 };
  for (const row of data) {
    if (row.status === "new") counts.new++;
    else if (row.status === "reviewed") counts.reviewed++;
    else if (row.status === "resolved") counts.resolved++;
    else if (row.status === "archived") counts.archived++;
  }
  return counts;
}

/**
 * Moves one message's status.
 *
 * Returns the updated row rather than a boolean: PostgREST answers an
 * update that matched nothing with a success status and an empty body, so
 * "no error" is not evidence that anything changed.
 */
export async function setContactStatus(id: string, status: ContactStatus): Promise<ContactMessageRow | null> {
  await requireAdmin();

  if (!CONTACT_STATUS_ORDER.includes(status)) throw new Error(`Estado no válido: ${status}`);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("admin contact status update failed", { code: error.code });
    return null;
  }
  return data ?? null;
}
