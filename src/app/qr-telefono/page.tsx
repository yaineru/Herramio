import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR para llamada telefónica",
  description:
    "Crea un código QR que inicia una llamada telefónica al escanearlo. Ideal para soporte, ventas y atención al cliente.",
  path: "/qr-telefono",
});

const fields: FieldConfig[] = [
  {
    name: "phone",
    label: "Número de teléfono",
    type: "tel",
    placeholder: "+52 55 1234 5678",
    required: true,
    helpText: "Incluye el código de país para que funcione desde cualquier lugar.",
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Una llamada a un toque de distancia" },
  {
    type: "p",
    text: "Al escanear este QR, el teléfono abre directamente la pantalla de marcado (o inicia la llamada, según el dispositivo) con tu número ya cargado. Es ideal para quienes prefieren resolver por voz en vez de chat o correo.",
  },
  { type: "h2", text: "Dónde funciona mejor" },
  {
    type: "ul",
    items: [
      "Vehículos de servicio (grúas, plomería, cerrajería) para llamadas urgentes",
      "Carteles de \"se vende\" o \"se renta\"",
      "Puntos de soporte técnico en tiendas",
      "Tarjetas de presentación de agentes de ventas",
    ],
  },
];

const faqItems = [
  {
    question: "¿El QR llama automáticamente sin confirmación?",
    answer:
      "No. Por seguridad, los sistemas operativos siempre muestran una pantalla de confirmación antes de iniciar la llamada; nunca se marca sin que el usuario lo apruebe.",
  },
  {
    question: "¿Debo incluir el código de país?",
    answer:
      "Sí, es muy recomendable, especialmente si el QR lo verá gente fuera de tu país o región.",
  },
];

export default function QrTelefonoPage() {
  return (
    <ToolPageShell
      toolId="qr-telefono"
      toolName="QR de llamada telefónica"
      eyebrow="Contacto directo"
      intro="Crea un QR que abre el marcador con tu número ya cargado, listo para iniciar una llamada."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QRGenerator
        toolId="qr-telefono"
        toolName="QR de llamada telefónica"
        fields={fields}
        emptyHint="Escribe un número de teléfono para generar el QR."
      />
    </ToolPageShell>
  );
}
