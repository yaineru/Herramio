import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { UrlPartsParser } from "@/components/tools/UrlPartsParser";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Analizador de URL Online",
  description: "Descompone una URL en protocolo, host, ruta y parámetros de consulta, directamente en tu navegador.",
  path: "/dev-url-parser",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega cualquier URL completa y la herramienta la descompone en protocolo, host, puerto, ruta, fragmento y cada uno de sus parámetros de consulta, listos para copiar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Revisar qué parámetros UTM lleva un enlace de campaña",
      "Depurar una URL con muchos parámetros de consulta",
      "Entender rápidamente la estructura de una URL larga o generada dinámicamente",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia del Codificador/Decodificador de URL?",
    answer:
      "Ese codifica o decodifica texto con porcentaje (%20, %2F, etc.). Este analizador toma una URL completa y la separa en sus partes (protocolo, host, ruta, parámetros).",
  },
  {
    question: "¿Se envía mi URL a algún servidor?",
    answer: "No. El análisis ocurre completamente en tu navegador.",
  },
];

export default function DevUrlParserPage() {
  return (
    <ToolPageShell
      toolId="dev-url-parser"
      toolName="Analizador de URL"
      eyebrow="Desarrolladores"
      intro="Descompone una URL en protocolo, host, ruta y parámetros de consulta."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <UrlPartsParser />
    </ToolPageShell>
  );
}
