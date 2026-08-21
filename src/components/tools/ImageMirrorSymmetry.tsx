"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FlipHorizontal2, ImageOff, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
import { cn } from "@/lib/utils";

const TOOL_ID = "imagen-espejo-simetria";

type Mode = "left" | "right" | "top" | "bottom";

const MODES: { value: Mode; label: string }[] = [
  { value: "left", label: "Mitad izquierda" },
  { value: "right", label: "Mitad derecha" },
  { value: "top", label: "Mitad superior" },
  { value: "bottom", label: "Mitad inferior" },
];

export function ImageMirrorSymmetry() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [mode, setMode] = useState<Mode>("left");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const { width, height } = loaded;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (mode === "left" || mode === "right") {
        const half = width / 2;
        if (mode === "left") {
          ctx.drawImage(loaded.img, 0, 0, half, height, 0, 0, half, height);
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(loaded.img, 0, 0, half, height, 0, 0, half, height);
          ctx.restore();
        } else {
          ctx.drawImage(loaded.img, half, 0, half, height, half, 0, half, height);
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(loaded.img, half, 0, half, height, 0, 0, half, height);
          ctx.restore();
        }
      } else {
        const half = height / 2;
        if (mode === "top") {
          ctx.drawImage(loaded.img, 0, 0, width, half, 0, 0, width, half);
          ctx.save();
          ctx.translate(0, height);
          ctx.scale(1, -1);
          ctx.drawImage(loaded.img, 0, 0, width, half, 0, 0, width, half);
          ctx.restore();
        } else {
          ctx.drawImage(loaded.img, 0, half, width, half, 0, half, width, half);
          ctx.save();
          ctx.translate(0, height);
          ctx.scale(1, -1);
          ctx.drawImage(loaded.img, 0, half, width, half, 0, 0, width, half);
          ctx.restore();
        }
      }

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
  }, [loaded, mode, file]);

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
    downloadBlob(resultBlob, `${base}-simetria.${ext}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, ext);
  }

  function handleSendToWatermark() {
    if (!resultBlob || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `simetria.${type === "image/png" ? "png" : "jpg"}`, { type });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "imagen-marca-agua", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_imagen-marca-agua`);
    router.push("/imagen-marca-agua");
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={handleFiles}
          label="Arrastra una imagen o haz clic para seleccionarla"
          hint={`Ideal con rostros o retratos — máx. ${formatBytes(MAX_IMAGE_BYTES)}`}
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
          <img src={resultUrl} alt="Vista previa con simetría" className="max-h-96 max-w-full object-contain" />
        ) : loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loaded.objectUrl} alt="Vista previa" className="max-h-96 max-w-full object-contain" />
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              mode === m.value ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300",
            )}
          >
            {m.label}
          </button>
        ))}
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
          onClick={handleSendToWatermark}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Añadir marca de agua a esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <FlipHorizontal2 className="h-3 w-3" /> Duplica una mitad de la imagen sobre la otra en espejo, creando un
        efecto de simetría perfecta. Procesado directamente en tu navegador.
      </p>
    </Card>
  );
}
