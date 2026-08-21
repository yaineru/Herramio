import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { InflationCalculator } from "@/components/tools/InflationCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Inflación Online",
  description:
    "Calcula cuánto valdría hoy una cantidad de dinero dentro de X años, según la inflación, directamente en tu navegador.",
  path: "/finanzas-inflacion",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe un monto, una tasa de inflación anual y un número de años. La calculadora proyecta cuánto necesitarías en el futuro para tener el mismo poder adquisitivo que ese monto tiene hoy, asumiendo una inflación constante.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Entender cómo la inflación reduce el poder adquisitivo del dinero con el tiempo",
      "Estimar cuánto necesitarás ganar en el futuro para mantener tu nivel de vida actual",
      "Comparar el efecto de distintas tasas de inflación a largo plazo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Esta calculadora es un consejo financiero?",
    answer: "No. Es una proyección matemática basada en una tasa de inflación constante que tú eliges, no una predicción económica real ni un consejo financiero.",
  },
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador.",
  },
];

export default function FinanzasInflacionPage() {
  return (
    <ToolPageShell
      toolId="finanzas-inflacion"
      toolName="Calculadora de Inflación"
      eyebrow="Calculadoras"
      intro="Calcula cuánto valdría hoy una cantidad de dinero dentro de X años, según la inflación."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <InflationCalculator />
    </ToolPageShell>
  );
}
