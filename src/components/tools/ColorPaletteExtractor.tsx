"use client";

import { useState } from "react";
import { Check, Copy, ImageOff, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  formatBytes,
  isSupportedImageType,
  loadImageFile,
} from "@/lib/images/canvas-image";
import { extractPalette, type PaletteColor } from "@/lib/images/color-palette";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-paleta-colores";
const SAMPLE_SIZE = 150; // downsample to keep pixel scanning fast regardless of source resolution

export function ColorPaletteExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteColor[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setPalette(null);
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
    setIsProcessing(true);

    loadImageFile(picked)
      .then(({ img, objectUrl, width, height }) => {
        setPreviewUrl(objectUrl);
        const scale = Math.min(1, SAMPLE_SIZE / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Tu navegador no pudo procesar esta imagen.");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setPalette(extractPalette(data, 6));
        AnalyticsEvents.toolUsed(TOOL_ID);
      })
      .catch((err: Error) => {
        setError(err.message);
        AnalyticsEvents.toolError(TOOL_ID, err.message);
      })
      .finally(() => setIsProcessing(false));
  }

  function handleReset() {
    setFile(null);
    setPreviewUrl(null);
    setPalette(null);
    setError(null);
  }

  async function handleCopy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  async function handleCopyAll() {
    if (!palette) return;
    try {
      await navigator.clipboard.writeText(palette.map((p) => p.hex).join(", "));
      setCopied("all");
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
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
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Imagen</p>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Vista previa de ${file.name}`}
              className="w-full rounded-xl border border-slate-200 object-contain"
            />
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Paleta extraída</p>
            {palette && palette.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={handleCopyAll}>
                {copied === "all" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === "all" ? "Copiado" : "Copiar todos"}
              </Button>
            )}
          </div>

          {isProcessing ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : palette && palette.length > 0 ? (
            <div className="space-y-2">
              {palette.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handleCopy(color.hex)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300"
                >
                  <span className="h-9 w-9 shrink-0 rounded-lg border border-slate-200" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-medium text-slate-900">{color.hex}</span>
                    <span className="block text-xs text-slate-400">{color.percentage}% de la imagen</span>
                  </span>
                  {copied === color.hex ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <Copy className="h-4 w-4 shrink-0 text-slate-300" />}
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
              No se pudo extraer una paleta de esta imagen.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6">
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
