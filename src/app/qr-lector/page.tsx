import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { QrReader } from "@/components/tools/QrReader";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Leer Código QR Online desde una Imagen",
  description:
    "Sube o arrastra una imagen con un código QR y descubre su contenido al instante, sin instalar ninguna app. Procesado en tu navegador.",
  path: "/qr-lector",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo leer un código QR desde una foto" },
  {
    type: "steps",
    items: [
      { title: "Sube la imagen", text: "Una foto, captura de pantalla o cualquier imagen que contenga el código QR." },
      { title: "Lectura automática", text: "El contenido se detecta y muestra al instante." },
      { title: "Copia o abre el resultado", text: "Copia el texto, o ábrelo directamente si es un enlace." },
    ],
  },
  { type: "h2", text: "Cuándo usar esta herramienta" },
  {
    type: "ul",
    items: [
      "Cuando no tienes la cámara del celular a la mano para escanear directamente",
      "Para leer un QR que llegó como imagen adjunta en un correo o chat",
      "Para verificar qué contiene un QR antes de escanearlo con tu celular",
    ],
  },
];

const faqItems = [
  {
    question: "¿Qué pasa si la imagen no tiene un QR válido?",
    answer: "Verás un mensaje indicando que no se encontró ningún código — intenta con una imagen más nítida o mejor encuadrada.",
  },
  {
    question: "¿Se sube mi imagen a un servidor?",
    answer: "No. La lectura del código ocurre completamente en tu navegador.",
  },
  {
    question: "¿Puedo leer varios tipos de QR (WiFi, vCard, texto)?",
    answer: "Sí, la herramienta muestra el contenido crudo del QR tal como está codificado, sea un enlace, texto, datos de WiFi o una tarjeta de contacto.",
  },
];

export default function QrLectorPage() {
  return (
    <ToolPageShell
      toolId="qr-lector"
      toolName="Leer Código QR"
      eyebrow="QR"
      intro="Sube o arrastra una imagen con un código QR y descubre su contenido al instante, sin instalar ninguna app."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <QrReader />
    </ToolPageShell>
  );
}
