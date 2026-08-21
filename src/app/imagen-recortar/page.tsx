import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageCropper } from "@/components/tools/ImageCropper";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Recortar Imagen Online Gratis",
  description:
    "Recorta una imagen a medida o con proporciones listas para Instagram y TikTok, directamente en tu navegador.",
  path: "/imagen-recortar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Arrastra sobre la imagen para marcar la zona que quieres conservar. Puedes recortar libremente o elegir una proporción fija (cuadrado, vertical de Instagram, historia/Reel, video 16:9) para que el resultado encaje directamente en la plataforma que necesites.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Recortar una foto al formato exacto de una publicación de Instagram",
      "Quitar bordes o elementos no deseados de una imagen",
      "Preparar una miniatura o portada con una proporción específica",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El recorte ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo recortar sin una proporción fija?",
    answer: "Sí, la opción \"Libre\" te permite arrastrar cualquier rectángulo sin restricciones.",
  },
  {
    question: "¿Puedo rehacer el recorte si me equivoco?",
    answer: "Sí, vuelve a arrastrar una nueva selección sobre la imagen original y presiona \"Recortar\" de nuevo.",
  },
];

export default function ImagenRecortarPage() {
  return (
    <ToolPageShell
      toolId="imagen-recortar"
      toolName="Recortar Imagen"
      eyebrow="Imágenes"
      intro="Recorta una imagen a medida o con proporciones listas para Instagram y TikTok."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageCropper />
    </ToolPageShell>
  );
}
