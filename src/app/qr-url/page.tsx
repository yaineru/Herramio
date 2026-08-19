import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR para URL o enlaces",
  description:
    "Convierte cualquier enlace o página web en un código QR gratis. Personaliza colores, tamaño y descarga en PNG o SVG sin registro.",
  path: "/qr-url",
});

const fields: FieldConfig[] = [
  {
    name: "url",
    label: "Enlace (URL)",
    type: "url",
    placeholder: "https://tusitio.com",
    required: true,
    helpText: "Puedes pegar cualquier página web, tienda online, red social o video.",
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Un QR de enlace, la forma más rápida de compartir una página" },
  {
    type: "p",
    text: "El QR de URL es el tipo de código QR más usado: codifica una dirección web completa para que, al escanearla, el celular abra directamente esa página en el navegador. Es ideal para llevar tráfico desde material impreso — volantes, empaques, carteles — hacia tu sitio web, tienda online o cualquier landing page.",
  },
  { type: "h2", text: "Cómo usarlo" },
  {
    type: "steps",
    items: [
      { title: "Pega tu enlace", text: "Copia la URL completa de la página que quieres compartir." },
      { title: "Personaliza el diseño", text: "Ajusta color, tamaño y estilo de puntos según tu marca." },
      { title: "Descarga tu QR", text: "En PNG para digital o SVG si lo vas a imprimir en gran formato." },
    ],
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Dirigir a una tienda online desde el empaque del producto",
      "Compartir un formulario o encuesta en un evento",
      "Enlazar a un video de YouTube desde un cartel",
      "Llevar tráfico a una landing page desde publicidad impresa",
    ],
  },
];

const faqItems = [
  {
    question: "¿El QR de URL caduca o deja de funcionar?",
    answer:
      "No. El QR codifica la dirección web directamente; seguirá funcionando mientras esa página exista. Si cambias la URL de destino, necesitarás generar un nuevo QR.",
  },
  {
    question: "¿Funciona con enlaces acortados (bit.ly, etc.)?",
    answer:
      "Sí, cualquier URL válida funciona, incluidos los acortadores de enlaces. Ten en cuenta que si el servicio de acortado deja de funcionar, el QR dejaría de redirigir correctamente.",
  },
  {
    question: "¿Puedo usar el mismo QR para varias campañas?",
    answer:
      "Si quieres medir tráfico por campaña, agrega parámetros UTM a tu URL antes de generar el QR (por ejemplo ?utm_source=volante) para diferenciarlo en Google Analytics.",
  },
];

export default function QrUrlPage() {
  return (
    <ToolPageShell
      toolId="qr-url"
      toolName="QR para enlaces (URL)"
      eyebrow="Herramienta más usada"
      intro="Convierte cualquier enlace o página web en un código QR escaneable, listo para imprimir o compartir digitalmente."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QRGenerator
        toolId="qr-url"
        toolName="QR para enlaces (URL)"
        fields={fields}
        emptyHint="Escribe un enlace para generar tu QR."
      />
    </ToolPageShell>
  );
}
