import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { RegexTester } from "@/components/tools/RegexTester";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Probador de Expresiones Regulares (Regex) Online",
  description:
    "Prueba expresiones regulares en tiempo real con resaltado de coincidencias y grupos de captura, gratis y en tu navegador.",
  path: "/dev-regex-tester",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo usar esta herramienta" },
  {
    type: "p",
    text: "Escribe tu expresión regular, selecciona los flags que necesites (global, sin distinguir mayúsculas, multilínea, punto incluye saltos de línea) y pega el texto donde quieres buscar coincidencias. Las coincidencias se resaltan directamente sobre el texto.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Validar que un patrón captura correctamente un formato (emails, teléfonos, códigos)",
      "Depurar por qué una expresión regular no encuentra las coincidencias esperadas",
      "Extraer datos de un texto usando grupos de captura",
      "Aprender y experimentar con la sintaxis de expresiones regulares de JavaScript",
    ],
  },
];

const faqItems = [
  {
    question: "¿Hay un límite de tamaño de texto?",
    answer: "Sí, el texto se limita a 20.000 caracteres y se muestran como máximo 500 coincidencias, para evitar que un patrón mal escrito bloquee tu navegador.",
  },
  {
    question: "¿Qué motor de expresiones regulares usa?",
    answer: "El motor nativo de JavaScript (RegExp) de tu navegador, el mismo que usarías en código.",
  },
  {
    question: "¿Se envía mi texto a algún servidor?",
    answer: "No. Todo el procesamiento ocurre en tu navegador; el texto nunca sale de tu dispositivo.",
  },
];

export default function DevRegexTesterPage() {
  return (
    <ToolPageShell
      toolId="dev-regex-tester"
      toolName="Probador de Expresiones Regulares"
      eyebrow="Desarrolladores"
      intro="Prueba expresiones regulares en tiempo real, con resaltado de coincidencias y grupos de captura."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <RegexTester />
    </ToolPageShell>
  );
}
