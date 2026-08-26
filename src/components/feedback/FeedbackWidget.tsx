"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, MessageSquare, X } from "lucide-react";
import { submitFeedbackAction, type FeedbackKind, type FeedbackState } from "@/lib/feedback/actions";
import { cn } from "@/lib/utils";

/**
 * Beta feedback, deliberately small.
 *
 * A feedback widget competes with the actual product for attention, so
 * this one stays a single button until someone chooses to open it. It
 * never interrupts, never appears on a timer, and never blocks the page —
 * the people worth hearing from are usually mid-task, and a modal that
 * ambushes them collects annoyance rather than information.
 *
 * The page path travels with the message because it is often worth more
 * than the message: "no entiendo esto" means different things on
 * /precios and on an originality report.
 */

const initialState: FeedbackState = { status: "idle", message: null };

const KINDS: { value: FeedbackKind; label: string; hint: string }[] = [
  { value: "problem", label: "Algo falla", hint: "Un error o algo que no funciona como esperabas" },
  { value: "idea", label: "Una idea", hint: "Algo que echas en falta" },
  { value: "comment", label: "Comentario", hint: "Cualquier otra cosa" },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("problem");
  const [state, formAction, isPending] = useActionState(submitFeedbackAction, initialState);
  const pathname = usePathname();
  const panelId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus moves into the panel on open and back to the trigger on close,
  // so a keyboard user is never left with focus on a hidden element.
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close on success, but only after the confirmation has been readable
  // for a moment — vanishing instantly leaves people unsure it worked.
  useEffect(() => {
    if (state.status !== "sent") return;
    const timer = setTimeout(() => setOpen(false), 2200);
    return () => clearTimeout(timer);
  }, [state.status]);

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Enviar comentario"
          className="mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.14)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Cuéntanos</p>
              <p className="mt-0.5 text-xs text-slate-600">Estamos en beta. Tu mensaje nos llega directamente.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Cerrar"
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {state.status === "sent" ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900" role="status">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              {state.message}
            </p>
          ) : (
            <form action={formAction} className="mt-3">
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="pagePath" value={pathname ?? ""} />

              <fieldset>
                <legend className="sr-only">Tipo de mensaje</legend>
                <div className="flex flex-wrap gap-1.5">
                  {KINDS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setKind(option.value)}
                      aria-pressed={kind === option.value}
                      title={option.hint}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
                        kind === option.value
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label htmlFor="feedback-message" className="sr-only">
                Tu mensaje
              </label>
              <textarea
                ref={textareaRef}
                id="feedback-message"
                name="message"
                rows={4}
                maxLength={4000}
                required
                placeholder="¿Qué ha pasado? Cuanto más concreto, mejor."
                className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              />

              {state.status === "error" && state.message && (
                <p className="mt-2 text-xs text-red-700" role="alert">
                  {state.message}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[11px] leading-tight text-slate-500">
                  No enviamos el contenido de tus documentos.
                </p>
                <button
                  type="submit"
                  disabled={isPending}
                  className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                >
                  {isPending ? "Enviando…" : "Enviar"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.10)]",
          "transition-colors hover:border-slate-400 hover:text-slate-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
        )}
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        Comentar
      </button>
    </div>
  );
}
