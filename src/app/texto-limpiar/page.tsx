import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TextCleaner } from "@/components/tools/TextCleaner";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Limpiador de Texto Online",
  description:
    "Quita espacios duplicados, líneas vacías y espacios sobrantes de un texto, y cambia mayúsculas/minúsculas, gratis y al instante.",
  path: "/texto-limpiar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué hace cada opción" },
  {
    type: "ul",
    items: [
      "Quitar espacios duplicados: convierte varios espacios seguidos en uno solo",
      "Quitar líneas vacías: elimina renglones en blanco entre párrafos",
      "Quitar espacios al inicio/final de cada línea: limpia texto copiado con sangría irregular",
      "Cambiar mayúsculas/minúsculas: MAYÚSCULAS, minúsculas, o Primera Letra Mayúscula",
    ],
  },
  { type: "h2", text: "Cuándo es útil" },
  {
    type: "p",
    text: "Muy común al pegar texto copiado de un PDF, un correo o una página web, que suele traer espacios y saltos de línea irregulares. También útil para normalizar listas de datos antes de procesarlas en una hoja de cálculo.",
  },
];

const faqItems = [
  {
    question: "¿Puedo aplicar varias limpiezas a la vez?",
    answer: "Sí, activa todas las opciones que necesites antes de hacer clic en \"Limpiar texto\" — se aplican todas juntas.",
  },
  {
    question: "¿Se guarda el texto que pego?",
    answer: "No, todo el procesamiento ocurre en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿Funciona correctamente con tildes y la letra ñ?",
    answer: "Sí, el cambio de mayúsculas/minúsculas respeta correctamente los acentos y la ñ — no los convierte en caracteres incorrectos ni los elimina.",
  },
  {
    question: "¿En qué orden se aplican las limpiezas?",
    answer: "Primero se recortan los espacios de cada línea, luego se unifican los espacios duplicados, después se quitan las líneas vacías y por último se aplica el cambio de mayúsculas/minúsculas — un orden fijo pensado para que el resultado sea consistente sin importar qué opciones actives.",
  },
];

export default function TextoLimpiarPage() {
  return (
    <ToolPageShell
      toolId="texto-limpiar"
      toolName="Limpiador de Texto"
      eyebrow="Texto"
      intro="Quita espacios duplicados, líneas vacías y espacios sobrantes, y cambia mayúsculas/minúsculas, al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TextCleaner />
    </ToolPageShell>
  );
}
