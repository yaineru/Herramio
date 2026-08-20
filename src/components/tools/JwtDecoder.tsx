"use client";

import { useId, useState } from "react";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { decodeJwt } from "@/lib/dev/jwt";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-jwt-decoder";

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function JwtDecoder() {
  const id = useId();
  const [token, setToken] = useState("");

  function handleChange(value: string) {
    setToken(value);
    if (value.trim() && decodeJwt(value).ok) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = token.trim() !== "";
  const result = hasInput ? decodeJwt(token) : null;

  return (
    <Card className="p-6">
      <Label htmlFor={`${id}-token`}>Token JWT</Label>
      <Textarea
        id={`${id}-token`}
        value={token}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
        className="min-h-32 font-mono text-xs"
        spellCheck={false}
      />

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Pega un token JWT para ver su contenido decodificado.
          </p>
        )}
        {result && !result.ok && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <div className="space-y-4">
            <JsonBlock title="Header" value={result.value.header} />
            <JsonBlock title="Payload" value={result.value.payload} />
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Firma</p>
              <p className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-500">
                {result.value.signature}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs text-slate-400">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Esta herramienta solo decodifica el token en tu navegador: no verifica su firma ni su validez. Nunca pegues
        tokens de producción con datos sensibles en herramientas de terceros.
      </p>
    </Card>
  );
}
