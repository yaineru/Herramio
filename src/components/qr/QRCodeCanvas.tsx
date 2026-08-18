"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";
import type { QRStyleOptions } from "@/lib/qr/style";

export interface QRCodeCanvasHandle {
  download: (extension: "png" | "svg", name: string) => Promise<void>;
}

interface QRCodeCanvasProps {
  data: string;
  style: QRStyleOptions;
}

function buildOptions(data: string, style: QRStyleOptions) {
  return {
    width: style.size,
    height: style.size,
    type: "svg" as const,
    data,
    margin: style.margin,
    image: style.logoDataUrl || undefined,
    qrOptions: {
      errorCorrectionLevel: style.errorCorrectionLevel,
    },
    dotsOptions: {
      color: style.fgColor,
      type: style.dotStyle,
    },
    cornersSquareOptions: {
      color: style.fgColor,
    },
    cornersDotOptions: {
      color: style.fgColor,
    },
    backgroundOptions: {
      color: style.transparentBg ? "rgba(0,0,0,0)" : style.bgColor,
    },
    imageOptions: {
      crossOrigin: "anonymous" as const,
      margin: 6,
      imageSize: 0.4,
    },
  };
}

export const QRCodeCanvas = forwardRef<QRCodeCanvasHandle, QRCodeCanvasProps>(
  ({ data, style }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        const { default: QRCodeStylingCtor } = await import("qr-code-styling");
        if (cancelled || !containerRef.current) return;
        if (!instanceRef.current) {
          instanceRef.current = new QRCodeStylingCtor(buildOptions(data || " ", style));
          containerRef.current.innerHTML = "";
          instanceRef.current.append(containerRef.current);
        } else {
          instanceRef.current.update(buildOptions(data || " ", style));
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [data, style]);

    useImperativeHandle(ref, () => ({
      download: async (extension, name) => {
        if (!instanceRef.current) return;
        await instanceRef.current.download({ name, extension });
      },
    }));

    return (
      <div
        ref={containerRef}
        className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        aria-label="Vista previa del código QR"
      />
    );
  },
);
QRCodeCanvas.displayName = "QRCodeCanvas";
