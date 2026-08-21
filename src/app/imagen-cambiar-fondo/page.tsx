import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageChangeBackground } from "@/components/tools/ImageChangeBackground";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Cambiar Fondo de Color de una Imagen Online",
  description: "Reemplaza un fondo de color sólido por otro color a tu elección, directamente en tu navegador.",
  path: "/imagen-cambiar-fondo",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen con fondo de un solo color, haz clic sobre ese fondo para seleccionarlo y elige el nuevo color que quieres poner en su lugar. Ajusta la tolerancia si el fondo no se detecta bien.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Cambiar una foto de producto de fondo blanco a un color de marca",
      "Adaptar una foto de carnet al color de fondo que exige un trámite",
      "Unificar el color de fondo de varias fotos de producto",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia de Eliminar Fondo de Color?",
    answer:
      "Eliminar Fondo de Color deja el fondo transparente. Esta herramienta hace lo mismo pero además rellena ese espacio con un nuevo color sólido que tú eliges.",
  },
  {
    question: "¿Funciona con fondos con textura o degradado?",
    answer: "Funciona mejor con fondos de un solo color sólido; no es una eliminación de fondo con IA, así que fondos complejos no se detectan bien.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El proceso ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenCambiarFondoPage() {
  return (
    <ToolPageShell
      toolId="imagen-cambiar-fondo"
      toolName="Cambiar Fondo de Color de una Imagen"
      eyebrow="Imágenes"
      intro="Reemplaza un fondo de color sólido por otro color a tu elección."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageChangeBackground />
    </ToolPageShell>
  );
}
