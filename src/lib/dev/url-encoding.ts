export type UrlEncodingResult = { ok: true; value: string } | { ok: false; error: string };

export function encodeUrlComponent(input: string): string {
  return encodeURIComponent(input);
}

export function decodeUrlComponent(input: string): UrlEncodingResult {
  try {
    return { ok: true, value: decodeURIComponent(input) };
  } catch {
    return { ok: false, error: "No se pudo decodificar: el texto no tiene un formato URL válido." };
  }
}
