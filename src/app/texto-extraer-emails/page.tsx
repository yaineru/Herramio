import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { EmailExtractor } from "@/components/tools/EmailExtractor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Extractor de Correos Electrónicos de un Texto",
  description:
    "Extrae todas las direcciones de correo electrónico de un texto y cópialas de un clic, directamente en tu navegador.",
  path: "/texto-extraer-emails",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega cualquier texto (un correo, una lista de contactos, una página copiada) y la herramienta busca cada dirección de correo que contenga, elimina duplicados y te la deja lista para copiar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Sacar rápido todos los correos de una lista de contactos pegada de otro documento",
      "Limpiar una lista de emails eliminando duplicados",
      "Recuperar direcciones de correo de un texto largo sin revisarlo manualmente",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda el texto que pego en algún servidor?",
    answer: "No. La extracción ocurre completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿Elimina los correos duplicados?",
    answer: "Sí, si el mismo correo aparece varias veces (sin importar mayúsculas o minúsculas) solo se muestra una vez.",
  },
  {
    question: "¿Puedo copiar todos los correos de una vez?",
    answer: "Sí, usa el botón \"Copiar todos\" para copiar la lista completa, uno por línea.",
  },
];

export default function TextoExtraerEmailsPage() {
  return (
    <ToolPageShell
      toolId="texto-extraer-emails"
      toolName="Extractor de Correos Electrónicos"
      eyebrow="Texto"
      intro="Extrae todas las direcciones de correo de un texto y cópialas de un clic."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <EmailExtractor />
    </ToolPageShell>
  );
}
