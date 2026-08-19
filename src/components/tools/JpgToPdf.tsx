"use client";

import { useEffect, useState } from "react";
import { Download, FilePlus2, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { ReorderableFileList } from "@/components/tools/ReorderableFileList";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_IMAGE_FOR_PDF_BYTES, imagesToPdf, type ImageForPdf } from "@/lib/pdf/pdf-engine";
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

export function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened("jpg-a-pdf");
  }, []);

  function handleFiles(picked: File[]) {
    setError(null);
    setResultBlob(null);
    const invalid = picked.find((f) => f.type !== "image/jpeg" && f.type !== "image/png");
    if (invalid) {
      setError(`"${invalid.name}" no es JPG ni PNG.`);
      return;
    }
    const tooLarge = picked.find((f) => f.size > MAX_IMAGE_FOR_PDF_BYTES);
    if (tooLarge) {
      setError(`"${tooLarge.name}" supera el máximo de ${formatBytes(MAX_IMAGE_FOR_PDF_BYTES)}.`);
      return;
    }
    setFiles((prev) => [...prev, ...picked]);
  }

  function handleRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultBlob(null);
  }

  function handleReset() {
    setFiles([]);
    setResultBlob(null);
    setError(null);
  }

  async function handleConvert() {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const images: ImageForPdf[] = files.map((file) => ({
        file,
        type: file.type as "image/jpeg" | "image/png",
      }));
      const blob = await imagesToPdf(images);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed("jpg-a-pdf");
    } catch {
      const message = "No se pudo generar el PDF. Verifica que las imágenes no estén dañadas.";
      setError(message);
      AnalyticsEvents.toolError("jpg-a-pdf", message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "imagenes.pdf");
    AnalyticsEvents.toolDownloaded("jpg-a-pdf", "pdf");
  }

  return (
    <Card className="p-6">
      <FileDropZone
        accept="image/jpeg,image/png"
        multiple
        onFiles={handleFiles}
        label="Arrastra imágenes JPG o PNG, o haz clic para seleccionarlas"
        hint={`Una o varias, en el orden en que quieras que aparezcan — máx. ${formatBytes(MAX_IMAGE_FOR_PDF_BYTES)} c/u`}
      />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {files.length} imagen{files.length !== 1 ? "es" : ""} — una página por imagen, en este orden
          </p>
          <ReorderableFileList files={files} onReorder={setFiles} onRemove={handleRemove} />
        </div>
      )}

      {resultBlob && (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-6 text-center">
          <p className="text-sm font-medium text-emerald-800">
            PDF generado ({formatBytes(resultBlob.size)})
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {resultBlob ? (
          <Button type="button" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        ) : (
          <Button type="button" onClick={handleConvert} disabled={files.length === 0 || isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
            {isProcessing ? "Generando…" : "Convertir a PDF"}
          </Button>
        )}
        {files.length > 0 && (
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tus imágenes se procesan directamente en tu navegador: no se suben a nuestros servidores
        en ningún momento de este proceso.
      </p>
    </Card>
  );
}
