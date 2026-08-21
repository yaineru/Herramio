import { describe, it, expect } from "vitest";
import { addTodo, toggleTodo, removeTodo, clearCompleted, type TodoItem } from "@/lib/productividad/todo-list";

describe("addTodo", () => {
  it("appends a new item with done:false", () => {
    const result = addTodo([], "Comprar leche", "1");
    expect(result).toEqual([{ id: "1", text: "Comprar leche", done: false }]);
  });

  it("trims whitespace from the text", () => {
    const result = addTodo([], "  tarea  ", "1");
    expect(result[0].text).toBe("tarea");
  });

  it("ignores blank input", () => {
    expect(addTodo([], "   ", "1")).toEqual([]);
    expect(addTodo([], "", "1")).toEqual([]);
  });
});

describe("toggleTodo", () => {
  it("flips the done flag of the matching item only", () => {
    const items: TodoItem[] = [
      { id: "1", text: "a", done: false },
      { id: "2", text: "b", done: false },
    ];
    const result = toggleTodo(items, "1");
    expect(result[0].done).toBe(true);
    expect(result[1].done).toBe(false);
  });

  it("toggles back to false on a second call", () => {
    const items: TodoItem[] = [{ id: "1", text: "a", done: true }];
    expect(toggleTodo(items, "1")[0].done).toBe(false);
  });
});

describe("removeTodo", () => {
  it("removes only the matching item", () => {
    const items: TodoItem[] = [
      { id: "1", text: "a", done: false },
      { id: "2", text: "b", done: false },
    ];
    expect(removeTodo(items, "1")).toEqual([{ id: "2", text: "b", done: false }]);
  });
});

describe("clearCompleted", () => {
  it("keeps only items that are not done", () => {
    const items: TodoItem[] = [
      { id: "1", text: "a", done: true },
      { id: "2", text: "b", done: false },
    ];
    expect(clearCompleted(items)).toEqual([{ id: "2", text: "b", done: false }]);
  });
});
