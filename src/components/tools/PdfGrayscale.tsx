"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Contrast, Download, FileWarning, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { canvasToBlob, formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount, imagesToPdf } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-escala-grises";
const MAX_PAGES = 40;

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

async function toGrayscaleBlob(colorBlob: Blob, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(colorBlob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar este PDF.");
  ctx.filter = "grayscale(100%)";
  ctx.drawImage(bitmap, 0, 0);
  return canvasToBlob(canvas, "image/jpeg", quality);
}

export function PdfGrayscale() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
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
  }

  async function handleConvert() {
    if (!file || !pageCount) return;
    setIsProcessing(true);
    setError(null);
    setProgress({ done: 0, total: pageCount });
    try {
      const { renderPdfPageToBlob } = await import("@/lib/pdf/pdf-render");
      const images: { file: File; type: "image/jpeg" }[] = [];
      for (let page = 1; page <= pageCount; page++) {
        const colorBlob = await renderPdfPageToBlob(file, page, 1.5, 0.85);
        const grayBlob = await toGrayscaleBlob(colorBlob, 0.85);
        images.push({ file: new File([grayBlob], `pagina-${page}.jpg`, { type: "image/jpeg" }), type: "image/jpeg" });
        setProgress({ done: page, total: pageCount });
      }
      const blob = await imagesToPdf(images);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch {
      const message = "No se pudo convertir el PDF a escala de grises.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-escala-de-grises.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleSendToCompressor() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-escala-de-grises.pdf", { type: "application/pdf" });
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
        <p className="mt-4 text-sm text-slate-500">Procesando página {progress.done} de {progress.total}…</p>
      )}

      {resultBlob && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">PDF en escala de grises listo ({formatBytes(resultBlob.size)}).</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleConvert} disabled={!pageCount || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Contrast className="h-4 w-4" />}
          {isProcessing ? "Convirtiendo…" : "Convertir a escala de grises"}
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
          onClick={handleSendToCompressor}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Comprimir este PDF sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso. Cada página se convierte en una imagen, así que el texto dejará de ser seleccionable — ideal
        para imprimir en blanco y negro o ahorrar tinta.
      </p>
    </Card>
  );
}
