import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getEntitlements } from "@/lib/auth/entitlements";
import { FALLBACK_FREE_ENTITLEMENTS } from "@/lib/plans/types";

export interface NavAuthState {
  isAuthenticated: boolean;
  displayName: string | null;
  email: string | null;
  planId: string;
  planLabel: string;
  /** null = unlimited. Read from the plan's own metadata — never hardcoded. */
  favoritesLimit: number | null;
}

function readFavoritesLimit(metadata: Record<string, unknown>): number | null {
  const raw = metadata.favorites_limit;
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

/**
 * Serializable auth + entitlements summary for client components (Navbar,
 * FavoriteButton) — the layout computes this server-side once and passes
 * it down (via props / EntitlementsProvider), so those components never
 * touch Supabase directly.
 */
export async function getNavAuthState(): Promise<NavAuthState> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      isAuthenticated: false,
      displayName: null,
      email: null,
      planId: FALLBACK_FREE_ENTITLEMENTS.planId,
      planLabel: FALLBACK_FREE_ENTITLEMENTS.planName,
      favoritesLimit: readFavoritesLimit(FALLBACK_FREE_ENTITLEMENTS.metadata),
    };
  }

  const entitlements = await getEntitlements();
  const displayName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;

  return {
    isAuthenticated: true,
    displayName,
    email: user.email ?? null,
    planId: entitlements.planId,
    // The plan's own `name` column is the label — no separate map to keep
    // in sync when a plan is added or renamed.
    planLabel: entitlements.planName,
    favoritesLimit: readFavoritesLimit(entitlements.metadata),
  };
}
