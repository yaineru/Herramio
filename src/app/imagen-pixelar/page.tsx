import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImagePixelator } from "@/components/tools/ImagePixelator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Pixelar Imagen Online Gratis",
  description:
    "Pixela una cara, un documento o cualquier zona sensible de una imagen antes de compartirla, directamente en tu navegador.",
  path: "/imagen-pixelar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Arrastra sobre la imagen para marcar la zona que quieres ocultar y aplícale el efecto de pixelado. Puedes repetirlo en varias zonas de la misma imagen antes de descargar el resultado final.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Ocultar una cara antes de publicar una foto",
      "Tapar un dato sensible en una captura de pantalla (matrícula, DNI, dirección)",
      "Censurar parte de un documento escaneado antes de compartirlo",
      "Crear miniaturas o vistas previas con contenido parcialmente oculto",
    ],
  },
  { type: "h2", text: "Control sobre el resultado" },
  {
    type: "ul",
    items: [
      "Ajusta el tamaño del bloque de pixelado antes de aplicarlo",
      "Aplica el efecto solo a la zona seleccionada o a toda la imagen",
      "Descarga el resultado en el mismo formato que subiste (JPEG o PNG)",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El pixelado se aplica completamente en tu navegador usando el canvas de HTML5; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo deshacer el pixelado después de aplicarlo?",
    answer: "No una vez aplicado sobre la imagen actual — usa el botón \"Elegir otra imagen\" para empezar de nuevo desde el archivo original si te equivocas.",
  },
  {
    question: "¿Puedo pixelar varias zonas distintas?",
    answer: "Sí. Después de pixelar una zona, puedes seleccionar y pixelar otra zona diferente cuantas veces quieras antes de descargar.",
  },
];

export default function ImagenPixelarPage() {
  return (
    <ToolPageShell
      toolId="imagen-pixelar"
      toolName="Pixelar Imagen"
      eyebrow="Imágenes"
      intro="Pixela una cara, un documento o cualquier zona sensible de una imagen antes de compartirla."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImagePixelator />
    </ToolPageShell>
  );
}
