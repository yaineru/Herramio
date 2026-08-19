import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TemperatureConverter } from "@/components/tools/TemperatureConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Temperatura (Celsius, Fahrenheit, Kelvin)",
  description:
    "Convierte grados Celsius, Fahrenheit y Kelvin gratis, al instante. Fórmulas exactas, sin depender de internet.",
  path: "/conv-temperatura",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Fórmulas de conversión" },
  {
    type: "ul",
    items: [
      "Celsius a Fahrenheit: °F = °C × 9/5 + 32",
      "Fahrenheit a Celsius: °C = (°F − 32) × 5/9",
      "Celsius a Kelvin: K = °C + 273.15",
      "Kelvin a Celsius: °C = K − 273.15",
    ],
  },
  { type: "h2", text: "Puntos de referencia comunes" },
  {
    type: "ul",
    items: [
      "El agua se congela a 0°C, 32°F, 273.15K",
      "El agua hierve a 100°C, 212°F, 373.15K",
      "La temperatura corporal normal es aproximadamente 37°C, 98.6°F",
    ],
  },
];

const faqItems = [
  {
    question: "¿Por qué Kelvin no usa el símbolo de grado (°)?",
    answer: "Por convención científica desde 1967, la unidad Kelvin se escribe sin el símbolo de grado — se dice \"273 kelvin\", no \"273 grados Kelvin\".",
  },
  {
    question: "¿Esta herramienta también convierte otras unidades?",
    answer: "Para longitud, peso, área, volumen y tiempo, usa nuestro convertidor de unidades general.",
  },
];

export default function ConvTemperaturaPage() {
  return (
    <ToolPageShell
      toolId="conv-temperatura"
      toolName="Convertidor de Temperatura"
      eyebrow="Convertidores"
      intro="Convierte Celsius, Fahrenheit y Kelvin al instante, con las fórmulas exactas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TemperatureConverter />
    </ToolPageShell>
  );
}
