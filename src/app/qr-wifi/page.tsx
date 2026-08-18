import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de WiFi gratis",
  description:
    "Crea un código QR para compartir tu red WiFi sin decir la contraseña. Compatible con iPhone y Android, listo para imprimir.",
  path: "/qr-wifi",
});

const fields: FieldConfig[] = [
  { name: "ssid", label: "Nombre de la red (SSID)", type: "text", placeholder: "MiRedWiFi", required: true },
  { name: "password", label: "Contraseña", type: "text", placeholder: "••••••••" },
  {
    name: "security",
    label: "Tipo de seguridad",
    type: "select",
    defaultValue: "WPA",
    options: [
      { value: "WPA", label: "WPA/WPA2 (más común)" },
      { value: "WEP", label: "WEP" },
      { value: "nopass", label: "Sin contraseña" },
    ],
  },
  { name: "hidden", label: "Es una red oculta", type: "checkbox" },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Conexión automática, sin escribir nada" },
  {
    type: "p",
    text: "Desde iOS 11 y Android 10, la cámara nativa reconoce este formato de QR y ofrece conectarse a la red automáticamente. Es perfecto para negocios con clientes frecuentes y para el hogar cuando llegan visitas.",
  },
  { type: "h2", text: "Recomendación de seguridad" },
  {
    type: "p",
    text: "Si vas a imprimir y exhibir este QR en un espacio público (cafetería, sala de espera), considera crear una red WiFi de invitados separada de tu red principal, para que las visitas no tengan acceso a tus dispositivos internos.",
  },
];

const faqItems = [
  {
    question: "¿Qué tipo de seguridad debo elegir?",
    answer:
      "La gran mayoría de routers modernos usan WPA o WPA2 — elige esa opción si no estás seguro. Usa WEP solo si tu router es muy antiguo, o \"Sin contraseña\" para redes abiertas.",
  },
  {
    question: "¿Funciona en todos los celulares?",
    answer:
      "Los iPhone con iOS 11 o superior y los Android con la app de cámara de Google (Android 10+) lo soportan de forma nativa. En equipos más antiguos, algunas apps de terceros para leer QR también soportan este formato.",
  },
  {
    question: "¿Qué pasa si mi contraseña tiene caracteres especiales?",
    answer:
      "La herramienta escapa automáticamente caracteres como punto y coma, comas o comillas para que el QR se genere correctamente sin romper el formato.",
  },
];

export default function QrWifiPage() {
  return (
    <>
      <ToolPageShell
        toolId="qr-wifi"
        toolName="QR de WiFi"
        eyebrow="Para negocios y hogar"
        intro="Comparte tu red WiFi sin decir la contraseña en voz alta: tus invitados escanean y se conectan automáticamente."
        fields={fields}
        emptyHint="Escribe el nombre de tu red para generar el QR."
        seoContent={seoContent}
        faqItems={faqItems}
      />
      <div className="container-page pb-16 text-center text-sm text-slate-400">
        Guía completa:{" "}
        <Link href="/blog/como-compartir-wifi-con-codigo-qr" className="font-medium text-emerald-700 underline">
          Cómo compartir WiFi con un código QR
        </Link>
      </div>
    </>
  );
}
