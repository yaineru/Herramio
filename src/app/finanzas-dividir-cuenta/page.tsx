import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { SplitBillCalculator } from "@/components/tools/SplitBillCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Dividir Cuenta entre Amigos Online",
  description:
    "Reparte una cuenta con propina incluida entre varias personas al instante, gratis y sin registro.",
  path: "/finanzas-dividir-cuenta",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se divide la cuenta" },
  {
    type: "p",
    text: "Se suma la propina al subtotal para obtener el total con propina, y ese total se divide en partes iguales entre el número de personas indicado.",
  },
  { type: "h2", text: "Qué muestra el resultado" },
  {
    type: "ul",
    items: [
      "Monto total de la propina",
      "Total con propina incluida",
      "Cuánto paga cada persona",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Repartir la cuenta de una cena o salida grupal",
      "Dividir gastos de un viaje o evento entre varios amigos",
      "Calcular rápido cuánto le corresponde pagar a cada persona con propina incluida",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador; los montos que escribes nunca se envían a ningún servidor.",
  },
  {
    question: "¿Puedo dividir la cuenta sin propina?",
    answer: "Sí, deja el campo de propina en 0% y la herramienta solo dividirá el subtotal entre las personas.",
  },
  {
    question: "¿El número de personas debe ser un número entero?",
    answer: "Sí, debe ser un número entero de al menos 1 persona.",
  },
];

export default function FinanzasDividirCuentaPage() {
  return (
    <ToolPageShell
      toolId="finanzas-dividir-cuenta"
      toolName="Dividir Cuenta entre Amigos"
      eyebrow="Calculadoras"
      intro="Reparte una cuenta con propina incluida entre varias personas al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <SplitBillCalculator />
    </ToolPageShell>
  );
}
