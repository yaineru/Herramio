export type ApaSourceType = "book" | "website" | "journal";

export interface ApaCitationInput {
  type: ApaSourceType;
  authors: string; // "Apellido, N." or "Apellido, N., & Apellido, N."
  year: string;
  title: string;
  // Book
  publisher?: string;
  // Website
  siteName?: string;
  url?: string;
  // Journal
  journalName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

export type ApaCitationResult = { ok: true; value: string } | { ok: false; error: string };

/** Builds an APA 7th-edition style reference-list entry for a book, website or journal article. */
export function buildApaCitation(input: ApaCitationInput): ApaCitationResult {
  const authors = input.authors.trim();
  const year = input.year.trim();
  const title = input.title.trim();

  if (!authors) return { ok: false, error: "El autor es obligatorio." };
  if (!year) return { ok: false, error: "El año es obligatorio." };
  if (!title) return { ok: false, error: "El título es obligatorio." };

  const authorPart = authors.endsWith(".") ? authors : `${authors}.`;
  const base = `${authorPart} (${year}).`;

  if (input.type === "book") {
    const publisher = input.publisher?.trim();
    if (!publisher) return { ok: false, error: "La editorial es obligatoria para un libro." };
    return { ok: true, value: `${base} ${title}. ${publisher}.` };
  }

  if (input.type === "website") {
    const siteName = input.siteName?.trim();
    const url = input.url?.trim();
    if (!url) return { ok: false, error: "La URL es obligatoria para un sitio web." };
    const sitePart = siteName ? ` ${siteName}.` : "";
    return { ok: true, value: `${base} ${title}.${sitePart} ${url}` };
  }

  // journal
  const journalName = input.journalName?.trim();
  if (!journalName) return { ok: false, error: "El nombre de la revista es obligatorio." };
  const volume = input.volume?.trim();
  const issue = input.issue?.trim();
  const pages = input.pages?.trim();
  let journalPart = journalName;
  if (volume) journalPart += `, ${volume}`;
  if (issue) journalPart += `(${issue})`;
  if (pages) journalPart += `, ${pages}`;
  return { ok: true, value: `${base} ${title}. ${journalPart}.` };
}
