import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Términos de uso",
  description: `Condiciones de uso de las herramientas gratuitas de ${SITE.name}.`,
  path: "/terminos",
});

const content: ContentBlock[] = [
  { type: "p", text: "Última actualización: 18 de agosto de 2026. Al usar este sitio, aceptas estos términos." },
  { type: "h2", text: "1. Descripción del servicio" },
  {
    type: "p",
    text: `${SITE.name} ofrece herramientas gratuitas para generar, personalizar y descargar códigos QR. El servicio se ofrece "tal cual", sin garantía de disponibilidad ininterrumpida.`,
  },
  { type: "h2", text: "2. Uso permitido" },
  {
    type: "p",
    text: "Puedes usar las herramientas para fines personales, educativos o comerciales, sin límite de generación. No está permitido usar el sitio para generar códigos QR con contenido ilegal, fraudulento, difamatorio o que infrinja derechos de terceros.",
  },
  { type: "h2", text: "3. Responsabilidad sobre el contenido" },
  {
    type: "p",
    text: "Eres el único responsable del contenido que codifiques en tus códigos QR (enlaces, textos, datos de contacto) y de cómo los distribuyas. No supervisamos ni podemos supervisar el contenido generado por los usuarios, ya que la generación ocurre en tu propio navegador.",
  },
  { type: "h2", text: "4. Propiedad intelectual" },
  {
    type: "p",
    text: "El diseño, código y marca del sitio son propiedad de sus operadores. Los códigos QR que generas son tuyos: puedes usarlos, modificarlos y distribuirlos libremente, sin atribución.",
  },
  { type: "h2", text: "5. Publicidad" },
  {
    type: "p",
    text: "El sitio puede mostrar publicidad de terceros (como Google AdSense) para sostener el servicio gratuito. No garantizamos el contenido de los anuncios mostrados por estas redes publicitarias.",
  },
  { type: "h2", text: "6. Límite de responsabilidad" },
  {
    type: "p",
    text: "No nos hacemos responsables por errores de escaneo derivados de una impresión, personalización o distancia de lectura inadecuadas, ni por el uso que terceros den a la información codificada en un QR que hayas compartido.",
  },
  { type: "h2", text: "7. Cambios en el servicio o estos términos" },
  {
    type: "p",
    text: "Podemos modificar o discontinuar funciones del sitio, así como actualizar estos términos, en cualquier momento. Los cambios relevantes se reflejarán en esta página.",
  },
  { type: "h2", text: "8. Contacto" },
  { type: "p", text: "Para dudas sobre estos términos, escríbenos desde nuestra página de contacto." },
];

export default function TerminosPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/terminos", label: "Términos de uso" }]} />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Términos de uso</h1>
      <div className="mx-auto mt-6 max-w-2xl">
        <ContentBlocks blocks={content} />
      </div>
    </div>
  );
}
