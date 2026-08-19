"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  generatePassword,
  estimatePasswordStrength,
  type PasswordOptions,
} from "@/lib/text/password";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const STRENGTH_COLOR: Record<number, string> = {
  0: "bg-red-500",
  1: "bg-orange-500",
  2: "bg-amber-500",
  3: "bg-emerald-500",
  4: "bg-emerald-600",
};

const TOOL_ID = "texto-generador-contrasenas";

export function PasswordGenerator() {
  const id = useId();
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  function regenerate(next: PasswordOptions = options) {
    const result = generatePassword(next);
    setPassword(result ?? "");
    setCopied(false);
    if (result) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
    // A random password can't be generated during the initial render
    // (server/client would disagree) — deferring to after mount is the
    // correct pattern here, not just a workaround for the lint rule.
    const timeout = setTimeout(() => regenerate(options), 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) {
    const next = { ...options, [key]: value };
    setOptions(next);
    regenerate(next);
  }

  async function handleCopy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  const strength = estimatePasswordStrength(password);
  const noCharsetSelected = password === "" && (options.uppercase || options.lowercase || options.numbers || options.symbols) === false;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
        <output className="flex-1 break-all font-mono text-lg text-slate-900" aria-live="polite">
          {password || "Selecciona al menos un tipo de carácter"}
        </output>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} disabled={!password} aria-label="Copiar contraseña">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => regenerate()} disabled={!password} aria-label="Regenerar contraseña">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {password && (
        <div className="mt-3">
          <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-full", i <= strength.score ? STRENGTH_COLOR[strength.score] : "bg-slate-200")}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Fortaleza: {strength.label}</p>
        </div>
      )}

      {noCharsetSelected && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Selecciona al menos un tipo de carácter para generar una contraseña.
        </p>
      )}

      <div className="mt-6">
        <Label htmlFor={`${id}-length`}>Longitud ({options.length} caracteres)</Label>
        <input
          id={`${id}-length`}
          type="range"
          min={6}
          max={64}
          value={options.length}
          onChange={(e) => update("length", Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.uppercase} onChange={(e) => update("uppercase", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Mayúsculas (A-Z)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.lowercase} onChange={(e) => update("lowercase", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Minúsculas (a-z)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.numbers} onChange={(e) => update("numbers", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Números (0-9)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.symbols} onChange={(e) => update("symbols", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Símbolos (!@#$...)
        </label>
        <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.excludeAmbiguous} onChange={(e) => update("excludeAmbiguous", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Excluir caracteres ambiguos (l, 1, I, O, 0)
        </label>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Generada con el generador de números aleatorios criptográficamente seguro de tu navegador
        (Web Crypto API). Nunca se envía ni se guarda en ningún servidor.
      </p>
    </Card>
  );
}
