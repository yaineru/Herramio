import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { NumberBaseConverter } from "@/components/tools/NumberBaseConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Base Numérica (Binario, Octal, Decimal, Hex)",
  description: "Convierte entre binario, octal, decimal y hexadecimal al instante, directamente en tu navegador.",
  path: "/conv-base-numerica",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe un número y elige en qué base está escrito (binario, octal, decimal o hexadecimal). La herramienta muestra al instante su equivalente en las otras tres bases, listas para copiar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Convertir un valor hexadecimal de un color o una dirección de memoria a decimal",
      "Entender cómo se representa un número en binario para una tarea de programación",
      "Verificar conversiones de base numérica para clases de sistemas digitales",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué pasa si escribo un dígito inválido para la base elegida?",
    answer: "La herramienta te avisa que el número no es válido en esa base (por ejemplo, un \"2\" no es válido en binario).",
  },
  {
    question: "¿Admite números negativos?",
    answer: "No, esta herramienta trabaja solo con números enteros positivos (incluyendo cero).",
  },
  {
    question: "¿Se guardan los números que escribo en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador.",
  },
];

export default function ConvBaseNumericaPage() {
  return (
    <ToolPageShell
      toolId="conv-base-numerica"
      toolName="Convertidor de Base Numérica"
      eyebrow="Convertidores"
      intro="Convierte entre binario, octal, decimal y hexadecimal al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <NumberBaseConverter />
    </ToolPageShell>
  );
}
