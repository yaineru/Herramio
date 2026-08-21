import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PasswordStrengthChecker } from "@/components/tools/PasswordStrengthChecker";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Verificar Fuerza de Contraseña Online",
  description:
    "Comprueba qué tan segura es una contraseña y qué le falta para ser más fuerte, directamente en tu navegador.",
  path: "/texto-verificar-contrasena",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se evalúa la fuerza" },
  {
    type: "p",
    text: "La herramienta revisa la longitud y la variedad de caracteres de tu contraseña (mayúsculas, minúsculas, números y símbolos) y estima cuántas combinaciones posibles tendría que probar un atacante para adivinarla — mientras más variedad y longitud, más fuerte es.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Comprobar si una contraseña nueva es lo bastante segura antes de usarla",
      "Entender exactamente qué le falta a una contraseña débil",
      "Aprender qué hace que una contraseña sea difícil de adivinar",
    ],
  },
];

const faqItems = [
  {
    question: "¿Mi contraseña se envía a algún servidor?",
    answer: "No, nunca. La evaluación ocurre completamente en tu navegador; la contraseña nunca se envía, se guarda ni se registra en ningún servidor.",
  },
  {
    question: "¿Qué significa la entropía en bits?",
    answer: "Es una medida de cuántas combinaciones posibles tendría que probar alguien para adivinar tu contraseña por fuerza bruta. Más bits significa exponencialmente más combinaciones y, por lo tanto, más seguridad.",
  },
  {
    question: "¿Una contraseña \"muy fuerte\" aquí es 100% inhackeable?",
    answer: "No. Esta herramienta mide la resistencia a un ataque de fuerza bruta según su longitud y variedad, no garantiza protección contra otros riesgos como reutilizar la misma contraseña en varios sitios o caer en phishing.",
  },
];

export default function TextoVerificarContrasenaPage() {
  return (
    <ToolPageShell
      toolId="texto-verificar-contrasena"
      toolName="Verificar Fuerza de Contraseña"
      eyebrow="Texto"
      intro="Comprueba qué tan segura es una contraseña y qué le falta para ser más fuerte."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PasswordStrengthChecker />
    </ToolPageShell>
  );
}
