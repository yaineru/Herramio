import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { CronTranslator } from "@/components/tools/CronTranslator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Traductor de Expresiones Cron Online",
  description:
    "Traduce una expresión cron a lenguaje natural y calcula sus próximas ejecuciones, directamente en tu navegador.",
  path: "/dev-cron",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es una expresión cron" },
  {
    type: "p",
    text: "Una expresión cron define cuándo debe ejecutarse una tarea programada, usando 5 campos: minuto, hora, día del mes, mes y día de la semana. Por ejemplo, \"0 9 * * 1-5\" significa \"todos los días de lunes a viernes, a las 9:00\".",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Entender qué hace una expresión cron que encontraste en un proyecto",
      "Verificar que una tarea programada (cron job) se va a ejecutar cuando esperas",
      "Aprender la sintaxis de cron probando distintas combinaciones",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué formato de cron admite?",
    answer: "El formato estándar de 5 campos (minuto, hora, día del mes, mes, día de la semana), con números, rangos (1-5), listas (1,2,3) y pasos (*/15).",
  },
  {
    question: "¿En qué zona horaria se calculan las próximas ejecuciones?",
    answer: "En la hora local de tu navegador — el mismo huso horario en el que normalmente correría tu tarea si el servidor usa esa misma zona.",
  },
  {
    question: "¿Se envía la expresión a algún servidor?",
    answer: "No. Todo el cálculo ocurre en tu navegador.",
  },
];

export default function DevCronPage() {
  return (
    <ToolPageShell
      toolId="dev-cron"
      toolName="Traductor de Expresiones Cron"
      eyebrow="Desarrolladores"
      intro="Traduce una expresión cron a lenguaje natural y calcula sus próximas ejecuciones."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <CronTranslator />
    </ToolPageShell>
  );
}
