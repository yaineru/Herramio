"use client";

import { useEffect, useState } from "react";
import { Download, FileImage, FileWarning, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { MAX_PDF_BYTES, getPdfPageCount } from "@/lib/pdf/pdf-engine";
import { parsePageGroups } from "@/lib/pdf/page-ranges";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "pdf-a-png";

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

interface PageImage {
  page: number;
  blob: Blob;
  url: string;
}

export function PdfToPng() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<PageImage[] | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResults(null);
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
        setRangeInput(count > 20 ? "1-20" : `1-${count}`);
      })
      .catch(() => setError("No se pudo leer este PDF. Verifica que no esté dañado o protegido con contraseña."));
  }

  function handleReset() {
    setFile(null);
    setPageCount(null);
    setRangeInput("");
    setResults(null);
    setError(null);
  }

  async function handleConvert() {
    if (!file || !pageCount) return;
    const groups = parsePageGroups(rangeInput, pageCount);
    if (!groups) {
      setError(`Escribe páginas válidas entre 1 y ${pageCount} (ej. 1-3,5).`);
      return;
    }
    const pages = Array.from(new Set(groups.flat())).sort((a, b) => a - b);
    if (pages.length > 30) {
      setError("Convierte como máximo 30 páginas a la vez para no saturar el navegador.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const { renderPdfPageToBlob } = await import("@/lib/pdf/pdf-render");
      const rendered: PageImage[] = [];
      for (const zeroBasedPage of pages) {
        const blob = await renderPdfPageToBlob(file, zeroBasedPage + 1, 2, 0.92, "image/png");
        rendered.push({ page: zeroBasedPage + 1, blob, url: URL.createObjectURL(blob) });
      }
      setResults(rendered);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch {
      const message = "No se pudo convertir el PDF a imágenes.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload(image: PageImage) {
    downloadBlob(image.blob, `pagina-${image.page}.png`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, "png");
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
          <Label htmlFor="pdf-png-ranges">Páginas a convertir</Label>
          <Input
            id="pdf-png-ranges"
            placeholder={`ej. 1-3,5,8-${pageCount}`}
            value={rangeInput}
            onChange={(e) => setRangeInput(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">
            Página 1 a {pageCount}. Máximo 30 páginas por conversión.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {results && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {results.length} imagen{results.length !== 1 ? "es" : ""} lista{results.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {results.map((image) => (
              <div key={image.page} className="overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={`Página ${image.page}`} className="aspect-[3/4] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDownload(image)}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Download className="h-3 w-3" /> Página {image.page}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleConvert} disabled={!pageCount || isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4" />}
          {isProcessing ? "Convirtiendo…" : "Convertir a PNG"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otro PDF
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tu archivo se procesa directamente en tu navegador: no se sube a nuestros servidores en
        ningún momento de este proceso.
      </p>
    </Card>
  );
}
