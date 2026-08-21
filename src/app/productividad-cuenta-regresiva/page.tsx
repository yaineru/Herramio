import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { CountdownTool } from "@/components/tools/CountdownTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Cuenta Regresiva Online para Cualquier Fecha",
  description:
    "Crea una cuenta regresiva en vivo hasta cualquier fecha y hora que elijas, directamente en tu navegador.",
  path: "/productividad-cuenta-regresiva",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige la fecha y hora del evento y, opcionalmente, ponle un nombre. La cuenta regresiva se actualiza en vivo cada segundo, mostrando días, horas, minutos y segundos restantes.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Contar los días para un examen, una boda o un viaje",
      "Mostrar en vivo cuánto falta para el lanzamiento de un producto o evento",
      "Saber exactamente cuánto tiempo ha pasado desde una fecha importante",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué zona horaria funciona la cuenta regresiva?",
    answer: "En tu hora local, la misma que tiene configurada tu navegador.",
  },
  {
    question: "¿Qué pasa si elijo una fecha que ya pasó?",
    answer: "La herramienta muestra el tiempo transcurrido desde esa fecha en lugar del tiempo restante.",
  },
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. Todo el cálculo ocurre en tu navegador.",
  },
];

export default function ProductividadCuentaRegresivaPage() {
  return (
    <ToolPageShell
      toolId="productividad-cuenta-regresiva"
      toolName="Cuenta Regresiva para una Fecha"
      eyebrow="Productividad"
      intro="Crea una cuenta regresiva en vivo hasta cualquier fecha y hora que elijas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <CountdownTool />
    </ToolPageShell>
  );
}
