"use client";

import { useState } from "react";
import { Check, Copy, ImageOff, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { MAX_IMAGE_BYTES, formatBytes, isSupportedImageType, loadImageFile } from "@/lib/images/canvas-image";
import { imageDataToAscii } from "@/lib/images/ascii-art";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-ascii";

export function AsciiArtConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cols, setCols] = useState(90);
  const [ascii, setAscii] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function render(img: HTMLImageElement, width: number, height: number, columns: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    setAscii(imageDataToAscii(data, width, height, columns));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setAscii(null);
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
        setLoadedImg(img);
        setDimensions({ width, height });
        render(img, width, height, cols);
      })
      .catch((err: Error) => setError(err.message));
  }

  function handleColsChange(value: number) {
    setCols(value);
    if (loadedImg && dimensions) render(loadedImg, dimensions.width, dimensions.height, value);
  }

  function handleReset() {
    setFile(null);
    setLoadedImg(null);
    setDimensions(null);
    setAscii(null);
    setError(null);
  }

  async function handleCopy() {
    if (!ascii) return;
    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  function handleDownload() {
    if (!ascii) return;
    const blob = new Blob([ascii], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arte-ascii.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    AnalyticsEvents.toolDownloaded(TOOL_ID, "txt");
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
      <Label htmlFor="ascii-cols">Ancho ({cols} caracteres)</Label>
      <input
        id="ascii-cols"
        type="range"
        min={30}
        max={200}
        step={5}
        value={cols}
        onChange={(e) => handleColsChange(Number(e.target.value))}
        className="mt-2 w-full accent-emerald-600"
      />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {ascii && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                Descargar .txt
              </Button>
            </div>
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-3 text-[6px] leading-[7px] text-emerald-400 sm:text-[8px] sm:leading-[9px]">
            {ascii}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
