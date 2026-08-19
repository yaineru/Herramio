"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { computeHash, HASH_ALGORITHMS, type HashAlgorithm } from "@/lib/dev/hash";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-hash-generator";

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Partial<Record<HashAlgorithm, string>>>({});
  const [copied, setCopied] = useState<HashAlgorithm | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!input) {
        setHashes({});
        return;
      }
      Promise.all(HASH_ALGORITHMS.map((algo) => computeHash(input, algo))).then((results) => {
        if (cancelled) return;
        const next: Partial<Record<HashAlgorithm, string>> = {};
        HASH_ALGORITHMS.forEach((algo, i) => (next[algo] = results[i]));
        setHashes(next);
        AnalyticsEvents.toolUsed(TOOL_ID);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  async function handleCopy(algo: HashAlgorithm, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(algo);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="hash-input">Texto a hashear</Label>
      <textarea
        id="hash-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe o pega el texto..."
        rows={5}
        spellCheck={false}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      {Object.keys(hashes).length > 0 && (
        <div className="mt-5 space-y-3">
          {HASH_ALGORITHMS.map((algo) => (
            <div key={algo}>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{algo}</p>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <output className="flex-1 break-all font-mono text-sm text-slate-800">{hashes[algo]}</output>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(algo, hashes[algo]!)}
                  aria-label={`Copiar hash ${algo}`}
                >
                  {copied === algo ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Calculado con <code>crypto.subtle.digest</code>, la API nativa de tu navegador. No se
        envía ni se guarda en ningún servidor. MD5 no está disponible: no lo implementa la Web
        Crypto API y, al estar criptográficamente roto, no vale la pena añadir una librería extra
        solo para ofrecerlo.
      </p>
    </Card>
  );
}
