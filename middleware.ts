import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets and image optimization files — session refresh has
     * no effect there and running it would just add latency to every
     * favicon/OG-image/CSS request. Every real page (including the 129
     * public tool pages) still passes through, which is required for the
     * session cookie to stay fresh, but the middleware itself does not
     * block or redirect them — see updateSession's docstring.
     */
    // Also skips /api/webhooks/*: those requests come from the payment
    // provider, never carry a user session cookie, and shouldn't pay the
    // cost (or risk any interference) of a session-refresh round trip.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|opengraph-image|og/|api/webhooks/).*)",
  ],
};
