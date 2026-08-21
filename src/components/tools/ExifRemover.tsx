"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Camera, Calendar, Compass, Download, ImageOff, RotateCcw, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  MAX_IMAGE_BYTES,
  canvasToBlob,
  downloadBlob,
  drawImageToCanvas,
  formatBytes,
  loadImageFile,
} from "@/lib/images/canvas-image";
import { parseJpegExif, type ExifData } from "@/lib/images/exif";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-eliminar-metadata";

export function ExifRemover() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null | undefined>(undefined); // undefined = not analyzed yet
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
    setExif(undefined);
    if (!picked) return;

    if (picked.type !== "image/jpeg" && picked.type !== "image/png") {
      setError("Selecciona una imagen JPEG o PNG.");
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setError(`El archivo es demasiado grande (máx. ${formatBytes(MAX_IMAGE_BYTES)}).`);
      return;
    }

    setFile(picked);
    picked
      .arrayBuffer()
      .then((buffer) => {
        setExif(picked.type === "image/jpeg" ? parseJpegExif(buffer) : null);
        AnalyticsEvents.toolUsed(TOOL_ID);
      })
      .catch(() => setExif(null));

    loadImageFile(picked)
      .then((loaded) => setPreviewUrl(loaded.objectUrl))
      .catch((err: Error) => setError(err.message));
  }

  async function handleClean() {
    if (!file) return;
    try {
      const loaded = await loadImageFile(file);
      // Redrawing onto a fresh canvas never carries EXIF along — canvas
      // pixel data has no metadata concept, so this is a real, complete strip.
      const canvas = drawImageToCanvas(loaded.img, { backgroundColor: file.type === "image/jpeg" ? "#ffffff" : undefined });
      const blob = await canvasToBlob(canvas, file.type, file.type === "image/jpeg" ? 0.95 : undefined);
      setResultBlob(blob);
      AnalyticsEvents.toolDownloaded(TOOL_ID, file.type === "image/png" ? "png" : "jpg");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la imagen.");
    }
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}-sin-metadata.${file.type === "image/png" ? "png" : "jpg"}`);
  }

  function handleSendToCompressor() {
    if (!resultBlob || !file) return;
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const handoffFile = new File([resultBlob], `limpia.${type === "image/png" ? "png" : "jpg"}`, { type });
    setToolHandoff({ sourceTool: TOOL_ID, targetTool: "imagen-comprimir", file: handoffFile });
    AnalyticsEvents.ctaClicked(`handoff_${TOOL_ID}_to_imagen-comprimir`);
    router.push("/imagen-comprimir");
  }

  function handleReset() {
    setFile(null);
    setPreviewUrl(null);
    setExif(undefined);
    setResultBlob(null);
    setError(null);
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="image/jpeg,image/png"
          onFiles={handleFiles}
          label="Arrastra una foto o haz clic para seleccionarla"
          hint={`JPEG o PNG — máx. ${formatBytes(MAX_IMAGE_BYTES)}`}
        />
        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <ImageOff className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}
      </Card>
    );
  }

  const hasGps = exif?.gpsLatitude !== undefined && exif?.gpsLongitude !== undefined;

  return (
    <Card className="p-6">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={`Vista previa de ${file.name}`} className="max-h-80 w-full rounded-xl border border-slate-200 object-contain" />
      )}

      <div className="mt-5">
        {exif === undefined && <p className="text-sm text-slate-400">Analizando metadata…</p>}

        {exif === null && (
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            Esta imagen no tiene metadata EXIF detectable.
          </p>
        )}

        {exif && (
          <div className="space-y-2">
            {hasGps && (
              <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Esta foto incluye la ubicación GPS exacta donde se tomó ({exif.gpsLatitude}, {exif.gpsLongitude}).
              </p>
            )}
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              {exif.make && (
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Camera className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {exif.make} {exif.model}
                </p>
              )}
              {exif.dateTime && (
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" /> {exif.dateTime}
                </p>
              )}
              {hasGps && (
                <p className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                  <Compass className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {exif.gpsLatitude}, {exif.gpsLongitude}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {resultBlob && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Metadata eliminada. Tu imagen está lista para descargar.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleClean} disabled={exif === undefined}>
          <ShieldCheck className="h-4 w-4" /> Eliminar metadata
        </Button>
        {resultBlob && (
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Descargar imagen limpia
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Elegir otra imagen
        </Button>
      </div>

      {resultBlob && (
        <button
          type="button"
          onClick={handleSendToCompressor}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Comprimir esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Todo el análisis y la limpieza ocurren en tu navegador: tu imagen nunca se sube a ningún servidor.
      </p>
    </Card>
  );
}
