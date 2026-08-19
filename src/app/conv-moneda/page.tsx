import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { CurrencyConverter } from "@/components/tools/CurrencyConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Moneda Online",
  description:
    "Convierte entre más de 30 monedas con tasas de referencia actualizadas diariamente. Gratis, sin registro.",
  path: "/conv-moneda",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "De dónde vienen las tasas de cambio" },
  {
    type: "p",
    text: "Esta herramienta usa tasas de referencia publicadas diariamente por el Banco Central Europeo, a través de una fuente de datos gratuita y abierta. Se actualizan una vez al día — no son tasas de trading en tiempo real, así que para operaciones financieras reales confirma siempre con tu banco o casa de cambio.",
  },
  { type: "h2", text: "Monedas disponibles" },
  {
    type: "p",
    text: "Cubre más de 30 monedas principales (dólar, euro, libra, yen, peso mexicano, real brasileño, entre otras). Algunas monedas latinoamericanas como el peso colombiano, argentino, chileno o el sol peruano no están disponibles porque esta fuente de datos específica no las publica — preferimos no mostrar una conversión que no podemos garantizar en vez de inventar una tasa aproximada.",
  },
];

const faqItems = [
  {
    question: "¿Las tasas son en tiempo real?",
    answer: "No, se actualizan una vez al día. Para operaciones reales de cambio, verifica la tasa vigente con tu banco.",
  },
  {
    question: "¿Por qué no incluye el peso colombiano o argentino?",
    answer: "La fuente de datos que usamos (tasas de referencia del Banco Central Europeo) no publica esas monedas. Preferimos no mostrarlas antes que ofrecer una conversión poco confiable.",
  },
  {
    question: "¿Necesito internet para usar esta herramienta?",
    answer: "Sí, a diferencia del resto de las herramientas de Herramio, esta necesita conexión para obtener la tasa de cambio actualizada.",
  },
  {
    question: "¿Qué pasa si el servicio de tasas de cambio no responde?",
    answer: "Verás un mensaje pidiéndote intentar de nuevo en unos minutos, en vez de un resultado incorrecto o inventado.",
  },
];

export default function ConvMonedaPage() {
  return (
    <ToolPageShell
      toolId="conv-moneda"
      toolName="Convertidor de Moneda"
      eyebrow="Convertidores"
      intro="Convierte entre más de 30 monedas con tasas de referencia actualizadas diariamente."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <CurrencyConverter />
    </ToolPageShell>
  );
}
