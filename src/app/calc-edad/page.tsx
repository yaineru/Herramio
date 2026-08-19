import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { AgeCalculator } from "@/components/tools/AgeCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Edad Exacta Online",
  description:
    "Calcula tu edad exacta en años, meses y días a partir de tu fecha de nacimiento, gratis y sin registro.",
  path: "/calc-edad",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se calcula la edad exacta" },
  {
    type: "p",
    text: "A diferencia de restar solo el año, esta calculadora tiene en cuenta el mes y el día completos: si tu cumpleaños todavía no llegó este año, resta un año adicional y ajusta los meses y días restantes — el mismo cálculo que harías a mano, pero automático.",
  },
  { type: "h2", text: "Qué muestra el resultado" },
  {
    type: "ul",
    items: [
      "Edad exacta en años, meses y días",
      "Total de días vividos desde tu nacimiento",
      "Días que faltan para tu próximo cumpleaños",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Verificar tu edad exacta para un trámite, formulario o requisito de edad mínima",
      "Calcular la edad de un hijo, familiar o mascota en años y meses, no solo en años",
      "Saber cuántos días faltan exactamente para tu próximo cumpleaños",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda mi fecha de nacimiento en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador; la fecha nunca se envía ni se almacena en ningún servidor.",
  },
  {
    question: "¿Por qué la edad en años a veces difiere de restar el año directamente?",
    answer: "Porque se ajusta al mes y día exactos: si tu cumpleaños de este año todavía no pasó, la calculadora todavía te cuenta con la edad del año anterior.",
  },
  {
    question: "¿Qué pasa si escribo una fecha de nacimiento futura?",
    answer: "La calculadora te avisa con un mensaje claro (\"La fecha de nacimiento no puede ser futura\") en vez de mostrar un resultado sin sentido.",
  },
  {
    question: "¿Tiene en cuenta los años bisiestos?",
    answer: "Sí. El cálculo se basa en las fechas reales del calendario, así que un 29 de febrero como fecha de nacimiento se maneja correctamente.",
  },
];

export default function CalcEdadPage() {
  return (
    <ToolPageShell
      toolId="calc-edad"
      toolName="Calculadora de Edad"
      eyebrow="Calculadoras"
      intro="Calcula tu edad exacta en años, meses y días a partir de tu fecha de nacimiento."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <AgeCalculator />
    </ToolPageShell>
  );
}
