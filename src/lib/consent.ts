export const CONSENT_STORAGE_KEY = "qr-toolkit-cookie-consent";
export type ConsentValue = "granted" | "denied";

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setStoredConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
}

/**
 * useSyncExternalStore bindings for consent state (backed by localStorage +
 * a custom event). This avoids reading localStorage in a useEffect and
 * calling setState synchronously, which React flags as a cascading-render
 * anti-pattern — subscribing to an external store is the recommended fix.
 */
export function subscribeToConsent(callback: () => void): () => void {
  window.addEventListener("cookie-consent-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("cookie-consent-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function getConsentSnapshot(): ConsentValue | null {
  return getStoredConsent();
}

export function getConsentServerSnapshot(): ConsentValue | null {
  return null;
}
