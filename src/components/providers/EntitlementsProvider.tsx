"use client";

import { createContext, useContext } from "react";

interface EntitlementsContextValue {
  /** null = unlimited. */
  favoritesLimit: number | null;
}

const EntitlementsContext = createContext<EntitlementsContextValue>({ favoritesLimit: null });

/**
 * Makes the current user's plan-derived limits available to client
 * components buried deep in the tree (e.g. `FavoriteButton` on any of the
 * 129 tool pages) without prop-drilling through every page — the value is
 * computed once, server-side, in the root layout via `getNavAuthState()`.
 */
export function EntitlementsProvider({
  favoritesLimit,
  children,
}: {
  favoritesLimit: number | null;
  children: React.ReactNode;
}) {
  return <EntitlementsContext.Provider value={{ favoritesLimit }}>{children}</EntitlementsContext.Provider>;
}

export function useFavoritesLimit(): number | null {
  return useContext(EntitlementsContext).favoritesLimit;
}
