import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QuickNotesTool } from "@/components/tools/QuickNotesTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Notas Rápidas Online — Bloc de Notas Simple",
  description: "Un bloc de notas simple que guarda tu texto en este navegador automáticamente, sin cuentas ni instalación.",
  path: "/productividad-notas-rapidas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe libremente en el cuadro de texto. Cada cambio se guarda automáticamente en este navegador, así que puedes cerrar la pestaña y encontrar tus notas tal como las dejaste la próxima vez que entres.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Anotar algo rápido sin abrir una app aparte",
      "Guardar un borrador de texto mientras trabajas en otra pestaña",
      "Tener un bloc de notas siempre disponible en el navegador",
    ],
  },
];

const faqItems = [
  {
    question: "¿Necesito crear una cuenta?",
    answer: "No. El bloc funciona sin registro y sin conexión a ningún servidor.",
  },
  {
    question: "¿Dónde se guardan mis notas?",
    answer:
      "Se guardan solo en este navegador, en este dispositivo (localStorage). No se sincronizan entre dispositivos ni se envían a ningún servidor, y desaparecen si borras los datos de navegación del sitio.",
  },
  {
    question: "¿Puedo tener varias notas separadas?",
    answer: "Esta herramienta guarda un solo bloc de texto por navegador, no notas individuales.",
  },
];

export default function ProductividadNotasRapidasPage() {
  return (
    <ToolPageShell
      toolId="productividad-notas-rapidas"
      toolName="Notas Rápidas"
      eyebrow="Productividad"
      intro="Un bloc de notas simple que guarda tu texto en este navegador automáticamente."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QuickNotesTool />
    </ToolPageShell>
  );
}
