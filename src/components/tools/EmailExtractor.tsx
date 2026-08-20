"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { extractEmails } from "@/lib/text/extract-emails";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-extraer-emails";

export function EmailExtractor() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    if (extractEmails(value).length > 0) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const emails = extractEmails(input);

  async function handleCopy() {
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join("\n"));
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="email-extractor-input">Texto con correos mezclados</Label>
      <Textarea
        id="email-extractor-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Pega aquí un texto, lista de contactos o correo con direcciones mezcladas..."
        className="min-h-40"
      />

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {emails.length > 0 ? `${emails.length} correo${emails.length !== 1 ? "s" : ""} encontrado${emails.length !== 1 ? "s" : ""}` : "Correos encontrados"}
          </p>
          {emails.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar todos"}
            </Button>
          )}
        </div>

        {emails.length > 0 ? (
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {emails.map((email) => (
              <span key={email} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                {email}
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Pega un texto para extraer los correos que contiene.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Todo ocurre en tu navegador; el texto que pegas nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
