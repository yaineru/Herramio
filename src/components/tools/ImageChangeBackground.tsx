"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, ImageOff, Pipette, RotateCcw } from "lucide-react";
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
import { removeColorBackground, type RgbColor } from "@/lib/images/chroma-key";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-cambiar-fondo";
const MAX_CANVAS_DIMENSION = 1200;

function rgbToHex({ r, g, b }: RgbColor): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function ImageChangeBackground() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetColor, setTargetColor] = useState<RgbColor>({ r: 255, g: 255, b: 255 });
  const [tolerance, setTolerance] = useState(30);
  const [newBackground, setNewBackground] = useState("#10b981");
  const [picking, setPicking] = useState(true);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setApplied(false);
    setPicking(true);
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

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        originalImageDataRef.current = ctx.getImageData(0, 0, w, h);
      })
      .catch((err: Error) => setError(err.message));
  }

  function handlePick(e: ReactMouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !picking) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    const original = originalImageDataRef.current;
    if (!original) return;
    const i = (y * canvas.width + x) * 4;
    setTargetColor({ r: original.data[i], g: original.data[i + 1], b: original.data[i + 2] });
    setPicking(false);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const original = originalImageDataRef.current;
    if (!canvas || !original || picking) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cutout = removeColorBackground(original.data, targetColor, tolerance);
    ctx.fillStyle = newBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(new ImageData(new Uint8ClampedArray(cutout), canvas.width, canvas.height), 0, 0);
    setApplied(true);
  }, [targetColor, tolerance, newBackground, picking]);

  function handleReset() {
    setFile(null);
    setDimensions(null);
    setApplied(false);
    setPicking(true);
    setError(null);
    originalImageDataRef.current = null;
  }

  function handlePickAgain() {
    setPicking(true);
    const canvas = canvasRef.current;
    const original = originalImageDataRef.current;
    if (canvas && original) {
      const ctx = canvas.getContext("2d");
      ctx?.putImageData(original, 0, 0);
    }
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !file) return;
    const blob = await canvasToBlob(canvas, "image/png");
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(blob, `${base}-fondo-nuevo.png`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, "png");
  }

  async function handleSendToCompressor() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas, "image/png");
    const handoffFile = new File([blob], "fondo-nuevo.png", { type: "image/png" });
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
          hint={`Ideal con fondo de un solo color — máx. ${formatBytes(MAX_IMAGE_BYTES)}`}
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
      <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Pipette className="h-4 w-4 shrink-0" />
        {picking ? "Haz clic en el color de fondo que quieres reemplazar." : "Ajusta la tolerancia o el nuevo color de fondo."}
      </p>

      <div
        className="mx-auto w-full overflow-hidden rounded-xl border border-slate-200 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,white_0%_50%)] bg-[length:16px_16px]"
        style={dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}
      >
        <canvas ref={canvasRef} onClick={handlePick} className={`block h-full w-full ${picking ? "cursor-crosshair" : ""}`} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 shrink-0 rounded-lg border border-slate-300" style={{ backgroundColor: rgbToHex(targetColor) }} aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Color a reemplazar</p>
            <p className="font-mono text-sm text-slate-700">{rgbToHex(targetColor).toUpperCase()}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handlePickAgain} className="ml-auto">
            <Pipette className="h-3.5 w-3.5" /> Elegir otro
          </Button>
        </div>
        <div>
          <Label htmlFor="bg-new-color">Nuevo color de fondo</Label>
          <input
            id="bg-new-color"
            type="color"
            value={newBackground}
            onChange={(e) => setNewBackground(e.target.value)}
            className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-300"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="bg-tolerance">Tolerancia ({tolerance})</Label>
        <input
          id="bg-tolerance"
          type="range"
          min={5}
          max={100}
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-600"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!applied}>
          <Download className="h-4 w-4" /> Descargar PNG
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      {applied && (
        <button
          type="button"
          onClick={handleSendToCompressor}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Comprimir esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Funciona mejor con fondos de un solo color (blanco, verde, etc.) — no es una eliminación de fondo con IA.
        Tu imagen se procesa directamente en tu navegador, sin subir nada a un servidor.
      </p>
    </Card>
  );
}
