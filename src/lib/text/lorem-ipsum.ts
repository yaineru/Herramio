export type LoremUnit = "palabras" | "oraciones" | "parrafos";

const WORD_BANK = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

function pickRandomWord(): string {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}

function generateSentence(wordCount: number): string {
  const words = Array.from({ length: Math.max(3, wordCount) }, pickRandomWord);
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function generateParagraph(sentenceCount: number): string {
  return Array.from({ length: Math.max(1, sentenceCount) }, () =>
    generateSentence(6 + Math.floor(Math.random() * 10)),
  ).join(" ");
}

/** Generates placeholder Lorem Ipsum text by word/sentence/paragraph count. */
export function generateLoremIpsum(count: number, unit: LoremUnit, startWithClassic = true): string {
  const safeCount = Math.max(1, Math.min(count, 500));

  if (unit === "palabras") {
    const words = Array.from({ length: safeCount }, pickRandomWord);
    if (startWithClassic) {
      words[0] = "Lorem";
      if (safeCount > 1) words[1] = "ipsum";
    }
    return words.join(" ") + ".";
  }

  if (unit === "oraciones") {
    const sentences = Array.from({ length: safeCount }, () => generateSentence(6 + Math.floor(Math.random() * 10)));
    if (startWithClassic) {
      sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    }
    return sentences.join(" ");
  }

  const paragraphs = Array.from({ length: safeCount }, () => generateParagraph(3 + Math.floor(Math.random() * 4)));
  if (startWithClassic) {
    paragraphs[0] =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + paragraphs[0];
  }
  return paragraphs.join("\n\n");
}
