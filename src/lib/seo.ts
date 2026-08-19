import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools/registry";

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
  // Tool pages get a social preview generated from the registry (name +
  // category) via /og/[slug] instead of the generic site-wide image, with
  // zero per-tool wiring required. Anything else (home, blog, legal pages)
  // falls back to inheriting app/opengraph-image.tsx, same as before.
  const matchingTool = TOOLS.find((t) => t.href === path);
  const resolvedOgImage = ogImage ?? (matchingTool ? `${SITE.url}/og/${matchingTool.id}` : undefined);
  const images = resolvedOgImage ? [{ url: resolvedOgImage, width: 1200, height: 630, alt: title }] : undefined;

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
