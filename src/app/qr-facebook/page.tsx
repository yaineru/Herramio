import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR de Facebook gratis",
  description:
    "Crea un código QR que lleva directo a tu página o perfil de Facebook. Gratis, sin registro y listo para imprimir.",
  path: "/qr-facebook",
});

const fields: FieldConfig[] = [
  {
    name: "username",
    label: "Nombre de página o URL de Facebook",
    type: "text",
    placeholder: "tupagina o facebook.com/tupagina",
    required: true,
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Suma seguidores a tu página de negocio" },
  {
    type: "p",
    text: "Este QR dirige directamente a tu página o perfil de Facebook, útil para negocios que gestionan reseñas, promociones o comunidad principalmente en esa red. Colócalo en material impreso, escaparates o publicidad local para captar seguidores de forma directa.",
  },
  { type: "h2", text: "Buenas prácticas" },
  {
    type: "p",
    text: "Usa siempre el enlace directo a tu página de negocio verificada (no a un grupo o evento temporal), a menos que el QR sea específicamente para promocionar ese evento o grupo puntual.",
  },
];

const faqItems = [
  {
    question: "¿Puedo apuntar a un evento de Facebook en vez de la página?",
    answer: "Sí, simplemente pega la URL completa del evento en lugar del nombre de tu página.",
  },
  {
    question: "¿Funciona igual para perfiles personales y páginas de negocio?",
    answer:
      "Sí, el QR simplemente abre la URL que le indiques, sea un perfil personal, una página o un grupo.",
  },
];

export default function QrFacebookPage() {
  return (
    <ToolPageShell
      toolId="qr-facebook"
      toolName="QR de Facebook"
      eyebrow="Redes sociales"
      intro="Comparte tu página o perfil de Facebook mediante un código QR fácil de escanear desde cualquier celular."
      fields={fields}
      emptyHint="Escribe tu página de Facebook para generar el QR."
      seoContent={seoContent}
      faqItems={faqItems}
    />
  );
}
