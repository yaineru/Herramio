import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { UnitConverter } from "@/components/tools/UnitConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Unidades Online",
  description:
    "Convierte longitud, peso, temperatura, área, volumen y tiempo entre unidades comunes. Gratis, sin registro y sin depender de internet.",
  path: "/conv-unidades",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Categorías disponibles" },
  {
    type: "ul",
    items: [
      "Longitud: milímetros, centímetros, metros, kilómetros, pulgadas, pies, yardas, millas",
      "Peso: miligramos, gramos, kilogramos, toneladas, onzas, libras",
      "Temperatura: Celsius, Fahrenheit, Kelvin",
      "Área: cm², m², km², hectáreas, ft², acres",
      "Volumen: mililitros, litros, m³, galones, cuartos, onzas líquidas",
      "Tiempo: segundos, minutos, horas, días, semanas",
    ],
  },
  { type: "h2", text: "Cómo usarlo" },
  {
    type: "p",
    text: "Elige la categoría, escribe la cantidad y selecciona la unidad de origen y destino — el resultado se calcula al instante. Usa el botón central para invertir rápidamente las unidades.",
  },
];

const faqItems = [
  {
    question: "¿Las conversiones usan una fuente externa o tipo de cambio?",
    answer:
      "No. Todas las conversiones de esta herramienta (longitud, peso, área, volumen, tiempo y temperatura) usan fórmulas matemáticas fijas, sin depender de ninguna API externa ni de internet.",
  },
  {
    question: "¿Por qué la temperatura funciona distinto a las demás categorías?",
    answer:
      "Celsius, Fahrenheit y Kelvin no están relacionados por un simple factor multiplicador como el resto de unidades, así que la conversión usa las fórmulas estándar entre escalas de temperatura.",
  },
];

export default function ConvUnidadesPage() {
  return (
    <ToolPageShell
      toolId="conv-unidades"
      toolName="Convertidor de Unidades"
      eyebrow="Convertidores"
      intro="Convierte longitud, peso, temperatura, área, volumen y tiempo entre las unidades más comunes, al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <UnitConverter />
    </ToolPageShell>
  );
}
