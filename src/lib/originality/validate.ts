// First bytes of each supported format — a spoofed extension/Content-Type
// doesn't survive this check (never trust the extension/MIME header alone).
const MAGIC_BYTES: Record<string, Uint8Array> = {
  "application/pdf": new TextEncoder().encode("%PDF"),
  // DOCX is a zip archive; every zip starts with "PK".
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": new Uint8Array([0x50, 0x4b]),
};

/** text/plain has no reliable magic number — always passes, by design. */
export function hasExpectedMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return true;
  if (bytes.length < expected.length) return false;
  return expected.every((b, i) => bytes[i] === b);
}

/** Strips path separators and anything that isn't a safe filename character — prevents path traversal via a crafted filename, and keeps the storage path predictable. */
export function sanitizeFilename(filename: string): string {
  const base = filename
    .replace(/[/\\]/g, "_")
    .replace(/[^\w.\- ]/g, "_")
    .slice(-180);
  return base || "documento";
}
