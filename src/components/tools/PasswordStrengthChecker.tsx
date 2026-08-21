"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { checkPasswordStrength } from "@/lib/text/password-strength";
import { cn } from "@/lib/utils";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-verificar-contrasena";

const SCORE_COLORS = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

const CHECK_LABELS: { key: keyof ReturnType<typeof checkPasswordStrength>["checks"]; label: string }[] = [
  { key: "length", label: "Al menos 8 caracteres" },
  { key: "uppercase", label: "Una letra mayúscula" },
  { key: "lowercase", label: "Una letra minúscula" },
  { key: "number", label: "Un número" },
  { key: "symbol", label: "Un símbolo (!@#$...)" },
];

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  function handleChange(value: string) {
    setPassword(value);
    if (value) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const result = checkPasswordStrength(password);
  const hasInput = password.length > 0;

  return (
    <Card className="p-6">
      <Label htmlFor="password-input">Contraseña a verificar</Label>
      <div className="relative">
        <input
          id="password-input"
          type={visible ? "text" : "password"}
          value={password}
          onChange={(e) => handleChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-11 font-mono text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Escribe tu contraseña..."
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {hasInput && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{result.label}</p>
            <p className="text-xs text-slate-400">~{result.entropyBits} bits de entropía</p>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("h-2 flex-1 rounded-full", i <= result.score ? SCORE_COLORS[result.score] : "bg-slate-200")} />
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {CHECK_LABELS.map(({ key, label }) => {
              const passed = result.checks[key];
              return (
                <p key={key} className={cn("flex items-center gap-2 text-sm", passed ? "text-emerald-700" : "text-slate-400")}>
                  {passed ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                  {label}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        La contraseña se evalúa completamente en tu navegador — nunca se envía, se guarda ni se registra en
        ningún servidor.
      </p>
    </Card>
  );
}
