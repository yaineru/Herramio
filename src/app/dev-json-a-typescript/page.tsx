import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { JsonToTypeScript } from "@/components/tools/JsonToTypeScript";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de JSON a TypeScript Online",
  description:
    "Genera interfaces de TypeScript a partir de un objeto JSON, con tipos anidados incluidos, directamente en tu navegador.",
  path: "/dev-json-a-typescript",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega un objeto JSON y la herramienta analiza su estructura para generar automáticamente las interfaces de TypeScript correspondientes, incluyendo objetos anidados y arreglos.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Tipar rápidamente la respuesta de una API sin escribir las interfaces a mano",
      "Entender la forma de un JSON complejo con varios niveles de anidamiento",
      "Generar un punto de partida para los tipos de un proyecto en TypeScript",
    ],
  },
];

const faqItems = [
  {
    question: "¿Los tipos son 100% precisos?",
    answer:
      "Se infieren solo a partir de los valores presentes en el JSON que pegaste. Un campo con varios objetos en un arreglo se combina en un solo tipo (marcando como opcionales los campos que no aparecen en todos), pero no puede adivinar tipos que no estén representados en tu ejemplo.",
  },
  {
    question: "¿Qué pasa con nombres de campos que no son identificadores válidos?",
    answer: 'Se generan entre comillas, como en JSON: "first-name": string;.',
  },
  {
    question: "¿Se guarda mi JSON en algún servidor?",
    answer: "No. La generación de tipos ocurre completamente en tu navegador.",
  },
];

export default function DevJsonATypescriptPage() {
  return (
    <ToolPageShell
      toolId="dev-json-a-typescript"
      toolName="Convertidor de JSON a TypeScript"
      eyebrow="Desarrolladores"
      intro="Genera interfaces de TypeScript a partir de un objeto JSON, con tipos anidados incluidos."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <JsonToTypeScript />
    </ToolPageShell>
  );
}
