import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageCircleCrop } from "@/components/tools/ImageCircleCrop";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Recortar Imagen en Círculo Online",
  description:
    "Recorta una imagen en forma de círculo y descárgala en PNG con fondo transparente, directamente en tu navegador.",
  path: "/imagen-circulo",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y ajusta el tamaño del círculo con el control deslizante. El recorte siempre queda centrado y se descarga como PNG con fondo transparente, listo para usar como avatar o logo circular.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear una foto de perfil circular para redes sociales",
      "Preparar un logo redondo para una tarjeta de presentación",
      "Recortar una foto de producto en forma de círculo para un catálogo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo mover el círculo a otra parte de la imagen?",
    answer:
      "El recorte siempre queda centrado en la imagen; el control deslizante ajusta el tamaño del círculo, no su posición.",
  },
  {
    question: "¿En qué formato se descarga?",
    answer: "Siempre en PNG, para que el área fuera del círculo quede transparente.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El recorte ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenCirculoPage() {
  return (
    <ToolPageShell
      toolId="imagen-circulo"
      toolName="Recortar Imagen en Círculo"
      eyebrow="Imágenes"
      intro="Recorta una imagen en forma de círculo y descárgala en PNG con fondo transparente."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageCircleCrop />
    </ToolPageShell>
  );
}
