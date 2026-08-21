import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TodoListTool } from "@/components/tools/TodoListTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Lista de Tareas Online Simple",
  description: "Una lista de tareas simple que guarda tus pendientes en este navegador, sin cuentas ni instalación.",
  path: "/productividad-lista-tareas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe una tarea y presiona Enter para añadirla. Márcala como completada con un clic, bórrala cuando ya no la necesites, o limpia todas las completadas de una vez. Tu lista se guarda automáticamente en este navegador.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Llevar un pendiente rápido del día sin instalar una app",
      "Organizar tareas de un proyecto pequeño sin crear una cuenta",
      "Tener una checklist siempre a mano en el navegador",
    ],
  },
];

const faqItems = [
  {
    question: "¿Necesito crear una cuenta?",
    answer: "No. La lista funciona sin registro y sin conexión a ningún servidor.",
  },
  {
    question: "¿Dónde se guardan mis tareas?",
    answer:
      "Se guardan solo en este navegador, en este dispositivo (localStorage). No se sincronizan entre dispositivos ni se envían a ningún servidor, y desaparecen si borras los datos de navegación del sitio.",
  },
  {
    question: "¿Puedo tener varias listas?",
    answer: "Esta herramienta mantiene una sola lista por navegador. Si necesitas separar tareas, puedes usar prefijos en el texto (por ejemplo, \"Trabajo: …\").",
  },
];

export default function ProductividadListaTareasPage() {
  return (
    <ToolPageShell
      toolId="productividad-lista-tareas"
      toolName="Lista de Tareas"
      eyebrow="Productividad"
      intro="Una lista de tareas simple que guarda tus pendientes en este navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TodoListTool />
    </ToolPageShell>
  );
}
