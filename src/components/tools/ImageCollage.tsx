"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, ImageOff, LayoutGrid, RotateCcw, X } from "lucide-react";
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

const TOOL_ID = "imagen-collage";
const MAX_IMAGES = 4;
const CELL = 480;
const GAP = 10;

function layoutFor(n: number): { cols: number; rows: number } {
  if (n <= 2) return { cols: n, rows: 1 };
  return { cols: 2, rows: 2 };
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, size: number) {
  const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const sw = size / scale;
  const sh = size / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, size, size);
}

export function ImageCollage() {
  const router = useRouter();
  const [items, setItems] = useState<{ file: File; loaded: LoadedImage }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  function handleFiles(files: File[]) {
    setError(null);
    const room = MAX_IMAGES - items.length;
    const toAdd = files.slice(0, room);
    if (files.length > room) {
      setError(`Solo puedes agregar hasta ${MAX_IMAGES} imágenes en total.`);
    }
    for (const picked of toAdd) {
      if (!isSupportedImageType(picked.type)) {
        setError("Formato no compatible. Usa JPEG, PNG o WebP.");
        continue;
      }
      if (picked.size > MAX_IMAGE_BYTES) {
        setError(`Una imagen es demasiado grande (máx. ${formatBytes(MAX_IMAGE_BYTES)}).`);
        continue;
      }
      loadImageFile(picked)
        .then((loaded) => setItems((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, { file: picked, loaded }])))
        .catch((err: Error) => setError(err.message));
    }
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (items.length - 1 < 2) {
      setResultBlob(null);
      setResultUrl(null);
    }
  }

  function handleReset() {
    setItems([]);
    setError(null);
    setResultBlob(null);
    setResultUrl(null);
  }

  useEffect(() => {
    if (items.length < 2) return;
    const timeout = setTimeout(async () => {
      const { cols, rows } = layoutFor(items.length);
      const canvas = document.createElement("canvas");
      canvas.width = cols * CELL + (cols - 1) * GAP;
      canvas.height = rows * CELL + (rows - 1) * GAP;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      items.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        drawCover(ctx, item.loaded.img, col * (CELL + GAP), row * (CELL + GAP), CELL);
      });

      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    }, 150);
    return () => clearTimeout(timeout);
  }, [items]);

  function handleDownload() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "collage.jpg");
    AnalyticsEvents.toolDownloaded(TOOL_ID, "jpg");
  }

  function handleSendToCompressor() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "collage.jpg", { type: "image/jpeg" });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "imagen-comprimir", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_imagen-comprimir`);
    router.push("/imagen-comprimir");
  }

  return (
    <Card className="p-6">
      {items.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.loaded.objectUrl} alt={`Imagen ${i + 1}`} className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label="Quitar imagen"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length < MAX_IMAGES && (
        <FileDropZone
          accept="image/jpeg,image/png,image/webp"
          multiple
          onFiles={handleFiles}
          label={items.length === 0 ? "Arrastra 2 a 4 imágenes o haz clic para seleccionarlas" : "Añadir otra imagen"}
          hint={`JPEG, PNG o WebP — máx. ${formatBytes(MAX_IMAGE_BYTES)} c/u`}
        />
      )}

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <ImageOff className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {items.length === 1 && (
        <p className="mt-4 text-sm text-slate-400">Añade al menos una imagen más para generar el collage.</p>
      )}

      {resultUrl && (
        <div className="mt-6 flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Vista previa del collage" className="max-h-96 max-w-full object-contain" />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob}>
          <Download className="h-4 w-4" /> Descargar collage
        </Button>
        {items.length > 0 && (
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </Button>
        )}
      </div>

      {resultBlob && (
        <button
          type="button"
          onClick={handleSendToCompressor}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Comprimir este collage sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <LayoutGrid className="h-3 w-3" /> Tus imágenes se procesan directamente en tu navegador: no se suben a
        nuestros servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
