import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageBlurTool } from "@/components/tools/ImageBlurTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Desenfocar Zona de una Imagen Online",
  description:
    "Difumina una cara o un dato sensible de una imagen de forma suave, antes de compartirla, directamente en tu navegador.",
  path: "/imagen-desenfocar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Arrastra sobre la imagen para seleccionar la zona que quieres difuminar y ajusta la intensidad del desenfoque. A diferencia del pixelado, el resultado es un difuminado suave — ideal cuando quieres ocultar algo sin que se note tan marcado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Difuminar una cara o matrícula antes de publicar una foto",
      "Suavizar el fondo de una imagen para resaltar el sujeto principal",
      "Ocultar un dato sensible en una captura de pantalla de forma discreta",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El desenfoque se aplica completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿En qué se diferencia de la herramienta de pixelar?",
    answer: "Pixelar convierte la zona en bloques de color sólido; desenfocar la suaviza gradualmente, un efecto más discreto y menos abrupto visualmente.",
  },
  {
    question: "¿Puedo desenfocar varias zonas?",
    answer: "Sí, puedes repetir la selección y aplicar el desenfoque cuantas veces necesites antes de descargar.",
  },
];

export default function ImagenDesenfocarPage() {
  return (
    <ToolPageShell
      toolId="imagen-desenfocar"
      toolName="Desenfocar Zona de Imagen"
      eyebrow="Imágenes"
      intro="Difumina una cara o un dato sensible de una imagen de forma suave, antes de compartirla."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageBlurTool />
    </ToolPageShell>
  );
}
