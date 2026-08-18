import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de correo electrónico",
  description:
    "Crea un código QR que abre un correo nuevo con destinatario, asunto y mensaje predefinidos. Gratis y sin registro.",
  path: "/qr-email",
});

const fields: FieldConfig[] = [
  { name: "to", label: "Correo destinatario", type: "email", placeholder: "contacto@tunegocio.com", required: true },
  { name: "subject", label: "Asunto (opcional)", type: "text", placeholder: "Consulta desde código QR" },
  { name: "body", label: "Mensaje (opcional)", type: "textarea", placeholder: "Escribe un mensaje predefinido..." },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Correos listos para enviar, sin escribir la dirección" },
  {
    type: "p",
    text: "Al escanear este QR, se abre la app de correo predeterminada del celular con el destinatario, asunto y cuerpo ya completados. El usuario solo revisa y presiona enviar, lo cual reduce errores de tipeo en tu dirección de correo.",
  },
  { type: "h2", text: "Casos de uso" },
  {
    type: "ul",
    items: [
      "Solicitudes de cotización desde un catálogo impreso",
      "Reportes de soporte técnico o garantías",
      "Solicitudes de información en ferias y stands",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué pasa si el usuario no tiene una app de correo configurada?",
    answer:
      "Algunos celulares mostrarán un aviso pidiendo configurar una cuenta de correo antes de continuar; esto depende del sistema operativo, no de tu QR.",
  },
  {
    question: "¿Puedo dejar el asunto y mensaje vacíos?",
    answer: "Sí, ambos son opcionales. Solo el correo destinatario es obligatorio.",
  },
];

export default function QrEmailPage() {
  return (
    <ToolPageShell
      toolId="qr-email"
      toolName="QR de correo electrónico"
      eyebrow="Contacto directo"
      intro="Genera un QR que abre un correo nuevo con destinatario, asunto y mensaje ya redactados."
      fields={fields}
      emptyHint="Escribe un correo destinatario para generar el QR."
      seoContent={seoContent}
      faqItems={faqItems}
    />
  );
}
