import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { BoxShadowGenerator } from "@/components/tools/BoxShadowGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Sombras CSS (Box Shadow) Online",
  description:
    "Diseña sombras CSS con capas múltiples, vista previa en vivo, y copia el código box-shadow al instante.",
  path: "/dev-sombra-css",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Ajusta la posición, el desenfoque, la expansión, el color y la opacidad de la sombra mientras ves el resultado en tiempo real sobre una tarjeta de ejemplo. Puedes apilar varias sombras para lograr efectos más elaborados, como sombras suaves de varias capas.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear la sombra de una tarjeta, botón o modal",
      "Lograr un efecto de profundidad con varias sombras superpuestas",
      "Probar sombras internas (inset) para efectos de hundido",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo combinar varias sombras en un mismo elemento?",
    answer: "Sí, puedes añadir hasta 4 capas de sombra; el CSS generado las combina en una sola propiedad box-shadow separadas por comas.",
  },
  {
    question: "¿Qué es una sombra 'inset'?",
    answer: "Es una sombra que se dibuja hacia adentro del elemento en vez de proyectarse hacia afuera, útil para efectos de hundido o de campo de texto.",
  },
  {
    question: "¿Se guarda mi diseño en algún servidor?",
    answer: "No. La sombra se genera completamente en tu navegador; nada se envía a ningún servidor.",
  },
];

export default function DevSombraCssPage() {
  return (
    <ToolPageShell
      toolId="dev-sombra-css"
      toolName="Generador de Sombras CSS"
      eyebrow="Desarrolladores"
      intro="Diseña sombras (box-shadow) con capas múltiples y copia el código CSS al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <BoxShadowGenerator />
    </ToolPageShell>
  );
}
