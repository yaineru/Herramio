import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de SMS gratis",
  description:
    "Crea un código QR que abre la app de mensajes con número y texto predefinidos. Rápido, gratis y sin registro.",
  path: "/qr-sms",
});

const fields: FieldConfig[] = [
  { name: "phone", label: "Número de teléfono", type: "tel", placeholder: "+52 55 1234 5678", required: true },
  { name: "message", label: "Mensaje predefinido (opcional)", type: "textarea", placeholder: "Escribe el mensaje..." },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Mensajes de texto sin marcar el número manualmente" },
  {
    type: "p",
    text: "A diferencia del QR de WhatsApp, este código abre la app nativa de SMS del celular, útil en contextos donde no puedes asumir que el destinatario tiene WhatsApp instalado, o cuando el mensaje necesita llegar por la red telefónica tradicional.",
  },
  { type: "h2", text: "Cuándo usar SMS en vez de WhatsApp" },
  {
    type: "p",
    text: "El SMS funciona en cualquier celular con señal, sin necesidad de internet ni de tener una app de mensajería instalada — es la opción más universal, aunque menos rica en funciones que WhatsApp.",
  },
];

const faqItems = [
  {
    question: "¿Tiene algún costo enviar el SMS generado?",
    answer:
      "Eso depende del plan telefónico de quien envía el mensaje, igual que cualquier SMS normal — la generación del QR es gratuita.",
  },
  {
    question: "¿Funciona igual en iPhone y Android?",
    answer: "Sí, ambos sistemas reconocen el formato sms: y abren su app de mensajes nativa.",
  },
];

export default function QrSmsPage() {
  return (
    <ToolPageShell
      toolId="qr-sms"
      toolName="QR de SMS"
      eyebrow="Contacto directo"
      intro="Genera un QR que abre la app de mensajes con número y texto predefinidos, sin necesidad de internet."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QRGenerator
        toolId="qr-sms"
        toolName="QR de SMS"
        fields={fields}
        emptyHint="Escribe un número de teléfono para generar el QR."
      />
    </ToolPageShell>
  );
}
