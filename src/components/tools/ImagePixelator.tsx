"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Download, Grid3x3, ImageOff, RotateCcw, Square } from "lucide-react";
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
} from "@/lib/images/canvas-image";
import { pixelateRegion, type PixelRect } from "@/lib/images/pixelate";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-pixelar";
const MAX_CANVAS_DIMENSION = 1600; // caps very large photos so pixel scanning stays fast

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
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

export function ImagePixelator() {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [blockSize, setBlockSize] = useState(16);
  const [pendingRect, setPendingRect] = useState<PixelRect | null>(null);
  const [hasEdits, setHasEdits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function drawOverlayRect(rect: PixelRect | null) {
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
    setPendingRect(null);
    setHasEdits(false);
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

        // Refs are already attached: `file` (set synchronously above, before
        // this promise resolves) is what mounts the canvas elements, so by
        // the time the image finishes loading they already exist in the DOM.
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
      .catch((err: Error) => {
        setError(err.message);
        AnalyticsEvents.toolError(TOOL_ID, err.message);
      });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    dragStartRef.current = getCanvasPoint(e, overlay);
    setPendingRect(null);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !dragStartRef.current) return;
    const current = getCanvasPoint(e, overlay);
    drawOverlayRect(normalizeRect(dragStartRef.current, current));
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !dragStartRef.current) return;
    const current = getCanvasPoint(e, overlay);
    const rect = normalizeRect(dragStartRef.current, current);
    dragStartRef.current = null;

    if (rect.width < 6 || rect.height < 6) {
      drawOverlayRect(null);
      setPendingRect(null);
      return;
    }
    setPendingRect(rect);
  }

  function applyPixelation(rect: PixelRect) {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const out = pixelateRegion(imageData.data, canvas.width, canvas.height, rect, blockSize);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(out), canvas.width, canvas.height), 0, 0);
    setHasEdits(true);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handlePixelateSelection() {
    if (!pendingRect) return;
    applyPixelation(pendingRect);
    setPendingRect(null);
    drawOverlayRect(null);
  }

  function handlePixelateAll() {
    if (!dimensions) return;
    applyPixelation({ x: 0, y: 0, width: dimensions.width, height: dimensions.height });
    setPendingRect(null);
    drawOverlayRect(null);
  }

  function handleReset() {
    setFile(null);
    setDimensions(null);
    setPendingRect(null);
    setHasEdits(false);
    setError(null);
  }

  async function handleDownload() {
    const canvas = baseCanvasRef.current;
    if (!canvas || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, type, type === "image/jpeg" ? 0.92 : undefined);
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(blob, `${base}-pixelada.${type === "image/png" ? "png" : "jpg"}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, type === "image/png" ? "png" : "jpg");
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
      <p className="mb-3 text-sm text-slate-500">
        Arrastra sobre la imagen para seleccionar la zona que quieres pixelar (una cara, un documento, un dato
        sensible...). Puedes repetirlo varias veces.
      </p>

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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pixel-block-size">Tamaño del bloque ({blockSize}px)</Label>
          <input
            id="pixel-block-size"
            type="range"
            min={4}
            max={48}
            step={2}
            value={blockSize}
            onChange={(e) => setBlockSize(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Button type="button" onClick={handlePixelateSelection} disabled={!pendingRect}>
            <Square className="h-4 w-4" /> Pixelar zona seleccionada
          </Button>
          <Button type="button" variant="outline" onClick={handlePixelateAll} disabled={!dimensions}>
            <Grid3x3 className="h-4 w-4" /> Pixelar toda la imagen
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!hasEdits}>
          <Download className="h-4 w-4" /> Descargar imagen
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
