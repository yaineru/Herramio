/**
 * Parses a single page-range segment ("1-3" or "5") into 0-based page
 * indices. Returns null when the segment is malformed or out of bounds.
 */
export function parsePageRange(segment: string, maxPage: number): number[] | null {
  const trimmed = segment.trim();
  if (trimmed === "") return null;

  const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (start < 1 || end < start || end > maxPage) return null;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
  }

  const single = Number(trimmed);
  if (Number.isInteger(single) && single >= 1 && single <= maxPage) return [single - 1];
  return null;
}

/**
 * Parses a comma-separated list of page ranges into groups of 0-based page
 * indices — one group per output file (e.g. "1-3,5,8-10" → three groups).
 * Returns null if any segment is invalid.
 */
export function parsePageGroups(input: string, maxPage: number): number[][] | null {
  const segments = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return null;

  const groups: number[][] = [];
  for (const segment of segments) {
    const indices = parsePageRange(segment, maxPage);
    if (!indices) return null;
    groups.push(indices);
  }
  return groups;
}

/**
 * Parses a comma-separated list of single page numbers into 0-based
 * indices, preserving order and allowing repeats (a page number appearing
 * twice means "duplicate this page") — unlike parsePageGroups, which groups
 * ranges into separate output files, this always returns one flat list.
 */
export function parsePageOrder(input: string, maxPage: number): number[] | null {
  const segments = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return null;

  const order: number[] = [];
  for (const segment of segments) {
    const n = Number(segment);
    if (!Number.isInteger(n) || n < 1 || n > maxPage) return null;
    order.push(n - 1);
  }
  return order;
}
