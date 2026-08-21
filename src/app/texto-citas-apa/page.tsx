import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ApaCitationGenerator } from "@/components/tools/ApaCitationGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Citas APA Online Gratis",
  description:
    "Genera citas en formato APA 7 para libros, sitios web y artículos de revista, directamente en tu navegador.",
  path: "/texto-citas-apa",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige el tipo de fuente (libro, sitio web o artículo de revista), completa los datos básicos y la herramienta arma la referencia en formato APA 7.ª edición, lista para copiar en tu documento.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Armar rápido la lista de referencias de un trabajo o tesis",
      "Citar correctamente un artículo, libro o página web según la norma APA",
      "Evitar errores de formato al citar múltiples fuentes",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan los datos que escribo en algún servidor?",
    answer: "No. La cita se genera completamente en tu navegador; los datos nunca se envían a ningún servidor.",
  },
  {
    question: "¿El resultado incluye el formato en cursiva?",
    answer: "El texto plano no puede llevar cursiva. La norma APA pide el título (en libros y sitios web) o el nombre de la revista en cursiva — aplícalo manualmente después de pegar la cita en tu documento.",
  },
  {
    question: "¿Qué tipos de fuente admite?",
    answer: "Libros, sitios web y artículos de revista, que cubren la mayoría de las citas académicas más comunes.",
  },
];

export default function TextoCitasApaPage() {
  return (
    <ToolPageShell
      toolId="texto-citas-apa"
      toolName="Generador de Citas APA"
      eyebrow="Texto"
      intro="Genera citas en formato APA 7 para libros, sitios web y artículos de revista."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ApaCitationGenerator />
    </ToolPageShell>
  );
}
