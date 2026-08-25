import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

/**
 * Landing point for every Supabase Auth email link (signup confirmation,
 * password reset, invite). Exchanges the one-time `code` for a real session
 * cookie, then redirects to `next` — never trusts `next` blindly (must be a
 * same-site relative path) to avoid an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/cuenta");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/iniciar-sesion?error=enlace_invalido`);
}
