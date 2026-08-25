"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/check";

export interface AuthActionState {
  error: string | null;
}

const GENERIC_ERROR = "No se pudo completar la operación. Inténtalo de nuevo.";
const RATE_LIMITED_ERROR = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";

export async function signUpAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password) return { error: "Correo y contraseña son obligatorios." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  // IP-based (not just email-based): the real abuse pattern for signup is
  // one attacker trying many different emails, not many attempts on one.
  const ip = await getClientIp();
  const allowed = await checkRateLimit(`auth:signup:ip:${ip}`, 5, 60 * 60);
  if (!allowed) return { error: RATE_LIMITED_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: `${SITE.url}/auth/callback?next=/cuenta`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Ya existe una cuenta con ese correo. Inicia sesión en su lugar." };
    }
    return { error: GENERIC_ERROR };
  }

  redirect("/registro/verifica-tu-correo");
}

export async function signInAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"), "/cuenta");

  if (!email || !password) return { error: "Correo y contraseña son obligatorios." };

  // Keyed by email, not IP: the realistic attack here is credential
  // stuffing against one account from many IPs, so the bucket that
  // actually matters is the target account itself.
  const allowed = await checkRateLimit(`auth:signin:${email.toLowerCase()}`, 10, 15 * 60);
  if (!allowed) return { error: RATE_LIMITED_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Ingresa tu correo electrónico." };

  // Prevents using this form to email-bomb someone else's inbox with
  // reset links. Fails the same way a normal error would (generic
  // message), never revealing that a limit specifically was hit for this
  // address — same enumeration-resistance reasoning as the comment below.
  const allowed = await checkRateLimit(`auth:reset:${email.toLowerCase()}`, 3, 60 * 60);
  if (!allowed) return { error: RATE_LIMITED_ERROR };

  const supabase = await createClient();
  // Deliberately don't reveal whether the email exists — same message either
  // way, so this can't be used to enumerate registered accounts.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE.url}/auth/callback?next=/actualizar-contrasena`,
  });

  redirect("/recuperar-contrasena/revisa-tu-correo");
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: GENERIC_ERROR };

  redirect("/cuenta");
}
