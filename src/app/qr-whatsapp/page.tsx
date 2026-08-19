import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de WhatsApp gratis",
  description:
    "Crea un código QR que abre un chat de WhatsApp con número y mensaje predefinido. Ideal para negocios, ventas y atención al cliente.",
  path: "/qr-whatsapp",
});

const fields: FieldConfig[] = [
  {
    name: "phone",
    label: "Número de WhatsApp",
    type: "tel",
    placeholder: "+52 55 1234 5678",
    required: true,
    helpText: "Incluye el código de país, con o sin espacios.",
  },
  {
    name: "message",
    label: "Mensaje predefinido (opcional)",
    type: "textarea",
    placeholder: "Hola, vi su QR y quiero más información...",
    maxLength: 300,
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Chatea sin que te guarden el número primero" },
  {
    type: "p",
    text: "Al escanear este QR, WhatsApp se abre directo en un chat contigo, con un mensaje ya escrito si lo configuraste. Es la manera más rápida de convertir un cartel, una tarjeta o un empaque en un canal de atención directa.",
  },
  { type: "h2", text: "Ideas para tu mensaje predefinido" },
  {
    type: "ul",
    items: [
      "\"Hola, quiero hacer un pedido\" — para restaurantes y tiendas",
      "\"Vi su anuncio y quiero una cotización\" — para servicios y freelancers",
      "\"Necesito soporte con mi compra\" — para atención postventa",
      "\"Quiero reservar una mesa\" — para restaurantes",
    ],
  },
  { type: "h2", text: "¿WhatsApp normal o WhatsApp Business?" },
  {
    type: "p",
    text: "El QR funciona igual para ambos: el número es lo único que importa. Si usas WhatsApp Business, verifica que el número coincida exactamente con el registrado en la app, incluyendo el código de país.",
  },
];

const faqItems = [
  {
    question: "¿Necesito tener WhatsApp Business para usar este QR?",
    answer:
      "No, funciona igual con una cuenta de WhatsApp personal o de WhatsApp Business. Solo necesitas el número de teléfono asociado a la cuenta.",
  },
  {
    question: "¿Qué pasa si dejo el mensaje en blanco?",
    answer:
      "El QR simplemente abrirá el chat vacío, listo para que la persona escriba lo que quiera.",
  },
  {
    question: "¿Puedo cambiar el mensaje después de imprimir el QR?",
    answer:
      "No: el mensaje queda codificado dentro del QR. Si necesitas cambiarlo, deberás generar un nuevo código y volver a imprimirlo.",
  },
];

export default function QrWhatsAppPage() {
  return (
    <>
      <ToolPageShell
        toolId="qr-whatsapp"
        toolName="QR de WhatsApp"
        eyebrow="Ventas y atención al cliente"
        intro="Crea un QR que abre un chat de WhatsApp con tu número y un mensaje predefinido, sin que el cliente tenga que guardarte antes."
        seoContent={seoContent}
        faqItems={faqItems}
      >
        <QRGenerator
          toolId="qr-whatsapp"
          toolName="QR de WhatsApp"
          fields={fields}
          emptyHint="Escribe un número de WhatsApp para generar tu QR."
        />
      </ToolPageShell>
      <div className="container-page pb-16 text-center text-sm text-slate-400">
        ¿Quieres aprender más? Lee la guía:{" "}
        <Link href="/blog/como-crear-qr-whatsapp" className="font-medium text-emerald-700 underline">
          Cómo crear un QR de WhatsApp con mensaje predefinido
        </Link>
      </div>
    </>
  );
}
