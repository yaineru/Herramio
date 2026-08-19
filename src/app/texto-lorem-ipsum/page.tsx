import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { LoremIpsumGenerator } from "@/components/tools/LoremIpsumGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Lorem Ipsum Online",
  description:
    "Genera texto de relleno Lorem Ipsum gratis, por palabras, oraciones o párrafos. Ideal para maquetas de diseño y desarrollo web.",
  path: "/texto-lorem-ipsum",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "¿Qué es el texto Lorem Ipsum?" },
  {
    type: "p",
    text: "Lorem Ipsum es un texto de relleno estándar en la industria del diseño y la maquetación, usado desde el siglo XVI. Su ventaja es tener una distribución de letras razonablemente normal, a diferencia de textos como \"aquí va el contenido\", lo que lo hace ideal para previsualizar cómo se verá un diseño con texto real sin distraer con contenido legible.",
  },
  { type: "h2", text: "Cuándo usarlo" },
  {
    type: "ul",
    items: [
      "Maquetas y prototipos de diseño web antes de tener el contenido final",
      "Pruebas de estilos tipográficos y espaciado",
      "Plantillas de documentos o presentaciones",
      "Desarrollo frontend, para ver cómo se comporta un layout con distintas cantidades de texto",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo generar solo unas pocas palabras?",
    answer: "Sí, elige la unidad \"Palabras\" y define la cantidad exacta que necesites.",
  },
  {
    question: "¿El texto siempre empieza igual?",
    answer: "Por defecto sí, con el clásico \"Lorem ipsum dolor sit amet...\" — puedes desactivar esa opción para obtener texto aleatorio desde la primera palabra.",
  },
  {
    question: "¿Genera texto de relleno en español?",
    answer: "No, genera el texto clásico Lorem Ipsum en pseudo-latín — el estándar de facto en diseño y maquetación. No incluye una versión en español ni otros idiomas.",
  },
  {
    question: "¿Puedo generar varios párrafos, oraciones o palabras a la vez?",
    answer: "Sí, elige la unidad (palabras, oraciones o párrafos) y la cantidad exacta que necesites en cada generación.",
  },
];

export default function TextoLoremIpsumPage() {
  return (
    <ToolPageShell
      toolId="texto-lorem-ipsum"
      toolName="Generador de Lorem Ipsum"
      eyebrow="Texto"
      intro="Genera texto de relleno Lorem Ipsum por palabras, oraciones o párrafos, listo para copiar."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <LoremIpsumGenerator />
    </ToolPageShell>
  );
}
