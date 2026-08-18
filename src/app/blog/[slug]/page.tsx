import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd, articleSchema } from "@/components/JsonLd";
import { ShareButtons } from "@/components/social/ShareButtons";
import { buildMetadata } from "@/lib/seo";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog/posts";
import { SITE } from "@/lib/site";
import { getToolById } from "@/lib/tools/registry";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedTool = post.relatedTool ? getToolById(post.relatedTool) : undefined;

  return (
    <div className="container-page py-10">
      <JsonLd
        data={articleSchema({
          headline: post.title,
          description: post.description,
          url: `${SITE.url}/blog/${post.slug}`,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
        })}
      />
      <Breadcrumbs items={[{ href: "/blog", label: "Blog" }, { href: `/blog/${post.slug}`, label: post.title }]} />

      <article className="mx-auto mt-6 max-w-2xl">
        <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
          {post.readingTime} de lectura
        </span>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{post.title}</h1>
        <p className="mt-3 text-slate-500">{post.excerpt}</p>

        {relatedTool && (
          <Link
            href={relatedTool.href}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            <relatedTool.icon className="h-4 w-4" /> Prueba gratis: {relatedTool.name}
          </Link>
        )}

        <div className="mt-6">
          <ContentBlocks blocks={post.content} />
        </div>

        <div className="my-10">
          <AdSlot placement="in-content" />
        </div>

        <div className="border-t border-slate-200 pt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Compartir artículo
          </p>
          <ShareButtons tool={`blog-${post.slug}`} url={`${SITE.url}/blog/${post.slug}`} title={post.title} />
        </div>
      </article>
    </div>
  );
}
