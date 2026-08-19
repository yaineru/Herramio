import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfToJpg } from "@/components/tools/PdfToJpg";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir PDF a JPG Online Gratis",
  description:
    "Convierte páginas de un PDF en imágenes JPG directamente en tu navegador. Elige qué páginas convertir y descárgalas de forma individual.",
  path: "/pdf-a-jpg",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cuándo convertir un PDF a JPG" },
  {
    type: "ul",
    items: [
      "Extraer una imagen o gráfico de un PDF para usarlo en una presentación o publicación",
      "Compartir una página específica como imagen en redes sociales o WhatsApp, donde un PDF no siempre se previsualiza bien",
      "Insertar una página de un documento dentro de otro archivo que solo acepta imágenes",
      "Generar miniaturas rápidas del contenido de un PDF sin abrir un lector especializado",
    ],
  },
  { type: "h2", text: "Cómo convertir un PDF a JPG" },
  {
    type: "steps",
    items: [
      { title: "Sube tu PDF", text: "La herramienta detecta cuántas páginas tiene." },
      { title: "Elige las páginas", text: "Escribe qué páginas convertir, por ejemplo 1-3,5." },
      { title: "Descarga cada imagen", text: "Cada página se convierte en una imagen JPG descargable por separado." },
    ],
  },
  { type: "h2", text: "Un límite pensado para tu navegador" },
  {
    type: "p",
    text: "Puedes convertir hasta 30 páginas por conversión. Este límite evita que el navegador se sature al renderizar muchas páginas de una vez — para documentos más largos, conviértelos en varios lotes.",
  },
  { type: "h2", text: "Errores frecuentes" },
  {
    type: "ul",
    items: [
      "Pedir un rango de páginas que no existe en el documento (por ejemplo \"10\" en un PDF de 5 páginas)",
      "Convertir un PDF muy largo de una sola vez y no dividirlo en lotes cuando el navegador se ve lento",
      "Esperar texto seleccionable en la imagen resultante — un JPG es una imagen plana, no conserva el texto como texto",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué calidad se generan las imágenes?",
    answer: "Cada página se renderiza al doble de resolución estándar, suficiente para impresión y visualización en pantalla.",
  },
  {
    question: "¿Se sube mi PDF a un servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador — el documento nunca sale de tu computadora.",
  },
  {
    question: "¿Por qué hay un límite de 30 páginas?",
    answer: "Renderizar páginas de PDF a imagen consume memoria del navegador. El límite evita que se congele en documentos muy largos; para más páginas, conviértelas en varios lotes.",
  },
  {
    question: "¿Puedo elegir el formato de salida además de JPG?",
    answer: "Esta herramienta genera únicamente JPG. Si necesitas PNG o WebP, puedes convertir el resultado con nuestro convertidor de imágenes.",
  },
];

export default function PdfAJpgPage() {
  return (
    <ToolPageShell
      toolId="pdf-a-jpg"
      toolName="PDF a JPG"
      eyebrow="PDF"
      intro="Convierte las páginas de un PDF en imágenes JPG, eligiendo cuáles convertir, sin subir tu documento a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfToJpg />
    </ToolPageShell>
  );
}
