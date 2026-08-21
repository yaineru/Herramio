import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { RegexExplainer } from "@/components/tools/RegexExplainer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Explicador de Expresiones Regulares Online",
  description: "Explica parte por parte qué hace una expresión regular, en español sencillo, directamente en tu navegador.",
  path: "/dev-regex-explicador",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe una expresión regular y la herramienta la descompone parte por parte, explicando en español qué hace cada literal, clase de caracteres, cuantificador o grupo.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Entender una expresión regular que encontraste en código de otra persona",
      "Verificar que una regex hace exactamente lo que crees antes de usarla",
      "Aprender la sintaxis de expresiones regulares con ejemplos reales",
    ],
  },
];

const faqItems = [
  {
    question: "¿Explica cualquier expresión regular, sin importar qué tan compleja sea?",
    answer:
      "Cubre la sintaxis estándar (literales, clases de caracteres, escapes comunes, cuantificadores, grupos y alternancia). Con patrones muy inusuales o con características avanzadas poco comunes, la explicación puede quedar incompleta.",
  },
  {
    question: "¿En qué se diferencia del Probador de Expresiones Regulares?",
    answer: "El probador ejecuta tu regex contra un texto para ver qué coincide. Este explicador describe en palabras qué hace la expresión, sin necesidad de un texto de prueba.",
  },
  {
    question: "¿Se envía mi expresión a algún servidor?",
    answer: "No. El análisis ocurre completamente en tu navegador.",
  },
];

export default function DevRegexExplicadorPage() {
  return (
    <ToolPageShell
      toolId="dev-regex-explicador"
      toolName="Explicador de Expresiones Regulares"
      eyebrow="Desarrolladores"
      intro="Explica parte por parte qué hace una expresión regular, en español sencillo."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <RegexExplainer />
    </ToolPageShell>
  );
}
