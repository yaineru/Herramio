import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools/registry";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Sobre nosotros",
  description: `La misión detrás de ${SITE.name}: herramientas online gratuitas, rápidas y sin trucos.`,
  path: "/sobre-nosotros",
});

const content: ContentBlock[] = [
  {
    type: "p",
    text: `${SITE.name} nació de una idea simple: resolver una tarea rápida online no debería requerir registrarte, pagar, ni descargar una app. Hoy somos ${TOOLS.length} herramientas gratuitas en 8 categorías — QR, PDF, imágenes, calculadoras, convertidores, texto, desarrolladores y productividad — y seguimos sumando más siguiendo el mismo criterio: solo herramientas que funcionen de verdad, de principio a fin.`,
  },
  { type: "h2", text: "Lo que nos importa" },
  {
    type: "ul",
    items: [
      "Gratis de verdad: sin límites de uso ni funciones básicas bloqueadas",
      "Privacidad primero: casi todas nuestras herramientas procesan tus archivos y datos directamente en tu navegador, sin subirlos a un servidor — la única excepción es el convertidor de moneda, que consulta tasas de cambio públicas",
      "Velocidad: cada herramienta responde al instante, sin recargar la página",
      "Contenido útil: cada herramienta y artículo del blog resuelve un problema real",
    ],
  },
  { type: "h2", text: "Cómo se sostiene el proyecto" },
  {
    type: "p",
    text: "El sitio se financia mediante publicidad no intrusiva — hoy todavía no mostramos anuncios reales, pero cuando los activemos, se mostrarán sin interferir con el uso de las herramientas. Nunca vendemos ni compartimos los archivos o datos que procesas con nuestras herramientas, porque nunca llegan a nuestros servidores para empezar.",
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
