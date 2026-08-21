import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageFrame } from "@/components/tools/ImageFrame";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Añadir Marco a una Imagen Online",
  description: "Agrega un marco de color y ancho ajustable alrededor de una imagen, directamente en tu navegador.",
  path: "/imagen-marco",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen, elige el color del marco y ajusta su ancho con el control deslizante. La vista previa se actualiza al instante antes de descargar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Darle un acabado tipo Polaroid a una foto antes de publicarla",
      "Resaltar una imagen de producto con un marco de color de marca",
      "Preparar una foto con borde blanco para imprimir",
    ],
  },
];

const faqItems = [
  {
    question: "¿El marco cambia el tamaño de la imagen original?",
    answer: "Sí, el marco se agrega alrededor de la imagen, por lo que el resultado final es más grande que el original.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El marco se genera completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenMarcoPage() {
  return (
    <ToolPageShell
      toolId="imagen-marco"
      toolName="Añadir Marco a una Imagen"
      eyebrow="Imágenes"
      intro="Agrega un marco de color y ancho ajustable alrededor de una imagen."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageFrame />
    </ToolPageShell>
  );
}
