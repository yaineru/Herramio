import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCurrentUserAdmin } from "@/lib/admin/auth";
import type { FeedbackRow } from "@/lib/supabase/database.types";

/**
 * Admin-side reads and writes for the beta feedback channel.
 *
 * Every function here re-checks `isCurrentUserAdmin()` itself rather than
 * trusting that a page already did. The admin client bypasses RLS by
 * design, so the authorisation check IS the security boundary — putting
 * it only in the page would mean any future caller silently inherits full
 * access to everyone's feedback.
 */

export type FeedbackStatus = FeedbackRow["status"];
export type FeedbackKind = FeedbackRow["kind"];

/** The order work should be looked at in: unseen first. */
export const STATUS_ORDER: readonly FeedbackStatus[] = ["new", "reviewed", "resolved"];

export interface FeedbackCounts {
  total: number;
  new: number;
  reviewed: number;
  resolved: number;
}

export class NotAuthorisedError extends Error {
  constructor() {
    super("Solo un administrador puede gestionar el feedback.");
    this.name = "NotAuthorisedError";
  }
}

async function requireAdmin(): Promise<void> {
  if (!(await isCurrentUserAdmin())) throw new NotAuthorisedError();
}

export interface FeedbackFilters {
  status?: FeedbackStatus | "all";
  kind?: FeedbackKind | "all";
  limit?: number;
}

export async function listFeedback(filters: FeedbackFilters = {}): Promise<FeedbackRow[]> {
  await requireAdmin();

  const admin = createAdminClient();
  let query = admin
    .from("feedback")
    .select("*")
    // Newest first within the list. The page groups by status so that
    // unread work surfaces above things already handled.
    .order("created_at", { ascending: false })
    .limit(Math.min(filters.limit ?? 100, 500));

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.kind && filters.kind !== "all") query = query.eq("kind", filters.kind);

  const { data, error } = await query;
  if (error) {
    console.error("admin feedback list failed", { code: error.code });
    return [];
  }
  return data ?? [];
}

export async function getFeedbackCounts(): Promise<FeedbackCounts> {
  await requireAdmin();

  const admin = createAdminClient();
  const { data, error } = await admin.from("feedback").select("status");
  if (error || !data) {
    console.error("admin feedback counts failed", { code: error?.code });
    return { total: 0, new: 0, reviewed: 0, resolved: 0 };
  }

  const counts: FeedbackCounts = { total: data.length, new: 0, reviewed: 0, resolved: 0 };
  for (const row of data) {
    if (row.status === "new") counts.new++;
    else if (row.status === "reviewed") counts.reviewed++;
    else if (row.status === "resolved") counts.resolved++;
  }
  return counts;
}

/**
 * Moves one item's status.
 *
 * Returns the updated row rather than a boolean so the caller can confirm
 * the change actually landed. PostgREST answers an update that matched
 * nothing with a success status and an empty body, so "no error" is not
 * evidence that anything changed.
 */
export async function setFeedbackStatus(id: string, status: FeedbackStatus): Promise<FeedbackRow | null> {
  await requireAdmin();

  if (!STATUS_ORDER.includes(status)) throw new Error(`Estado no válido: ${status}`);

  const admin = createAdminClient();
  const { data, error } = await admin.from("feedback").update({ status }).eq("id", id).select("*").maybeSingle();

  if (error) {
    console.error("admin feedback status update failed", { code: error.code });
    return null;
  }
  return data ?? null;
}
