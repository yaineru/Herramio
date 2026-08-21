"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, ImageOff, RotateCcw, Smile } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
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

const TOOL_ID = "imagen-meme";
const MEME_FONT_STACK = "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function drawMemeText(ctx: CanvasRenderingContext2D, text: string, fontSize: number, canvasWidth: number, baselineY: number, growUpward: boolean) {
  ctx.font = `bold ${fontSize}px ${MEME_FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineWidth = fontSize / 12;
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";

  const lines = wrapText(ctx, text.toUpperCase(), canvasWidth * 0.92);
  const lineHeight = fontSize * 1.15;
  lines.forEach((line, i) => {
    const y = growUpward ? baselineY - (lines.length - 1 - i) * lineHeight : baselineY + i * lineHeight;
    ctx.strokeText(line, canvasWidth / 2, y);
    ctx.fillText(line, canvasWidth / 2, y);
  });
}

export function ImageMemeGenerator() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setTopText("");
    setBottomText("");
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
      const canvas = document.createElement("canvas");
      canvas.width = loaded.width;
      canvas.height = loaded.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(loaded.img, 0, 0);
      const fontSize = Math.round(loaded.width / 11);
      const margin = fontSize * 0.3;
      if (topText.trim()) drawMemeText(ctx, topText, fontSize, loaded.width, margin + fontSize, false);
      if (bottomText.trim()) drawMemeText(ctx, bottomText, fontSize, loaded.width, loaded.height - margin, true);

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
  }, [loaded, topText, bottomText, file]);

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const ext = file.type === "image/png" ? "png" : "jpg";
    downloadBlob(resultBlob, `meme.${ext}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, ext);
  }

  function handleSendToWatermark() {
    if (!resultBlob || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `meme.${type === "image/png" ? "png" : "jpg"}`, { type });
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
          <img src={resultUrl} alt="Vista previa del meme" className="max-h-96 max-w-full object-contain" />
        ) : loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loaded.objectUrl} alt="Vista previa" className="max-h-96 max-w-full object-contain" />
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="meme-top">Texto superior</Label>
          <Input id="meme-top" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="TEXTO DE ARRIBA" maxLength={120} />
        </div>
        <div>
          <Label htmlFor="meme-bottom">Texto inferior</Label>
          <Input id="meme-bottom" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="TEXTO DE ABAJO" maxLength={120} />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob}>
          <Download className="h-4 w-4" /> Descargar meme
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
          Añadir marca de agua a este meme sin volver a subirlo <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Smile className="h-3 w-3" /> Tu imagen se procesa directamente en tu navegador: no se sube a nuestros
        servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
