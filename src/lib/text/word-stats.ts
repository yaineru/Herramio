export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

const WORDS_PER_MINUTE = 200;

/** Counts words, characters, lines, paragraphs and estimated reading time. */
export function getTextStats(text: string): TextStats {
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs =
    trimmed === "" ? 0 : trimmed.split(/(?:\r\n|\r|\n){2,}/).filter((p) => p.trim() !== "").length;
  const readingTimeMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

  return { words, characters, charactersNoSpaces, lines, paragraphs, readingTimeMinutes };
}
