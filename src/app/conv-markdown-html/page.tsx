import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { MarkdownConverter } from "@/components/tools/MarkdownConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Markdown a HTML con Vista Previa",
  description:
    "Convierte Markdown a HTML con vista previa en vivo, listo para copiar, directamente en tu navegador.",
  path: "/conv-markdown-html",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe o pega tu Markdown en el panel izquierdo y ve el resultado renderizado en vivo a la derecha. Cuando quede como quieres, copia el HTML generado y pégalo donde lo necesites.",
  },
  { type: "h2", text: "Qué sintaxis admite" },
  {
    type: "ul",
    items: [
      "Encabezados (# ## ###), negrita, cursiva y código en línea",
      "Enlaces, listas ordenadas y sin ordenar",
      "Citas (blockquote) y líneas horizontales",
    ],
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Previsualizar cómo se verá un README o un post antes de publicarlo",
      "Convertir notas en Markdown a HTML para pegarlas en un editor web",
      "Aprender rápido cómo se renderiza cada elemento de Markdown",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda mi texto en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿Admite todo CommonMark?",
    answer: "Cubre la sintaxis de Markdown más usada en el día a día (encabezados, negrita, cursiva, enlaces, listas, citas), pero no es una implementación completa de la especificación CommonMark.",
  },
  {
    question: "¿Es seguro el HTML generado?",
    answer: "Sí. Cualquier HTML que escribas directamente en el Markdown se muestra como texto, no se ejecuta — el resultado nunca inyecta código HTML sin escapar.",
  },
];

export default function ConvMarkdownHtmlPage() {
  return (
    <ToolPageShell
      toolId="conv-markdown-html"
      toolName="Convertidor de Markdown a HTML"
      eyebrow="Convertidores"
      intro="Convierte Markdown a HTML con vista previa en vivo, listo para copiar."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <MarkdownConverter />
    </ToolPageShell>
  );
}
