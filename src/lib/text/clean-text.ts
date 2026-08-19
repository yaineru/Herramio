export interface CleanTextOptions {
  removeDuplicateSpaces: boolean;
  removeEmptyLines: boolean;
  trimLines: boolean;
  textCase: "none" | "upper" | "lower" | "title";
}

function applyCase(text: string, textCase: CleanTextOptions["textCase"]): string {
  if (textCase === "upper") return text.toUpperCase();
  if (textCase === "lower") return text.toLowerCase();
  if (textCase === "title") {
    return text.replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  return text;
}

/** Applies the requested cleanup operations, in a sensible fixed order. */
export function cleanText(text: string, options: CleanTextOptions): string {
  let result = text;

  if (options.trimLines) {
    result = result
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .join("\n");
  }

  if (options.removeDuplicateSpaces) {
    result = result.replace(/[^\S\r\n]+/g, " ");
  }

  if (options.removeEmptyLines) {
    result = result
      .split(/\r\n|\r|\n/)
      .filter((line) => line.trim() !== "")
      .join("\n");
  }

  result = applyCase(result, options.textCase);

  return result.trim();
}
