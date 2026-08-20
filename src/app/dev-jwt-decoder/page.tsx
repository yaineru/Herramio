import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { JwtDecoder } from "@/components/tools/JwtDecoder";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Decodificador de JWT Online",
  description:
    "Decodifica el header y payload de un token JWT directamente en tu navegador, sin enviarlo a ningún servidor.",
  path: "/dev-jwt-decoder",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es un JWT" },
  {
    type: "p",
    text: "Un JSON Web Token (JWT) es un formato compacto para representar información de forma segura entre dos partes. Está formado por tres partes separadas por puntos: header, payload y signature, cada una codificada en Base64URL.",
  },
  { type: "h2", text: "Qué hace esta herramienta" },
  {
    type: "ul",
    items: [
      "Decodifica el header y el payload a JSON legible",
      "Muestra la firma tal como viene en el token",
      "No verifica la firma ni la validez del token — solo lee su contenido",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Depurar rápidamente qué contiene un token que genera tu backend",
      "Verificar qué claims (datos) trae un token durante desarrollo",
      "Entender la estructura de un JWT sin escribir código",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se envía mi token a algún servidor?",
    answer: "No. La decodificación ocurre completamente en tu navegador; el token nunca se envía a ningún servidor.",
  },
  {
    question: "¿Esta herramienta verifica si el token es válido o si su firma es correcta?",
    answer: "No. Solo decodifica el contenido del header y el payload — no verifica la firma criptográfica ni la validez del token. Para eso necesitas la clave secreta o pública con la que fue firmado.",
  },
  {
    question: "¿Es seguro pegar aquí un token de producción?",
    answer: "Evita pegar tokens con datos sensibles de producción en cualquier herramienta de terceros, incluida esta. Úsala principalmente con tokens de desarrollo o pruebas.",
  },
];

export default function DevJwtDecoderPage() {
  return (
    <ToolPageShell
      toolId="dev-jwt-decoder"
      toolName="Decodificador de JWT"
      eyebrow="Desarrolladores"
      intro="Decodifica el header y payload de un token JWT directamente en tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <JwtDecoder />
    </ToolPageShell>
  );
}
