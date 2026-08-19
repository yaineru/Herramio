import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR para negocios",
  description:
    "Crea un código QR todo-en-uno para que tu negocio comparta web, redes y contacto desde un solo enlace escaneable.",
  path: "/qr-negocio",
});

const fields: FieldConfig[] = [
  {
    name: "url",
    label: "Enlace principal de tu negocio",
    type: "url",
    placeholder: "https://tunegocio.com o tu página de enlaces",
    required: true,
    helpText:
      "Puede ser tu sitio web o una página de enlaces (tipo Linktree) con tu web, redes y WhatsApp.",
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Un solo QR para todos tus canales" },
  {
    type: "p",
    text: "Si tu negocio tiene varios canales — sitio web, Instagram, WhatsApp, ubicación — la forma más simple de compartirlos todos con un único código QR es crear una página de enlaces (por ejemplo, con Linktree, Beacons o una landing propia) que reúna todos esos accesos, y generar el QR apuntando a esa página.",
  },
  { type: "h2", text: "Dónde usar tu QR de negocio" },
  {
    type: "ul",
    items: [
      "Fachada, vitrina o mostrador",
      "Tarjetas de presentación y facturas",
      "Empaques y bolsas de producto",
      "Publicidad impresa: volantes, revistas, vallas",
    ],
  },
  { type: "h2", text: "Alternativa simple: apunta directo a tu web" },
  {
    type: "p",
    text: "Si no quieres crear una página de enlaces adicional, puedes usar directamente la URL de tu sitio web principal — funciona igual de bien si tu web ya centraliza la información de contacto y redes.",
  },
];

const faqItems = [
  {
    question: "¿Necesito crear una página de enlaces especial?",
    answer:
      "No es obligatorio: puedes apuntar el QR directo a tu sitio web. Una página de enlaces solo ayuda si quieres centralizar varios canales (redes, WhatsApp, ubicación) en un solo destino.",
  },
  {
    question: "¿Puedo cambiar el destino del QR más adelante?",
    answer:
      "El QR queda fijo apuntando a la URL que generaste. Si necesitas cambiar el destino, deberás generar un nuevo código — a menos que uses una página de enlaces cuyo contenido interno sí puedas editar libremente.",
  },
];

export default function QrNegocioPage() {
  return (
    <ToolPageShell
      toolId="qr-negocio"
      toolName="QR para negocios"
      eyebrow="Todo en un solo QR"
      intro="Un QR todo-en-uno para que tu negocio comparta web, redes sociales y contacto desde un solo escaneo."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QRGenerator
        toolId="qr-negocio"
        toolName="QR para negocios"
        fields={fields}
        emptyHint="Escribe el enlace principal de tu negocio para generar el QR."
      />
    </ToolPageShell>
  );
}
