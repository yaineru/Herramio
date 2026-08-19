import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { Stopwatch } from "@/components/tools/Stopwatch";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Cronómetro Online Gratis con Vueltas",
  description:
    "Cronómetro online preciso, con registro de vueltas, gratis y sin registro. Funciona directamente en tu navegador.",
  path: "/productividad-cronometro",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo usar el cronómetro" },
  {
    type: "p",
    text: "Pulsa Iniciar para comenzar a medir el tiempo. Puedes registrar vueltas mientras corre para comparar tiempos parciales, pausarlo en cualquier momento y reiniciarlo cuando quieras.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Medir el tiempo de entrenamientos deportivos o rutinas de ejercicio",
      "Cronometrar presentaciones, exposiciones o exámenes",
      "Medir tiempos de vuelta en actividades repetitivas",
      "Controlar la duración de tareas de estudio o trabajo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué tan preciso es el cronómetro?",
    answer: "Usa la hora del sistema de tu dispositivo (Date.now()) como referencia, por lo que es preciso al nivel de milisegundos que muestra la pantalla.",
  },
  {
    question: "¿Puedo registrar más de una vuelta?",
    answer: "Sí, puedes registrar tantas vueltas como necesites mientras el cronómetro está corriendo; se muestran en orden, la más reciente primero.",
  },
  {
    question: "¿Sigue corriendo si cambio de pestaña?",
    answer: "Sí, mientras la pestaña siga abierta en tu navegador, aunque no esté en primer plano.",
  },
];

export default function ProductividadCronometroPage() {
  return (
    <ToolPageShell
      toolId="productividad-cronometro"
      toolName="Cronómetro"
      eyebrow="Productividad"
      intro="Un cronómetro simple y preciso, con registro de vueltas, directamente en tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <Stopwatch />
    </ToolPageShell>
  );
}
