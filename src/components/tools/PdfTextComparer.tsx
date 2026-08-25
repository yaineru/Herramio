"use client";

import { useState } from "react";
import { FileWarning, GitCompareArrows, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES } from "@/lib/pdf/pdf-engine";
import { diffWords, type DiffToken } from "@/lib/pdf/pdf-diff";
import { TextDiffView } from "@/components/tools/TextDiffView";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-comparar-texto";

function pickFile(files: File[], setFile: (f: File | null) => void, setError: (e: string | null) => void) {
  const picked = files[0];
  if (!picked) return;
  if (picked.type !== "application/pdf") {
    setError("Selecciona un archivo PDF válido.");
    return;
  }
  if (picked.size > MAX_PDF_BYTES) {
    setError(`El archivo supera el máximo de ${formatBytes(MAX_PDF_BYTES)}.`);
    return;
  }
  setError(null);
  setFile(picked);
}

function Slot({
  label,
  file,
  onFiles,
  error,
}: {
  label: string;
  file: File | null;
  onFiles: (files: File[]) => void;
  error: string | null;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {file ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
        </div>
      ) : (
        <FileDropZone accept="application/pdf" onFiles={onFiles} label="Arrastra un PDF o haz clic" hint={`Máx. ${formatBytes(MAX_PDF_BYTES)}`} />
      )}
      {error && (
        <p className="mt-2 flex items-center gap-2 text-xs text-red-700" role="alert">
          <FileWarning className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

export function PdfTextComparer() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<DiffToken[] | null>(null);

  function handleReset() {
    setFileA(null);
    setFileB(null);
    setErrorA(null);
    setErrorB(null);
    setProcessError(null);
    setTokens(null);
  }

  async function handleCompare() {
    if (!fileA || !fileB) return;
    setIsProcessing(true);
    setProcessError(null);
    setTokens(null);
    try {
      const { extractPdfText } = await import("@/lib/pdf/pdf-render");
      const [pagesA, pagesB] = await Promise.all([extractPdfText(fileA), extractPdfText(fileB)]);
      const textA = pagesA.join("\n\n").trim();
      const textB = pagesB.join("\n\n").trim();
      if (!textA && !textB) {
        setProcessError("Ninguno de los dos PDF tiene texto extraíble (probablemente son documentos escaneados).");
        return;
      }
      setTokens(diffWords(textA, textB));
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron comparar los documentos.";
      setProcessError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Card className="p-6">
      {/* Politely announced so a screen-reader user knows work is happening. */}
      <p className="sr-only" role="status">
        {isProcessing ? "Comparando los documentos…" : ""}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Slot label="Documento A" file={fileA} onFiles={(f) => pickFile(f, setFileA, setErrorA)} error={errorA} />
        <Slot label="Documento B" file={fileB} onFiles={(f) => pickFile(f, setFileB, setErrorB)} error={errorB} />
      </div>

      {processError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {processError}
        </p>
      )}

      {tokens && (
        <div className="mt-6">
          <TextDiffView tokens={tokens} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleCompare} disabled={!fileA || !fileB || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompareArrows className="h-4 w-4" />}
          {isProcessing ? "Comparando…" : "Comparar textos"}
        </Button>
        {(fileA || fileB) && (
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Compara el texto real de cada PDF (no imágenes ni formato) directamente en tu navegador: ningún archivo se
        sube a nuestros servidores.
      </p>
    </Card>
  );
}
