import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageShadow } from "@/components/tools/ImageShadow";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Añadir Sombra a una Imagen Online",
  description:
    "Agrega una sombra suave y ajustable alrededor de una imagen con fondo transparente, directamente en tu navegador.",
  path: "/imagen-sombra",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen (idealmente con fondo transparente) y ajusta el difuminado, la distancia y la opacidad de la sombra con los controles deslizantes. La vista previa se actualiza al instante.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Darle profundidad a una foto de producto para una tienda online",
      "Preparar un logo con sombra para una presentación",
      "Hacer que un elemento resalte más sobre el fondo de un diseño",
    ],
  },
];

const faqItems = [
  {
    question: "¿Funciona con cualquier imagen?",
    answer:
      "Funciona mejor con imágenes PNG de fondo transparente, ya que la sombra se dibuja alrededor de las partes visibles. Si tu imagen tiene fondo blanco, primero usa Eliminar Fondo de Color.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La sombra se genera completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenSombraPage() {
  return (
    <ToolPageShell
      toolId="imagen-sombra"
      toolName="Añadir Sombra a una Imagen"
      eyebrow="Imágenes"
      intro="Agrega una sombra suave y ajustable alrededor de una imagen con fondo transparente."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageShadow />
    </ToolPageShell>
  );
}
