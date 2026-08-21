"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, ImageOff, Lock, RotateCcw, Unlock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  canvasToBlob,
  downloadBlob,
  extensionForMime,
  formatBytes,
  isSupportedImageType,
  loadImageFile,
  resizeImageToCanvas,
  type LoadedImage,
} from "@/lib/images/canvas-image";
import { RESIZE_PRESETS, maintainAspectRatio } from "@/lib/images/resize-presets";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-redimensionar";

export function ImageResizer() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockRatio, setLockRatio] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

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
    loadImageFile(picked)
      .then((img) => {
        setLoaded(img);
        setWidth(String(img.width));
        setHeight(String(img.height));
      })
      .catch((err: Error) => setError(err.message));
  }

  function applyPreset(presetId: string) {
    const preset = RESIZE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setWidth(String(preset.width));
    setHeight(String(preset.height));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleWidthChange(value: string) {
    setWidth(value);
    if (lockRatio && loaded && value) {
      setHeight(String(maintainAspectRatio(loaded.width, loaded.height, "width", Number(value))));
    }
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleHeightChange(value: string) {
    setHeight(value);
    if (lockRatio && loaded && value) {
      setWidth(String(maintainAspectRatio(loaded.width, loaded.height, "height", Number(value))));
    }
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const targetWidth = Number(width);
  const targetHeight = Number(height);
  const validDimensions = Number.isFinite(targetWidth) && Number.isFinite(targetHeight) && targetWidth > 0 && targetHeight > 0;

  useEffect(() => {
    if (!loaded || !validDimensions) return;
    const timeout = setTimeout(async () => {
      try {
        const canvas = resizeImageToCanvas(loaded.img, targetWidth, targetHeight);
        const type = file?.type === "image/png" ? "image/png" : "image/jpeg";
        const blob = await canvasToBlob(canvas, type, type === "image/jpeg" ? 0.9 : undefined);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultBlob(blob);
        setResultUrl(URL.createObjectURL(blob));
        AnalyticsEvents.toolUsed(TOOL_ID);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo redimensionar la imagen.");
      }
    }, 200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, targetWidth, targetHeight]);

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setWidth("");
    setHeight("");
    setResultBlob(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    downloadBlob(resultBlob, `${base}-${targetWidth}x${targetHeight}.${extensionForMime(type)}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, extensionForMime(type));
  }

  function handleSendToPdf() {
    if (!resultBlob || !file || file.type === "image/webp") return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `redimensionada.${extensionForMime(type)}`, { type });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "jpg-a-pdf", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_jpg-a-pdf`);
    router.push("/jpg-a-pdf");
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
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Original</p>
          {loaded && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={loaded.objectUrl} alt={`Vista previa de ${file.name}`} className="w-full rounded-xl border border-slate-200 object-contain" />
          )}
          {loaded && <p className="mt-2 text-sm text-slate-500">{loaded.width}×{loaded.height}px · {formatBytes(file.size)}</p>}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {resultUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="Vista previa redimensionada" className="h-full w-full object-contain" />
            ) : (
              <p className="text-sm text-slate-400">Ajusta el tamaño para ver el resultado</p>
            )}
          </div>
          {resultBlob && <p className="mt-2 text-sm text-slate-500">{targetWidth}×{targetHeight}px · {formatBytes(resultBlob.size)}</p>}
        </div>
      </div>

      <div className="mt-6">
        <Label htmlFor="resize-preset">Tamaño predefinido</Label>
        <Select id="resize-preset" onChange={(e) => applyPreset(e.target.value)} defaultValue="">
          <option value="" disabled>Elige un tamaño para redes sociales…</option>
          {RESIZE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>{p.label} ({p.width}×{p.height})</option>
          ))}
        </Select>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="resize-width">Ancho (px)</Label>
          <Input id="resize-width" type="number" inputMode="numeric" min={1} value={width} onChange={(e) => handleWidthChange(e.target.value)} />
        </div>
        <button
          type="button"
          onClick={() => setLockRatio((v) => !v)}
          aria-label={lockRatio ? "Desbloquear proporción" : "Bloquear proporción"}
          aria-pressed={lockRatio}
          className="mb-2.5 shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
        >
          {lockRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
        <div className="flex-1">
          <Label htmlFor="resize-height">Alto (px)</Label>
          <Input id="resize-height" type="number" inputMode="numeric" min={1} value={height} onChange={(e) => handleHeightChange(e.target.value)} />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob}>
          <Download className="h-4 w-4" /> Descargar imagen
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      {resultBlob && file.type !== "image/webp" && (
        <button
          type="button"
          onClick={handleSendToPdf}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Crear un PDF con esta imagen <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
