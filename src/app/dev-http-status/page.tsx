import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { HttpStatusLookup } from "@/components/tools/HttpStatusLookup";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Referencia de Códigos de Estado HTTP",
  description: "Busca y consulta el significado de los códigos de estado HTTP más comunes, directamente en tu navegador.",
  path: "/dev-http-status",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe un número de código (como 404) o una palabra clave (como \"redirección\" o \"no autorizado\") y la lista se filtra al instante para mostrarte los códigos HTTP relacionados con su significado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Recordar rápidamente qué significa un código de error al depurar una API",
      "Elegir el código de estado correcto al construir un endpoint",
      "Aprender la diferencia entre códigos parecidos, como 401 y 403",
    ],
  },
];

const faqItems = [
  {
    question: "¿Incluye todos los códigos HTTP que existen?",
    answer: "Incluye los códigos más usados en la práctica diaria de desarrollo web, agrupados en las categorías 1xx a 5xx.",
  },
  {
    question: "¿Se guarda mi búsqueda en algún servidor?",
    answer: "No. La búsqueda ocurre completamente en tu navegador sobre una lista de referencia local.",
  },
];

export default function DevHttpStatusPage() {
  return (
    <ToolPageShell
      toolId="dev-http-status"
      toolName="Referencia de Códigos HTTP"
      eyebrow="Desarrolladores"
      intro="Busca y consulta el significado de los códigos de estado HTTP más comunes."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <HttpStatusLookup />
    </ToolPageShell>
  );
}
