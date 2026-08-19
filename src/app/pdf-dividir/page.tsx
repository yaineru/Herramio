import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfSplitter } from "@/components/tools/PdfSplitter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Dividir PDF Online Gratis",
  description:
    "Extrae páginas específicas de un PDF y descárgalas como archivos independientes, directamente en tu navegador.",
  path: "/pdf-dividir",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cuándo dividir un PDF" },
  {
    type: "ul",
    items: [
      "Separar los capítulos de un libro o informe largo en archivos independientes",
      "Extraer solo las páginas que necesitas de un contrato o expediente extenso",
      "Sacar una página específica (un anexo, una firma) sin enviar el documento completo",
      "Reducir un PDF pesado a partes más pequeñas y manejables para compartir",
    ],
  },
  { type: "h2", text: "Cómo dividir un PDF" },
  {
    type: "steps",
    items: [
      { title: "Sube tu PDF", text: "La herramienta detecta automáticamente cuántas páginas tiene." },
      { title: "Define los rangos", text: "Escribe los grupos de páginas separados por comas, ej. 1-3,5,8-10." },
      { title: "Descarga cada parte", text: "Cada grupo se convierte en un PDF independiente y descargable." },
    ],
  },
  { type: "h2", text: "Ejemplo" },
  {
    type: "p",
    text: "Si escribes \"1-3,4-6\", obtendrás dos archivos: uno con las páginas 1 a 3, y otro con las páginas 4 a 6 — útil para separar capítulos o secciones de un mismo documento.",
  },
  { type: "h2", text: "Errores frecuentes" },
  {
    type: "ul",
    items: [
      "Escribir un rango fuera del total de páginas del documento (por ejemplo \"5-10\" en un PDF de 6 páginas)",
      "Confundir el orden de los rangos — cada grupo que escribas se descarga como un archivo separado, en el orden en que lo escribiste",
      "Intentar dividir un PDF protegido con contraseña sin quitarle la protección primero",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo extraer una sola página?",
    answer: "Sí, escribe solo el número de esa página (por ejemplo \"5\") para obtenerla como un PDF de una sola página.",
  },
  {
    question: "¿Se sube mi PDF a un servidor?",
    answer: "No. La división ocurre completamente en tu navegador — el documento nunca sale de tu computadora.",
  },
  {
    question: "¿Cuántos rangos puedo definir a la vez?",
    answer: "No hay un límite fijo. Puedes definir tantos grupos de páginas como necesites, separados por comas.",
  },
  {
    question: "¿Qué pasa si me equivoco en un rango?",
    answer: "Simplemente corrige el texto y vuelve a generar la división — no se descarga nada hasta que confirmes.",
  },
  {
    question: "¿Funciona con PDF escaneados o con imágenes?",
    answer: "Sí, la división solo reorganiza las páginas del archivo; no importa si el contenido es texto, imágenes o ambos.",
  },
];

export default function PdfDividirPage() {
  return (
    <ToolPageShell
      toolId="pdf-dividir"
      toolName="Dividir PDF"
      eyebrow="PDF"
      intro="Extrae páginas específicas de un PDF y descárgalas como archivos independientes, sin subir tu documento a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfSplitter />
    </ToolPageShell>
  );
}
