import type { TodoItem } from "@/lib/productividad/todo-list";

const STORAGE_KEY = "herramio-lista-tareas";
const CHANGE_EVENT = "herramio-todo-list-change";

function isTodoItem(value: unknown): value is TodoItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.text === "string" && typeof v.done === "boolean";
}

function readTodos(): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTodoItem) : [];
  } catch {
    return [];
  }
}

export function writeTodos(items: TodoItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function subscribeToTodos(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getTodosSnapshot(): string {
  return JSON.stringify(readTodos());
}

export function getTodosServerSnapshot(): string {
  return "[]";
}
