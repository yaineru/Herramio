"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, Droplet, ImageOff, RotateCcw } from "lucide-react";
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
  type LoadedImage,
} from "@/lib/images/canvas-image";
import { applyDuotoneEffect, type RgbColor } from "@/lib/images/duotone";
import { setToolHandoff } from "@/lib/tool-handoff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "imagen-duotono";

const PRESETS: { label: string; a: string; b: string }[] = [
  { label: "Azul / Rosa", a: "#0f2557", b: "#ff6fb5" },
  { label: "Morado / Naranja", a: "#2d0b4e", b: "#ff9d42" },
  { label: "Verde / Amarillo", a: "#0b3d2e", b: "#f9e94e" },
  { label: "Rojo / Crema", a: "#3a0000", b: "#fff2d8" },
  { label: "Blanco y negro", a: "#000000", b: "#ffffff" },
];

function hexToRgb(hex: string): RgbColor {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function ImageDuotone() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [colorA, setColorA] = useState(PRESETS[0].a);
  const [colorB, setColorB] = useState(PRESETS[0].b);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResultBlob(null);
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

      const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const mapped = applyDuotoneEffect(original.data, hexToRgb(colorA), hexToRgb(colorB));
      ctx.putImageData(new ImageData(new Uint8ClampedArray(mapped), canvas.width, canvas.height), 0, 0);

      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultBlob(blob);
      AnalyticsEvents.toolUsed(TOOL_ID);
    }, 150);
    return () => clearTimeout(timeout);
  }, [loaded, colorA, colorB]);

  function handleReset() {
    setFile(null);
    setLoaded(null);
    setResultBlob(null);
    setResultUrl(null);
    setError(null);
  }

  function handleDownload() {
    if (!resultBlob || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadBlob(resultBlob, `${base}-duotono.jpg`);
    AnalyticsEvents.toolDownloaded(TOOL_ID, "jpg");
  }

  function handleSendToWatermark() {
    if (!resultBlob) return;
    const handoffFile = new File([resultBlob], "duotono.jpg", { type: "image/jpeg" });
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
          <img src={resultUrl} alt="Vista previa duotono" className="max-h-96 max-w-full object-contain" />
        ) : loaded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loaded.objectUrl} alt="Vista previa" className="max-h-96 max-w-full object-contain" />
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => { setColorA(preset.a); setColorB(preset.b); }}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="flex h-3.5 w-3.5 overflow-hidden rounded-full border border-slate-300">
              <span className="w-1/2" style={{ backgroundColor: preset.a }} />
              <span className="w-1/2" style={{ backgroundColor: preset.b }} />
            </span>
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="duotone-a">Color de sombras</Label>
          <input id="duotone-a" type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-300" />
        </div>
        <div>
          <Label htmlFor="duotone-b">Color de luces</Label>
          <input id="duotone-b" type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-300" />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={!resultBlob}>
          <Download className="h-4 w-4" /> Descargar imagen
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
          Añadir marca de agua a esta imagen sin volver a subirla <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Droplet className="h-3 w-3" /> Tu imagen se procesa directamente en tu navegador: no se sube a nuestros
        servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
