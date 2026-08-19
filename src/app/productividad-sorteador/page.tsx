import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { RafflePicker } from "@/components/tools/RafflePicker";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Sorteador de Nombres Online Gratis",
  description:
    "Sortea un ganador al azar entre una lista de nombres, gratis y sin registro. Ideal para giveaways, rifas y sorteos en clase.",
  path: "/productividad-sorteador",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo usar el sorteador" },
  {
    type: "p",
    text: "Escribe un nombre o participante por línea, pulsa Sortear y la herramienta elegirá uno al azar. Puedes activar la opción de quitar al ganador de la lista para hacer varios sorteos sucesivos sin repetir ganadores.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Elegir un ganador para un sorteo o giveaway en redes sociales",
      "Sortear el orden de participación en una actividad",
      "Elegir al azar quién presenta primero en clase o reunión",
      "Repartir premios en rifas o eventos",
    ],
  },
];

const faqItems = [
  {
    question: "¿El sorteo es realmente aleatorio?",
    answer: "Sí, se elige un ganador al azar entre la lista de participantes usando el generador de números aleatorios del navegador.",
  },
  {
    question: "¿Se guarda mi lista de participantes en algún servidor?",
    answer: "No. Todo el sorteo ocurre en tu navegador; la lista nunca se envía ni se almacena en ningún servidor.",
  },
  {
    question: "¿Puedo hacer varios sorteos con la misma lista?",
    answer: "Sí. Activa la opción de quitar al ganador de la lista tras cada sorteo para elegir varios ganadores sin repetir.",
  },
];

export default function ProductividadSorteadorPage() {
  return (
    <ToolPageShell
      toolId="productividad-sorteador"
      toolName="Sorteador de Nombres"
      eyebrow="Productividad"
      intro="Elige un ganador al azar entre una lista de nombres, ideal para sorteos, rifas y giveaways."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <RafflePicker />
    </ToolPageShell>
  );
}
