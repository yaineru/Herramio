"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/current-user";
import { checkRateLimit } from "@/lib/rate-limit/check";

/**
 * Receives beta feedback.
 *
 * Written to be hard to lose and hard to abuse, in that order. The point
 * of a beta is to learn what breaks and what confuses people, and the
 * most valuable comment is usually the one from someone about to give up
 * — so this never requires an account, and never fails the submission for
 * a reason the person could not have anticipated.
 */

export type FeedbackKind = "comment" | "problem" | "idea";

export interface FeedbackState {
  status: "idle" | "sent" | "error";
  message: string | null;
}

const MIN_LENGTH = 3;
const MAX_LENGTH = 4000;

/** Mirrors the CHECK constraint in 0008_feedback.sql. */
const VALID_KINDS: readonly FeedbackKind[] = ["comment", "problem", "idea"];

export async function submitFeedbackAction(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const raw = formData.get("message");
  const message = typeof raw === "string" ? raw.trim() : "";

  if (message.length < MIN_LENGTH) {
    return { status: "error", message: "Escribe al menos unas palabras para que podamos entenderte." };
  }
  if (message.length > MAX_LENGTH) {
    return { status: "error", message: `El mensaje es demasiado largo (máximo ${MAX_LENGTH} caracteres).` };
  }

  const kindRaw = formData.get("kind");
  const kind: FeedbackKind = VALID_KINDS.includes(kindRaw as FeedbackKind) ? (kindRaw as FeedbackKind) : "comment";

  const pagePathRaw = formData.get("pagePath");
  const pagePath = typeof pagePathRaw === "string" ? pagePathRaw.slice(0, 300) : null;

  const user = await getCurrentUser();

  // Rate limited by IP for anonymous submissions and by user id otherwise.
  // A feedback box is a free-text field open to the internet, so it is a
  // spam target like any other; the limit is generous enough that nobody
  // reporting a real problem will hit it.
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(user ? `feedback:user:${user.id}` : `feedback:ip:${ip}`, 10, 60 * 60);
  if (!allowed) {
    return {
      status: "error",
      message: "Has enviado varios mensajes seguidos. Espera un momento e inténtalo otra vez.",
    };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("feedback").insert({
      user_id: user?.id ?? null,
      kind,
      message,
      page_path: pagePath,
      // Deliberately minimal. No document text, no email, no user agent
      // string — nothing that turns a feedback box into a data-collection
      // surface the person did not agree to.
      context: {},
    });

    if (error) {
      // Logged for us, generic for them: the reason a database insert
      // failed is not something the person can act on, and echoing it
      // back leaks schema detail.
      console.error("feedback insert failed", { code: error.code, message: error.message });
      return {
        status: "error",
        message: "No pudimos guardar tu mensaje. Vuelve a intentarlo en un momento.",
      };
    }
  } catch (error) {
    console.error("feedback submission threw", error);
    return { status: "error", message: "No pudimos guardar tu mensaje. Vuelve a intentarlo en un momento." };
  }

  return { status: "sent", message: "Gracias. Lo hemos recibido." };
}
