import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TextCompare } from "@/components/tools/TextCompare";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Comparar Dos Textos Online (Diff de Texto)",
  description: "Compara dos textos y resalta lo que se agregó o se quitó entre ellos, directamente en tu navegador.",
  path: "/texto-comparar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega un texto en cada recuadro. La herramienta compara palabra por palabra y resalta en verde lo que se agregó y en rojo (tachado) lo que se quitó entre el primero y el segundo.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Revisar qué cambió entre dos versiones de un correo o documento",
      "Comparar dos párrafos casi idénticos para encontrar la diferencia exacta",
      "Verificar que una edición no alteró nada más del texto original",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia de Comparar Texto de Dos PDF?",
    answer:
      "Esta herramienta compara texto que pegas directamente; la de PDF extrae primero el texto de dos archivos PDF y luego lo compara. Usa esta si ya tienes el texto, y la de PDF si necesitas extraerlo de un archivo.",
  },
  {
    question: "¿Se guarda el texto que pego en algún servidor?",
    answer: "No. La comparación ocurre completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
];

export default function TextoCompararPage() {
  return (
    <ToolPageShell
      toolId="texto-comparar"
      toolName="Comparar Dos Textos"
      eyebrow="Texto"
      intro="Compara dos textos y resalta lo que se agregó o se quitó entre ellos."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TextCompare />
    </ToolPageShell>
  );
}
