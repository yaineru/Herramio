import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageResizer } from "@/components/tools/ImageResizer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Redimensionar Imagen Online Gratis",
  description:
    "Cambia el tamaño de una imagen a medida o con tamaños listos para Instagram, TikTok, YouTube y más, directamente en tu navegador.",
  path: "/imagen-redimensionar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige un tamaño predefinido para redes sociales o escribe el ancho y alto exactos que necesitas. Si mantienes la proporción bloqueada, el otro valor se ajusta automáticamente para que la imagen no se deforme.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Preparar una imagen con el tamaño exacto que pide Instagram, TikTok o YouTube",
      "Ajustar una foto de perfil al tamaño requerido por una plataforma",
      "Reducir las dimensiones de una imagen antes de subirla a un formulario con límite de tamaño",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El redimensionado ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Qué pasa si no bloqueo la proporción?",
    answer: "Puedes escribir un ancho y alto completamente independientes, aunque eso puede deformar la imagen si no coinciden con su proporción original.",
  },
  {
    question: "¿Puedo agrandar una imagen pequeña?",
    answer: "Sí, pero al aumentar el tamaño por encima de la resolución original la imagen puede perder nitidez, como con cualquier ampliación digital.",
  },
];

export default function ImagenRedimensionarPage() {
  return (
    <ToolPageShell
      toolId="imagen-redimensionar"
      toolName="Redimensionar Imagen"
      eyebrow="Imágenes"
      intro="Cambia el tamaño de una imagen a medida o con tamaños listos para redes sociales."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageResizer />
    </ToolPageShell>
  );
}
