function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Applies inline markdown (bold, italic, inline code, links) to already-HTML-escaped text. */
function renderInline(text: string): string {
  let result = text;
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return result;
}

/**
 * Converts a practical, common subset of Markdown to HTML: headers, bold,
 * italic, inline code, links, unordered/ordered lists, blockquotes,
 * horizontal rules and paragraphs. Not a full CommonMark implementation —
 * covers what people actually write day to day. All literal text is
 * HTML-escaped first, so raw HTML in the input is never executed.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    html.push(`<p>${renderInline(paragraphBuffer.join(" "))}</p>`);
    paragraphBuffer = [];
  }

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const escaped = escapeHtml(line);

    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    const quoteMatch = line.match(/^>\s?(.*)$/);
    const isHr = /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim());

    if (line.trim() === "") {
      flushParagraph();
      closeList();
      continue;
    }

    if (isHr) {
      flushParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    if (headerMatch) {
      flushParagraph();
      closeList();
      const level = headerMatch[1].length;
      html.push(`<h${level}>${renderInline(escapeHtml(headerMatch[2]))}</h${level}>`);
      continue;
    }

    if (quoteMatch) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${renderInline(escapeHtml(quoteMatch[1]))}</blockquote>`);
      continue;
    }

    if (ulMatch) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInline(escapeHtml(ulMatch[1]))}</li>`);
      continue;
    }

    if (olMatch) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInline(escapeHtml(olMatch[1]))}</li>`);
      continue;
    }

    closeList();
    paragraphBuffer.push(escaped);
  }

  flushParagraph();
  closeList();

  return html.join("\n");
}
