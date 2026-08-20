import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TimezoneConverter } from "@/components/tools/TimezoneConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Zona Horaria Online",
  description:
    "Convierte una hora entre dos zonas horarias al instante, con horario de verano incluido, gratis y sin registro.",
  path: "/conv-zona-horaria",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona la conversión" },
  {
    type: "p",
    text: "Esta herramienta interpreta la fecha y hora que escribes como la hora local de la zona de origen, calcula el instante exacto en el tiempo que representa, y lo muestra como hora local en la zona de destino — teniendo en cuenta automáticamente el horario de verano vigente en esa fecha para cada zona.",
  },
  { type: "h2", text: "Qué muestra el resultado" },
  {
    type: "ul",
    items: [
      "La hora convertida en la zona de destino",
      "La fecha correspondiente, que puede ser un día antes o después según la diferencia horaria",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Coordinar una reunión o llamada con personas en otro país",
      "Saber a qué hora local llega un vuelo o evento en otra zona horaria",
      "Planificar un lanzamiento o publicación que debe salir a una hora específica en otro huso horario",
    ],
  },
];

const faqItems = [
  {
    question: "¿Tiene en cuenta el horario de verano (DST)?",
    answer: "Sí. La conversión calcula el desfase horario real para la fecha exacta que elijas en cada zona, así que el horario de verano se aplica automáticamente cuando corresponde.",
  },
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador, usando las zonas horarias que ya conoce tu sistema.",
  },
  {
    question: "¿Por qué la fecha cambia después de convertir?",
    answer: "Porque la diferencia horaria entre las zonas puede cruzar la medianoche: por ejemplo, las 11pm en Los Ángeles pueden ser las 4pm del día siguiente en Tokio.",
  },
];

export default function ConvZonaHorariaPage() {
  return (
    <ToolPageShell
      toolId="conv-zona-horaria"
      toolName="Convertidor de Zona Horaria"
      eyebrow="Convertidores"
      intro="Convierte una hora entre dos zonas horarias, con horario de verano incluido."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TimezoneConverter />
    </ToolPageShell>
  );
}
