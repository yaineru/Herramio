import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageRoundedCorners } from "@/components/tools/ImageRoundedCorners";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Redondear Esquinas de una Imagen Online",
  description:
    "Redondea las esquinas de una imagen con un radio ajustable y descárgala en PNG transparente, directamente en tu navegador.",
  path: "/imagen-esquinas-redondeadas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y ajusta el radio de las esquinas con el control deslizante. La vista previa se actualiza al instante y se descarga en PNG con las esquinas fuera del radio transparentes.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Darle a una captura de pantalla el mismo estilo redondeado que usan las apps",
      "Preparar un ícono de app con esquinas suaves",
      "Suavizar una foto de producto para un catálogo o sitio web",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia de Recortar Imagen en Círculo?",
    answer:
      "Recortar en Círculo siempre produce un círculo perfecto. Esta herramienta conserva la forma rectangular de la imagen y solo suaviza las esquinas con el radio que elijas — con el radio al máximo en una imagen cuadrada, el resultado es igual a un círculo.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El procesamiento ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenEsquinasRedondeadasPage() {
  return (
    <ToolPageShell
      toolId="imagen-esquinas-redondeadas"
      toolName="Redondear Esquinas de una Imagen"
      eyebrow="Imágenes"
      intro="Redondea las esquinas de una imagen con un radio ajustable."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageRoundedCorners />
    </ToolPageShell>
  );
}
