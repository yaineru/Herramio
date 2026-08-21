"use client";

import { useRef, useState, type MouseEvent } from "react";
import { Check, Copy, ImageOff, Pipette, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  formatBytes,
  isSupportedImageType,
  loadImageFile,
  type LoadedImage,
} from "@/lib/images/canvas-image";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-color-picker";

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0").toUpperCase();
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate font-mono text-sm text-slate-900">{value}</p>
      </div>
      <button type="button" onClick={handleCopy} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`Copiar ${label}`}>
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function ImageColorPicker() {
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [color, setColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setColor(null);
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
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img.img, 0, 0);
        canvasRef.current = canvas;
      })
      .catch((err: Error) => setError(err.message));
  }

  function handlePick(e: MouseEvent<HTMLImageElement>) {
    const canvas = canvasRef.current;
    const img = loaded;
    if (!canvas || !img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    setColor({ r, g, b });
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setColor(null);
    setError(null);
    canvasRef.current = null;
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

  const hex = color ? `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}` : null;
  const rgb = color ? `rgb(${color.r}, ${color.g}, ${color.b})` : null;

  return (
    <Card className="p-6">
      <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4">
        {loaded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loaded.objectUrl}
            alt="Haz clic para sacar un color"
            onClick={handlePick}
            className="max-h-96 max-w-full cursor-crosshair object-contain"
          />
        )}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <Pipette className="h-3.5 w-3.5" /> Haz clic en cualquier punto de la imagen para sacar su color.
      </p>

      {color && hex && rgb && (
        <div className="mt-6 grid gap-3 sm:grid-cols-[80px_1fr]">
          <div className="h-20 w-20 rounded-xl border border-slate-200" style={{ backgroundColor: hex }} />
          <div className="grid gap-3">
            <CopyField label="Hexadecimal" value={hex} />
            <CopyField label="RGB" value={rgb} />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso.
      </p>
    </Card>
  );
}
