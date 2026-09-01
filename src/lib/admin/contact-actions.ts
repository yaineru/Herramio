"use server";

import { revalidatePath } from "next/cache";
import { setContactStatus, NotAuthorisedError } from "@/lib/admin/contact";
import type { ContactStatus } from "@/lib/supabase/database.types";

/**
 * Status transitions from the admin UI.
 *
 * The authorisation check lives in setContactStatus, not here. A Server
 * Action is a public HTTP endpoint — anyone who can reach the app can
 * invoke it with any arguments — so the check has to sit next to the
 * database call, never in the component that renders the button.
 */

export interface ContactActionState {
  status: "idle" | "done" | "error";
  message: string | null;
}

export async function updateContactStatusAction(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const id = formData.get("id");
  const next = formData.get("status");

  if (typeof id !== "string" || !id) {
    return { status: "error", message: "Falta el identificador." };
  }

  try {
    const updated = await setContactStatus(id, next as ContactStatus);
    if (!updated) {
      return { status: "error", message: "No se encontró ese mensaje." };
    }
    revalidatePath("/admin");
    return { status: "done", message: null };
  } catch (error) {
    if (error instanceof NotAuthorisedError) {
      // Deliberately indistinguishable from any other failure: someone
      // probing this endpoint learns nothing about whether the id exists.
      return { status: "error", message: "No autorizado." };
    }
    console.error("contact status action failed", error);
    return { status: "error", message: "No se pudo actualizar." };
  }
}
