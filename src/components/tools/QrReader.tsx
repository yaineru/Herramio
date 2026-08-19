"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, QrCode, RotateCcw, ScanLine } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropZone } from "@/components/tools/FileDropZone";
import { formatBytes } from "@/lib/images/canvas-image";
import { decodeQrFromFile, MAX_QR_IMAGE_BYTES } from "@/lib/qr/decode";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "qr-lector";

function looksLikeUrl(text: string): boolean {
  return /^https?:\/\//i.test(text.trim());
}

export function QrReader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFiles(files: File[]) {
    const picked = files[0];
    setError(null);
    setResult(null);
    setCopied(false);
    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen válido.");
      return;
    }
    if (picked.size > MAX_QR_IMAGE_BYTES) {
      setError(`La imagen supera el máximo de ${formatBytes(MAX_QR_IMAGE_BYTES)}.`);
      return;
    }

    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setIsProcessing(true);
    try {
      const decoded = await decodeQrFromFile(picked);
      if (decoded === null) {
        setError("No encontramos ningún código QR en esta imagen. Prueba con una foto más nítida o mejor encuadrada.");
        AnalyticsEvents.toolError(TOOL_ID, "no-qr-found");
      } else {
        setResult(decoded);
        AnalyticsEvents.toolUsed(TOOL_ID);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo leer la imagen.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleReset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  if (!file) {
    return (
      <Card className="p-6">
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Arrastra una imagen con un código QR, o haz clic para seleccionarla"
          hint={`Cualquier formato de imagen — máx. ${formatBytes(MAX_QR_IMAGE_BYTES)}`}
        />
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Imagen</p>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={`Vista previa de ${file.name}`} className="w-full rounded-xl border border-slate-200 object-contain" />
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Contenido detectado</p>
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : result ? (
              <p className="w-full break-all text-sm text-slate-900">{result}</p>
            ) : (
              <ScanLine className="h-6 w-6 text-slate-300" />
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
              {looksLikeUrl(result) && (
                <a href={result} target="_blank" rel="noopener noreferrer">
                  <Button type="button" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" /> Abrir enlace
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Leer otra imagen
        </Button>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <QrCode className="h-3.5 w-3.5" /> Tu imagen se procesa directamente en tu navegador: no se
        sube a nuestros servidores en ningún momento de este proceso.
      </p>
    </Card>
  );
}
