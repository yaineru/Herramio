import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageColorPicker } from "@/components/tools/ImageColorPicker";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Sacar Color de una Imagen (Eyedropper Online)",
  description:
    "Haz clic en cualquier punto de una imagen para obtener su color exacto en HEX y RGB, directamente en tu navegador.",
  path: "/imagen-color-picker",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y haz clic en cualquier punto. La herramienta lee el color exacto de ese píxel y te muestra su código HEX y su valor RGB, listos para copiar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Obtener el código exacto de un color de marca a partir de un logo o captura",
      "Igualar el color de fondo de un diseño con el de una foto de referencia",
      "Sacar el color dominante de un elemento específico de una imagen",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia de la Paleta de Colores?",
    answer:
      "La Paleta de Colores extrae automáticamente los colores dominantes de toda la imagen. Esta herramienta te deja elegir tú mismo el punto exacto del que quieres el color, con precisión de un píxel.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La lectura del color ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenColorPickerPage() {
  return (
    <ToolPageShell
      toolId="imagen-color-picker"
      toolName="Sacar Color de una Imagen"
      eyebrow="Imágenes"
      intro="Haz clic en cualquier punto de una imagen para obtener su color exacto en HEX y RGB."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageColorPicker />
    </ToolPageShell>
  );
}
