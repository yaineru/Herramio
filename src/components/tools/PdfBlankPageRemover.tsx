"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, Eraser, FileWarning, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount, removePdfPages } from "@/lib/pdf/pdf-engine";
import { isImageDataBlank } from "@/lib/pdf/blank-page-detector";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-eliminar-paginas-blancas";
const MAX_PAGES = 60;

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

async function isPageBlank(file: File, pageNumber: number): Promise<boolean> {
  const { renderPdfPageToBlob } = await import("@/lib/pdf/pdf-render");
  const blob = await renderPdfPageToBlob(file, pageNumber, 0.4, 0.7);
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(bitmap, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return isImageDataBlank(data, 248);
}

export function PdfBlankPageRemover() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [blankPages, setBlankPages] = useState<number[] | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setBlankPages(null);
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
      .then((count) => {
        if (count > MAX_PAGES) {
          setError(`Este PDF tiene ${count} páginas; esta herramienta admite hasta ${MAX_PAGES} por archivo.`);
          return;
        }
        setPageCount(count);
      })
      .catch(() => setError("No se pudo leer este PDF. Verifica que no esté dañado o protegido con contraseña."));
  }

  function handleReset() {
    setFile(null);
    setPageCount(null);
    setResultBlob(null);
    setError(null);
    setProgress(null);
    setBlankPages(null);
  }

  async function handleDetectAndRemove() {
    if (!file || !pageCount) return;
    setIsProcessing(true);
    setError(null);
    setProgress({ done: 0, total: pageCount });
    try {
      const blanks: number[] = [];
      for (let page = 1; page <= pageCount; page++) {
        if (await isPageBlank(file, page)) blanks.push(page - 1);
        setProgress({ done: page, total: pageCount });
      }
      if (blanks.length === 0) {
        setBlankPages([]);
        AnalyticsEvents.toolUsed(TOOL_ID);
        return;
      }
      if (blanks.length === pageCount) {
        setError("Todas las páginas parecen estar en blanco; no se eliminó nada para evitar dejar el PDF vacío.");
        return;
      }
      const blob = await removePdfPages(file, blanks);
      setResultBlob(blob);
      setBlankPages(blanks);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron detectar las páginas en blanco.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-sin-paginas-blancas.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleSendToCompressor() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-sin-paginas-blancas.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "pdf-comprimir", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_pdf-comprimir`);
    router.push("/pdf-comprimir");
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="application/pdf"
          onFiles={handleFiles}
          label="Arrastra un PDF o haz clic para seleccionarlo"
          hint={`Máx. ${formatBytes(MAX_PDF_BYTES)} · hasta ${MAX_PAGES} páginas`}
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

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {isProcessing && progress && (
        <p className="mt-4 text-sm text-slate-500">Analizando página {progress.done} de {progress.total}…</p>
      )}

      {blankPages !== null && blankPages.length === 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700" role="alert">
          No se detectó ninguna página en blanco en este PDF.
        </p>
      )}

      {resultBlob && blankPages && blankPages.length > 0 && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">
            Se {blankPages.length === 1 ? "eliminó la página" : `eliminaron ${blankPages.length} páginas`} en blanco
            ({blankPages.map((i) => i + 1).join(", ")}). PDF listo ({formatBytes(resultBlob.size)}).
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDetectAndRemove} disabled={!pageCount || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
          {isProcessing ? "Analizando…" : "Detectar y eliminar páginas en blanco"}
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

      {resultBlob && blankPages && blankPages.length > 0 && (
        <button
          type="button"
          onClick={handleSendToCompressor}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Comprimir este PDF sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso. Una página se considera &quot;en blanco&quot; cuando no tiene ningún píxel visible con tinta;
        páginas casi vacías pero con una marca de agua tenue podrían no detectarse.
      </p>
    </Card>
  );
}
