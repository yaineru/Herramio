"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, FileWarning, Loader2, RotateCcw, TextSelect } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES } from "@/lib/pdf/pdf-engine";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-extraer-texto";

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function PdfTextExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setPages(null);
    if (!picked) return;

    if (picked.type !== "application/pdf") {
      setError("Selecciona un archivo PDF válido.");
      return;
    }
    if (picked.size > MAX_PDF_BYTES) {
      setError(`El archivo supera el máximo de ${formatBytes(MAX_PDF_BYTES)}.`);
      return;
    }

    setFile(picked);
  }

  function handleReset() {
    setFile(null);
    setPages(null);
    setError(null);
    setCopied(false);
  }

  async function handleExtract() {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { extractPdfText } = await import("@/lib/pdf/pdf-render");
      const extracted = await extractPdfText(file);
      setPages(extracted);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch {
      const message = "No se pudo leer el texto de este PDF.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  const fullText = pages?.join("\n\n").trim() ?? "";
  const isEmpty = pages !== null && fullText === "";

  async function handleCopy() {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  function handleDownload() {
    downloadText(fullText, "texto-extraido.txt");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "txt");
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="application/pdf"
          onFiles={handleFiles}
          label="Arrastra un PDF o haz clic para seleccionarlo"
          hint={`Máx. ${formatBytes(MAX_PDF_BYTES)}`}
        />
        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <FileWarning className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-400">
            {formatBytes(file.size)} {pages !== null && `· ${pages.length} páginas`}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {isEmpty && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700" role="alert">
          Este PDF no tiene texto extraíble: probablemente es un documento escaneado (solo imágenes). Prueba con
          otro archivo.
        </p>
      )}

      {pages !== null && !isEmpty && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Texto extraído</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" /> Descargar .txt
              </Button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap">
            {fullText}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleExtract} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TextSelect className="h-4 w-4" />}
          {isProcessing ? "Extrayendo…" : "Extraer texto"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otro PDF
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso.
      </p>
    </Card>
  );
}
