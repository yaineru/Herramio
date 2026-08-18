"use client";

import { useState } from "react";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { UNIVERSAL_KINDS } from "@/lib/qr/universal-fields";
import { cn } from "@/lib/utils";

export function UniversalQRGenerator() {
  const [activeKind, setActiveKind] = useState(UNIVERSAL_KINDS[0].kind);
  const active = UNIVERSAL_KINDS.find((k) => k.kind === activeKind) ?? UNIVERSAL_KINDS[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {UNIVERSAL_KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => setActiveKind(k.kind)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              k.kind === activeKind
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            )}
          >
            <span>{k.emoji}</span>
            {k.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <QRGenerator
          key={active.kind}
          toolId={active.kind}
          toolName={`QR de ${active.label}`}
          fields={active.fields}
          emptyHint={active.emptyHint}
        />
      </div>
    </div>
  );
}
