import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { JpgToPdf } from "@/components/tools/JpgToPdf";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir JPG a PDF Online Gratis",
  description:
    "Convierte una o varias imágenes JPG o PNG en un solo archivo PDF, en el orden que elijas, directamente en tu navegador.",
  path: "/jpg-a-pdf",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cuándo conviene convertir imágenes a PDF" },
  {
    type: "ul",
    items: [
      "Enviar un documento escaneado con la cámara del celular (una foto por página) como un solo archivo ordenado",
      "Armar un portafolio o catálogo de fotos que se vea igual en cualquier dispositivo",
      "Entregar comprobantes o recibos fotografiados en un formato que un formulario web acepte como documento",
      "Asegurar que el destinatario reciba un archivo formal, no varias imágenes sueltas por correo",
    ],
  },
  { type: "h2", text: "Cómo convertir imágenes a PDF" },
  {
    type: "steps",
    items: [
      { title: "Sube tus imágenes", text: "Una o varias, en formato JPG o PNG." },
      { title: "Ordénalas", text: "Cada imagen se convierte en una página, en el orden que definas." },
      { title: "Descarga el PDF", text: "Obtén un solo archivo PDF listo para compartir o imprimir." },
    ],
  },
  { type: "h2", text: "Errores frecuentes" },
  {
    type: "ul",
    items: [
      "Subir las fotos en el orden equivocado y no reordenarlas antes de descargar",
      "Fotografiar un documento con mala luz o en ángulo, lo que reduce la legibilidad de la página resultante",
      "Convertir imágenes muy pesadas sin necesidad, cuando una versión comprimida se vería igual de bien",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo convertir varias imágenes en un solo PDF?",
    answer: "Sí, cada imagen se convierte en una página independiente dentro del mismo archivo PDF, en el orden que elijas.",
  },
  {
    question: "¿Se suben mis imágenes a un servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador — las imágenes nunca salen de tu dispositivo.",
  },
  {
    question: "¿Pierdo calidad al convertir a PDF?",
    answer: "No: cada imagen se incrusta en el PDF tal cual la subiste, sin recomprimirla.",
  },
  {
    question: "¿Puedo mezclar JPG y PNG en el mismo PDF?",
    answer: "Sí, puedes combinar ambos formatos libremente — cada uno se convierte en una página independiente.",
  },
];

export default function JpgAPdfPage() {
  return (
    <ToolPageShell
      toolId="jpg-a-pdf"
      toolName="JPG a PDF"
      eyebrow="PDF"
      intro="Convierte una o varias imágenes JPG o PNG en un solo archivo PDF, sin subir nada a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <JpgToPdf />
    </ToolPageShell>
  );
}
