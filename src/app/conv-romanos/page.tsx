import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { RomanNumeralConverter } from "@/components/tools/RomanNumeralConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Números Romanos Online",
  description: "Convierte números arábigos a números romanos y viceversa, directamente en tu navegador.",
  path: "/conv-romanos",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe un número arábigo (1 a 3999) para ver su equivalente en números romanos, o escribe directamente un número romano para ver a qué número arábigo corresponde.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Saber cómo se escribe un año o un capítulo en números romanos",
      "Verificar la fecha grabada en un monumento, reloj o edición de libro",
      "Resolver una tarea escolar sobre numeración romana",
    ],
  },
];

const faqItems = [
  {
    question: "¿Por qué hay un límite de 3999?",
    answer:
      "El sistema clásico de numeración romana (con las letras I, V, X, L, C, D, M) no tiene una forma estándar de representar números de 4000 en adelante.",
  },
  {
    question: "¿Detecta números romanos escritos incorrectamente?",
    answer:
      "Sí. Por ejemplo, \"IIII\" o \"VX\" no son formas válidas de escribir un número romano y la herramienta te lo indica en vez de dar un resultado incorrecto.",
  },
  {
    question: "¿Se guardan los números que escribo en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador.",
  },
];

export default function ConvRomanosPage() {
  return (
    <ToolPageShell
      toolId="conv-romanos"
      toolName="Convertidor de Números Romanos"
      eyebrow="Convertidores"
      intro="Convierte números arábigos a números romanos y viceversa."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <RomanNumeralConverter />
    </ToolPageShell>
  );
}
