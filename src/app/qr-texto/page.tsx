import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de texto gratis",
  description:
    "Convierte cualquier texto, nota o instrucción en un código QR. Sin límite de generación, descarga en PNG o SVG.",
  path: "/qr-texto",
});

const fields: FieldConfig[] = [
  {
    name: "text",
    label: "Texto a codificar",
    type: "textarea",
    placeholder: "Escribe aquí el texto, nota o instrucción...",
    required: true,
    maxLength: 2000,
    helpText: "Hasta 2000 caracteres. Para textos muy largos, considera codificar un enlace en su lugar.",
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "El formato más simple: texto plano" },
  {
    type: "p",
    text: "Un QR de texto no abre ninguna aplicación externa: simplemente muestra el contenido tal cual lo escribiste cuando alguien lo escanea. Es útil para instrucciones, códigos de descuento, notas o cualquier mensaje que no necesite un enlace ni una acción específica.",
  },
  { type: "h2", text: "Ejemplos de uso" },
  {
    type: "ul",
    items: [
      "Instrucciones de uso de un producto o equipo",
      "Un código de cupón o descuento para mostrar en caja",
      "Información de cuidado en etiquetas de ropa o productos",
      "Notas o mensajes en proyectos escolares o artísticos",
    ],
  },
  { type: "h2", text: "Un consejo sobre la longitud del texto" },
  {
    type: "p",
    text: "Cuanto más largo el texto, más denso se vuelve el patrón del QR, lo que puede dificultar el escaneo a distancia. Si tu contenido supera un par de párrafos, es mejor publicarlo en una página web y generar en su lugar un QR de enlace (URL).",
  },
];

const faqItems = [
  {
    question: "¿Qué diferencia hay entre un QR de texto y uno de URL?",
    answer:
      "El QR de texto muestra el contenido directamente en pantalla; el QR de URL abre un navegador y carga una página web. Usa texto para mensajes cortos y URL para contenido más extenso o que cambie con el tiempo.",
  },
  {
    question: "¿Puedo incluir emojis o acentos?",
    answer: "Sí, el generador admite cualquier carácter Unicode, incluyendo tildes, eñes y emojis.",
  },
];

export default function QrTextoPage() {
  return (
    <ToolPageShell
      toolId="qr-texto"
      toolName="QR de texto"
      eyebrow="Notas e instrucciones"
      intro="Codifica cualquier texto plano, nota o instrucción en un código QR que se muestra directo en pantalla al escanear."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QRGenerator
        toolId="qr-texto"
        toolName="QR de texto"
        fields={fields}
        emptyHint="Escribe un texto para generar tu QR."
      />
    </ToolPageShell>
  );
}
