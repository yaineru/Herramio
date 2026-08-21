import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { SalaryConverter } from "@/components/tools/SalaryConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Salario: Por Hora, Diario, Mensual y Anual",
  description:
    "Convierte tu salario entre por hora, diario, mensual y anual, con tu horario real de trabajo, directamente en tu navegador.",
  path: "/finanzas-salario",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe tu salario en el periodo que conoces (por hora, diario, mensual o anual) junto con tus horas y días de trabajo por semana, y la herramienta calcula el equivalente en los otros tres periodos, basado en 52 semanas al año.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Comparar una oferta de trabajo por hora con tu salario mensual actual",
      "Saber cuánto ganas al año a partir de tu sueldo mensual",
      "Calcular tu tarifa por hora real como freelancer o contratista",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador; los datos nunca se envían a ningún servidor.",
  },
  {
    question: "¿Por qué necesito indicar horas y días de trabajo?",
    answer: "Porque el equivalente entre un salario por hora y uno mensual o anual depende directamente de cuántas horas trabajas — no es lo mismo cobrar $20/hora trabajando 30 horas que 40 horas semanales.",
  },
];

export default function FinanzasSalarioPage() {
  return (
    <ToolPageShell
      toolId="finanzas-salario"
      toolName="Convertidor de Salario"
      eyebrow="Calculadoras"
      intro="Convierte tu salario entre por hora, diario, mensual y anual, con tu horario real de trabajo."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <SalaryConverter />
    </ToolPageShell>
  );
}
