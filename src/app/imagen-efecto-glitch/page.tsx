import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageGlitchEffect } from "@/components/tools/ImageGlitchEffect";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Efecto Glitch para Imágenes Online",
  description: "Aplica un efecto glitch con separación de canales de color a cualquier imagen, directamente en tu navegador.",
  path: "/imagen-efecto-glitch",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y ajusta la intensidad del efecto. La herramienta separa los canales de color rojo y azul y desplaza franjas horizontales de la imagen, creando un efecto de distorsión digital real.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear una miniatura o portada con estética retro-digital",
      "Darle un toque distorsionado a una foto para redes sociales",
      "Generar contenido visual llamativo para un video corto",
    ],
  },
];

const faqItems = [
  {
    question: "¿El efecto cambia cada vez que lo aplico?",
    answer: "No. El efecto es determinístico: la misma imagen y la misma intensidad siempre producen el mismo resultado.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El efecto se genera completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenEfectoGlitchPage() {
  return (
    <ToolPageShell
      toolId="imagen-efecto-glitch"
      toolName="Efecto Glitch para Imágenes"
      eyebrow="Imágenes"
      intro="Aplica un efecto glitch con separación de canales de color a cualquier imagen."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageGlitchEffect />
    </ToolPageShell>
  );
}
