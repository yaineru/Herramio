import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { UrlEncoderTool } from "@/components/tools/UrlEncoderTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Codificador y Decodificador de URL Online",
  description:
    "Codifica y decodifica componentes de URL (percent-encoding) gratis, en tu navegador. Ideal para parámetros con espacios, acentos o símbolos.",
  path: "/dev-url-encoder",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es el percent-encoding" },
  {
    type: "p",
    text: "Las URLs solo pueden contener un conjunto limitado de caracteres. El percent-encoding (o URL encoding) convierte caracteres especiales, espacios y acentos en secuencias %XX seguras para usar en una URL.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Codificar un parámetro de búsqueda con espacios o símbolos antes de armar una URL",
      "Decodificar una URL para leer su contenido real",
      "Depurar un enlace que no funciona por caracteres mal codificados",
      "Preparar valores para query strings en código o pruebas de API",
    ],
  },
];

const faqItems = [
  {
    question: "¿Codifica la URL completa o solo un componente?",
    answer: "Esta herramienta usa encodeURIComponent, pensado para codificar un valor individual (como un parámetro), no una URL completa con protocolo y dominio.",
  },
  {
    question: "¿Qué pasa si el texto no está codificado correctamente?",
    answer: "Al decodificar, se muestra un error claro si la secuencia de caracteres % no es válida, en vez de fallar silenciosamente.",
  },
  {
    question: "¿Se procesa todo localmente?",
    answer: "Sí, usando las funciones nativas encodeURIComponent/decodeURIComponent del navegador. Nada se envía a un servidor.",
  },
];

export default function DevUrlEncoderPage() {
  return (
    <ToolPageShell
      toolId="dev-url-encoder"
      toolName="Codificador/Decodificador de URL"
      eyebrow="Desarrolladores"
      intro="Codifica y decodifica componentes de URL al instante, directamente en tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <UrlEncoderTool />
    </ToolPageShell>
  );
}
