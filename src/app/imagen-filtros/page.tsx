import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageFilters } from "@/components/tools/ImageFilters";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Filtros para Imágenes Online (Blanco y Negro, Sepia y Más)",
  description:
    "Aplica blanco y negro, sepia, brillo, contraste y más filtros a una imagen en tiempo real, directamente en tu navegador.",
  path: "/imagen-filtros",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige uno de los filtros predefinidos o ajusta manualmente el blanco y negro, el sepia, el brillo, el contraste, la saturación y la inversión de colores. El resultado se actualiza en vivo mientras mueves los controles.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Convertir una foto a blanco y negro o sepia rápido",
      "Ajustar el brillo o contraste de una imagen sin instalar un editor",
      "Probar distintos estilos de color para una foto antes de compartirla",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. Los filtros se aplican completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo combinar varios filtros?",
    answer: "Sí, todos los controles se aplican a la vez sobre la misma imagen, así que puedes combinarlos como quieras.",
  },
];

export default function ImagenFiltrosPage() {
  return (
    <ToolPageShell
      toolId="imagen-filtros"
      toolName="Filtros para Imágenes"
      eyebrow="Imágenes"
      intro="Aplica blanco y negro, sepia, brillo, contraste y más filtros a una imagen en tiempo real."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageFilters />
    </ToolPageShell>
  );
}
