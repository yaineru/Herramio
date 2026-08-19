import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { UuidGenerator } from "@/components/tools/UuidGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de UUID v4 Online Gratis",
  description:
    "Genera identificadores UUID v4 únicos y aleatorios, gratis y en tu navegador. Genera de 1 a 100 a la vez.",
  path: "/dev-uuid-generator",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es un UUID" },
  {
    type: "p",
    text: "Un UUID (Universally Unique Identifier) es un identificador de 128 bits diseñado para ser único sin necesidad de coordinación central. La versión 4 se genera de forma aleatoria y es la más usada para identificar registros, sesiones o recursos.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Generar IDs únicos para registros de una base de datos durante desarrollo o pruebas",
      "Crear identificadores de sesión o de solicitud para depuración",
      "Poblar datos de prueba (seed data) con identificadores realistas",
      "Nombrar archivos temporales de forma que no colisionen entre sí",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué tan probable es que se repita un UUID?",
    answer: "Prácticamente nula: un UUID v4 tiene 122 bits de aleatoriedad, por lo que la probabilidad de colisión es insignificante incluso generando miles de millones.",
  },
  {
    question: "¿Cómo se generan los UUID?",
    answer: "Con crypto.randomUUID(), la API nativa de generación aleatoria criptográficamente segura de tu navegador — no una librería externa.",
  },
  {
    question: "¿Cuántos puedo generar a la vez?",
    answer: "Hasta 100 UUID por lote, para mantener la lista legible y evitar sobrecargar la página.",
  },
];

export default function DevUuidGeneratorPage() {
  return (
    <ToolPageShell
      toolId="dev-uuid-generator"
      toolName="Generador de UUID"
      eyebrow="Desarrolladores"
      intro="Genera identificadores UUID v4 únicos y aleatorios al instante, directamente en tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <UuidGenerator />
    </ToolPageShell>
  );
}
