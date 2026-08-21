"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Crop, Download, ImageOff, RotateCcw } from "lucide-react";
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
} from "@/lib/images/canvas-image";
import { CROP_PRESETS, constrainToAspect } from "@/lib/images/crop";
import type { PixelRect } from "@/lib/images/pixelate";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TOOL_ID = "imagen-recortar";
const MAX_CANVAS_DIMENSION = 1600;

function getCanvasPoint(e: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY)),
  };
}

function normalizeRect(a: { x: number; y: number }, b: { x: number; y: number }): PixelRect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
}

export function ImageCropper() {
  const router = useRouter();
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [aspectId, setAspectId] = useState("free");
  const [selection, setSelection] = useState<PixelRect | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aspectRatio = CROP_PRESETS.find((p) => p.id === aspectId)?.ratio ?? null;

  function drawOverlay(rect: PixelRect | null) {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!rect) return;
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = Math.max(2, overlay.width / 300);
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setSelection(null);
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
      .then(({ img, width, height }) => {
        const scale = Math.min(1, MAX_CANVAS_DIMENSION / Math.max(width, height));
        const w = Math.max(1, Math.round(width * scale));
        const h = Math.max(1, Math.round(height * scale));
        setDimensions({ width: w, height: h });

        const canvas = baseCanvasRef.current;
        const overlay = overlayCanvasRef.current;
        if (!canvas || !overlay) return;
        canvas.width = w;
        canvas.height = h;
        overlay.width = w;
        overlay.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
      })
      .catch((err: Error) => setError(err.message));
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    dragStartRef.current = getCanvasPoint(e, overlay);
    setSelection(null);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !dragStartRef.current) return;
    const current = getCanvasPoint(e, overlay);
    let rect = normalizeRect(dragStartRef.current, current);
    if (aspectRatio) rect = constrainToAspect(rect, aspectRatio);
    drawOverlay(rect);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !dragStartRef.current) return;
    const current = getCanvasPoint(e, overlay);
    let rect = normalizeRect(dragStartRef.current, current);
    if (aspectRatio) rect = constrainToAspect(rect, aspectRatio);
    dragStartRef.current = null;

    if (rect.width < 10 || rect.height < 10) {
      drawOverlay(null);
      setSelection(null);
      return;
    }
    setSelection(rect);
  }

  function handleCrop() {
    const canvas = baseCanvasRef.current;
    if (!canvas || !selection) return;
    const out = document.createElement("canvas");
    out.width = Math.round(selection.width);
    out.height = Math.round(selection.height);
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, selection.x, selection.y, selection.width, selection.height, 0, 0, out.width, out.height);

    const type = file?.type === "image/png" ? "image/png" : "image/jpeg";
    canvasToBlob(out, type, type === "image/jpeg" ? 0.92 : undefined).then((blob) => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      AnalyticsEvents.toolUsed(TOOL_ID);
    });
  }

  function handleReset() {
    setFile(null);
    setDimensions(null);
    setSelection(null);
    setResultBlob(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    const ext = file.type === "image/png" ? "png" : "jpg";
    downloadBlob(resultBlob, `${base}-recortada.${ext}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, ext);
  }

  function handleSendToCompressor() {
    if (!resultBlob || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `recortada.${type === "image/png" ? "png" : "jpg"}`, { type });
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
      <p className="mb-3 text-sm text-slate-500">Arrastra sobre la imagen para marcar la zona que quieres recortar.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {CROP_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setAspectId(p.id);
              setSelection(null);
              drawOverlay(null);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              aspectId === p.id ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        className="relative mx-auto w-full touch-none select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        style={dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}
      >
        <canvas ref={baseCanvasRef} className="block h-full w-full" />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={handleCrop} disabled={!selection}>
          <Crop className="h-4 w-4" /> Recortar
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultUrl && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Imagen recortada" className="max-h-80 rounded-xl border border-slate-200 object-contain" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Descargar imagen
            </Button>
          </div>
          <button
            type="button"
            onClick={handleSendToCompressor}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
          >
            Comprimir esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso.
      </p>
    </Card>
  );
}
