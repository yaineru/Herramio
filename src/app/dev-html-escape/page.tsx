import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { HtmlEscapeTool } from "@/components/tools/HtmlEscapeTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Escapar y Desescapar HTML Online",
  description:
    "Convierte caracteres HTML especiales a entidades (&amp;, &lt;, &gt;...) y viceversa, gratis y en tu navegador.",
  path: "/dev-html-escape",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué hace esta herramienta" },
  {
    type: "p",
    text: "Convierte caracteres especiales de HTML (<, >, &, comillas) en sus entidades correspondientes (&lt;, &gt;, &amp;, &quot;) para que un texto se pueda mostrar literalmente dentro de una página web sin que el navegador lo interprete como código.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Mostrar código HTML como texto de ejemplo dentro de una página",
      "Preparar texto de usuario para insertarlo de forma segura en HTML",
      "Decodificar entidades HTML de un texto copiado de otra fuente",
      "Depurar por qué un texto se está renderizando como etiqueta en vez de texto plano",
    ],
  },
];

const faqItems = [
  {
    question: "¿Esta herramienta reemplaza la sanitización de seguridad de una aplicación real?",
    answer: "No. Es una utilidad de conveniencia para trabajar con texto. En una aplicación real, el escapado de HTML para prevenir XSS debe hacerse en el código del lado del servidor o con las herramientas del framework que uses.",
  },
  {
    question: "¿Qué caracteres convierte?",
    answer: "Los cinco caracteres reservados de HTML: &, <, >, comillas dobles (\") y comillas simples ('). Al desescapar, también reconoce &nbsp; y &apos;.",
  },
  {
    question: "¿Se procesa todo en mi navegador?",
    answer: "Sí, con una función de reemplazo de texto nativa. Nada se envía a un servidor.",
  },
];

export default function DevHtmlEscapePage() {
  return (
    <ToolPageShell
      toolId="dev-html-escape"
      toolName="Escapar/Desescapar HTML"
      eyebrow="Desarrolladores"
      intro="Convierte caracteres HTML especiales a entidades y viceversa, al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <HtmlEscapeTool />
    </ToolPageShell>
  );
}
