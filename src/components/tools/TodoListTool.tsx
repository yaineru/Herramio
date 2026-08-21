"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckSquare, Plus, Square, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addTodo, clearCompleted, removeTodo, toggleTodo, type TodoItem } from "@/lib/productividad/todo-list";
import { subscribeToTodos, getTodosSnapshot, getTodosServerSnapshot, writeTodos } from "@/lib/productividad/todo-list-store";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TOOL_ID = "productividad-lista-tareas";

export function TodoListTool() {
  const [draft, setDraft] = useState("");

  // Reading via useSyncExternalStore (rather than localStorage directly in
  // an effect) keeps the first client render identical to the
  // server-rendered markup, avoiding a hydration mismatch.
  const snapshot = useSyncExternalStore(subscribeToTodos, getTodosSnapshot, getTodosServerSnapshot);
  const items: TodoItem[] = JSON.parse(snapshot);

  function handleAdd() {
    if (draft.trim() === "") return;
    writeTodos(addTodo(items, draft, crypto.randomUUID()));
    setDraft("");
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleToggle(id: string) {
    writeTodos(toggleTodo(items, id));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleRemove(id: string) {
    writeTodos(removeTodo(items, id));
  }

  function handleClearCompleted() {
    writeTodos(clearCompleted(items));
    AnalyticsEvents.ctaClicked(`${TOOL_ID}_clear_completed`);
  }

  const pendingCount = items.filter((item) => !item.done).length;
  const completedCount = items.length - pendingCount;

  return (
    <Card className="p-6">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Escribe una tarea y presiona Enter"
        />
        <Button type="button" onClick={handleAdd} disabled={draft.trim() === ""}>
          <Plus className="h-4 w-4" /> Añadir
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">Aún no tienes tareas. Añade la primera arriba.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                aria-label={item.done ? "Marcar como pendiente" : "Marcar como completada"}
                className="shrink-0 text-slate-400 hover:text-emerald-600"
              >
                {item.done ? <CheckSquare className="h-5 w-5 text-emerald-600" /> : <Square className="h-5 w-5" />}
              </button>
              <span className={cn("min-w-0 flex-1 truncate text-sm text-slate-900", item.done && "text-slate-400 line-through")}>
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                aria-label="Eliminar tarea"
                className="shrink-0 text-slate-300 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {pendingCount} pendiente{pendingCount !== 1 && "s"} · {completedCount} completada{completedCount !== 1 && "s"}
          </p>
          {completedCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleClearCompleted}>
              <Trash2 className="h-3.5 w-3.5" /> Borrar completadas
            </Button>
          )}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Tus tareas se guardan solo en este navegador (localStorage): no se envían a ningún servidor y desaparecen si
        borras los datos del sitio.
      </p>
    </Card>
  );
}
