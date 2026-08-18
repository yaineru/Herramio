"use client";

import { type ChangeEvent, useId } from "react";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  DEFAULT_QR_STYLE,
  DOT_STYLE_OPTIONS,
  ERROR_CORRECTION_OPTIONS,
  evaluateQrContrast,
  type QRStyleOptions,
} from "@/lib/qr/style";
import { cn } from "@/lib/utils";

interface QRCustomizerProps {
  style: QRStyleOptions;
  onChange: (style: QRStyleOptions) => void;
}

export function QRCustomizer({ style, onChange }: QRCustomizerProps) {
  const id = useId();
  const contrast = evaluateQrContrast(style.fgColor, style.bgColor);

  function update<K extends keyof QRStyleOptions>(key: K, value: QRStyleOptions[K]) {
    onChange({ ...style, [key]: value });
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      update("logoDataUrl", null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("logoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${id}-fg`}>Color del QR</Label>
          <div className="flex items-center gap-2">
            <input
              id={`${id}-fg`}
              type="color"
              value={style.fgColor}
              onChange={(e) => update("fgColor", e.target.value)}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
            />
            <span className="text-xs text-slate-500">{style.fgColor}</span>
          </div>
        </div>
        <div>
          <Label htmlFor={`${id}-bg`}>Color de fondo</Label>
          <div className="flex items-center gap-2">
            <input
              id={`${id}-bg`}
              type="color"
              value={style.bgColor}
              onChange={(e) => update("bgColor", e.target.value)}
              disabled={style.transparentBg}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 disabled:opacity-40"
            />
            <span className="text-xs text-slate-500">
              {style.transparentBg ? "Transparente" : style.bgColor}
            </span>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={style.transparentBg}
          onChange={(e) => update("transparentBg", e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Fondo transparente (solo PNG/SVG)
      </label>

      {contrast.message && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            contrast.level === "danger"
              ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700",
          )}
        >
          ⚠️ {contrast.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${id}-size`}>Tamaño ({style.size}px)</Label>
          <input
            id={`${id}-size`}
            type="range"
            min={160}
            max={1000}
            step={20}
            value={style.size}
            onChange={(e) => update("size", Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <Label htmlFor={`${id}-margin`}>Margen ({style.margin}px)</Label>
          <input
            id={`${id}-margin`}
            type="range"
            min={0}
            max={40}
            step={2}
            value={style.margin}
            onChange={(e) => update("margin", Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${id}-dots`}>Estilo de puntos</Label>
          <Select
            id={`${id}-dots`}
            value={style.dotStyle}
            onChange={(e) => update("dotStyle", e.target.value as QRStyleOptions["dotStyle"])}
          >
            {DOT_STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${id}-ecc`}>Corrección de errores</Label>
          <Select
            id={`${id}-ecc`}
            value={style.errorCorrectionLevel}
            onChange={(e) =>
              update("errorCorrectionLevel", e.target.value as QRStyleOptions["errorCorrectionLevel"])
            }
          >
            {ERROR_CORRECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor={`${id}-logo`}>Logo en el centro (opcional)</Label>
        <div className="flex items-center gap-3">
          <input
            id={`${id}-logo`}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoUpload}
            className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {style.logoDataUrl && (
            <button
              type="button"
              onClick={() => update("logoDataUrl", null)}
              className="shrink-0 text-xs font-medium text-red-600 hover:underline"
            >
              Quitar
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Máximo 1MB. Usa corrección de errores &quot;Máxima (H)&quot; con logo para asegurar la lectura.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange({ ...DEFAULT_QR_STYLE })}
        className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
      >
        Restablecer estilo
      </button>
    </div>
  );
}
