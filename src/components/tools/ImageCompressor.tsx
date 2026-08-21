"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ImageOff, Loader2, RotateCcw, ArrowRight } from "lucide-react";
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
import { setToolHandoff, consumeToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

type OutputFormat = "image/jpeg" | "image/webp" | "image/png";

export function ImageCompressor() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened("imagen-comprimir");
  }, []);

  // Picks up an image handed off from imagen-eliminar-metadata (or any other
  // source that reuses this same handoff target) via the exact same
  // validation path as a manual upload — no separate code path to keep in
  // sync. A no-op when there's nothing pending.
  useEffect(() => {
    const handoffFile = consumeToolHandoff("imagen-comprimir");
    if (handoffFile) handleFiles([handoffFile]);
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
    setOutputFormat(picked.type === "image/png" ? "image/png" : "image/jpeg");

    loadImageFile(picked)
      .then(setLoaded)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(async () => {
      // Runs after the debounce delay, not synchronously in the effect body,
      // so this async work (and the setState calls inside it) is a response
      // to a timer firing, not a render — the pattern useEffect exists for.
      setIsProcessing(true);
      try {
        const canvas = drawImageToCanvas(loaded.img, {
          backgroundColor: outputFormat === "image/jpeg" ? "#ffffff" : undefined,
        });
        const q = outputFormat === "image/png" ? undefined : quality / 100;
        const blob = await canvasToBlob(canvas, outputFormat, q);
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        const url = URL.createObjectURL(blob);
        resultUrlRef.current = url;
        setResultBlob(blob);
        setResultUrl(url);
        setError(null);
        AnalyticsEvents.toolUsed("imagen-comprimir");
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo comprimir la imagen.";
        setError(message);
        AnalyticsEvents.toolError("imagen-comprimir", message);
      } finally {
        setIsProcessing(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [loaded, outputFormat, quality]);

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setResultBlob(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}-comprimida.${extensionForMime(outputFormat)}`);
    AnalyticsEvents.toolDownloaded("imagen-comprimir", extensionForMime(outputFormat));
  }

  function handleSendToConverter() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    const handoffFile = new File([resultBlob], `${base}-comprimida.${extensionForMime(outputFormat)}`, {
      type: outputFormat,
    });
    setToolHandoff({ sourceTool: "imagen-comprimir", targetTool: "imagen-convertir", file: handoffFile });
    router.push("/imagen-convertir");
  }

  const reduction =
    file && resultBlob ? Math.round((1 - resultBlob.size / file.size) * 100) : null;

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
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Original</p>
          {loaded && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loaded.objectUrl}
              alt={`Vista previa de ${file.name}`}
              className="w-full rounded-xl border border-slate-200 object-contain"
            />
          )}
          <p className="mt-2 text-sm text-slate-500">
            {formatBytes(file.size)} · {loaded ? `${loaded.width}×${loaded.height}px` : "…"}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="Vista previa comprimida" className="h-full w-full object-contain" />
            ) : (
              <p className="text-sm text-slate-400">Ajusta la calidad para ver el resultado</p>
            )}
          </div>
          {resultBlob && (
            <p className="mt-2 text-sm text-slate-500">
              {formatBytes(resultBlob.size)}
              {reduction !== null && reduction > 0 && (
                <span className="ml-1.5 font-medium text-emerald-600">−{reduction}%</span>
              )}
              {reduction !== null && reduction <= 0 && (
                <span className="ml-1.5 text-amber-600">sin reducción de tamaño</span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="output-format">Formato de salida</Label>
          <Select
            id="output-format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
          >
            <option value="image/jpeg">JPEG (recomendado, mejor compresión)</option>
            <option value="image/webp">WebP (mejor compresión, menos compatible)</option>
            <option value="image/png">PNG (sin pérdida, casi no reduce el tamaño)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="quality">
            Calidad ({quality}%){outputFormat === "image/png" && " — no aplica en PNG"}
          </Label>
          <input
            id="quality"
            type="range"
            min={10}
            max={100}
            step={5}
            value={quality}
            disabled={outputFormat === "image/png"}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="mt-3 w-full accent-emerald-600 disabled:opacity-40"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob || isProcessing}>
          <Download className="h-4 w-4" /> Descargar imagen comprimida
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      {resultBlob && !isProcessing && (
        <button
          type="button"
          onClick={handleSendToConverter}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          ¿Necesitas el resultado en otro formato? Conviértelo sin volver a subirlo{" "}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en
        ningún momento de este proceso.
      </p>
    </Card>
  );
}
