import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PomodoroTimer } from "@/components/tools/PomodoroTimer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Temporizador Online Gratis (Pomodoro)",
  description:
    "Temporizador de cuenta regresiva online con presets de Pomodoro (enfoque, descanso corto y largo), gratis y sin registro.",
  path: "/productividad-temporizador",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es la técnica Pomodoro" },
  {
    type: "p",
    text: "La técnica Pomodoro divide el trabajo en bloques de tiempo enfocado (tradicionalmente 25 minutos) seguidos de descansos cortos, con un descanso más largo cada varios bloques. Ayuda a mantener la concentración y evitar el agotamiento.",
  },
  { type: "h2", text: "Cómo usar este temporizador" },
  {
    type: "ul",
    items: [
      "Elige un preset (25 min de enfoque, 5 o 15 min de descanso) o ajusta el tiempo",
      "Pulsa Iniciar para comenzar la cuenta regresiva",
      "Mantén la pestaña abierta hasta que termine el tiempo",
      "Cuando termine, verás un aviso visual en pantalla",
    ],
  },
];

const faqItems = [
  {
    question: "¿El temporizador sigue corriendo si cierro la pestaña?",
    answer: "No. El temporizador funciona mientras la pestaña esté abierta en tu navegador; si la cierras, se detiene.",
  },
  {
    question: "¿Puedo usar un tiempo distinto a los presets?",
    answer: "Los presets cubren los usos más comunes de la técnica Pomodoro. Si necesitas un tiempo totalmente personalizado, puedes seguir usando cualquiera de los presets como punto de partida.",
  },
  {
    question: "¿Necesito crear una cuenta?",
    answer: "No, la herramienta funciona directamente en tu navegador sin registro ni instalación.",
  },
];

export default function ProductividadTemporizadorPage() {
  return (
    <ToolPageShell
      toolId="productividad-temporizador"
      toolName="Temporizador Pomodoro"
      eyebrow="Productividad"
      intro="Un temporizador de cuenta regresiva simple, con presets de la técnica Pomodoro para trabajar enfocado."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PomodoroTimer />
    </ToolPageShell>
  );
}
