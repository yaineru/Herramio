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
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Favoritos y recientes</h1>
        <p className="mt-3 text-slate-500">
          Guardadas en tu navegador — no se envían a ningún servidor. Si cambias de dispositivo o
          borras los datos de navegación, esta lista se pierde.
        </p>
      </div>
      <div className="mt-8">
        <FavoritesAndHistoryView />
      </div>
    </div>
  );
}
