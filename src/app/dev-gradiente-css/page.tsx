import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { GradientGenerator } from "@/components/tools/GradientGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Gradientes CSS Online",
  description:
    "Crea gradientes CSS personalizados con vista previa en vivo y copia el código linear-gradient al instante.",
  path: "/dev-gradiente-css",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Ajusta los colores, sus posiciones y el ángulo del gradiente mientras ves el resultado en tiempo real. Cuando quede como quieres, copia la línea de CSS lista para pegar en tu proyecto.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Crear el fondo de una sección, botón o tarjeta con un solo clic",
      "Probar combinaciones de colores antes de decidir la paleta de un sitio",
      "Generar rápido un gradiente para una miniatura, banner o portada",
    ],
  },
  { type: "h2", text: "Qué incluye" },
  {
    type: "ul",
    items: [
      "Hasta 5 colores por gradiente, con posición ajustable",
      "Control de ángulo de 0° a 360°",
      "Presets rápidos y un botón para generar colores al azar",
    ],
  },
];

const faqItems = [
  {
    question: "¿El código generado funciona en cualquier navegador moderno?",
    answer: "Sí, usa la sintaxis estándar linear-gradient(), compatible con todos los navegadores modernos.",
  },
  {
    question: "¿Puedo usar más de dos colores?",
    answer: "Sí, puedes añadir hasta 5 colores y ajustar la posición de cada uno de forma independiente.",
  },
  {
    question: "¿Se guarda mi diseño en algún servidor?",
    answer: "No. El gradiente se genera completamente en tu navegador; nada se envía a ningún servidor.",
  },
];

export default function DevGradienteCssPage() {
  return (
    <ToolPageShell
      toolId="dev-gradiente-css"
      toolName="Generador de Gradientes CSS"
      eyebrow="Desarrolladores"
      intro="Crea gradientes CSS personalizados con vista previa en vivo y copia el código."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <GradientGenerator />
    </ToolPageShell>
  );
}
