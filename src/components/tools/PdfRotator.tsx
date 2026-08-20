"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FileWarning, Loader2, RotateCcw, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount, rotatePdfPages } from "@/lib/pdf/pdf-engine";
import { parsePageGroups } from "@/lib/pdf/page-ranges";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TOOL_ID = "pdf-rotar";

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

export function PdfRotator() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [rangeInput, setRangeInput] = useState("");
  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
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
    setResultBlob(null);
    setError(null);
  }

  async function handleRotate() {
    if (!file || !pageCount) return;

    let targets: number[] | "all" = "all";
    if (scope === "selected") {
      const groups = parsePageGroups(rangeInput, pageCount);
      if (!groups) {
        setError(`Escribe páginas válidas entre 1 y ${pageCount}, separadas por comas (ej. 2,4-5).`);
        return;
      }
      targets = groups.flat();
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await rotatePdfPages(file, targets, degrees);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch {
      const message = "No se pudo rotar el PDF.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-rotado.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleSendToSplitter() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-rotado.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "pdf-dividir", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_pdf-dividir`);
    router.push("/pdf-dividir");
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

      <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {(
          [
            { value: "all", label: "Todas las páginas" },
            { value: "selected", label: "Páginas específicas" },
          ] as { value: "all" | "selected"; label: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setScope(opt.value)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              scope === opt.value ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white/60",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {scope === "selected" && pageCount !== null && (
        <div className="mt-4">
          <Label htmlFor="pages-to-rotate">Páginas a rotar</Label>
          <Input
            id="pages-to-rotate"
            placeholder="ej. 2,4-5"
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">Página 1 a {pageCount}, separadas por comas.</p>
        </div>
      )}

      <div className="mt-4">
        <Label htmlFor="rotation-degrees">Rotación</Label>
        <div className="flex gap-2">
          {[90, 180, 270].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDegrees(d as 90 | 180 | 270)}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                degrees === d ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {d}°
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultBlob && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">PDF listo ({formatBytes(resultBlob.size)}).</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleRotate} disabled={!pageCount || (scope === "selected" && !rangeInput) || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
          {isProcessing ? "Rotando…" : "Rotar PDF"}
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otro PDF
        </Button>
      </div>

      {resultBlob && (
        <button
          type="button"
          onClick={handleSendToSplitter}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Dividir este PDF sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en
        ningún momento de este proceso.
      </p>
    </Card>
  );
}
