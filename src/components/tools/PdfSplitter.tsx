"use client";

import { useEffect, useState } from "react";
import { Download, FileWarning, Loader2, RotateCcw, Split } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount, splitPdfByGroups } from "@/lib/pdf/pdf-engine";
import { parsePageGroups } from "@/lib/pdf/page-ranges";
import { consumeToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Blob[] | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened("pdf-dividir");
  }, []);

  // Picks up a PDF handed off from pdf-unir or jpg-a-pdf via the exact same
  // validation path as a manual upload — no separate code path to keep in
  // sync. A no-op when there's nothing pending.
  useEffect(() => {
    const handoffFile = consumeToolHandoff("pdf-dividir");
    if (handoffFile) handleFiles([handoffFile]);
  }, []);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResults(null);
    setPageCount(null);
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
    getPdfPageCount(picked)
      .then(setPageCount)
      .catch(() => setError("No se pudo leer este PDF. Verifica que no esté dañado o protegido con contraseña."));
  }

  function handleReset() {
    setFile(null);
    setPageCount(null);
    setRangeInput("");
    setResults(null);
    setError(null);
  }

  async function handleSplit() {
    if (!file || !pageCount) return;
    const groups = parsePageGroups(rangeInput, pageCount);
    if (!groups) {
      setError(`Escribe rangos válidos entre 1 y ${pageCount}, separados por comas (ej. 1-3,5,8-10).`);
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const blobs = await splitPdfByGroups(file, groups);
      setResults(blobs);
      AnalyticsEvents.toolUsed("pdf-dividir");
    } catch {
      const message = "No se pudo dividir el PDF.";
      setError(message);
      AnalyticsEvents.toolError("pdf-dividir", message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload(blob: Blob, index: number) {
    downloadBlob(blob, `parte-${index + 1}.pdf`);
    AnalyticsEvents.toolDownloaded("pdf-dividir", "pdf");
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
            {formatBytes(file.size)} {pageCount !== null && `· ${pageCount} páginas`}
          </p>
        </div>
      </div>

      {pageCount !== null && (
        <div className="mt-6">
          <Label htmlFor="page-ranges">Páginas a extraer</Label>
          <Input
            id="page-ranges"
            placeholder={`ej. 1-3,5,8-${pageCount}`}
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">
            Cada grupo separado por comas genera un PDF descargable independiente. Página 1 a {pageCount}.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {results && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {results.length} archivo{results.length !== 1 ? "s" : ""} listo{results.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {results.map((blob, i) => (
              <Button key={i} type="button" variant="outline" size="sm" onClick={() => handleDownload(blob, i)}>
                <Download className="h-3.5 w-3.5" /> Parte {i + 1} ({formatBytes(blob.size)})
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSplit} disabled={!pageCount || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Split className="h-4 w-4" />}
          {isProcessing ? "Dividiendo…" : "Dividir PDF"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otro PDF
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en
        ningún momento de este proceso.
      </p>
    </Card>
  );
}
