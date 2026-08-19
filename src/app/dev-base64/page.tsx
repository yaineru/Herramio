import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Codificador y Decodificador Base64 Online",
  description:
    "Codifica y decodifica texto en Base64 gratis, directamente en tu navegador. Compatible con acentos, ñ y emoji (UTF-8).",
  path: "/dev-base64",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es Base64" },
  {
    type: "p",
    text: "Base64 es una forma de representar datos binarios como texto usando solo 64 caracteres seguros (letras, números, + y /). Se usa mucho para incrustar datos en URLs, JSON, correos electrónicos o cabeceras HTTP.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Decodificar un token o payload que llegó en Base64 (por ejemplo, la parte de un JWT)",
      "Codificar credenciales para una cabecera HTTP Basic Auth",
      "Incrustar un texto pequeño como Data URI",
      "Verificar el contenido real de una cadena Base64 antes de usarla en código",
    ],
  },
];

const faqItems = [
  {
    question: "¿Es lo mismo Base64 que cifrado?",
    answer: "No. Base64 es solo una codificación, no ofrece ninguna seguridad: cualquiera puede decodificarlo. No lo uses para proteger información sensible.",
  },
  {
    question: "¿Funciona con acentos, ñ o emoji?",
    answer: "Sí. El texto se codifica primero como UTF-8 antes de convertirlo a Base64, por lo que el proceso es totalmente reversible con cualquier carácter.",
  },
  {
    question: "¿Se guarda mi texto en algún servidor?",
    answer: "No. Todo el proceso ocurre en tu navegador usando las APIs nativas btoa/atob; nada se envía a un servidor.",
  },
];

export default function DevBase64Page() {
  return (
    <ToolPageShell
      toolId="dev-base64"
      toolName="Codificador/Decodificador Base64"
      eyebrow="Desarrolladores"
      intro="Codifica y decodifica texto en Base64 al instante, con soporte completo para UTF-8."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <Base64Tool />
    </ToolPageShell>
  );
}
