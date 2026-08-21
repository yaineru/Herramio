import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { HtmlToTextConverter } from "@/components/tools/HtmlToTextConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de HTML a Texto Online",
  description: "Elimina las etiquetas HTML de un contenido y deja solo el texto plano, directamente en tu navegador.",
  path: "/conv-html-a-texto",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega código HTML y la herramienta elimina todas las etiquetas, dejando solo el texto visible. Los párrafos, listas y encabezados se separan en líneas para que el resultado siga siendo legible.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Obtener el texto plano de un correo o página copiada con formato HTML",
      "Limpiar contenido pegado desde un editor web antes de reutilizarlo",
      "Revisar qué texto real contiene un fragmento de HTML antes de publicarlo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Es seguro pegar HTML de una fuente desconocida?",
    answer:
      "Sí. El HTML se analiza con el parser nativo del navegador en un documento inerte: ningún script se ejecuta y no se cargan imágenes ni otros recursos externos, incluso si el HTML los incluye.",
  },
  {
    question: "¿En qué se diferencia de Markdown a HTML?",
    answer: "Ese convierte Markdown en HTML. Esta herramienta hace lo opuesto en espíritu: parte de HTML y deja solo el texto plano, sin ninguna etiqueta.",
  },
  {
    question: "¿Se envía mi HTML a algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador.",
  },
];

export default function ConvHtmlATextoPage() {
  return (
    <ToolPageShell
      toolId="conv-html-a-texto"
      toolName="Convertidor de HTML a Texto"
      eyebrow="Convertidores"
      intro="Elimina las etiquetas HTML de un contenido y deja solo el texto plano."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <HtmlToTextConverter />
    </ToolPageShell>
  );
}
