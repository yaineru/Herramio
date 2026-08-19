import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TeamGenerator } from "@/components/tools/TeamGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Equipos Aleatorios Online",
  description:
    "Divide una lista de nombres en equipos aleatorios y equilibrados, gratis y sin registro. Ideal para deportes, clases y juegos.",
  path: "/productividad-generador-equipos",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo usar el generador de equipos" },
  {
    type: "p",
    text: "Escribe un nombre por línea, elige cuántos equipos quieres formar y pulsa Generar equipos. Los participantes se reparten al azar de la forma más equilibrada posible entre los equipos.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Formar equipos para deportes o juegos recreativos",
      "Dividir un grupo de clase en equipos de trabajo",
      "Repartir participantes en un torneo o dinámica grupal",
      "Organizar equipos para eventos o actividades de team building",
    ],
  },
];

const faqItems = [
  {
    question: "¿Los equipos quedan del mismo tamaño?",
    answer: "Se reparten de la forma más equilibrada posible; si el número de participantes no es divisible exactamente entre los equipos, algunos tendrán un integrante más que otros.",
  },
  {
    question: "¿Puedo elegir cualquier número de equipos?",
    answer: "Sí, desde 2 equipos hasta como máximo el número de participantes que ingreses.",
  },
  {
    question: "¿Se guarda mi lista en algún servidor?",
    answer: "No. Todo el proceso ocurre en tu navegador; la lista nunca se envía ni se almacena en ningún servidor.",
  },
];

export default function ProductividadGeneradorEquiposPage() {
  return (
    <ToolPageShell
      toolId="productividad-generador-equipos"
      toolName="Generador de Equipos"
      eyebrow="Productividad"
      intro="Divide una lista de participantes en equipos aleatorios y equilibrados al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TeamGenerator />
    </ToolPageShell>
  );
}
