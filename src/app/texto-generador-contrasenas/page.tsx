import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PasswordGenerator } from "@/components/tools/PasswordGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Contraseñas Seguras Online",
  description:
    "Genera contraseñas seguras y aleatorias gratis, con longitud y tipos de carácter personalizables. Procesado en tu navegador con Web Crypto API.",
  path: "/texto-generador-contrasenas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se genera la contraseña" },
  {
    type: "p",
    text: "Cada carácter se elige usando la API Web Crypto de tu navegador (`crypto.getRandomValues`), un generador de números aleatorios criptográficamente seguro — no un generador de números pseudoaleatorios común como `Math.random()`, que no es apto para nada relacionado con seguridad.",
  },
  { type: "h2", text: "Recomendaciones para una contraseña fuerte" },
  {
    type: "ul",
    items: [
      "Usa al menos 12-16 caracteres — la longitud es el factor más importante",
      "Combina mayúsculas, minúsculas, números y símbolos",
      "No reutilices la misma contraseña en varios sitios",
      "Usa un gestor de contraseñas para no tener que memorizarlas",
    ],
  },
  { type: "h2", text: "¿Por qué excluir caracteres ambiguos?" },
  {
    type: "p",
    text: "Caracteres como 'l', '1', 'I' o 'O', '0' pueden confundirse fácilmente al leer o transcribir una contraseña a mano, especialmente en pantallas pequeñas. Activa esa opción si vas a anotar la contraseña o dictarla.",
  },
];

const faqItems = [
  {
    question: "¿La contraseña se envía a algún servidor?",
    answer: "No. Se genera completamente en tu navegador y nunca sale de tu dispositivo.",
  },
  {
    question: "¿Es segura para cuentas importantes (banco, correo)?",
    answer:
      "Sí, siempre que uses una longitud de al menos 12-16 caracteres con varios tipos de carácter combinados. El indicador de fortaleza te ayuda a evaluar cada contraseña generada.",
  },
  {
    question: "¿Debería anotar mi contraseña en algún lugar?",
    answer:
      "Lo más seguro es guardarla directamente en un gestor de contraseñas en el momento de crearla, en vez de anotarla en texto plano.",
  },
];

export default function TextoGeneradorContrasenasPage() {
  return (
    <ToolPageShell
      toolId="texto-generador-contrasenas"
      toolName="Generador de Contraseñas Seguras"
      eyebrow="Texto"
      intro="Genera contraseñas aleatorias y seguras, con la longitud y los tipos de carácter que necesites, directamente en tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PasswordGenerator />
    </ToolPageShell>
  );
}
