import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageTargetSizeCompressor } from "@/components/tools/ImageTargetSizeCompressor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Comprimir Imagen a un Tamaño Exacto en KB",
  description:
    "Comprime una imagen hasta alcanzar un tamaño en KB específico, como 100 KB o 200 KB, directamente en tu navegador.",
  path: "/imagen-comprimir-a-tamano",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe el tamaño máximo que necesitas en KB (por ejemplo, para un formulario que exige \"máx. 100 KB\") y la herramienta prueba distintos niveles de calidad automáticamente hasta encontrar el más alto que aún cumple ese límite.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Cumplir el límite de peso de archivo de un formulario o trámite en línea",
      "Reducir fotos para que carguen más rápido sin adivinar el nivel de calidad",
      "Preparar imágenes para un límite de tamaño de subida de un sitio web",
    ],
  },
];

const faqItems = [
  {
    question: "¿Funciona con PNG?",
    answer:
      "Puedes subir un PNG, pero como el PNG no admite compresión por calidad, la herramienta lo convierte a JPEG o WebP (el formato que elijas) para poder alcanzar el tamaño objetivo.",
  },
  {
    question: "¿Siempre alcanza el tamaño exacto que pido?",
    answer:
      "Se acerca lo más posible reduciendo la calidad, pero si la imagen es muy grande y el objetivo muy pequeño, es posible que ni con la calidad mínima se alcance; en ese caso te lo indica y te muestra el tamaño real logrado.",
  },
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La compresión ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
];

export default function ImagenComprimirATamanoPage() {
  return (
    <ToolPageShell
      toolId="imagen-comprimir-a-tamano"
      toolName="Comprimir Imagen a un Tamaño Exacto"
      eyebrow="Imágenes"
      intro="Comprime una imagen hasta alcanzar un tamaño en KB específico."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageTargetSizeCompressor />
    </ToolPageShell>
  );
}
