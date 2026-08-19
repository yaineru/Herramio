import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { HashGenerator } from "@/components/tools/HashGenerator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de Hash SHA-256, SHA-1, SHA-384 y SHA-512",
  description:
    "Calcula el hash SHA-1, SHA-256, SHA-384 o SHA-512 de cualquier texto, gratis y en tu navegador con la Web Crypto API.",
  path: "/dev-hash-generator",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es un hash" },
  {
    type: "p",
    text: "Un hash es el resultado de aplicar una función matemática que convierte cualquier texto en una cadena de longitud fija. La misma entrada siempre produce el mismo hash, pero es prácticamente imposible reconstruir el texto original a partir del hash.",
  },
  { type: "h2", text: "¿Por qué no incluye MD5?" },
  {
    type: "p",
    text: "La Web Crypto API del navegador (crypto.subtle.digest), que es la que usa esta herramienta, no implementa MD5. Además, MD5 está criptográficamente roto desde hace años y no debería usarse para nada relacionado con seguridad, así que no vale la pena añadir una librería externa solo para ofrecerlo.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Verificar que un archivo o texto no fue alterado comparando su hash",
      "Generar un checksum para pruebas de integridad de datos",
      "Crear una huella digital reproducible de un texto o configuración",
    ],
  },
];

const faqItems = [
  {
    question: "¿Cuál algoritmo debería usar?",
    answer: "SHA-256 es el más usado hoy en día como estándar general. SHA-384 y SHA-512 ofrecen más bits de seguridad; SHA-1 se incluye por compatibilidad, pero ya no se considera robusto para usos criptográficos.",
  },
  {
    question: "¿Mi texto se envía a algún servidor?",
    answer: "No. El hash se calcula completamente en tu navegador con crypto.subtle.digest; el texto nunca sale de tu dispositivo.",
  },
  {
    question: "¿Por qué no hay MD5?",
    answer: "La Web Crypto API no lo soporta y, al estar roto criptográficamente, no se justifica añadir una dependencia extra solo para ofrecerlo.",
  },
];

export default function DevHashGeneratorPage() {
  return (
    <ToolPageShell
      toolId="dev-hash-generator"
      toolName="Generador de Hash"
      eyebrow="Desarrolladores"
      intro="Calcula hashes SHA-1, SHA-256, SHA-384 y SHA-512 de cualquier texto al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <HashGenerator />
    </ToolPageShell>
  );
}
