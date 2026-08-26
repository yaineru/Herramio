import type { Metadata } from "next";
import { FavoritesAndHistoryView } from "@/components/tools/FavoritesAndHistoryView";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Favoritos y herramientas recientes",
    description: "Tus herramientas favoritas y las que has usado recientemente en Herramio.",
    path: "/favoritos",
  }),
  // Content here is per-browser (localStorage) and empty for crawlers —
  // nothing unique for search engines to index on this URL.
  robots: { index: false, follow: true },
};

export default function FavoritosPage() {
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Mis herramientas</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">Favoritos y recientes</h1>
          </div>
        </div>
        <p className="max-w-2xl text-base text-slate-600">
          Todo se guarda en tu navegador y no se envía a ningún servidor. Si cambias de dispositivo o borras los datos de navegación, esta lista se pierde.
        </p>
      </div>
      <div className="mt-8">
        <FavoritesAndHistoryView />
      </div>
    </div>
  );
}
