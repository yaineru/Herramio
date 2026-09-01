import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { FAQ } from "@/components/marketing/FAQ";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd, itemListSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { CATEGORIES, getCategory, type CategoryId } from "@/lib/tools/categories";
import { CATEGORY_INTRO } from "@/lib/tools/category-content";
import { CATEGORY_GUIDES } from "@/lib/tools/category-guides";
import { getToolsByCategory, isLocalProcessing } from "@/lib/tools/registry";

export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.status === "active").map((c) => ({ id: c.id }));
}

function isValidCategoryId(id: string): id is CategoryId {
  return CATEGORIES.some((c) => c.id === id);
}

export async function generateMetadata({
  params,
}: PageProps<"/categoria/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!isValidCategoryId(id)) return {};
  const category = getCategory(id);
  const tools = getToolsByCategory(id);
  return buildMetadata({
    title: `Herramientas de ${category.name} online gratis`,
    description: `${CATEGORY_INTRO[id]} ${tools.length} herramientas gratuitas, sin registro.`,
    path: `/categoria/${id}`,
  });
}

export default async function CategoriaPage({ params }: PageProps<"/categoria/[id]">) {
  const { id } = await params;
  if (!isValidCategoryId(id)) notFound();

  const category = getCategory(id);
  const tools = getToolsByCategory(id);
  if (tools.length === 0) notFound();

  const allLocal = tools.every(isLocalProcessing);
  const externalTools = tools.filter((t) => !isLocalProcessing(t));

  const privacyAnswer = allLocal
    ? `Sí. Todas las herramientas de ${category.name} procesan tus datos directamente en tu navegador — nada se sube a un servidor.`
    : `La mayoría sí: todas las herramientas de ${category.name} procesan tus datos en tu navegador, excepto ${externalTools.map((t) => t.name).join(", ")}, que necesita conectarse a un servicio externo para funcionar (ver su propia página para el detalle).`;

  const guide = CATEGORY_GUIDES[id];
  // Category-specific questions first. The two shared ones stay because
  // they are the questions people actually ask, but they no longer make up
  // the entire FAQ — which is what made these eight pages read as one
  // template with the noun swapped.
  const faqItems = [
    ...guide.faq,
    { question: "¿Necesito crear una cuenta para usarlas?", answer: `No. Ninguna herramienta de ${category.name} requiere registro ni inicio de sesión.` },
    { question: "¿Se suben mis archivos o datos a un servidor?", answer: privacyAnswer },
  ];

  return (
    <div className="container-page py-10">
      <JsonLd
        data={itemListSchema({
          items: tools.map((tool) => ({ name: tool.name, url: `${SITE.url}${tool.href}` })),
        })}
      />

      <Breadcrumbs
        items={[
          { href: "/herramientas", label: "Herramientas" },
          { href: `/categoria/${id}`, label: category.name },
        ]}
      />

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <category.icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            {tools.length} herramienta{tools.length === 1 ? "" : "s"}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Herramientas de {category.name}</h1>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-slate-500">{CATEGORY_INTRO[id]}</p>

      {/* Task -> tool, before the grid.
          Someone arriving here usually knows their problem ("this PDF is
          too big to email") and not which of 23 tools solves it. The grid
          answers "what exists"; this answers "which one do I need", which
          is the question they actually have. */}
      <section className="mt-10" aria-labelledby="elegir-heading">
        <h2 id="elegir-heading" className="text-xl font-bold tracking-[-0.02em] text-slate-900">
          ¿Qué necesitas hacer?
        </h2>
        <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {guide.chooseByTask.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{item.task}</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                  {item.tool}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900">
          Todas las herramientas de {category.name}
        </h2>
        <div className="mt-4">
          <ToolGrid category={id} />
        </div>
      </div>

      {/* Stated plainly, because a page that only sells is less useful
          than one that tells you when to look elsewhere. */}
      <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-5" aria-labelledby="limites-heading">
        <h2 id="limites-heading" className="text-base font-semibold text-slate-900">
          Qué no puedes hacer con estas herramientas
        </h2>
        <ul className="mt-3 space-y-2">
          {guide.limits.map((limit) => (
            <li key={limit} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              {limit}
            </li>
          ))}
        </ul>
      </section>

      <div className="my-12">
        <AdSlot placement="below-generator" />
      </div>

      <div className="mx-auto max-w-2xl">
        <FAQ items={faqItems} title={`Preguntas sobre ${category.name}`} />
      </div>
    </div>
  );
}
