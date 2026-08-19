import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfMerger } from "@/components/tools/PdfMerger";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Unir PDF Online Gratis",
  description:
    "Combina varios archivos PDF en uno solo, en el orden que elijas, directamente en tu navegador. Sin límite de archivos, sin marcas de agua.",
  path: "/pdf-unir",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo unir tus PDF" },
  {
    type: "steps",
    items: [
      { title: "Selecciona tus archivos", text: "Arrastra dos o más PDF, o haz clic para elegirlos." },
      { title: "Ordénalos como quieras", text: "Usa las flechas para definir el orden final del documento combinado." },
      { title: "Descarga el resultado", text: "Obtén un solo PDF con todas las páginas, en el orden que definiste." },
    ],
  },
  { type: "h2", text: "Casos de uso" },
  {
    type: "ul",
    items: [
      "Combinar varios contratos o formularios firmados en un solo documento",
      "Juntar capítulos de un informe entregados por separado",
      "Unir comprobantes o facturas escaneadas en un solo archivo para enviar",
    ],
  },
];

const faqItems = [
  {
    question: "¿Hay un límite de archivos que puedo unir?",
    answer: "No hay un límite fijo de cantidad, aunque cada archivo individual debe pesar menos de 50 MB.",
  },
  {
    question: "¿Se suben mis PDF a un servidor?",
    answer: "No. Todo el proceso de unión ocurre en tu navegador; tus archivos nunca salen de tu computadora.",
  },
  {
    question: "¿Funciona con PDF protegidos con contraseña?",
    answer: "No por ahora — si un PDF está protegido, primero deberás quitarle la contraseña antes de unirlo.",
  },
];

export default function PdfUnirPage() {
  return (
    <ToolPageShell
      toolId="pdf-unir"
      toolName="Unir PDF"
      eyebrow="PDF"
      intro="Combina varios archivos PDF en uno solo, en el orden que elijas, sin subir tus documentos a ningún servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfMerger />
    </ToolPageShell>
  );
}
