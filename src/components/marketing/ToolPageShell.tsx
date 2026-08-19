import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { FAQ, type FAQItem } from "@/components/marketing/FAQ";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { FavoriteButton } from "@/components/tools/FavoriteButton";
import { HistoryTracker } from "@/components/tools/HistoryTracker";
import { JsonLd, faqPageSchema, softwareApplicationSchema } from "@/components/JsonLd";
import type { ContentBlock } from "@/lib/blog/types";
import { getBlogPostByTool } from "@/lib/blog/posts";
import { getRelatedTools, getToolById } from "@/lib/tools/registry";
import { getCategory } from "@/lib/tools/categories";
import { SITE } from "@/lib/site";

interface ToolPageShellProps {
  toolId: string;
  toolName: string;
  eyebrow: string;
  intro: string;
  seoContent: ContentBlock[];
  faqItems: FAQItem[];
  /** The interactive tool itself — QRGenerator, a calculator, an uploader... */
  children: ReactNode;
}

/**
 * Shared page shell for every tool in the catalog, regardless of category.
 * Keeps breadcrumb/JSON-LD/FAQ/related-tools/ad-slot layout identical across
 * QR, PDF, images, calculators, etc. — only the interactive widget (children)
 * and the surrounding copy change per tool.
 */
export function ToolPageShell({
  toolId,
  toolName,
  eyebrow,
  intro,
  seoContent,
  faqItems,
  children,
}: ToolPageShellProps) {
  const tool = getToolById(toolId);
  const category = tool ? getCategory(tool.category) : undefined;
  const relatedTools = tool ? getRelatedTools(tool) : [];
  const relatedArticle = getBlogPostByTool(toolId);

  return (
    <div className="container-page py-10">
      <JsonLd
        data={softwareApplicationSchema({
          name: toolName,
          description: intro,
          url: `${SITE.url}/${toolId}`,
        })}
      />
      <JsonLd data={faqPageSchema(faqItems)} />

      <HistoryTracker toolId={toolId} toolName={toolName} />

      <Breadcrumbs
        items={[
          ...(category
            ? [{ href: `/herramientas?categoria=${category.id}`, label: category.name }]
            : []),
          { href: `/${toolId}`, label: toolName },
        ]}
      />

      <div className="mt-4 max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {tool && (
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <tool.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              {eyebrow}
            </span>
          </div>
          <FavoriteButton toolId={toolId} />
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{toolName}</h1>
        <p className="mt-3 text-slate-500">{intro}</p>
      </div>

      <div className="mt-8">{children}</div>

      <div className="my-12">
        <AdSlot placement="below-generator" />
      </div>

      <div className="mx-auto max-w-2xl">
        <ContentBlocks blocks={seoContent} />

        {relatedArticle && (
          <Link
            href={`/blog/${relatedArticle.slug}`}
            className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">Guía relacionada</span>
              <span className="block font-medium text-slate-900">{relatedArticle.title}</span>
            </span>
          </Link>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <FAQ items={faqItems} />
      </div>

      {relatedTools.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">Herramientas relacionadas</h2>
          <div className="mt-5">
            <ToolGrid tools={relatedTools} />
          </div>
          <Link
            href="/herramientas"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline"
          >
            Ver todas las herramientas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-2xl">
        <AdSlot placement="in-content" />
      </div>
    </div>
  );
}
