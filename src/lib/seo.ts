import type { Metadata } from "next";
import { SITE } from "@/lib/site";

interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

export function buildMetadata({ title, description, path, ogImage }: PageSeoInput): Metadata {
  const url = `${SITE.url}${path}`;
  // The root layout's title.template already appends " | SITE.name" to any
  // plain string title from a child page — don't suffix it again here.
  const fullTitle = path === "/" ? title : `${title} | ${SITE.name}`;
  // When ogImage is omitted, Next.js inherits the root app/opengraph-image.tsx
  // (file-convention metadata cascades down the route tree).
  const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE.name,
      locale: "es_ES",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images?.map((i) => i.url),
      site: SITE.twitter,
    },
  };
}
