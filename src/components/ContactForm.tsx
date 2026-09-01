"use client";

import { useActionState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { submitContactAction, type ContactState } from "@/lib/contact/actions";
import { AnalyticsEvents } from "@/lib/analytics";

/**
 * The real contact form.
 *
 * It used to build a `mailto:` link to hola@herramio.com — an address with
 * no mailbox behind it. Every message went nowhere, and the sender was
 * shown their mail client opening as if it had worked. Two failures at
 * once: a dead address, and a UI that reported success it could not know
 * about.
 *
 * Now the message is stored server-side and the confirmation appears only
 * after the row is written. The wording says "tu mensaje fue enviado" and
 * never "te enviamos un correo", because no email is sent anywhere.
 */

const initialState: ContactState = { status: "idle", message: null, field: null };

const TOPICS = [
  { value: "problema", label: "Algo no funciona" },
  { value: "herramienta", label: "Falta una herramienta" },
  { value: "privacidad", label: "Privacidad o datos" },
  { value: "otro", label: "Otro" },
];

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState);
  const pathname = usePathname();
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      AnalyticsEvents.contactOpened();
    }
  }, []);

  // Move focus to whatever the server objected to. Without this, a
  // keyboard user gets an error message and no way to know which field it
  // is about.
  useEffect(() => {
    if (state.status === "error") {
      AnalyticsEvents.contactFailed();
      if (state.field === "email") emailRef.current?.focus();
      if (state.field === "message") messageRef.current?.focus();
    }
    if (state.status === "sent") AnalyticsEvents.contactSubmitted("enviado");
  }, [state]);

  if (state.status === "sent") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="text-sm text-emerald-900">
          <p className="font-semibold">Tu mensaje fue enviado.</p>
          <p className="mt-1">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="pagePath" value={pathname ?? ""} />

      <div>
        <Label htmlFor="contact-topic">Motivo</Label>
        <select
          id="contact-topic"
          name="topic"
          defaultValue="problema"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="contact-name">Nombre (opcional)</Label>
        <Input id="contact-name" name="name" maxLength={120} autoComplete="name" />
      </div>

      <div>
        <Label htmlFor="contact-email">Correo electrónico</Label>
        <Input
          ref={emailRef}
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-describedby="contact-email-hint"
          aria-invalid={state.field === "email" || undefined}
        />
        <p id="contact-email-hint" className="mt-1.5 text-xs text-slate-600">
          Solo lo usamos para responderte a esto.
        </p>
      </div>

      <div>
        <Label htmlFor="contact-message">Mensaje</Label>
        <Textarea
          ref={messageRef}
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={4000}
          aria-invalid={state.field === "message" || undefined}
        />
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando…" : "Enviar mensaje"}
      </Button>

      <p className="text-xs leading-relaxed text-slate-600">
        Guardamos tu correo, tu mensaje y la página desde la que escribes, y nada más. No se usa para enviarte
        publicidad ni se comparte con terceros.
      </p>
    </form>
  );
}
