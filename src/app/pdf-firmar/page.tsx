import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfSigner } from "@/components/tools/PdfSigner";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Firmar un PDF Online Gratis",
  description:
    "Dibuja tu firma y colócala en cualquier página de un PDF, directamente en tu navegador, sin instalar nada.",
  path: "/pdf-firmar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Dibuja tu firma con el mouse o el dedo directamente en el lienzo, elige en qué página del PDF va y en qué esquina colocarla, y la herramienta la incrusta como imagen en el documento.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Firmar un documento rápido sin imprimirlo, firmarlo a mano y escanearlo",
      "Añadir tu rúbrica a un contrato o formulario en PDF",
      "Firmar desde el celular sin instalar ninguna aplicación",
    ],
  },
];

const faqItems = [
  {
    question: "¿Es una firma digital con validez legal?",
    answer: "No. Es una firma visual (una imagen de tu trazo) incrustada en el PDF, no una firma digital criptográfica. Para documentos que requieran validez legal formal, usa un servicio de firma digital certificada.",
  },
  {
    question: "¿Se sube mi PDF o mi firma a algún servidor?",
    answer: "No. Todo el proceso (dibujar la firma y colocarla en el PDF) ocurre completamente en tu navegador.",
  },
];

export default function PdfFirmarPage() {
  return (
    <ToolPageShell
      toolId="pdf-firmar"
      toolName="Firmar PDF"
      eyebrow="PDF"
      intro="Dibuja tu firma y colócala en cualquier página de un PDF, sin instalar nada."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfSigner />
    </ToolPageShell>
  );
}
