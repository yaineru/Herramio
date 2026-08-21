import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { AsciiArtConverter } from "@/components/tools/AsciiArtConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir Imagen a ASCII Art Online",
  description:
    "Convierte cualquier foto en arte ASCII de texto, listo para copiar o descargar, directamente en tu navegador.",
  path: "/imagen-ascii",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "La herramienta analiza el brillo de cada zona de la imagen y lo traduce a un carácter de texto: las zonas oscuras usan símbolos densos y las zonas claras usan espacios, recreando la imagen con texto monoespaciado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear una firma de texto para foros, correos o terminal",
      "Generar contenido curioso y compartible a partir de una foto",
      "Convertir un logo o retrato en arte de texto para un README o documento de código",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo ajustar el nivel de detalle?",
    answer: "Sí, el control de ancho define cuántos caracteres tiene cada línea — más caracteres significa más detalle, pero un resultado más grande.",
  },
  {
    question: "¿Puedo descargar el resultado?",
    answer: "Sí, puedes copiarlo al portapapeles o descargarlo como archivo de texto (.txt).",
  },
];

export default function ImagenAsciiPage() {
  return (
    <ToolPageShell
      toolId="imagen-ascii"
      toolName="Convertir Imagen a ASCII Art"
      eyebrow="Imágenes"
      intro="Convierte cualquier foto en arte ASCII de texto, listo para copiar o descargar."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <AsciiArtConverter />
    </ToolPageShell>
  );
}
