const STORAGE_KEY = "herramio-notas-rapidas";
const CHANGE_EVENT = "herramio-quick-notes-change";

function readNotes(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeNotes(text: string) {
  window.localStorage.setItem(STORAGE_KEY, text);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function subscribeToNotes(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getNotesSnapshot(): string {
  return readNotes();
}

export function getNotesServerSnapshot(): string {
  return "";
}
