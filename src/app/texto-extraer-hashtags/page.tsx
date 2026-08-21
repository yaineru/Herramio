import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { HashtagExtractor } from "@/components/tools/HashtagExtractor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Extractor de Hashtags de un Texto",
  description: "Extrae todos los #hashtags de un texto y cópialos de un clic, directamente en tu navegador.",
  path: "/texto-extraer-hashtags",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega el texto de una publicación o un borrador y la herramienta busca cada hashtag que contiene, elimina duplicados (sin importar mayúsculas o minúsculas) y te los deja listos para copiar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Recopilar rápido todos los hashtags usados en una publicación larga",
      "Reutilizar los hashtags de un post anterior en uno nuevo",
      "Revisar qué hashtags contiene un texto antes de publicarlo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda el texto que pego en algún servidor?",
    answer: "No. La extracción ocurre completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿Detecta hashtags con acentos o eñes?",
    answer: "Sí, reconoce letras acentuadas y la eñe (por ejemplo, #diseño o #viajé).",
  },
];

export default function TextoExtraerHashtagsPage() {
  return (
    <ToolPageShell
      toolId="texto-extraer-hashtags"
      toolName="Extractor de Hashtags"
      eyebrow="Texto"
      intro="Extrae todos los #hashtags de un texto y cópialos de un clic."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <HashtagExtractor />
    </ToolPageShell>
  );
}
