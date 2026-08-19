const FAVORITES_STORAGE_KEY = "herramio-favorites";
const FAVORITES_EVENT = "herramio-favorites-change";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

export function getFavorites(): string[] {
  return readFavorites();
}

export function isFavorite(toolId: string): boolean {
  return readFavorites().includes(toolId);
}

export function toggleFavorite(toolId: string): boolean {
  const current = readFavorites();
  const next = current.includes(toolId)
    ? current.filter((id) => id !== toolId)
    : [...current, toolId];
  writeFavorites(next);
  return next.includes(toolId);
}

/**
 * useSyncExternalStore bindings (same pattern as consent.ts): reading
 * localStorage from a useEffect and calling setState synchronously would
 * trigger React's cascading-render warning, so components subscribe to
 * this external store instead.
 */
export function subscribeToFavorites(callback: () => void): () => void {
  window.addEventListener(FAVORITES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getFavoritesSnapshot(): string {
  // Returned as a joined string so useSyncExternalStore's Object.is check
  // treats unchanged data as the same snapshot instead of a new array ref.
  return readFavorites().join(",");
}

export function getFavoritesServerSnapshot(): string {
  return "";
}
