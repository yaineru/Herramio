"use client";

import { useState } from "react";
import { Download, ImageOff, RotateCcw } from "lucide-react";
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
  resizeImageToCanvas,
} from "@/lib/images/canvas-image";
import { FAVICON_SIZES } from "@/lib/images/favicon-sizes";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-favicon";

interface GeneratedIcon {
  id: string;
  label: string;
  size: number;
  url: string;
  blob: Blob;
}

export function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [icons, setIcons] = useState<GeneratedIcon[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setIcons(null);
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
      .then(async ({ img }) => {
        const generated: GeneratedIcon[] = [];
        for (const preset of FAVICON_SIZES) {
          const canvas = resizeImageToCanvas(img, preset.size, preset.size);
          const blob = await canvasToBlob(canvas, "image/png");
          generated.push({ id: preset.id, label: preset.label, size: preset.size, url: URL.createObjectURL(blob), blob });
        }
        setIcons(generated);
        AnalyticsEvents.toolUsed(TOOL_ID);
      })
      .catch((err: Error) => setError(err.message));
  }

  function handleReset() {
    setFile(null);
    setIcons(null);
    setError(null);
  }

  function handleDownload(icon: GeneratedIcon) {
    downloadBlob(icon.blob, `${icon.label}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, "png");
  }

  function handleDownloadAll() {
    if (!icons) return;
    icons.forEach((icon, i) => setTimeout(() => handleDownload(icon), i * 150));
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="image/jpeg,image/png,image/webp"
          onFiles={handleFiles}
          label="Arrastra un logo o imagen cuadrada, o haz clic para seleccionarla"
          hint={`Idealmente cuadrada — JPEG, PNG o WebP, máx. ${formatBytes(MAX_IMAGE_BYTES)}`}
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
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {icons && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {icons.map((icon) => (
            <div key={icon.id} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon.url} alt={icon.label} className="h-12 w-12 rounded border border-slate-200 bg-white object-contain" />
              <p className="text-center text-xs text-slate-500">{icon.size}×{icon.size}px</p>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDownload(icon)}>
                <Download className="h-3 w-3" /> Descargar
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownloadAll} disabled={!icons}>
          <Download className="h-4 w-4" /> Descargar todos
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Genera los tamaños de ícono más usados por navegadores y móviles a partir de tu imagen — procesado
        directamente en tu navegador, sin subir nada a un servidor.
      </p>
    </Card>
  );
}
