"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ImageIcon, FileCode } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { QRCodeCanvas, type QRCodeCanvasHandle } from "@/components/qr/QRCodeCanvas";
import { QRCustomizer } from "@/components/qr/QRCustomizer";
import { ShareButtons } from "@/components/social/ShareButtons";
import { DEFAULT_QR_STYLE, type QRStyleOptions } from "@/lib/qr/style";
import { initialValuesFromFields, type FieldConfig } from "@/lib/qr/fields";
import { PAYLOAD_BUILDERS, type QrKind } from "@/lib/qr/registry";
import { AnalyticsEvents } from "@/lib/analytics";
import { SITE } from "@/lib/site";

interface QRGeneratorProps {
  toolId: QrKind;
  toolName: string;
  fields: FieldConfig[];
  emptyHint?: string;
}

export function QRGenerator({ toolId, toolName, fields, emptyHint }: QRGeneratorProps) {
  const [values, setValues] = useState(() => initialValuesFromFields(fields));
  const [style, setStyle] = useState<QRStyleOptions>(DEFAULT_QR_STYLE);
  const qrRef = useRef<QRCodeCanvasHandle>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    AnalyticsEvents.toolOpened(toolId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payload = useMemo(() => PAYLOAD_BUILDERS[toolId](values), [values, toolId]);

  useEffect(() => {
    if (payload && !trackedRef.current) {
      trackedRef.current = true;
      AnalyticsEvents.qrGenerated(toolId);
    }
    if (!payload) trackedRef.current = false;
  }, [payload, toolId]);

  function setField(name: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleDownload(extension: "png" | "svg") {
    if (!payload || !qrRef.current) return;
    await qrRef.current.download(extension, toolId);
    AnalyticsEvents.qrDownloaded(toolId, extension);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Datos del QR</h2>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type !== "checkbox" && (
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </Label>
              )}
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={values[field.name] as string}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              ) : field.type === "select" ? (
                <Select
                  id={field.name}
                  value={values[field.name] as string}
                  onChange={(e) => setField(field.name, e.target.value)}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(e) => setField(field.name, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {field.label}
                </label>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={values[field.name] as string}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              )}
              {field.helpText && <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>}
            </div>
          ))}
        </div>

        <hr className="my-6 border-slate-100" />
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Personalización</h2>
        <QRCustomizer style={style} onChange={setStyle} />
      </Card>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="flex flex-col items-center gap-5 p-6 text-center">
          <div
            className="flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"
            style={
              style.transparentBg
                ? { backgroundImage: CHECKER_BG, backgroundSize: "16px 16px", backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px" }
                : undefined
            }
          >
            {payload ? (
              <QRCodeCanvas ref={qrRef} data={payload} style={style} />
            ) : (
              <p className="px-4 text-sm text-slate-400">
                {emptyHint || `Completa los datos para generar tu ${toolName.toLowerCase()}.`}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={!payload}
              onClick={() => handleDownload("png")}
            >
              <ImageIcon className="h-4 w-4" /> Descargar PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={!payload}
              onClick={() => handleDownload("svg")}
            >
              <FileCode className="h-4 w-4" /> Descargar SVG
            </Button>
          </div>

          {payload && (
            <div className="w-full border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Compartir esta herramienta
              </p>
              <ShareButtons tool={toolId} url={`${SITE.url}/${toolId}`} title={toolName} />
            </div>
          )}

          {!payload && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Download className="h-3.5 w-3.5" /> El QR se genera automáticamente al escribir
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

const CHECKER_BG =
  "linear-gradient(45deg,#e2e8f0 25%,transparent 25%),linear-gradient(-45deg,#e2e8f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e8f0 75%),linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)";
