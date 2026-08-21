import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageBackgroundRemover } from "@/components/tools/ImageBackgroundRemover";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Eliminar Fondo Blanco o de Color de una Imagen",
  description:
    "Quita un fondo blanco o de un solo color de una imagen y descárgala en PNG transparente, directamente en tu navegador.",
  path: "/imagen-eliminar-fondo-color",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Haz clic sobre el color de fondo que quieres eliminar (por ejemplo, el blanco detrás de un producto) y la herramienta lo convierte en transparente. El control de tolerancia decide qué tan parecidos deben ser los colores para eliminarlos también.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Quitar el fondo blanco de una foto de producto para venderlo online",
      "Dejar transparente el fondo de un logo escaneado",
      "Preparar una imagen con fondo verde o azul (chroma key) para superponerla en otro diseño",
    ],
  },
];

const faqItems = [
  {
    question: "¿Funciona con cualquier fondo?",
    answer: "Funciona mejor con fondos de un solo color uniforme (blanco, verde, etc.). No es una eliminación de fondo con inteligencia artificial, así que no reconoce ni separa sujetos de fondos complejos o texturizados.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. Todo el proceso ocurre completamente en tu navegador.",
  },
  {
    question: "¿En qué formato se descarga?",
    answer: "Siempre en PNG, porque es el formato que admite transparencia.",
  },
];

export default function ImagenEliminarFondoColorPage() {
  return (
    <ToolPageShell
      toolId="imagen-eliminar-fondo-color"
      toolName="Eliminar Fondo de Color Sólido"
      eyebrow="Imágenes"
      intro="Quita un fondo blanco o de un solo color de una imagen y descárgala en PNG transparente."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageBackgroundRemover />
    </ToolPageShell>
  );
}
