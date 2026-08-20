export type LineSortMode = "none" | "asc" | "desc";

export interface SortLinesOptions {
  sort: LineSortMode;
  dedupe: boolean;
  removeEmpty: boolean;
}

/** Splits text into lines and applies dedupe/sort/empty-line-removal in a fixed, predictable order: filter, dedupe, then sort. */
export function processLines(text: string, options: SortLinesOptions): string {
  let lines = text.split(/\r\n|\r|\n/);

  if (options.removeEmpty) lines = lines.filter((line) => line.trim() !== "");

  if (options.dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });
  }

  if (options.sort === "asc") lines = [...lines].sort((a, b) => a.localeCompare(b));
  if (options.sort === "desc") lines = [...lines].sort((a, b) => b.localeCompare(a));

  return lines.join("\n");
}
