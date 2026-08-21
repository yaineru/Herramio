import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageMemeGenerator } from "@/components/tools/ImageMemeGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Memes Online",
  description: "Agrega texto superior e inferior estilo meme a cualquier imagen, directamente en tu navegador.",
  path: "/imagen-meme",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y escribe un texto superior y uno inferior. La herramienta los dibuja en mayúsculas con el estilo clásico de meme (letras blancas con borde negro) y ajusta el tamaño automáticamente al ancho de la imagen.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear un meme para compartir en redes sociales al instante",
      "Reaccionar a una captura de pantalla con texto rápido",
      "Preparar contenido divertido para grupos o chats",
    ],
  },
];

const faqItems = [
  {
    question: "¿La fuente siempre se ve igual?",
    answer:
      "La herramienta pide la fuente clásica de memes (Impact); si tu sistema no la tiene instalada, el navegador usa una fuente de reemplazo en negrita similar, así que el resultado puede variar levemente entre dispositivos.",
  },
  {
    question: "¿Puedo dejar solo el texto de arriba o solo el de abajo?",
    answer: "Sí, cada campo es independiente: puedes usar solo uno de los dos si lo prefieres.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El meme se genera completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenMemePage() {
  return (
    <ToolPageShell
      toolId="imagen-meme"
      toolName="Generador de Memes"
      eyebrow="Imágenes"
      intro="Agrega texto superior e inferior estilo meme a cualquier imagen y descárgala."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageMemeGenerator />
    </ToolPageShell>
  );
}
