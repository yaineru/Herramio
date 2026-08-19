import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageConverter } from "@/components/tools/ImageConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Imágenes Online (JPG, PNG, WebP)",
  description:
    "Convierte imágenes entre JPG, PNG y WebP directamente en tu navegador, sin subirlas a ningún servidor. Gratis y sin marcas de agua.",
  path: "/imagen-convertir",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Conversiones disponibles" },
  {
    type: "ul",
    items: [
      "JPG → PNG y JPG → WebP",
      "PNG → JPG y PNG → WebP",
      "WebP → JPG y WebP → PNG",
    ],
  },
  { type: "h2", text: "¿Cuándo usar cada formato?" },
  {
    type: "p",
    text: "JPG es ideal para fotografías por su buena compresión. PNG es necesario cuando la imagen requiere fondo transparente (logos, iconos). WebP suele dar el mejor balance entre calidad y peso, pero algunos sistemas antiguos no lo soportan del todo.",
  },
  { type: "h2", text: "Qué pasa con la transparencia" },
  {
    type: "p",
    text: "Si conviertes una imagen PNG con transparencia a JPG, el área transparente se rellena automáticamente con fondo blanco, porque JPG no soporta canal alfa. Si necesitas conservar la transparencia, convierte a PNG o WebP en su lugar.",
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador usando la API Canvas nativa.",
  },
  {
    question: "¿Pierdo calidad al convertir?",
    answer:
      "Convertir a JPG o WebP aplica una compresión con pérdida mínima. Convertir a PNG no pierde calidad, pero puede generar un archivo más pesado.",
  },
];

export default function ImagenConvertirPage() {
  return (
    <ToolPageShell
      toolId="imagen-convertir"
      toolName="Convertidor de Imágenes"
      eyebrow="Imágenes"
      intro="Convierte tus imágenes entre JPG, PNG y WebP directamente en tu navegador, sin instalar nada ni subir archivos a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageConverter />
    </ToolPageShell>
  );
}
