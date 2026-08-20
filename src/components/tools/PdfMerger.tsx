"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Combine, Download, Loader2, RotateCcw, Split } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { ReorderableFileList } from "@/components/tools/ReorderableFileList";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, mergePdfs } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
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

export function PdfMerger() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened("pdf-unir");
  }, []);

  function handleFiles(picked: File[]) {
    setError(null);
    setResultBlob(null);
    const invalid = picked.find((f) => f.type !== "application/pdf");
    if (invalid) {
      setError(`"${invalid.name}" no es un archivo PDF válido.`);
      return;
    }
    const tooLarge = picked.find((f) => f.size > MAX_PDF_BYTES);
    if (tooLarge) {
      setError(`"${tooLarge.name}" supera el máximo de ${formatBytes(MAX_PDF_BYTES)}.`);
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

  async function handleMerge() {
    if (files.length < 2) {
      setError("Agrega al menos 2 archivos PDF para unirlos.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await mergePdfs(files);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed("pdf-unir");
    } catch (err) {
      const message =
        err instanceof Error
          ? "No se pudo unir los PDF. Verifica que ninguno esté dañado o protegido con contraseña."
          : "Ocurrió un error inesperado.";
      setError(message);
      AnalyticsEvents.toolError("pdf-unir", message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-unido.pdf");
    AnalyticsEvents.toolDownloaded("pdf-unir", "pdf");
  }

  function handleSendToSplitter() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-unido.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: "pdf-unir", targetTool: "pdf-dividir", file: handoffFile });
    AnalyticsEvents.ctaClicked("handoff_pdf-unir_to_pdf-dividir");
    router.push("/pdf-dividir");
  }

  return (
    <Card className="p-6">
      <FileDropZone
        accept="application/pdf"
        multiple
        onFiles={handleFiles}
        label="Arrastra archivos PDF o haz clic para seleccionarlos"
        hint={`Puedes agregar varios — máx. ${formatBytes(MAX_PDF_BYTES)} por archivo`}
      />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {files.length} archivo{files.length !== 1 ? "s" : ""} — se unirán en este orden
          </p>
          <ReorderableFileList files={files} onReorder={setFiles} onRemove={handleRemove} />
        </div>
      )}

      {resultBlob && (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-6 text-center">
          <p className="text-sm font-medium text-emerald-800">
            PDF combinado listo ({formatBytes(resultBlob.size)})
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {resultBlob ? (
          <Button type="button" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF unido
          </Button>
        ) : (
          <Button type="button" onClick={handleMerge} disabled={files.length < 2 || isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Combine className="h-4 w-4" />}
            {isProcessing ? "Uniendo…" : "Unir PDFs"}
          </Button>
        )}
        {files.length > 0 && (
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </Button>
        )}
      </div>

      {resultBlob && (
        <button
          type="button"
          onClick={handleSendToSplitter}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          <Split className="h-3.5 w-3.5" /> Dividir este PDF sin volver a subirlo
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tus archivos se procesan directamente en tu navegador: no se suben a nuestros servidores
        en ningún momento de este proceso.
      </p>
    </Card>
  );
}
