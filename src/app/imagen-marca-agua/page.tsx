import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageWatermark } from "@/components/tools/ImageWatermark";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Añadir Marca de Agua a una Imagen Online",
  description:
    "Repite un texto semitransparente sobre una imagen para protegerla antes de compartirla, directamente en tu navegador.",
  path: "/imagen-marca-agua",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe el texto de tu marca de agua (tu nombre, tu marca, un aviso de derechos) y ajusta la opacidad, el tamaño y qué tan seguido se repite sobre la imagen. El resultado se actualiza en vivo mientras ajustas los controles.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Proteger fotos de un portafolio antes de publicarlas",
      "Marcar imágenes de producto con el nombre de tu tienda",
      "Evitar que una imagen se use sin dar crédito",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La marca de agua se aplica completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo controlar cuántas veces se repite el texto?",
    answer: "Sí, el control de repetición ajusta la separación entre cada copia del texto sobre la imagen.",
  },
];

export default function ImagenMarcaAguaPage() {
  return (
    <ToolPageShell
      toolId="imagen-marca-agua"
      toolName="Añadir Marca de Agua a Imagen"
      eyebrow="Imágenes"
      intro="Repite un texto semitransparente sobre una imagen para protegerla antes de compartirla."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageWatermark />
    </ToolPageShell>
  );
}
