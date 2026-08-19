import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ColorConverter } from "@/components/tools/ColorConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Color HEX a RGB y HSL Online",
  description:
    "Convierte colores entre HEX, RGB y HSL al instante, con selector visual, gratis y en tu navegador.",
  path: "/dev-color-picker",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué son HEX, RGB y HSL" },
  {
    type: "p",
    text: "Son tres formas distintas de representar el mismo color. HEX (#10B981) es la notación hexadecimal más común en CSS y diseño. RGB (rgb(16,185,129)) expresa el color como mezcla de rojo, verde y azul de 0 a 255. HSL (hsl(160,84%,39%)) lo describe por matiz, saturación y luminosidad — más intuitivo para ajustar un color a mano.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Convertir un color de diseño (HEX) al formato que necesita tu código (RGB/HSL)",
      "Ajustar la luminosidad de un color manteniendo el mismo matiz, editando el valor HSL",
      "Verificar el valor exacto de un color usando el selector visual",
      "Copiar un color en el formato correcto para CSS, Tailwind o cualquier lenguaje",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué formatos de entrada acepta?",
    answer: "HEX de 3 o 6 dígitos (con o sin #), rgb()/rgba() y hsl()/hsla(). Detecta el formato automáticamente.",
  },
  {
    question: "¿Se guarda el color en algún servidor?",
    answer: "No. Toda la conversión ocurre en tu navegador con funciones matemáticas nativas; nada se envía a un servidor.",
  },
  {
    question: "¿Por qué RGB y HSL dan valores redondeados?",
    answer: "La conversión entre espacios de color implica redondeo — la diferencia es imperceptible visualmente, normalmente de ±1 en un canal.",
  },
];

export default function DevColorPickerPage() {
  return (
    <ToolPageShell
      toolId="dev-color-picker"
      toolName="Convertidor de Color"
      eyebrow="Desarrolladores"
      intro="Convierte colores entre HEX, RGB y HSL al instante, con selector visual incluido."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ColorConverter />
    </ToolPageShell>
  );
}
