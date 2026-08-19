import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de Instagram gratis",
  description:
    "Crea un código QR que lleva directo a tu perfil de Instagram. Ideal para vitrinas, empaques y material impreso.",
  path: "/qr-instagram",
});

const fields: FieldConfig[] = [
  {
    name: "username",
    label: "Usuario o URL de Instagram",
    type: "text",
    placeholder: "@tunombre o instagram.com/tunombre",
    required: true,
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Convierte seguidores en clientes reales" },
  {
    type: "p",
    text: "Un QR de Instagram lleva al usuario directo a tu perfil, sin que tenga que buscarte manualmente ni arriesgarse a escribir mal tu usuario. Es especialmente efectivo en puntos de venta físicos, empaques y eventos donde quieres convertir una visita presencial en un seguidor.",
  },
  { type: "h2", text: "Dónde colocarlo" },
  {
    type: "ul",
    items: [
      "Vitrina o mostrador de tu tienda física",
      "Empaques y bolsas de producto",
      "Recibos y facturas impresas",
      "Stands en ferias y eventos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Debo escribir el usuario con o sin @?",
    answer: "Puedes escribirlo de cualquier forma; la herramienta lo normaliza automáticamente.",
  },
  {
    question: "¿Puedo apuntar a un Reel o publicación específica en vez del perfil?",
    answer:
      "Sí, pega directamente la URL completa de esa publicación o Reel en lugar del nombre de usuario.",
  },
];

export default function QrInstagramPage() {
  return (
    <ToolPageShell
      toolId="qr-instagram"
      toolName="QR de Instagram"
      eyebrow="Redes sociales"
      intro="Lleva a tus clientes directo a tu perfil de Instagram con un solo escaneo, sin que tengan que buscarte."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QRGenerator
        toolId="qr-instagram"
        toolName="QR de Instagram"
        fields={fields}
        emptyHint="Escribe tu usuario de Instagram para generar el QR."
      />
    </ToolPageShell>
  );
}
