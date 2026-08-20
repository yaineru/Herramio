import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { FAQ } from "@/components/marketing/FAQ";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd, itemListSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { CATEGORIES, getCategory, type CategoryId } from "@/lib/tools/categories";
import { CATEGORY_INTRO } from "@/lib/tools/category-content";
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

  const faqItems = [
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

      <div className="mt-10">
        <ToolGrid category={id} />
      </div>

      <div className="my-12">
        <AdSlot placement="below-generator" />
      </div>

      <div className="mx-auto max-w-2xl">
        <FAQ items={faqItems} title={`Preguntas sobre ${category.name}`} />
      </div>
    </div>
  );
}
