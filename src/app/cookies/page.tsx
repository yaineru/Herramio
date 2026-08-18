import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Política de cookies",
  description: `Qué cookies usa ${SITE.name}, para qué sirven y cómo puedes rechazarlas.`,
  path: "/cookies",
});

const content: ContentBlock[] = [
  {
    type: "p",
    text: "Una cookie es un pequeño archivo que un sitio web guarda en tu navegador. Usamos las siguientes categorías.",
  },
  { type: "h2", text: "Cookies esenciales" },
  {
    type: "p",
    text: "Guardan tu elección sobre el aviso de cookies (aceptar o rechazar), para no volver a mostrártelo en cada visita. No se pueden desactivar porque son necesarias para el funcionamiento básico del aviso de privacidad.",
  },
  { type: "h2", text: "Cookies de analítica (Google Analytics 4)" },
  {
    type: "p",
    text: "Si las aceptas, nos ayudan a entender qué páginas y herramientas se usan más, para mejorar el sitio. Solo se activan después de que aceptas el aviso de cookies.",
  },
  { type: "h2", text: "Cookies de publicidad (Google AdSense)" },
  {
    type: "p",
    text: "Cuando la publicidad esté activa, estas cookies permiten a Google mostrar anuncios relevantes según tu navegación. También se activan únicamente si aceptas cookies.",
  },
  { type: "h2", text: "Cómo rechazar o eliminar cookies" },
  {
    type: "ul",
    items: [
      "Selecciona \"Rechazar\" en el aviso de cookies que aparece en tu primera visita",
      "Borra las cookies desde la configuración de privacidad de tu navegador en cualquier momento",
      "Usa la configuración de anuncios de Google (adssettings.google.com) para gestionar la personalización publicitaria",
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/cookies", label: "Cookies" }]} />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Política de cookies</h1>
      <div className="mx-auto mt-6 max-w-2xl">
        <ContentBlocks blocks={content} />
      </div>
    </div>
  );
}
