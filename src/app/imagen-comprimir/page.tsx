import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageCompressor } from "@/components/tools/ImageCompressor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Comprimir Imagen Online Gratis",
  description:
    "Reduce el tamaño de una imagen JPG, PNG o WebP directamente en tu navegador, sin subirla a ningún servidor. Control de calidad y descarga instantánea.",
  path: "/imagen-comprimir",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona la compresión" },
  {
    type: "p",
    text: "Esta herramienta reduce el tamaño de tu imagen ajustando el nivel de calidad de compresión JPEG o WebP — ambos formatos permiten reducir bastante el peso del archivo con una pérdida de calidad visual mínima si eliges un nivel razonable (70-85% suele ser un buen punto medio).",
  },
  { type: "h2", text: "¿Por qué PNG casi no se reduce?" },
  {
    type: "p",
    text: "PNG es un formato sin pérdida: no tiene un control de calidad como JPEG o WebP, así que \"comprimirlo\" solo optimiza la codificación interna, con una reducción de tamaño mucho menor. Si tu imagen PNG no necesita transparencia, conviértela a JPEG o WebP desde el selector de formato para lograr una reducción real.",
  },
  { type: "h2", text: "Ejemplo de reducción típica" },
  {
    type: "p",
    text: "Una fotografía de 2.4 MB en JPEG con calidad 100% puede bajar a unos 780 KB con calidad 80% — una reducción de aproximadamente 67%, prácticamente indistinguible a simple vista.",
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer:
      "No. Todo el procesamiento (lectura, compresión y descarga) ocurre directamente en tu navegador con la API Canvas nativa — la imagen nunca sale de tu computadora o celular.",
  },
  {
    question: "¿Qué formato debo elegir para comprimir mejor?",
    answer:
      "JPEG o WebP, con un control de calidad real. PNG es sin pérdida y apenas reduce el tamaño, así que solo tiene sentido si necesitas mantener transparencia.",
  },
  {
    question: "¿Hay un límite de tamaño de archivo?",
    answer:
      "Sí, 25 MB por imagen, para evitar que el navegador se congele al procesar archivos extremadamente grandes.",
  },
];

export default function ImagenComprimirPage() {
  return (
    <ToolPageShell
      toolId="imagen-comprimir"
      toolName="Comprimir Imagen Online"
      eyebrow="Imágenes"
      intro="Reduce el tamaño de tu imagen JPG, PNG o WebP directamente en tu navegador, con control de calidad y sin subir el archivo a ningún servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageCompressor />
    </ToolPageShell>
  );
}
