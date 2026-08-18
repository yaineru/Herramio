import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { FAQ } from "@/components/marketing/FAQ";
import { AdSlot } from "@/components/ads/AdSlot";
import { UniversalQRGenerator } from "@/components/qr/UniversalQRGenerator";
import { JsonLd, faqPageSchema, softwareApplicationSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Generador de códigos QR gratis",
  description:
    "El generador de QR todo-en-uno: URL, WhatsApp, WiFi, texto, email, teléfono, SMS, contacto, ubicación y redes sociales. Gratis y sin registro.",
  path: "/generador-qr",
});

const FAQ_ITEMS = [
  {
    question: "¿Cuántos códigos QR puedo generar gratis?",
    answer: "No hay límite. Puedes generar y descargar todos los códigos QR que necesites, sin costo.",
  },
  {
    question: "¿Necesito crear una cuenta?",
    answer: "No, todas las herramientas funcionan sin registro ni inicio de sesión.",
  },
  {
    question: "¿Los QR generados tienen marca de agua?",
    answer: "No, tanto las descargas en PNG como en SVG están libres de marcas de agua.",
  },
  {
    question: "¿Qué diferencia hay entre las opciones del generador?",
    answer:
      "Cada pestaña arma el formato de datos correcto para ese tipo de contenido (enlace, WiFi, contacto, etc.) para que el QR resultante funcione exactamente como espera cada aplicación al escanearlo.",
  },
];

export default function GeneradorQrPage() {
  return (
    <div className="container-page py-10">
      <JsonLd
        data={softwareApplicationSchema({
          name: "Generador de códigos QR",
          description: SITE.description,
          url: `${SITE.url}/generador-qr`,
        })}
      />
      <JsonLd data={faqPageSchema(FAQ_ITEMS)} />

      <Breadcrumbs items={[{ href: "/generador-qr", label: "Generador QR" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Generador de códigos QR gratis
        </h1>
        <p className="mt-3 text-slate-500">
          Elige el tipo de código que necesitas, completa los datos y personaliza el diseño.
          Todo en un mismo lugar, sin registro.
        </p>
      </div>

      <div className="mt-8">
        <UniversalQRGenerator />
      </div>

      <div className="my-12">
        <AdSlot placement="below-generator" />
      </div>

      <div className="mx-auto max-w-2xl">
        <FAQ items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
