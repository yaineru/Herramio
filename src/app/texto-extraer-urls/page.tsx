import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { UrlExtractor } from "@/components/tools/UrlExtractor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Extractor de URLs de un Texto",
  description:
    "Extrae todos los enlaces de un texto y cópialos de un clic, directamente en tu navegador.",
  path: "/texto-extraer-urls",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega cualquier texto (un correo, un artículo, una página copiada) y la herramienta busca cada enlace http o https que contenga, elimina duplicados y te lo deja listo para copiar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Sacar rápido todos los enlaces de un correo o documento largo",
      "Recuperar los enlaces de una lista de referencias pegada de otro documento",
      "Revisar qué enlaces contiene un texto antes de compartirlo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda el texto que pego en algún servidor?",
    answer: "No. La extracción ocurre completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿Detecta enlaces sin \"http://\" o \"https://\"?",
    answer: "No, solo detecta enlaces que empiezan explícitamente con http:// o https://. Un texto como \"ejemplo.com\" sin el esquema no se reconoce como URL.",
  },
];

export default function TextoExtraerUrlsPage() {
  return (
    <ToolPageShell
      toolId="texto-extraer-urls"
      toolName="Extractor de URLs"
      eyebrow="Texto"
      intro="Extrae todos los enlaces de un texto y cópialos de un clic."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <UrlExtractor />
    </ToolPageShell>
  );
}
