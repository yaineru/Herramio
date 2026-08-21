"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Circle, Download, ImageOff, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
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
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-circulo";

export function ImageCircleCrop() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [sizePercent, setSizePercent] = useState(100);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setSizePercent(100);
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
      const size = Math.max(1, Math.round(Math.min(loaded.width, loaded.height) * (sizePercent / 100)));
      const sx = (loaded.width - size) / 2;
      const sy = (loaded.height - size) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(loaded.img, sx, sy, size, size, 0, 0, size, size);
      ctx.restore();

      const blob = await canvasToBlob(canvas, "image/png");
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    }, 150);
    return () => clearTimeout(timeout);
  }, [loaded, sizePercent]);

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
    downloadBlob(resultBlob, `${base}-circular.png`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, "png");
  }

  function handleSendToCompressor() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "circular.png", { type: "image/png" });
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
      <div
        className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,white_0%_50%)] bg-[length:20px_20px] p-4"
      >
        {resultUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultUrl} alt="Vista previa circular" className="max-h-96 max-w-full object-contain" />
        ) : loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loaded.objectUrl} alt="Vista previa" className="max-h-96 max-w-full object-contain" />
        ) : null}
      </div>

      <div className="mt-5">
        <Label htmlFor="circle-size">Tamaño del círculo ({sizePercent}%)</Label>
        <input
          id="circle-size"
          type="range"
          min={30}
          max={100}
          value={sizePercent}
          onChange={(e) => setSizePercent(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-600"
        />
        <p className="mt-1 text-xs text-slate-400">
          El recorte siempre queda centrado en la imagen. 100% usa el lado más corto completo.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob}>
          <Download className="h-4 w-4" /> Descargar PNG
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
        <Circle className="h-3 w-3" /> Tu imagen se procesa directamente en tu navegador: no se sube a nuestros
        servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
