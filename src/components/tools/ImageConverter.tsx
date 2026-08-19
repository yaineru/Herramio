"use client";

import { useEffect, useState } from "react";
import { Download, ImageOff, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  canvasToBlob,
  downloadBlob,
  drawImageToCanvas,
  extensionForMime,
  formatBytes,
  isSupportedImageType,
  loadImageFile,
  type LoadedImage,
} from "@/lib/images/canvas-image";
import { AnalyticsEvents } from "@/lib/analytics";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const FORMAT_LABELS: Record<OutputFormat, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
};

function otherFormats(current: string): OutputFormat[] {
  return (Object.keys(FORMAT_LABELS) as OutputFormat[]).filter((f) => f !== current);
}

export function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>("image/png");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened("imagen-convertir");
  }, []);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    if (!picked) return;

    if (!isSupportedImageType(picked.type)) {
      setError("Formato no compatible. Usa JPEG, PNG o WebP.");
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setError(`El archivo es demasiado grande (máx. ${formatBytes(MAX_IMAGE_BYTES)}).`);
      return;
    }

    setFile(picked);
    setTargetFormat(otherFormats(picked.type)[0]);

    loadImageFile(picked)
      .then(setLoaded)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    if (!loaded) return;
    // Deferred via setTimeout so the state updates below happen in response
    // to the timer firing, not synchronously during the effect's render pass.
    const timeout = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const canvas = drawImageToCanvas(loaded.img, {
          backgroundColor: targetFormat === "image/jpeg" ? "#ffffff" : undefined,
        });
        const blob = await canvasToBlob(canvas, targetFormat, targetFormat === "image/png" ? undefined : 0.92);
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setError(null);
        AnalyticsEvents.toolUsed("imagen-convertir");
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo convertir la imagen.";
        setError(message);
        AnalyticsEvents.toolError("imagen-convertir", message);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [loaded, targetFormat]);

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setResultBlob(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}.${extensionForMime(targetFormat)}`);
    AnalyticsEvents.toolDownloaded("imagen-convertir", extensionForMime(targetFormat));
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={handleFiles}
          label="Arrastra una imagen o haz clic para seleccionarla"
          hint={`JPEG, PNG o WebP — máx. ${formatBytes(MAX_IMAGE_BYTES)}`}
        />
        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <ImageOff className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Original ({FORMAT_LABELS[file.type as OutputFormat] ?? file.type})
          </p>
          {loaded && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loaded.objectUrl}
              alt={`Vista previa de ${file.name}`}
              className="w-full rounded-xl border border-slate-200 object-contain"
            />
          )}
          <p className="mt-2 text-sm text-slate-500">{formatBytes(file.size)}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Convertido a {FORMAT_LABELS[targetFormat]}
          </p>
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="Vista previa convertida" className="h-full w-full object-contain" />
            ) : (
              <p className="text-sm text-slate-400">Procesando…</p>
            )}
          </div>
          {resultBlob && <p className="mt-2 text-sm text-slate-500">{formatBytes(resultBlob.size)}</p>}
        </div>
      </div>

      <div className="mt-6 max-w-xs">
        <Label htmlFor="target-format">Convertir a</Label>
        <Select
          id="target-format"
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value as OutputFormat)}
        >
          {otherFormats(file.type).map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </Select>
      </div>

      {targetFormat === "image/jpeg" && file.type === "image/png" && (
        <p className="mt-3 text-xs text-amber-600">
          JPEG no soporta transparencia: las áreas transparentes se rellenarán con fondo blanco.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob || isProcessing}>
          <Download className="h-4 w-4" /> Descargar {FORMAT_LABELS[targetFormat]}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en
        ningún momento de este proceso.
      </p>
    </Card>
  );
}
