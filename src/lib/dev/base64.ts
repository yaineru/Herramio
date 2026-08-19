export type Base64Result = { ok: true; value: string } | { ok: false; error: string };

/** Encodes text to Base64, correctly handling UTF-8 (accents, emoji, ñ). */
export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function decodeBase64(input: string): Base64Result {
  try {
    const binary = atob(input);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { ok: true, value: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: "Base64 inválido: verifica que el texto esté correctamente codificado." };
  }
}
