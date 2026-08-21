import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { NumberToWordsTool } from "@/components/tools/NumberToWordsTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Número a Letras en Español",
  description:
    "Convierte cualquier número en su escritura completa en letras, en español, directamente en tu navegador.",
  path: "/conv-numero-a-letras",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe un número entero (hasta 999.999.999) y la herramienta lo convierte a su escritura completa en letras, aplicando correctamente las reglas del español como \"veintiuno\", \"ciento\" vs. \"cien\", y \"un millón\" vs. \"millones\".",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Escribir un cheque o documento legal donde el monto debe ir en letras",
      "Generar el texto en letras de una factura o contrato",
      "Verificar cómo se escribe correctamente un número en español",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan los números que escribo en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador.",
  },
  {
    question: "¿Admite decimales?",
    answer: "Actualmente convierte números enteros; para montos con centavos, escribe la parte entera y añade \"con XX centavos\" manualmente.",
  },
  {
    question: "¿Hasta qué número funciona?",
    answer: "Desde 0 hasta 999.999.999 (novecientos noventa y nueve millones novecientos noventa y nueve mil novecientos noventa y nueve).",
  },
];

export default function ConvNumeroALetrasPage() {
  return (
    <ToolPageShell
      toolId="conv-numero-a-letras"
      toolName="Convertidor de Número a Letras"
      eyebrow="Convertidores"
      intro="Convierte cualquier número en su escritura completa en letras, en español."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <NumberToWordsTool />
    </ToolPageShell>
  );
}
