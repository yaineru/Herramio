import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { JsonFormatter } from "@/components/tools/JsonFormatter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Formateador y Validador de JSON Online",
  description:
    "Formatea, valida y minifica JSON gratis y en tu navegador. Indentación legible, detección de errores de sintaxis y copiado en un clic.",
  path: "/dev-json-formatter",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué hace esta herramienta" },
  {
    type: "p",
    text: "Pega un JSON y esta herramienta lo valida, lo formatea con indentación legible o lo minifica en una sola línea. Si el JSON tiene un error de sintaxis, te muestra el mensaje exacto para que puedas corregirlo.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Depurar una respuesta de API que llegó comprimida en una sola línea",
      "Validar que un archivo de configuración JSON no tenga errores de sintaxis",
      "Minificar un JSON antes de incluirlo en código para ahorrar espacio",
      "Revisar rápidamente la estructura de un objeto JSON anidado",
    ],
  },
  { type: "h2", text: "Errores frecuentes en JSON" },
  {
    type: "ul",
    items: [
      "Dejar una coma extra después del último elemento de un objeto o arreglo",
      "Usar comillas simples en vez de comillas dobles para las claves o los strings",
      "Olvidar comillas en una clave (JSON exige claves entre comillas, a diferencia de JavaScript)",
      "Copiar un objeto de JavaScript con comentarios o funciones — JSON no admite ninguno de los dos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Mi JSON se envía a algún servidor?",
    answer: "No. Todo el procesamiento ocurre en tu navegador con JSON.parse/JSON.stringify nativos; el contenido nunca sale de tu dispositivo.",
  },
  {
    question: "¿Qué pasa si mi JSON tiene un error?",
    answer: "Se muestra el mensaje de error que reporta el motor de JavaScript, indicando el tipo de problema para que puedas ubicarlo y corregirlo.",
  },
  {
    question: "¿Hay un límite de tamaño?",
    answer: "No hay un límite artificial, pero JSON muy grandes (varios megabytes) pueden tardar más en procesarse según la potencia de tu dispositivo.",
  },
  {
    question: "¿Por qué mi JSON válido en JavaScript no pasa la validación?",
    answer: "JSON es más estricto que un objeto literal de JavaScript: exige comillas dobles en las claves, no permite comas finales ni comentarios. Un objeto que funciona en tu código puede no ser JSON válido.",
  },
];

export default function DevJsonFormatterPage() {
  return (
    <ToolPageShell
      toolId="dev-json-formatter"
      toolName="Formateador de JSON"
      eyebrow="Desarrolladores"
      intro="Formatea, valida y minifica JSON al instante, sin salir de tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <JsonFormatter />
    </ToolPageShell>
  );
}
