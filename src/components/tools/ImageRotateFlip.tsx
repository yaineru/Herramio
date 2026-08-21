"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, FlipHorizontal2, FlipVertical2, ImageOff, RotateCcw, RotateCw } from "lucide-react";
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

const TOOL_ID = "imagen-rotar-voltear";

export function ImageRotateFlip() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
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

  function render(nextRotation: number, nextFlipH: boolean, nextFlipV: boolean) {
    if (!loaded) return;
    const swapDims = nextRotation === 90 || nextRotation === 270;
    const canvas = document.createElement("canvas");
    canvas.width = swapDims ? loaded.height : loaded.width;
    canvas.height = swapDims ? loaded.width : loaded.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((nextRotation * Math.PI) / 180);
    ctx.scale(nextFlipH ? -1 : 1, nextFlipV ? -1 : 1);
    ctx.drawImage(loaded.img, -loaded.width / 2, -loaded.height / 2);
    ctx.restore();

    const type = file?.type === "image/png" ? "image/png" : "image/jpeg";
    canvasToBlob(canvas, type, type === "image/jpeg" ? 0.92 : undefined).then((blob) => {
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultBlob(blob);
    });
  }

  function applyRotate(delta: number) {
    const next = (rotation + delta + 360) % 360;
    setRotation(next);
    render(next, flipH, flipV);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function applyFlip(axis: "h" | "v") {
    const nextH = axis === "h" ? !flipH : flipH;
    const nextV = axis === "v" ? !flipV : flipV;
    setFlipH(nextH);
    setFlipV(nextV);
    render(rotation, nextH, nextV);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

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
    downloadBlob(resultBlob, `${base}-editada.${ext}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, ext);
  }

  function handleSendToCompressor() {
    if (!resultBlob || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `editada.${type === "image/png" ? "png" : "jpg"}`, { type });
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
          <img src={resultUrl} alt="Vista previa" className="max-h-80 max-w-full object-contain" />
        ) : loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loaded.objectUrl} alt="Vista previa" className="max-h-80 max-w-full object-contain" />
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={() => applyRotate(-90)}>
          <RotateCcw className="h-4 w-4" /> Girar izquierda
        </Button>
        <Button type="button" variant="outline" onClick={() => applyRotate(90)}>
          <RotateCw className="h-4 w-4" /> Girar derecha
        </Button>
        <Button type="button" variant="outline" onClick={() => applyFlip("h")}>
          <FlipHorizontal2 className="h-4 w-4" /> Voltear horizontal
        </Button>
        <Button type="button" variant="outline" onClick={() => applyFlip("v")}>
          <FlipVertical2 className="h-4 w-4" /> Voltear vertical
        </Button>
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
          Elegir otra imagen
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

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso.
      </p>
    </Card>
  );
}
