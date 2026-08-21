const BLOCK_TAGS = new Set([
  "P", "DIV", "BR", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "TR", "BLOCKQUOTE", "SECTION", "ARTICLE", "HR",
]);

function walk(node: Node, out: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(node.textContent ?? "");
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;

  node.childNodes.forEach((child) => walk(child, out));

  if (BLOCK_TAGS.has(el.tagName)) out.push("\n");
}

/**
 * Strips HTML tags down to plain text, using DOMParser (which never executes
 * scripts or fetches resources — the markup is parsed inert). Inserts
 * newlines after block-level elements so paragraphs/list items stay
 * readable instead of running together.
 */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  walk(doc.body, out);
  return out
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
