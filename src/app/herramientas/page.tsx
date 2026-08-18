import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ToolCatalog } from "@/components/marketing/ToolCatalog";
import { buildMetadata } from "@/lib/seo";
import { CATEGORIES, type CategoryId } from "@/lib/tools/categories";

export const metadata: Metadata = buildMetadata({
  title: "Todas las herramientas",
  description:
    "El catálogo de Herramio: encuentra una herramienta para convertir, calcular, crear o resolver lo que necesitas.",
  path: "/herramientas",
});

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

function parseCategory(value: string | undefined): CategoryId | "todas" {
  if (value && CATEGORY_IDS.includes(value as CategoryId)) return value as CategoryId;
  return "todas";
}

export default async function HerramientasPage({
  searchParams,
}: PageProps<"/herramientas">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const categoria = parseCategory(typeof params.categoria === "string" ? params.categoria : undefined);

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/herramientas", label: "Herramientas" }]} />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Todas nuestras herramientas</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Encuentra una herramienta para convertir, calcular, crear o resolver lo que necesitas.
      </p>

      <div className="mt-10">
        <ToolCatalog initialQuery={q} initialCategory={categoria} />
      </div>
    </div>
  );
}
