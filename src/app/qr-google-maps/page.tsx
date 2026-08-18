import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR para Google Maps",
  description:
    "Crea un código QR que abre tu ubicación exacta en Google Maps. Ideal para negocios, eventos e invitaciones.",
  path: "/qr-google-maps",
});

const fields: FieldConfig[] = [
  {
    name: "query",
    label: "Enlace de Google Maps o dirección",
    type: "text",
    placeholder: "Pega el enlace de \"Compartir\" de Maps, o escribe una dirección",
    required: true,
    helpText: "Para máxima precisión, usa el botón Compartir → Copiar enlace desde Google Maps.",
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Elimina la confusión de las direcciones" },
  {
    type: "p",
    text: "En lugar de explicar cómo llegar por texto, este QR abre Google Maps directamente en tu ubicación, con la ruta calculada desde la posición del usuario. Funciona tanto con un enlace exacto copiado desde Maps como con una dirección escrita en texto.",
  },
  { type: "h2", text: "Cómo obtener el enlace más preciso" },
  {
    type: "steps",
    items: [
      { title: "Abre tu negocio en Google Maps", text: "Busca tu ficha o el punto exacto en el mapa." },
      { title: "Toca \"Compartir\"", text: "Selecciona la opción de compartir ubicación." },
      { title: "Copia el enlace", text: "Pégalo directamente en el campo de esta herramienta." },
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo usar solo la dirección de texto en vez de un enlace?",
    answer:
      "Sí, si escribes una dirección, el QR generará una búsqueda de esa dirección en Google Maps. Es preciso, aunque un enlace copiado directamente desde tu ficha de Maps sigue siendo la opción más exacta.",
  },
  {
    question: "¿Funciona con Apple Maps en iPhone?",
    answer:
      "El QR abre Google Maps por defecto. Si el usuario no tiene la app instalada, se abrirá en el navegador, que funciona en cualquier dispositivo.",
  },
];

export default function QrGoogleMapsPage() {
  return (
    <>
      <ToolPageShell
        toolId="qr-google-maps"
        toolName="QR de Google Maps"
        eyebrow="Ubicación y direcciones"
        intro="Genera un QR que lleva directo a tu ubicación exacta en el mapa, sin explicar direcciones por texto."
        fields={fields}
        emptyHint="Pega un enlace o escribe una dirección para generar tu QR."
        seoContent={seoContent}
        faqItems={faqItems}
      />
      <div className="container-page pb-16 text-center text-sm text-slate-400">
        Guía completa:{" "}
        <Link href="/blog/qr-para-google-maps-ubicacion" className="font-medium text-emerald-700 underline">
          Cómo crear un QR para Google Maps
        </Link>
      </div>
    </>
  );
}
