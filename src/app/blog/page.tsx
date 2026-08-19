import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { BLOG_POSTS } from "@/lib/blog/posts";

export const metadata: Metadata = buildMetadata({
  title: "Blog: guías prácticas de QR, PDF, imágenes y más",
  description:
    "Artículos prácticos para resolver tareas concretas: crear códigos QR, unir PDF, comprimir y convertir imágenes, contraseñas seguras y más.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/blog", label: "Blog" }]} />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Guías prácticas para resolver tareas concretas — códigos QR, PDF, imágenes, contraseñas
        y más — cada una enlazada a la herramienta que la resuelve.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              {post.readingTime} de lectura
            </span>
            <h2 className="mt-2 font-semibold text-slate-900">{post.title}</h2>
            <p className="mt-1.5 flex-1 text-sm text-slate-500">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
