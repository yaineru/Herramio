import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { DataSizeConverter } from "@/components/tools/DataSizeConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Tamaño de Datos (Bytes, KB, MB, GB, TB)",
  description: "Convierte entre bytes, KB, MB, GB y TB, en base binaria o decimal, directamente en tu navegador.",
  path: "/conv-datos",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe una cantidad, elige la unidad de origen y si quieres calcular en base binaria (1024) o decimal (1000). La herramienta muestra al instante el equivalente en bytes, KB, MB, GB y TB.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Entender cuántos GB ocupa un archivo expresado en MB",
      "Comparar el espacio de almacenamiento que anuncia un fabricante con el que muestra tu sistema operativo",
      "Calcular cuánto espacio necesitas para varios archivos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Por qué hay dos bases (1024 y 1000)?",
    answer:
      "Los sistemas operativos suelen calcular 1 KB como 1024 bytes (base binaria), mientras que los fabricantes de discos y memorias suelen anunciar la capacidad en base decimal (1 KB = 1000 bytes). Por eso un disco de \"1 TB\" muestra menos espacio del esperado en tu computadora.",
  },
  {
    question: "¿Se guardan los números que escribo en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador.",
  },
];

export default function ConvDatosPage() {
  return (
    <ToolPageShell
      toolId="conv-datos"
      toolName="Convertidor de Tamaño de Datos"
      eyebrow="Convertidores"
      intro="Convierte entre bytes, KB, MB, GB y TB, en base binaria o decimal."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <DataSizeConverter />
    </ToolPageShell>
  );
}
