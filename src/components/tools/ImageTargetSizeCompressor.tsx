"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, ImageOff, Loader2, RotateCcw, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  canvasToBlob,
  downloadBlob,
  drawImageToCanvas,
  formatBytes,
  isSupportedImageType,
  loadImageFile,
  type LoadedImage,
} from "@/lib/images/canvas-image";
import { binarySearchQuality } from "@/lib/images/target-size";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-comprimir-a-tamano";

export function ImageTargetSizeCompressor() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [targetKb, setTargetKb] = useState("200");
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [reachedTarget, setReachedTarget] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setResultUrl(null);
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

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
    setTargetKb("200");
  }

  async function handleCompress() {
    if (!loaded) return;
    const targetBytes = Number(targetKb) * 1024;
    if (!Number.isFinite(targetBytes) || targetBytes <= 0) {
      setError("Escribe un tamaño objetivo válido en KB.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const quality = await binarySearchQuality(async (q) => {
        const canvas = drawImageToCanvas(loaded.img);
        const blob = await canvasToBlob(canvas, format, q);
        return blob.size;
      }, targetBytes);

      const canvas = drawImageToCanvas(loaded.img);
      const finalBlob = await canvasToBlob(canvas, format, quality);
      setResultBlob(finalBlob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(finalBlob);
      });
      setReachedTarget(finalBlob.size <= targetBytes);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo comprimir la imagen.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    const ext = format === "image/webp" ? "webp" : "jpg";
    downloadBlob(resultBlob, `imagen-comprimida.${ext}`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, ext);
  }

  function handleSendToWatermark() {
    if (!resultBlob) return;
    const ext = format === "image/webp" ? "webp" : "jpg";
    const handoffFile = new File([resultBlob], `comprimida.${ext}`, { type: format });
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
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
          <p className="text-xs text-slate-400">Original: {formatBytes(file.size)}</p>
        </div>
      </div>

      {file.type === "image/png" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700" role="alert">
          El PNG es un formato sin pérdida y no se puede comprimir por calidad. Esta herramienta convertirá tu
          imagen a {format === "image/webp" ? "WebP" : "JPEG"} para alcanzar el tamaño objetivo.
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="target-kb">Tamaño objetivo (KB)</Label>
          <Input id="target-kb" type="number" inputMode="numeric" min={1} value={targetKb} onChange={(e) => setTargetKb(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="target-format">Formato de salida</Label>
          <Select id="target-format" value={format} onChange={(e) => setFormat(e.target.value as "image/jpeg" | "image/webp")}>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
          </Select>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultBlob && resultUrl && (
        <div className="mt-6">
          <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="Vista previa comprimida" className="max-h-72 max-w-full object-contain" />
          </div>
          <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${reachedTarget ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-amber-200 bg-amber-50 text-amber-800"}`}>
            {reachedTarget
              ? `Resultado: ${formatBytes(resultBlob.size)} (objetivo: ${targetKb} KB).`
              : `No se pudo bajar de ${formatBytes(resultBlob.size)} sin degradar demasiado la imagen — es el archivo más pequeño posible incluso con la calidad mínima.`}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleCompress} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
          {isProcessing ? "Comprimiendo…" : "Comprimir a este tamaño"}
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar imagen
          </Button>
        )}
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
          Añadir marca de agua a esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Tu imagen se procesa directamente en tu navegador: no se sube a nuestros servidores en ningún momento de
        este proceso.
      </p>
    </Card>
  );
}
