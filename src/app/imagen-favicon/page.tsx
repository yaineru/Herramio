import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { FaviconGenerator } from "@/components/tools/FaviconGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Favicon Online Gratis",
  description:
    "Convierte un logo o imagen en los tamaños de favicon que necesita tu sitio web, directamente en tu navegador.",
  path: "/imagen-favicon",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu logo o imagen (idealmente cuadrada) y la herramienta genera automáticamente los tamaños de ícono más usados: favicon clásico, apple-touch-icon para iOS y los íconos que piden las Progressive Web Apps de Android.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear el favicon de un sitio web a partir de tu logo",
      "Generar los íconos que pide un manifest.json de PWA",
      "Preparar el apple-touch-icon para cuando alguien guarda tu web en el celular",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. Todos los tamaños se generan completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Genera un archivo .ico?",
    answer: "No, genera archivos PNG en cada tamaño estándar. La mayoría de navegadores y sistemas modernos aceptan favicon.png sin problema; si necesitas específicamente un .ico, puedes convertir el PNG de 32×32 con otra herramienta.",
  },
  {
    question: "¿Qué tamaño de imagen debo subir?",
    answer: "Idealmente una imagen cuadrada de al menos 512×512px, para que los íconos más grandes no pierdan calidad.",
  },
];

export default function ImagenFaviconPage() {
  return (
    <ToolPageShell
      toolId="imagen-favicon"
      toolName="Generador de Favicon"
      eyebrow="Imágenes"
      intro="Convierte un logo o imagen en los tamaños de favicon que necesita tu sitio web."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <FaviconGenerator />
    </ToolPageShell>
  );
}
