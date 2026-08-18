const OPEN_EVENT = "herramio-open-search";

/** Opens the global SearchPalette from anywhere (Navbar, hero, /herramientas). */
export function openSearchPalette(initialQuery = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: initialQuery }));
}

export function subscribeToSearchOpen(callback: (initialQuery: string) => void): () => void {
  function handler(e: Event) {
    callback((e as CustomEvent<string>).detail ?? "");
  }
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
