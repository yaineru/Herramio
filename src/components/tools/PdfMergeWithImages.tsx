"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Combine, Download, FileText, Image as ImageIcon, Loader2, RotateCcw, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes, isSupportedImageType, MAX_IMAGE_BYTES } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, mergePdfsAndImages, type MergeItem } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-combinar-con-imagenes";
const MAX_ITEMS = 15;

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

export function PdfMergeWithImages() {
  const router = useRouter();
  const [items, setItems] = useState<MergeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  function handleFiles(files: File[]) {
    setError(null);
    setResultBlob(null);
    const room = MAX_ITEMS - items.length;
    if (files.length > room) setError(`Solo puedes combinar hasta ${MAX_ITEMS} archivos en total.`);

    const next: MergeItem[] = [];
    for (const picked of files.slice(0, room)) {
      if (picked.type === "application/pdf") {
        if (picked.size > MAX_PDF_BYTES) {
          setError(`"${picked.name}" supera el máximo de ${formatBytes(MAX_PDF_BYTES)}.`);
          continue;
        }
        next.push({ kind: "pdf", file: picked });
      } else if (isSupportedImageType(picked.type) && picked.type !== "image/webp") {
        if (picked.size > MAX_IMAGE_BYTES) {
          setError(`"${picked.name}" es demasiado grande (máx. ${formatBytes(MAX_IMAGE_BYTES)}).`);
          continue;
        }
        next.push({ kind: "image", file: picked, type: picked.type === "image/png" ? "image/png" : "image/jpeg" });
      } else {
        setError(`"${picked.name}" no es un PDF ni una imagen JPEG/PNG compatible.`);
      }
    }
    if (next.length > 0) setItems((prev) => [...prev, ...next]);
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setResultBlob(null);
  }

  function handleMove(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResultBlob(null);
  }

  function handleReset() {
    setItems([]);
    setError(null);
    setResultBlob(null);
  }

  async function handleMerge() {
    if (items.length < 2) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await mergePdfsAndImages(items);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron combinar los archivos.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-combinado.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleSendToWatermark() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-combinado.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "pdf-marca-agua", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_pdf-marca-agua`);
    router.push("/pdf-marca-agua");
  }

  return (
    <Card className="p-6">
      {items.length > 0 && (
        <ul className="mb-5 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              {item.kind === "pdf" ? (
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{item.file.name}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:bg-slate-200 disabled:opacity-30" aria-label="Mover arriba">
                  ↑
                </button>
                <button type="button" onClick={() => handleMove(i, 1)} disabled={i === items.length - 1} className="rounded p-1 text-slate-400 hover:bg-slate-200 disabled:opacity-30" aria-label="Mover abajo">
                  ↓
                </button>
                <button type="button" onClick={() => handleRemove(i)} className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="Quitar">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length < MAX_ITEMS && (
        <FileDropZone
          accept="application/pdf,image/jpeg,image/png"
          multiple
          onFiles={handleFiles}
          label={items.length === 0 ? "Arrastra PDF e imágenes o haz clic para seleccionarlos" : "Añadir otro archivo"}
          hint={`PDF, JPEG o PNG — máx. ${MAX_ITEMS} archivos en total`}
        />
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {items.length === 1 && (
        <p className="mt-4 text-sm text-slate-400">Añade al menos un archivo más para combinar.</p>
      )}

      {resultBlob && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">PDF combinado listo ({formatBytes(resultBlob.size)}).</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleMerge} disabled={items.length < 2 || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Combine className="h-4 w-4" />}
          {isProcessing ? "Combinando…" : "Combinar en un PDF"}
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        )}
        {items.length > 0 && (
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
        Tus archivos se procesan directamente en tu navegador: no se suben a nuestros servidores en ningún momento
        de este proceso.
      </p>
    </Card>
  );
}
