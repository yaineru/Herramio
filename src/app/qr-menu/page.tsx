import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { buildMetadata } from "@/lib/seo";
import type { FieldConfig } from "@/lib/qr/fields";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Generador de QR para menú de restaurante",
  description:
    "Crea un código QR que lleva al menú digital de tu restaurante, bar o cafetería. Gratis, sin registro y listo para imprimir.",
  path: "/qr-menu",
});

const fields: FieldConfig[] = [
  {
    name: "url",
    label: "Enlace de tu menú",
    type: "url",
    placeholder: "https://tu-restaurante.com/menu",
    required: true,
    helpText: "Puede ser una página web o un PDF alojado públicamente.",
  },
];

const seoContent: ContentBlock[] = [
  { type: "h2", text: "El menú QR: rápido de actualizar, fácil de escanear" },
  {
    type: "p",
    text: "En lugar de reimprimir cartas cada vez que cambian precios o platillos, un menú digital enlazado por QR se actualiza al instante. Este generador crea el código a partir de la URL de tu menú — una página web o un PDF público.",
  },
  { type: "h2", text: "Recomendaciones para restaurantes" },
  {
    type: "ul",
    items: [
      "Usa un atril o base pequeña en la mesa, en vez de pegar el QR al mantel",
      "Imprime con nivel de corrección de errores alto si vas a plastificar el QR",
      "Prueba el QR impreso, no solo en pantalla, antes de repartirlo en todas las mesas",
      "Considera ofrecer también una carta física para quienes lo prefieran",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo usar un PDF como menú?",
    answer:
      "Sí, siempre que esté alojado en una URL pública que no requiera iniciar sesión para visualizarse.",
  },
  {
    question: "¿Qué pasa si cambio los precios del menú?",
    answer:
      "Si actualizas el contenido en la misma URL, el QR no necesita regenerarse: seguirá apuntando a la versión más reciente automáticamente.",
  },
];

export default function QrMenuPage() {
  return (
    <>
      <ToolPageShell
        toolId="qr-menu"
        toolName="QR para menú de restaurante"
        eyebrow="Para restaurantes y cafeterías"
        intro="Crea un QR que lleva al menú digital de tu restaurante, bar o cafetería, actualizable sin reimprimir nada."
        fields={fields}
        emptyHint="Pega el enlace de tu menú para generar el QR."
        seoContent={seoContent}
        faqItems={faqItems}
      />
      <div className="container-page pb-16 text-center text-sm text-slate-400">
        Guía completa:{" "}
        <Link href="/blog/qr-para-restaurantes-menu-digital" className="font-medium text-emerald-700 underline">
          Cómo poner un QR en tu restaurante para el menú digital
        </Link>
      </div>
    </>
  );
}
