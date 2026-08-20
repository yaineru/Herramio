import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools/registry";
import { CATEGORIES } from "@/lib/tools/categories";
import { BLOG_POSTS } from "@/lib/blog/posts";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/generador-qr", priority: 0.9, changeFrequency: "weekly" },
  { path: "/herramientas", priority: 0.8, changeFrequency: "weekly" },
  { path: "/experiencia", priority: 0.5, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contacto", priority: 0.3, changeFrequency: "yearly" },
  { path: "/sobre-nosotros", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const toolEntries = TOOLS.filter((tool) => tool.status === "active").map((tool) => ({
    url: `${SITE.url}${tool.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryEntries = CATEGORIES.filter((c) => c.status === "active").map((c) => ({
    url: `${SITE.url}/categoria/${c.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified || post.datePublished),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...toolEntries, ...blogEntries];
}
