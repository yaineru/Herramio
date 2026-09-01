"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/current-user";
import { checkRateLimit } from "@/lib/rate-limit/check";

/**
 * Receives a message from the public contact form.
 *
 * Replaces a mailto: link pointing at a mailbox that does not exist —
 * every message sent through it was lost, and the sender was told their
 * mail client had done its job. A contact page that quietly discards
 * messages is worse than none: it promises a channel and does not provide
 * one.
 *
 * So the contract here is narrow and literal. The success message is
 * returned only after the row is confirmed written. Nothing anywhere in
 * this file says "email sent", because no email is sent: the message is
 * stored and read in the admin panel. Saying otherwise would repeat the
 * original failure in a new form.
 */

export type ContactTopic = "problema" | "herramienta" | "privacidad" | "otro";

export interface ContactState {
  status: "idle" | "sent" | "error";
  message: string | null;
  /** Which field to point at, so the form can move focus there. */
  field?: "email" | "message" | null;
}

const MIN_MESSAGE = 10;
const MAX_MESSAGE = 4000;
const MAX_EMAIL = 254;
const MAX_NAME = 120;

/** Mirrors the CHECK constraint in 0010_contact_messages.sql. */
const VALID_TOPICS: readonly ContactTopic[] = ["problema", "herramienta", "privacidad", "otro"];

/**
 * Deliberately permissive. Server-side email validation exists to catch
 * typos and obvious junk, not to enforce RFC 5322 — every strict regex
 * ever written rejects addresses that genuinely work, and the real
 * verification is whether a reply arrives.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function text(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function submitContactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Validated here and not only in the browser: a Server Action is a
  // public HTTP endpoint, so the form's own `required` attributes prove
  // nothing about what actually arrives.
  const email = text(formData, "email").slice(0, MAX_EMAIL + 1);
  if (!email || !EMAIL_SHAPE.test(email) || email.length > MAX_EMAIL) {
    return { status: "error", message: "Revisa tu correo: sin una dirección válida no podemos responderte.", field: "email" };
  }

  const message = text(formData, "message");
  if (message.length < MIN_MESSAGE) {
    return { status: "error", message: "Cuéntanos un poco más para que podamos ayudarte.", field: "message" };
  }
  if (message.length > MAX_MESSAGE) {
    return { status: "error", message: `El mensaje es demasiado largo (máximo ${MAX_MESSAGE} caracteres).`, field: "message" };
  }

  const topicRaw = formData.get("topic");
  const topic: ContactTopic = VALID_TOPICS.includes(topicRaw as ContactTopic) ? (topicRaw as ContactTopic) : "otro";

  const name = text(formData, "name").slice(0, MAX_NAME) || null;
  const pagePath = text(formData, "pagePath").slice(0, 300) || null;

  const user = await getCurrentUser();

  // A public free-text form is a spam target. Six per hour is far above
  // what anyone with a real question needs and low enough to make the
  // form useless as a relay.
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(user ? `contact:user:${user.id}` : `contact:ip:${ip}`, 6, 60 * 60);
  if (!allowed) {
    return {
      status: "error",
      message: "Has enviado varios mensajes seguidos. Espera un rato antes de escribir otro.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("contact_messages")
      .insert({
        // Passed explicitly even when null: the insert policy checks
        // `user_id is null or user_id = auth.uid()`, and omitting the
        // column entirely makes that check fail rather than pass.
        user_id: user?.id ?? null,
        email,
        name,
        topic,
        message,
        page_path: pagePath,
      })
      .select("id")
      .single();

    // The row is read back rather than trusting the absence of an error.
    // PostgREST answers some writes it did not perform with a success
    // status, and "we received it" is not a claim to make on a status code.
    if (error || !data?.id) {
      console.error("contact insert failed", { code: error?.code, message: error?.message });
      return {
        status: "error",
        message: "Hubo un problema al enviar el mensaje. Inténtalo nuevamente en un momento.",
      };
    }
  } catch (error) {
    console.error("contact submission threw", error);
    return {
      status: "error",
      message: "Hubo un problema al enviar el mensaje. Inténtalo nuevamente en un momento.",
    };
  }

  return {
    status: "sent",
    message: "Tu mensaje fue enviado. Lo leeremos y te responderemos al correo que nos dejaste.",
  };
}
