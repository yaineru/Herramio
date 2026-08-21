export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

/** Appends a new item; blank (whitespace-only) text is ignored so empty rows never get created. */
export function addTodo(items: TodoItem[], text: string, id: string): TodoItem[] {
  const trimmed = text.trim();
  if (trimmed === "") return items;
  return [...items, { id, text: trimmed, done: false }];
}

export function toggleTodo(items: TodoItem[], id: string): TodoItem[] {
  return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
}

export function removeTodo(items: TodoItem[], id: string): TodoItem[] {
  return items.filter((item) => item.id !== id);
}

export function clearCompleted(items: TodoItem[]): TodoItem[] {
  return items.filter((item) => !item.done);
}
