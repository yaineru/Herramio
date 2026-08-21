import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { BrowserInfoViewer } from "@/components/tools/BrowserInfoViewer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Qué Sabe tu Navegador de Ti",
  description:
    "Descubre qué información expone tu navegador a cualquier sitio que visitas: navegador, sistema operativo, pantalla, idioma y más.",
  path: "/privacidad-info-navegador",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué información revela tu navegador" },
  {
    type: "p",
    text: "Cada vez que visitas un sitio web, tu navegador comparte automáticamente ciertos datos: qué navegador y sistema operativo usas, la resolución de tu pantalla, tu idioma, tu zona horaria y más. Ningún sitio necesita pedirte permiso para leer esto — es información estándar que viaja con cada visita.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Entender qué datos técnicos comparte tu navegador sin que lo notes",
      "Verificar qué navegador y versión detecta un sitio cuando lo visitas",
      "Depurar problemas reportando exactamente tu configuración de navegador",
    ],
  },
];

const faqItems = [
  {
    question: "¿Esta página envía mi información a algún servidor?",
    answer: "No. Todos estos datos se leen y se muestran directamente en tu navegador; nada se envía a ningún servidor ni se guarda.",
  },
  {
    question: "¿Puedo evitar que los sitios vean esta información?",
    answer: "Parte de ella (como el user-agent) se puede modificar con extensiones de privacidad, pero datos como la resolución de pantalla o el idioma son difíciles de ocultar sin cambiar tu configuración del sistema.",
  },
  {
    question: "¿Esto es lo mismo que una huella digital (fingerprint) de navegador?",
    answer: "Es una versión simplificada del concepto: los sitios pueden combinar estos datos (y otros más técnicos) para intentar identificar tu navegador de forma única entre visitas.",
  },
];

export default function PrivacidadInfoNavegadorPage() {
  return (
    <ToolPageShell
      toolId="privacidad-info-navegador"
      toolName="Qué Sabe tu Navegador de Ti"
      eyebrow="Desarrolladores"
      intro="Descubre qué información expone tu navegador a cualquier sitio que visitas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <BrowserInfoViewer />
    </ToolPageShell>
  );
}
