const HISTORY_STORAGE_KEY = "herramio-history";
const HISTORY_EVENT = "herramio-history-change";
const MAX_HISTORY_ITEMS = 12;

// Only slug, name and timestamp are stored — never file contents, form
// values, or any other user-entered data (see PRODUCT-ROADMAP.md).
export interface HistoryEntry {
  slug: string;
  name: string;
  timestamp: number;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.slug === "string" && typeof v.name === "string" && typeof v.timestamp === "number";
}

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isHistoryEntry) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(HISTORY_EVENT));
}

export function getHistory(): HistoryEntry[] {
  return readHistory();
}

export function addToHistory(slug: string, name: string, timestamp: number = Date.now()) {
  const withoutDuplicate = readHistory().filter((entry) => entry.slug !== slug);
  const next = [{ slug, name, timestamp }, ...withoutDuplicate].slice(0, MAX_HISTORY_ITEMS);
  writeHistory(next);
}

export function clearHistory() {
  writeHistory([]);
}

export function subscribeToHistory(callback: () => void): () => void {
  window.addEventListener(HISTORY_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(HISTORY_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getHistorySnapshot(): string {
  return JSON.stringify(readHistory());
}

export function getHistoryServerSnapshot(): string {
  return "[]";
}
