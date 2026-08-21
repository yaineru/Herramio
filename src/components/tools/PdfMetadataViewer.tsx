"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FileText, FileWarning, RotateCcw, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, readPdfMetadata, stripPdfMetadata, type PdfMetadata } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-eliminar-metadata";

const FIELD_LABELS: { key: keyof PdfMetadata; label: string }[] = [
  { key: "title", label: "Título" },
  { key: "author", label: "Autor" },
  { key: "subject", label: "Asunto" },
  { key: "producer", label: "Producido con" },
  { key: "creator", label: "Creado con" },
];

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

export function PdfMetadataViewer() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setMetadata(undefined);
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
    readPdfMetadata(picked)
      .then((meta) => {
        setMetadata(meta);
        AnalyticsEvents.toolUsed(TOOL_ID);
      })
      .catch(() => setError("No se pudo leer este PDF. Verifica que no esté dañado o protegido con contraseña."));
  }

  async function handleStrip() {
    if (!file) return;
    try {
      const blob = await stripPdfMetadata(file);
      setResultBlob(blob);
      AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
    } catch {
      const message = "No se pudo eliminar la metadata.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-sin-metadata.pdf");
  }

  function handleReset() {
    setFile(null);
    setMetadata(undefined);
    setResultBlob(null);
    setError(null);
  }

  function handleSendToSplitter() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-sin-metadata.pdf", { type: "application/pdf" });
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

  const hasAnyMetadata = metadata && (metadata.title || metadata.author || metadata.subject || metadata.producer || metadata.creator || metadata.keywords.length > 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
        </div>
      </div>

      <div className="mt-5">
        {metadata === undefined && <p className="text-sm text-slate-400">Analizando metadata…</p>}

        {metadata && !hasAnyMetadata && (
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            Este PDF no tiene metadata identificable.
          </p>
        )}

        {metadata && hasAnyMetadata && (
          <div className="space-y-2">
            {FIELD_LABELS.filter((f) => metadata[f.key]).map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="h-3.5 w-3.5 shrink-0" /> {f.label}
                </span>
                <span className="truncate font-mono text-sm text-slate-900">{String(metadata[f.key])}</span>
              </div>
            ))}
            {metadata.keywords.length > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                <span className="text-sm text-slate-500">Palabras clave</span>
                <span className="truncate font-mono text-sm text-slate-900">{metadata.keywords.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultBlob && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Metadata eliminada. Tu PDF está listo para descargar.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleStrip} disabled={metadata === undefined}>
          <ShieldCheck className="h-4 w-4" /> Eliminar metadata
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar PDF limpio
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
        Todo el análisis y la limpieza ocurren en tu navegador: tu PDF nunca se sube a ningún servidor.
      </p>
    </Card>
  );
}
