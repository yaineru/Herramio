import "server-only";
import mammoth from "mammoth";

/** Server-side DOCX text extraction. mammoth ignores images/styling and returns plain paragraph text, which is exactly what the analysis pipeline needs. */
export async function extractDocxTextServer(bytes: Uint8Array): Promise<{ text: string }> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  return { text: result.value };
}
