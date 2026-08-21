import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageMirrorSymmetry } from "@/components/tools/ImageMirrorSymmetry";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Efecto Espejo y Simetría para Fotos Online",
  description:
    "Duplica una mitad de una imagen sobre la otra en espejo, creando un efecto de simetría perfecta, directamente en tu navegador.",
  path: "/imagen-espejo-simetria",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y elige qué mitad quieres conservar (izquierda, derecha, superior o inferior). Esa mitad se refleja sobre la otra, creando una imagen perfectamente simétrica.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear el popular efecto de \"cara simétrica\" con un retrato",
      "Generar patrones simétricos a partir de una foto de paisaje o textura",
      "Producir contenido curioso y compartible para redes sociales",
    ],
  },
];

const faqItems = [
  {
    question: "¿Funciona mejor con algún tipo de imagen?",
    answer: "Funciona con cualquier imagen, pero el efecto de simetría facial es más llamativo con retratos centrados y bien iluminados.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El efecto se genera completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenEspejoSimetriaPage() {
  return (
    <ToolPageShell
      toolId="imagen-espejo-simetria"
      toolName="Efecto Espejo y Simetría"
      eyebrow="Imágenes"
      intro="Duplica una mitad de una imagen sobre la otra en espejo, creando un efecto de simetría perfecta."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageMirrorSymmetry />
    </ToolPageShell>
  );
}
