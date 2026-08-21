import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageDuotone } from "@/components/tools/ImageDuotone";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Efecto Duotono para Imágenes Online",
  description: "Convierte una imagen en un efecto duotono de dos colores, con presets listos para usar, directamente en tu navegador.",
  path: "/imagen-duotono",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y elige dos colores (o uno de los presets): uno para las sombras y otro para las luces. La herramienta calcula el brillo de cada píxel y lo mapea entre esos dos colores.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear una portada o miniatura con una estética de color consistente",
      "Darle a una foto un look editorial tipo revista o afiche",
      "Unificar el tono de varias imágenes con la misma paleta de dos colores",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo usar cualquier par de colores?",
    answer: "Sí, además de los presets puedes elegir libremente el color de sombras y el de luces con el selector de color.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El efecto se genera completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenDuotonoPage() {
  return (
    <ToolPageShell
      toolId="imagen-duotono"
      toolName="Efecto Duotono para Imágenes"
      eyebrow="Imágenes"
      intro="Convierte una imagen en un efecto duotono de dos colores, con presets listos para usar."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageDuotone />
    </ToolPageShell>
  );
}
