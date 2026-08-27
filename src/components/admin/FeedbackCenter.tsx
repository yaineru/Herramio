"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Inbox, MessageSquare } from "lucide-react";
import { updateFeedbackStatusAction, type FeedbackActionState } from "@/lib/admin/feedback-actions";
import { cn } from "@/lib/utils";
import type { FeedbackRow } from "@/lib/supabase/database.types";

/**
 * Beta feedback triage.
 *
 * Built around one job: turning a comment into work. Unseen items sort
 * first and everything else recedes, because the failure mode for a
 * feedback inbox is not missing features — it is quietly accumulating
 * items nobody reads.
 *
 * The user column shows a short id, never an email. Whoever triages
 * feedback does not need to know who wrote it to act on it, and putting
 * addresses on screen makes a support tool into a place where personal
 * data leaks by being looked at.
 */

const initialState: FeedbackActionState = { status: "idle", message: null };

const KIND_LABELS: Record<FeedbackRow["kind"], string> = {
  problem: "Algo falla",
  idea: "Idea",
  comment: "Comentario",
};

const KIND_CLASSES: Record<FeedbackRow["kind"], string> = {
  problem: "border-amber-200 bg-amber-50 text-amber-900",
  idea: "border-indigo-200 bg-indigo-50 text-indigo-900",
  comment: "border-slate-300 bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<FeedbackRow["status"], string> = {
  new: "Nuevo",
  reviewed: "Revisado",
  resolved: "Resuelto",
};

const STATUS_CLASSES: Record<FeedbackRow["status"], string> = {
  new: "border-emerald-200 bg-emerald-50 text-emerald-800",
  reviewed: "border-sky-200 bg-sky-50 text-sky-900",
  resolved: "border-slate-300 bg-slate-100 text-slate-700",
};

// Unseen work first. This is the whole point of the screen.
const STATUS_WEIGHT: Record<FeedbackRow["status"], number> = { new: 0, reviewed: 1, resolved: 2 };

type StatusFilter = FeedbackRow["status"] | "all";
type KindFilter = FeedbackRow["kind"] | "all";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackCenter({ items }: { items: FeedbackRow[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(updateFeedbackStatusAction, initialState);

  const visible = useMemo(() => {
    return items
      .filter((item) => (statusFilter === "all" ? true : item.status === statusFilter))
      .filter((item) => (kindFilter === "all" ? true : item.kind === kindFilter))
      .sort((a, b) => {
        const byStatus = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
        return byStatus !== 0 ? byStatus : b.created_at.localeCompare(a.created_at);
      });
  }, [items, statusFilter, kindFilter]);

  const countFor = (status: StatusFilter) =>
    status === "all" ? items.length : items.filter((i) => i.status === status).length;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Inbox className="mx-auto h-5 w-5 text-slate-500" aria-hidden="true" />
        <p className="mt-2 text-sm text-slate-700">Todavía no hay comentarios.</p>
        <p className="mt-1 text-xs text-slate-500">
          Aparecerán aquí en cuanto alguien use el botón «Comentar» del workspace o de un informe.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por estado">
          {(["all", "new", "reviewed", "resolved"] as StatusFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              aria-pressed={statusFilter === value}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
                statusFilter === value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {value === "all" ? "Todos" : STATUS_LABELS[value]}
              <span className={cn("tabular-nums", statusFilter === value ? "text-white/70" : "text-slate-500")}>
                {countFor(value)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por tipo">
          {(["all", "problem", "idea", "comment"] as KindFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setKindFilter(value)}
              aria-pressed={kindFilter === value}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
                kindFilter === value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {value === "all" ? "Todos los tipos" : KIND_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {state.status === "error" && state.message && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {state.message}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Ningún comentario cumple estos filtros.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <li key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", STATUS_CLASSES[item.status])}>
                        {STATUS_LABELS[item.status]}
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", KIND_CLASSES[item.kind])}>
                        {KIND_LABELS[item.kind]}
                      </span>
                      <span className="text-[11px] text-slate-500">{formatDate(item.created_at)}</span>
                      {item.page_path && (
                        <span className="truncate font-mono text-[11px] text-slate-500">{item.page_path}</span>
                      )}
                    </span>
                    <span className="mt-1.5 block truncate text-sm text-slate-800">{item.message}</span>
                  </span>
                  <ChevronDown
                    className={cn("mt-1 h-4 w-4 shrink-0 text-slate-500 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">{item.message}</p>

                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">Página</dt>
                        <dd className="break-all font-mono text-slate-800">{item.page_path ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Usuario</dt>
                        {/* Short id, never an email: triaging does not
                            require knowing who wrote it. */}
                        <dd className="font-mono text-slate-800">
                          {item.user_id ? `${item.user_id.slice(0, 8)}…` : "anónimo"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Recibido</dt>
                        <dd className="text-slate-800">{new Date(item.created_at).toLocaleString("es")}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Contexto</dt>
                        <dd className="break-all font-mono text-slate-800">
                          {Object.keys(item.context ?? {}).length === 0 ? "—" : JSON.stringify(item.context)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.status !== "reviewed" && (
                        <form action={formAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value="reviewed" />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                          >
                            Marcar como revisado
                          </button>
                        </form>
                      )}
                      {item.status !== "resolved" && (
                        <form action={formAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value="resolved" />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Marcar como resuelto
                          </button>
                        </form>
                      )}
                      {item.status !== "new" && (
                        <form action={formAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="status" value="new" />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                          >
                            Devolver a nuevo
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FeedbackSummary({ counts }: { counts: { total: number; new: number; reviewed: number; resolved: number } }) {
  const cells = [
    { label: "Total", value: counts.total },
    { label: "Nuevos", value: counts.new, highlight: counts.new > 0 },
    { label: "Revisados", value: counts.reviewed },
    { label: "Resueltos", value: counts.resolved },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cn(
            "rounded-xl border p-3",
            cell.highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white",
          )}
        >
          <dt className="flex items-center gap-1.5 text-[11px] text-slate-600">
            {cell.label === "Total" && <MessageSquare className="h-3 w-3" aria-hidden="true" />}
            {cell.label}
          </dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}
