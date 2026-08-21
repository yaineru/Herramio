import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ExifRemover } from "@/components/tools/ExifRemover";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Eliminar Metadata de una Imagen (EXIF)",
  description:
    "Descubre qué datos ocultos trae tu foto (cámara, fecha, ubicación GPS) y elimínalos antes de compartirla, directamente en tu navegador.",
  path: "/imagen-eliminar-metadata",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es la metadata EXIF" },
  {
    type: "p",
    text: "Cuando tomas una foto con un celular o cámara, el archivo puede guardar datos invisibles junto a la imagen: modelo del dispositivo, fecha y hora exactas, y en muchos casos la ubicación GPS donde se tomó. Esta herramienta lee esos datos y te los muestra antes de eliminarlos.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Comprobar si una foto que vas a publicar revela tu ubicación exacta",
      "Eliminar metadata antes de compartir una imagen con desconocidos",
      "Limpiar fotos antes de subirlas a una web, marketplace o red social",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. La lectura y eliminación de metadata ocurren completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Cómo elimina la metadata?",
    answer: "Redibuja la imagen en un lienzo (canvas) nuevo y la vuelve a exportar. Ese proceso no traslada ningún dato EXIF, así que el archivo resultante queda limpio.",
  },
  {
    question: "¿Funciona con imágenes PNG?",
    answer: "Sí, se pueden limpiar y descargar imágenes PNG, aunque la detección de metadata detallada (cámara, GPS) solo aplica a JPEG, que es el formato que normalmente usan las cámaras y celulares.",
  },
];

export default function ImagenEliminarMetadataPage() {
  return (
    <ToolPageShell
      toolId="imagen-eliminar-metadata"
      toolName="Eliminar Metadata de Imagen"
      eyebrow="Imágenes"
      intro="Descubre qué datos ocultos trae tu foto y elimínalos antes de compartirla."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ExifRemover />
    </ToolPageShell>
  );
}
