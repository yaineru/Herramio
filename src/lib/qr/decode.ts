import { drawImageToCanvas, loadImageFile } from "@/lib/images/canvas-image";

export const MAX_QR_IMAGE_BYTES = 15 * 1024 * 1024;

/** Decodes a QR code from an uploaded image file. Returns null when no QR code is found. */
export async function decodeQrFromFile(file: File): Promise<string | null> {
  const jsQR = (await import("jsqr")).default;
  const { img, objectUrl } = await loadImageFile(file);
  try {
    const canvas = drawImageToCanvas(img);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tu navegador no pudo procesar esta imagen.");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height);
    return result ? result.data : null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
