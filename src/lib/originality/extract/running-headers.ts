/**
 * Removes running headers and footers from extracted PDF pages.
 *
 * Why this matters for a similarity engine specifically: a running header
 * ("Universidad X - Tesis de grado - Página 3") is identical on every page
 * of a document AND on every page of every other document from the same
 * template. Left in, it inflates similarity between unrelated papers that
 * merely share a faculty template, and it pollutes any embedding of the
 * chunk that swallowed it. It is boilerplate, not authored text, so it
 * should not count as evidence in either direction.
 *
 * The rule is deliberately conservative: a line is only removed when it
 * repeats at the same edge of the page across pages. A line that appears
 * once is left alone, because a single occurrence is indistinguishable
 * from real content.
 */

/** How many lines from each edge of a page can qualify as header/footer. */
const EDGE_LINES = 2;

/** Below this, "repeats on every page" isn't a meaningful signal yet. */
const MIN_PAGES = 2;

/**
 * Collapses the parts that legitimately vary between pages so
 * "Página 1" and "Página 2" are recognised as the same running header.
 * Digits become a placeholder and case/whitespace are flattened.
 */
function fingerprint(line: string): string {
  return line.trim().toLowerCase().replace(/\d+/g, "#").replace(/\s+/g, " ");
}

/**
 * A line long enough to be real content is risky to strip even if it
 * repeats — a short document could legitimately repeat a sentence. Running
 * headers are short by nature.
 */
const MAX_HEADER_CHARS = 120;

/**
 * A page needs an interior for "edge" to mean anything. On a page with
 * only a few lines, every line is an edge line, so body text would be
 * indistinguishable from a header — such pages contribute no evidence.
 */
const MIN_LINES_FOR_EDGES = EDGE_LINES * 2 + 1;

export function findRunningLines(pages: string[]): Set<string> {
  if (pages.length < MIN_PAGES) return new Set();

  const counts = new Map<string, number>();

  for (const page of pages) {
    const lines = page.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < MIN_LINES_FOR_EDGES) continue;
    const edges = [...lines.slice(0, EDGE_LINES), ...lines.slice(-EDGE_LINES)];
    // A page whose own first and last line coincide (a one-line page)
    // must not be counted twice.
    for (const line of new Set(edges)) {
      if (line.length > MAX_HEADER_CHARS) continue;
      const key = fingerprint(line);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  // Present at the edge of at least two pages. For longer documents this
  // still requires a majority, so a coincidence on pages 1-2 of a 40-page
  // thesis doesn't strip real text.
  const threshold = Math.max(MIN_PAGES, Math.ceil(pages.length * 0.5));
  return new Set([...counts.entries()].filter(([, n]) => n >= threshold).map(([key]) => key));
}

/**
 * Returns the pages with their running header/footer lines removed. Only
 * edge lines are considered, so a phrase that also appears mid-page as
 * genuine prose survives there.
 */
export function stripRunningHeaders(pages: string[]): string[] {
  const running = findRunningLines(pages);
  if (running.size === 0) return pages;

  return pages.map((page) => {
    const lines = page.split(/\n/);
    if (lines.filter((l) => l.trim()).length < MIN_LINES_FOR_EDGES) return page;
    const keep = lines.filter((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return true;
      const nonEmptyBefore = lines.slice(0, index).filter((l) => l.trim()).length;
      const nonEmptyAfter = lines.slice(index + 1).filter((l) => l.trim()).length;
      const atEdge = nonEmptyBefore < EDGE_LINES || nonEmptyAfter < EDGE_LINES;
      return !(atEdge && running.has(fingerprint(trimmed)));
    });
    return keep.join("\n").trim();
  });
}
