"use server";

import { revalidatePath } from "next/cache";
import { setFeedbackStatus, NotAuthorisedError, type FeedbackStatus } from "@/lib/admin/feedback";

/**
 * Status transitions from the admin UI.
 *
 * The authorisation check lives in setFeedbackStatus, not here. A Server
 * Action is a public HTTP endpoint — anyone who can reach the app can
 * invoke it with any arguments — so the check has to sit next to the
 * database call rather than in the component that renders the button.
 */

export interface FeedbackActionState {
  status: "idle" | "done" | "error";
  message: string | null;
}

export async function updateFeedbackStatusAction(
  _prev: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const id = formData.get("id");
  const next = formData.get("status");

  if (typeof id !== "string" || !id) {
    return { status: "error", message: "Falta el identificador." };
  }

  try {
    const updated = await setFeedbackStatus(id, next as FeedbackStatus);
    if (!updated) {
      // PostgREST answers an update that matched nothing with success and
      // an empty body, so this is checked against the returned row rather
      // than against the absence of an error.
      return { status: "error", message: "No se encontró ese comentario." };
    }
    revalidatePath("/admin");
    return { status: "done", message: null };
  } catch (error) {
    if (error instanceof NotAuthorisedError) {
      // Deliberately the same shape as any other failure: a non-admin
      // probing this endpoint learns nothing about whether the id exists.
      return { status: "error", message: "No autorizado." };
    }
    console.error("feedback status action failed", error);
    return { status: "error", message: "No se pudo actualizar." };
  }
}
