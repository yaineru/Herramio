import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de contacto (vCard) gratis",
  description:
    "Crea una tarjeta de presentación digital en QR: nombre, teléfono, correo y empresa listos para guardar en un contacto nuevo.",
  path: "/qr-vcard",
});

const fields: FieldConfig[] = [
  { name: "firstName", label: "Nombre", type: "text", placeholder: "Ana", required: true },
  { name: "lastName", label: "Apellido", type: "text", placeholder: "García" },
  { name: "phone", label: "Teléfono", type: "tel", placeholder: "+52 55 1234 5678" },
  { name: "email", label: "Correo electrónico", type: "email", placeholder: "ana@empresa.com" },
  { name: "company", label: "Empresa", type: "text", placeholder: "Mi Empresa SAS" },
  { name: "title", label: "Cargo", type: "text", placeholder: "Directora de Ventas" },
  { name: "website", label: "Sitio web", type: "url", placeholder: "https://miempresa.com" },
  { name: "address", label: "Dirección", type: "text", placeholder: "Calle 123, Ciudad" },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Tu tarjeta de presentación, sin papel" },
  {
    type: "p",
    text: "Este QR codifica un archivo vCard: el estándar que usan los celulares para reconocer una tarjeta de contacto. Al escanearlo, se ofrece guardar automáticamente un contacto nuevo con todos los datos que definas, sin necesidad de teclear nada.",
  },
  { type: "h2", text: "Qué datos incluir" },
  {
    type: "p",
    text: "Nombre, teléfono y correo son los más importantes. Empresa y cargo dan contexto profesional. El sitio web es útil si tienes portafolio o LinkedIn. La dirección es opcional — solo agrégala si es relevante (por ejemplo, un consultorio o local físico).",
  },
];

const faqItems = [
  {
    question: "¿Todos los campos son obligatorios?",
    answer:
      "No, solo el nombre o el teléfono son necesarios para generar el QR. El resto de los campos son opcionales y se incluyen únicamente si los completas.",
  },
  {
    question: "¿En qué formato se guarda el contacto?",
    answer:
      "Se usa el estándar vCard 3.0, compatible con la app de Contactos de iPhone y Android de forma nativa.",
  },
];

export default function QrVCardPage() {
  return (
    <>
      <ToolPageShell
        toolId="qr-vcard"
        toolName="QR de tarjeta de contacto (vCard)"
        eyebrow="Tarjeta de presentación digital"
        intro="Comparte tu tarjeta de presentación digital: nombre, teléfono, empresa y más, lista para guardar como contacto."
        fields={fields}
        emptyHint="Completa al menos tu nombre o teléfono para generar el QR."
        seoContent={seoContent}
        faqItems={faqItems}
      />
      <div className="container-page pb-16 text-center text-sm text-slate-400">
        Guía completa:{" "}
        <Link href="/blog/qr-tarjeta-de-presentacion-digital" className="font-medium text-emerald-700 underline">
          QR para tarjeta de presentación: comparte tu contacto al instante
        </Link>
      </div>
    </>
  );
}
