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
  { type: "h2", text: "Casos de uso reales" },
  {
    type: "ul",
    items: [
      "Convertir una receta de cocina de tazas y onzas a mililitros y gramos",
      "Pasar una medida de un plano o mueble de pulgadas a centímetros antes de comprar algo",
      "Convertir tu peso o estatura entre el sistema métrico e imperial para un formulario o consulta médica",
      "Calcular cuántos kilómetros son una distancia dada en millas antes de un viaje",
    ],
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
  {
    question: "¿Qué pasa si escribo un valor que no es un número?",
    answer: "El campo simplemente no muestra un resultado hasta que introduzcas un número válido — no se genera ningún cálculo erróneo.",
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
