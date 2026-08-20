import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { SlugGenerator } from "@/components/tools/SlugGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Slugs Online Gratis",
  description:
    "Convierte cualquier texto en un slug limpio para URLs: sin acentos, sin espacios y en minúsculas, al instante y en tu navegador.",
  path: "/texto-slug",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es un slug" },
  {
    type: "p",
    text: "Un slug es la parte de una URL que identifica una página de forma legible: minúsculas, sin acentos ni caracteres especiales, y palabras separadas por guiones. Por ejemplo, \"Cómo Crear un Código QR Gratis\" se convierte en \"como-crear-un-codigo-qr-gratis\".",
  },
  { type: "h2", text: "Cómo se genera" },
  {
    type: "ul",
    items: [
      "Se eliminan los acentos y se normalizan caracteres especiales (ñ, ü, etc.)",
      "Todo el texto se convierte a minúsculas",
      "Los espacios y símbolos se reemplazan por guiones simples",
      "Se eliminan guiones sobrantes al inicio y al final",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Crear URLs limpias y amigables para SEO en un blog o tienda online",
      "Generar nombres de archivo seguros a partir de un título",
      "Convertir el nombre de un producto en un identificador único para una base de datos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda el texto que escribo en algún servidor?",
    answer: "No. El slug se genera completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿Cómo maneja los acentos y la ñ?",
    answer: "Los acentos se eliminan (é → e) y la ñ se convierte en n, siguiendo la convención estándar de slugs en la mayoría de plataformas web.",
  },
  {
    question: "¿Qué pasa con los números y símbolos?",
    answer: "Los números se conservan tal cual; los símbolos y la puntuación se eliminan o se convierten en guiones.",
  },
];

export default function TextoSlugPage() {
  return (
    <ToolPageShell
      toolId="texto-slug"
      toolName="Generador de Slugs"
      eyebrow="Texto"
      intro="Convierte cualquier texto en un slug limpio y listo para usar en URLs."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <SlugGenerator />
    </ToolPageShell>
  );
}
