"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, ImageOff, RotateCcw, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  canvasToBlob,
  downloadBlob,
  formatBytes,
  isSupportedImageType,
  loadImageFile,
  type LoadedImage,
} from "@/lib/images/canvas-image";
import { SOCIAL_CROP_PRESETS, computeCoverCropRect } from "@/lib/images/social-presets";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-recortar-redes-sociales";

export function ImageSocialCrop() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [presetId, setPresetId] = useState(SOCIAL_CROP_PRESETS[0].id);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preset = SOCIAL_CROP_PRESETS.find((p) => p.id === presetId) ?? SOCIAL_CROP_PRESETS[0];

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
    loadImageFile(picked).then(setLoaded).catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(async () => {
      const rect = computeCoverCropRect(loaded.width, loaded.height, preset.ratio);
      const outWidth = preset.outputWidth;
      const outHeight = Math.round(outWidth / preset.ratio);

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(loaded.img, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, outWidth, outHeight);

      const type = file?.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await canvasToBlob(canvas, type, type === "image/jpeg" ? 0.92 : undefined);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    }, 150);
    return () => clearTimeout(timeout);
  }, [loaded, preset, file]);

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    const ext = file.type === "image/png" ? "png" : "jpg";
    downloadBlob(resultBlob, `${base}-${preset.id}.${ext}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, ext);
  }

  function handleSendToCompressor() {
    if (!resultBlob || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `recorte.${type === "image/png" ? "png" : "jpg"}`, { type });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "imagen-comprimir", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_imagen-comprimir`);
    router.push("/imagen-comprimir");
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
      <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4">
        {resultUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultUrl} alt="Vista previa recortada" className="max-h-96 max-w-full object-contain" />
        ) : loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loaded.objectUrl} alt="Vista previa" className="max-h-96 max-w-full object-contain" />
        ) : null}
      </div>

      <div className="mt-5">
        <Label htmlFor="social-preset">Formato de destino</Label>
        <Select id="social-preset" value={presetId} onChange={(e) => setPresetId(e.target.value)}>
          {SOCIAL_CROP_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-400">
          El recorte queda centrado automáticamente ({preset.outputWidth}×{Math.round(preset.outputWidth / preset.ratio)}px).
        </p>
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

      {resultBlob && (
        <button
          type="button"
          onClick={handleSendToCompressor}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Comprimir esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Smartphone className="h-3 w-3" /> Tu imagen se procesa directamente en tu navegador: no se sube a nuestros
        servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
