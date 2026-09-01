"use client";

import { useActionState, useMemo, useState } from "react";
import { Archive, CheckCircle2, Mail, MessageSquareText } from "lucide-react";
import { updateContactStatusAction, type ContactActionState } from "@/lib/admin/contact-actions";
import { cn } from "@/lib/utils";
import type { ContactMessageRow, ContactStatus, ContactTopic } from "@/lib/supabase/database.types";

/**
 * Contact triage.
 *
 * Unlike the feedback inbox, this one DOES show email addresses — that is
 * the whole point: these messages exist because someone is waiting for a
 * reply, and a support tool that hides the reply address is not a support
 * tool. The address is shown only in the expanded detail, never in the
 * collapsed list, so a screen sitting open does not put a column of
 * strangers' emails on display.
 *
 * The message body is rendered as text. It is untrusted input from an
 * anonymous form, and React escaping it is what keeps a support inbox from
 * becoming a stored-XSS vector against the person reading it.
 */

const initialState: ContactActionState = { status: "idle", message: null };

const TOPIC_LABELS: Record<ContactTopic, string> = {
  problema: "Algo no funciona",
  herramienta: "Falta una herramienta",
  privacidad: "Privacidad",
  otro: "Otro",
};

const TOPIC_CLASSES: Record<ContactTopic, string> = {
  problema: "border-amber-200 bg-amber-50 text-amber-900",
  herramienta: "border-indigo-200 bg-indigo-50 text-indigo-900",
  privacidad: "border-sky-200 bg-sky-50 text-sky-900",
  otro: "border-slate-300 bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  new: "Nuevo",
  reviewed: "Revisado",
  resolved: "Resuelto",
  archived: "Archivado",
};

const STATUS_CLASSES: Record<ContactStatus, string> = {
  new: "border-emerald-200 bg-emerald-50 text-emerald-800",
  reviewed: "border-sky-200 bg-sky-50 text-sky-900",
  resolved: "border-slate-300 bg-slate-100 text-slate-700",
  archived: "border-slate-200 bg-slate-50 text-slate-600",
};

const FILTERS: { value: ContactStatus | "all"; label: string }[] = [
  { value: "new", label: "Nuevos" },
  { value: "reviewed", label: "Revisados" },
  { value: "resolved", label: "Resueltos" },
  { value: "archived", label: "Archivados" },
  { value: "all", label: "Todos" },
];

function StatusButton({ id, next, label, icon: Icon }: { id: string; next: ContactStatus; label: string; icon: typeof CheckCircle2 }) {
  const [, action, pending] = useActionState(updateContactStatusAction, initialState);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {pending ? "…" : label}
      </button>
    </form>
  );
}

export function ContactCenter({ messages }: { messages: ContactMessageRow[] }) {
  const [filter, setFilter] = useState<ContactStatus | "all">("new");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? messages : messages.filter((m) => m.status === filter)),
    [messages, filter],
  );

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <section aria-labelledby="contacto-heading" className="rounded-2xl border border-slate-200 bg-white elevation-1">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="contacto-heading" className="text-[15px] font-semibold text-slate-900">
            Mensajes de contacto
          </h2>
          <p className="text-xs text-slate-600">
            {newCount === 0 ? "Nada nuevo por leer." : `${newCount} sin leer de ${messages.length}.`}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-5 py-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600",
              filter === f.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-600">
          No hay mensajes {filter === "all" ? "todavía" : `en «${FILTERS.find((f) => f.value === filter)?.label}»`}.
        </p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {visible.map((m) => {
            const isOpen = openId === m.id;
            return (
              <li key={m.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", TOPIC_CLASSES[m.topic])}>
                    {TOPIC_LABELS[m.topic]}
                  </span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_CLASSES[m.status])}>
                    {STATUS_LABELS[m.status]}
                  </span>
                  <time dateTime={m.created_at} className="text-xs text-slate-600">
                    {new Date(m.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                  </time>
                  {m.page_path && <span className="text-xs text-slate-500">desde {m.page_path}</span>}
                </div>

                <p className={cn("mt-2 text-sm leading-relaxed text-slate-800", !isOpen && "line-clamp-2")}>
                  {m.message}
                </p>

                {isOpen && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm">
                    {/* Shown here and not in the list: the address is
                        needed to reply, not to scan the queue. */}
                    <p className="flex flex-wrap items-center gap-2 text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                      <a href={`mailto:${m.email}`} className="font-medium text-emerald-700 hover:underline">
                        {m.email}
                      </a>
                      {m.name && <span className="text-slate-600">· {m.name}</span>}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      {m.user_id ? `Usuario registrado · ${m.user_id.slice(0, 8)}…` : "Enviado sin cuenta"}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : m.id)}
                    aria-expanded={isOpen}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    {isOpen ? "Ocultar detalle" : "Ver detalle y responder"}
                  </button>
                  {m.status !== "reviewed" && <StatusButton id={m.id} next="reviewed" label="Revisado" icon={CheckCircle2} />}
                  {m.status !== "resolved" && <StatusButton id={m.id} next="resolved" label="Resuelto" icon={CheckCircle2} />}
                  {m.status !== "archived" && <StatusButton id={m.id} next="archived" label="Archivar" icon={Archive} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
