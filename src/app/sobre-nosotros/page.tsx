import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Sobre nosotros",
  description: `La misión detrás de ${SITE.name}: herramientas online gratuitas, rápidas y sin trucos.`,
  path: "/sobre-nosotros",
});

const content: ContentBlock[] = [
  {
    type: "p",
    text: `${SITE.name} nació de una idea simple: resolver una tarea rápida online no debería requerir registrarte, pagar, ni descargar una app. Estamos construyendo un conjunto de herramientas gratuitas, rápidas y enfocadas en casos reales — hoy códigos QR, y progresivamente PDF, imágenes, calculadoras, convertidores y texto.`,
  },
  { type: "h2", text: "Lo que nos importa" },
  {
    type: "ul",
    items: [
      "Gratis de verdad: sin límites de uso ni funciones básicas bloqueadas",
      "Privacidad primero: cuando es posible, tus datos se procesan en tu propio navegador",
      "Velocidad: cada herramienta responde al instante, sin recargar la página",
      "Contenido útil: cada herramienta y artículo del blog resuelve un problema real",
    ],
  },
  { type: "h2", text: "Cómo se sostiene el proyecto" },
  {
    type: "p",
    text: "El sitio se financia mediante publicidad no intrusiva, que se muestra sin interferir con el uso de las herramientas. Nunca vendemos ni compartimos el contenido que generas con nuestras herramientas.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/sobre-nosotros", label: "Sobre nosotros" }]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Sobre nosotros</h1>
        <div className="mt-6">
          <ContentBlocks blocks={content} />
        </div>
        <Link href="/generador-qr" className="mt-8 inline-block">
          <Button>Probar el generador</Button>
        </Link>
      </div>
    </div>
  );
}
