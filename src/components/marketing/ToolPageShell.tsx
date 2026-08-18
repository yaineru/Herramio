import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { FAQ, type FAQItem } from "@/components/marketing/FAQ";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { JsonLd, faqPageSchema, softwareApplicationSchema } from "@/components/JsonLd";
import type { ContentBlock } from "@/lib/blog/types";
import type { FieldConfig } from "@/lib/qr/fields";
import type { QrKind } from "@/lib/qr/registry";
import { getRelatedTools, getToolById } from "@/lib/tools/registry";
import { getCategory } from "@/lib/tools/categories";
import { SITE } from "@/lib/site";

interface ToolPageShellProps {
  toolId: QrKind;
  toolName: string;
  eyebrow: string;
  intro: string;
  fields: FieldConfig[];
  emptyHint?: string;
  seoContent: ContentBlock[];
  faqItems: FAQItem[];
}

export function ToolPageShell({
  toolId,
  toolName,
  eyebrow,
  intro,
  fields,
  emptyHint,
  seoContent,
  faqItems,
}: ToolPageShellProps) {
  const tool = getToolById(toolId);
  const category = tool ? getCategory(tool.category) : undefined;
  const relatedTools = tool ? getRelatedTools(tool) : [];

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

      <Breadcrumbs
        items={[
          ...(category
            ? [{ href: `/herramientas?categoria=${category.id}`, label: category.name }]
            : []),
          { href: `/${toolId}`, label: toolName },
        ]}
      />

      <div className="mt-4 max-w-2xl">
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
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{toolName}</h1>
        <p className="mt-3 text-slate-500">{intro}</p>
      </div>

      <div className="mt-8">
        <QRGenerator
          toolId={toolId}
          toolName={toolName}
          fields={fields}
          emptyHint={emptyHint}
        />
      </div>

      <div className="my-12">
        <AdSlot placement="below-generator" />
      </div>

      <div className="mx-auto max-w-2xl">
        <ContentBlocks blocks={seoContent} />
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <FAQ items={faqItems} />
      </div>

      {relatedTools.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">Herramientas QR relacionadas</h2>
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
