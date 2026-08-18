export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  readingTime: string;
  relatedTool?: string;
  content: ContentBlock[];
}
