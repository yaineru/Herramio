import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageSocialCrop } from "@/components/tools/ImageSocialCrop";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Recortar Imagen para Redes Sociales (Instagram, TikTok, YouTube...)",
  description:
    "Recorta una imagen a los formatos exactos de Instagram, TikTok, YouTube, LinkedIn y más, directamente en tu navegador.",
  path: "/imagen-recortar-redes-sociales",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube una imagen y elige la plataforma y el formato al que la necesitas (publicación cuadrada de Instagram, historia, miniatura de YouTube, portada de LinkedIn, etc.). La herramienta recorta automáticamente el centro de la imagen a la proporción exacta.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Adaptar una misma foto a varios formatos antes de publicarla en distintas redes",
      "Preparar la miniatura de un video de YouTube con las proporciones correctas",
      "Ajustar una foto de perfil o portada al tamaño exacto que pide cada plataforma",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo elegir qué parte de la imagen se conserva?",
    answer: "El recorte siempre se centra automáticamente en la imagen; no se puede desplazar manualmente en esta versión.",
  },
  {
    question: "¿Los tamaños son exactos?",
    answer: "Sí, cada preset genera la imagen en píxeles exactos para ese formato (por ejemplo, 1080×1080 para una publicación cuadrada de Instagram).",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El recorte ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenRecortarRedesSocialesPage() {
  return (
    <ToolPageShell
      toolId="imagen-recortar-redes-sociales"
      toolName="Recortar Imagen para Redes Sociales"
      eyebrow="Imágenes"
      intro="Recorta una imagen a los formatos exactos de Instagram, TikTok, YouTube, LinkedIn y más."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageSocialCrop />
    </ToolPageShell>
  );
}
