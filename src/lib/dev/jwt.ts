export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
}

export type JwtDecodeResult = { ok: true; value: DecodedJwt } | { ok: false; error: string };

/** Decodes a base64url segment (JWT's alphabet: '-'/'_' instead of '+'/'/', no padding). */
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Decodes a JWT's header and payload — this only reads the token, it never
 * verifies the signature (that needs the issuer's secret/public key, which
 * this tool never has). The signature segment is returned as-is, raw.
 */
export function decodeJwt(token: string): JwtDecodeResult {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Un JWT válido tiene 3 partes separadas por puntos: header.payload.signature." };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { ok: true, value: { header, payload, signature: parts[2] } };
  } catch {
    return { ok: false, error: "No se pudo decodificar este token. Verifica que esté completo y bien formado." };
  }
}
