import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { GroupExpenseSplitter } from "@/components/tools/GroupExpenseSplitter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Dividir Gastos de Grupo Online Gratis",
  description:
    "Reparte gastos entre varias personas con aportes distintos y calcula quién le debe a quién, directamente en tu navegador.",
  path: "/finanzas-dividir-gastos-grupo",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe el nombre de cada persona y cuánto pagó realmente durante el viaje o evento — no hace falta que todos hayan pagado lo mismo. La herramienta calcula cuánto debería aportar cada quien y te da la lista más corta de pagos posible para saldar las cuentas.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Repartir los gastos de un viaje entre amigos que pagaron cosas distintas",
      "Saber exactamente quién le debe dinero a quién después de un evento grupal",
      "Evitar transferencias innecesarias con el número mínimo de pagos para saldar todo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador; los nombres y montos nunca se envían a ningún servidor.",
  },
  {
    question: "¿En qué se diferencia de \"Dividir Cuenta entre Amigos\"?",
    answer: "Esa herramienta reparte una única cuenta en partes iguales. Esta calcula liquidaciones cuando cada persona pagó un monto distinto durante todo un viaje o evento.",
  },
  {
    question: "¿Qué pasa si dos personas pagaron exactamente lo mismo?",
    answer: "Si todos aportaron lo mismo, la herramienta te lo indica y no genera ningún pago pendiente.",
  },
];

export default function FinanzasDividirGastosGrupoPage() {
  return (
    <ToolPageShell
      toolId="finanzas-dividir-gastos-grupo"
      toolName="Dividir Gastos de Grupo"
      eyebrow="Calculadoras"
      intro="Reparte gastos entre varias personas con aportes distintos y calcula quién le debe a quién."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <GroupExpenseSplitter />
    </ToolPageShell>
  );
}
