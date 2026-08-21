import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageRotateFlip } from "@/components/tools/ImageRotateFlip";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Rotar y Voltear Imagen Online Gratis",
  description:
    "Gira una imagen 90°, 180° o 270°, o voltéala en horizontal y vertical, directamente en tu navegador.",
  path: "/imagen-rotar-voltear",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Usa los botones para girar la imagen en pasos de 90° o voltearla como un espejo en horizontal o vertical. Puedes combinar varios ajustes antes de descargar el resultado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Corregir una foto tomada de lado o al revés",
      "Voltear una imagen para usarla como espejo en un diseño",
      "Girar una captura de pantalla antes de compartirla",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La rotación y el volteo ocurren completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo combinar rotación y volteo?",
    answer: "Sí, cada ajuste se aplica sobre el resultado anterior, así que puedes combinarlos libremente.",
  },
];

export default function ImagenRotarVoltearPage() {
  return (
    <ToolPageShell
      toolId="imagen-rotar-voltear"
      toolName="Rotar y Voltear Imagen"
      eyebrow="Imágenes"
      intro="Gira una imagen 90°/180°/270° o voltéala en horizontal y vertical."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageRotateFlip />
    </ToolPageShell>
  );
}
