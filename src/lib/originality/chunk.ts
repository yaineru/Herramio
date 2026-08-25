import { normalizeText } from "@/lib/originality/normalize";

export interface TextChunk {
  sequence: number;
  text: string;
  normalizedText: string;
  wordCount: number;
}

const MAX_CHUNK_WORDS = 220;

function countWords(text: string): number {
  const matches = text.match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Splits raw page/document text into paragraph-sized chunks — no attempt
 * to label a chunk as "Introduction" / "Methodology" / etc. (that needs
 * real structural analysis this version doesn't do; a fabricated label
 * would be worse than no label). An overlong paragraph is split further
 * on sentence boundaries so no single chunk badly dominates a comparison.
 */
export function chunkText(rawText: string): TextChunk[] {
  const paragraphs = rawText
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  const chunks: TextChunk[] = [];
  let sequence = 0;

  for (const paragraph of paragraphs) {
    if (countWords(paragraph) <= MAX_CHUNK_WORDS) {
      chunks.push(makeChunk(sequence++, paragraph));
      continue;
    }

    // Overlong paragraph: split on sentence boundaries, then greedily
    // regroup sentences up to the word cap.
    const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [paragraph];
    let buffer = "";
    for (const sentence of sentences) {
      if (buffer && countWords(buffer) + countWords(sentence) > MAX_CHUNK_WORDS) {
        chunks.push(makeChunk(sequence++, buffer.trim()));
        buffer = "";
      }
      buffer += sentence;
    }
    if (buffer.trim()) chunks.push(makeChunk(sequence++, buffer.trim()));
  }

  return chunks;
}

function makeChunk(sequence: number, text: string): TextChunk {
  return { sequence, text, normalizedText: normalizeText(text), wordCount: countWords(text) };
}
