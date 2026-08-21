"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookImage, Download, FileWarning, ImageOff, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes, isSupportedImageType, MAX_IMAGE_BYTES } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount, addCoverPage } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-portada";

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

export function PdfCoverPage() {
  const router = useRouter();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  function handlePdfFiles(files: File[]) {
    const picked = files[0];
    setPdfError(null);
    setResultBlob(null);
    setPageCount(null);
    if (!picked) return;

    if (picked.type !== "application/pdf") {
      setPdfError("Selecciona un archivo PDF válido.");
      return;
    }
    if (picked.size > MAX_PDF_BYTES) {
      setPdfError(`El archivo supera el máximo de ${formatBytes(MAX_PDF_BYTES)}.`);
      return;
    }

    setPdfFile(picked);
    getPdfPageCount(picked)
      .then(setPageCount)
      .catch(() => setPdfError("No se pudo leer este PDF. Verifica que no esté dañado o protegido con contraseña."));
  }

  function handleImageFiles(files: File[]) {
    const picked = files[0];
    setImageError(null);
    setResultBlob(null);
    if (!picked) return;

    if (!isSupportedImageType(picked.type) || picked.type === "image/webp") {
      setImageError("Usa una imagen JPEG o PNG para la portada.");
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setImageError(`El archivo es demasiado grande (máx. ${formatBytes(MAX_IMAGE_BYTES)}).`);
      return;
    }

    setImageFile(picked);
  }

  function handleReset() {
    setPdfFile(null);
    setPageCount(null);
    setImageFile(null);
    setResultBlob(null);
    setPdfError(null);
    setImageError(null);
    setProcessError(null);
  }

  async function handleAddCover() {
    if (!pdfFile || !imageFile) return;
    setIsProcessing(true);
    setProcessError(null);
    try {
      const imageBytes = await imageFile.arrayBuffer();
      const imageType = imageFile.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await addCoverPage(pdfFile, imageBytes, imageType);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo añadir la portada.";
      setProcessError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-con-portada.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleSendToWatermark() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-con-portada.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "pdf-marca-agua", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_pdf-marca-agua`);
    router.push("/pdf-marca-agua");
  }

  return (
    <Card className="p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Documento PDF</p>
          {pdfFile ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="truncate text-sm font-medium text-slate-900">{pdfFile.name}</p>
              <p className="text-xs text-slate-400">
                {formatBytes(pdfFile.size)} {pageCount !== null && `· ${pageCount} páginas`}
              </p>
            </div>
          ) : (
            <FileDropZone accept="application/pdf" onFiles={handlePdfFiles} label="Arrastra un PDF o haz clic" hint={`Máx. ${formatBytes(MAX_PDF_BYTES)}`} />
          )}
          {pdfError && (
            <p className="mt-2 flex items-center gap-2 text-xs text-red-700" role="alert">
              <FileWarning className="h-3.5 w-3.5 shrink-0" /> {pdfError}
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Imagen de portada</p>
          {imageFile ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="truncate text-sm font-medium text-slate-900">{imageFile.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(imageFile.size)}</p>
            </div>
          ) : (
            <FileDropZone accept="image/jpeg,image/png" onFiles={handleImageFiles} label="Arrastra una imagen o haz clic" hint="JPEG o PNG" />
          )}
          {imageError && (
            <p className="mt-2 flex items-center gap-2 text-xs text-red-700" role="alert">
              <ImageOff className="h-3.5 w-3.5 shrink-0" /> {imageError}
            </p>
          )}
        </div>
      </div>

      {processError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {processError}
        </p>
      )}

      {resultBlob && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">PDF con portada listo ({formatBytes(resultBlob.size)}).</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleAddCover} disabled={!pdfFile || !imageFile || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookImage className="h-4 w-4" />}
          {isProcessing ? "Añadiendo…" : "Añadir portada"}
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        )}
        {(pdfFile || imageFile) && (
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </Button>
        )}
      </div>

      {resultBlob && (
        <button
          type="button"
          onClick={handleSendToWatermark}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Añadir marca de agua a este PDF sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Ambos archivos se procesan directamente en tu navegador: nunca se suben a ningún servidor.
      </p>
    </Card>
  );
}
