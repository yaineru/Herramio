"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FileText, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatBytes } from "@/lib/images/canvas-image";
import { createPdfFromText } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-crear-desde-texto";
const MAX_CHARS = 50000;

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

export function PdfFromText() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  async function handleCreate() {
    if (text.trim() === "") return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await createPdfFromText(text);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el PDF.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleReset() {
    setText("");
    setResultBlob(null);
    setError(null);
  }

  function handleSendToWatermark() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "pdf-marca-agua", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_pdf-marca-agua`);
    router.push("/pdf-marca-agua");
  }

  return (
    <Card className="p-6">
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value.slice(0, MAX_CHARS));
          setResultBlob(null);
        }}
        rows={14}
        placeholder="Escribe o pega tu texto aquí…"
      />
      <p className="mt-1 text-right text-xs text-slate-400">{text.length.toLocaleString("es")} / {MAX_CHARS.toLocaleString("es")}</p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultBlob && (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">PDF listo ({formatBytes(resultBlob.size)}).</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleCreate} disabled={text.trim() === "" || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {isProcessing ? "Creando…" : "Crear PDF"}
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        )}
        {text && (
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
        El PDF se genera completamente en tu navegador con formato simple (tamaño A4, texto en negro, sin estilos):
        ningún texto se envía a ningún servidor.
      </p>
    </Card>
  );
}
