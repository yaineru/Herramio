"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FilePlus2, FileWarning, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount, insertBlankPage } from "@/lib/pdf/pdf-engine";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-insertar-pagina-blanca";

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

export function PdfBlankPageInserter() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [positionInput, setPositionInput] = useState("");
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
      .then((count) => {
        setPageCount(count);
        setPositionInput(String(count + 1));
      })
      .catch(() => setError("No se pudo leer este PDF. Verifica que no esté dañado o protegido con contraseña."));
  }

  function handleReset() {
    setFile(null);
    setPageCount(null);
    setPositionInput("");
    setResultBlob(null);
    setError(null);
  }

  async function handleInsert() {
    if (!file || !pageCount) return;
    const position = Number(positionInput);
    if (!Number.isInteger(position) || position < 1 || position > pageCount + 1) {
      setError(`Escribe una posición entre 1 y ${pageCount + 1}.`);
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await insertBlankPage(file, position - 1);
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo insertar la página en blanco.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "documento-con-pagina-en-blanco.pdf");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "pdf");
  }

  function handleSendToNumberer() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "documento-con-pagina-en-blanco.pdf", { type: "application/pdf" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "pdf-numerar-paginas", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_pdf-numerar-paginas`);
    router.push("/pdf-numerar-paginas");
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
          <Label htmlFor="blank-position">Insertar en la posición</Label>
          <Input
            id="blank-position"
            type="number"
            inputMode="numeric"
            min={1}
            max={pageCount + 1}
            value={positionInput}
            onChange={(e) => setPositionInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">
            Un valor entre 1 y {pageCount + 1}. Por ejemplo, {pageCount + 1} agrega la página en blanco al final.
          </p>
        </div>
      )}

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
        <Button type="button" onClick={handleInsert} disabled={!pageCount || !positionInput || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
          {isProcessing ? "Insertando…" : "Insertar página en blanco"}
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
          onClick={handleSendToNumberer}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Numerar las páginas de este PDF sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso.
      </p>
    </Card>
  );
}
