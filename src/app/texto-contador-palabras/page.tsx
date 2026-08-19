import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { WordCounter } from "@/components/tools/WordCounter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Contador de Palabras y Caracteres Online",
  description:
    "Cuenta palabras, caracteres, líneas, párrafos y tiempo de lectura en tiempo real. Gratis, sin registro y sin subir tu texto a ningún servidor.",
  path: "/texto-contador-palabras",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "¿Cómo se cuentan las palabras?" },
  {
    type: "p",
    text: "El contador separa el texto por espacios en blanco (espacios, tabulaciones, saltos de línea) y cuenta cada fragmento resultante como una palabra. Los espacios múltiples seguidos se tratan como uno solo, así que no afectan el conteo.",
  },
  { type: "h2", text: "Qué mide cada estadística" },
  {
    type: "ul",
    items: [
      "Palabras: fragmentos de texto separados por espacios",
      "Caracteres: total de letras, números, espacios y signos de puntuación",
      "Sin espacios: caracteres excluyendo espacios en blanco",
      "Líneas: saltos de línea en el texto",
      "Párrafos: bloques de texto separados por una línea en blanco",
      "Minutos de lectura: estimado a 200 palabras por minuto, redondeado hacia arriba",
    ],
  },
  { type: "h2", text: "Casos de uso" },
  {
    type: "ul",
    items: [
      "Verificar el límite de caracteres de una publicación en redes sociales",
      "Calcular el tiempo de lectura estimado de un artículo o guion",
      "Revisar la extensión de un ensayo o tarea escolar",
      "Contar palabras de una descripción de producto o meta description SEO",
    ],
  },
];

const faqItems = [
  {
    question: "¿El conteo se actualiza automáticamente?",
    answer: "Sí, todas las estadísticas se recalculan en tiempo real mientras escribes o pegas texto.",
  },
  {
    question: "¿Hay un límite de texto que puedo analizar?",
    answer:
      "No hay un límite estricto — funciona bien con textos largos como artículos o ensayos completos, ya que el procesamiento ocurre en tu propio navegador.",
  },
  {
    question: "¿Mi texto se guarda o se envía a algún servidor?",
    answer: "No. El texto nunca sale de tu navegador; el conteo se calcula localmente.",
  },
];

export default function TextoContadorPalabrasPage() {
  return (
    <ToolPageShell
      toolId="texto-contador-palabras"
      toolName="Contador de Palabras y Caracteres"
      eyebrow="Texto"
      intro="Cuenta palabras, caracteres, líneas, párrafos y tiempo de lectura en tiempo real, mientras escribes."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <WordCounter />
    </ToolPageShell>
  );
}
