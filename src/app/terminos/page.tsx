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
  { type: "p", text: "Última actualización: 19 de agosto de 2026. Al usar este sitio, aceptas estos términos." },
  { type: "h2", text: "1. Descripción del servicio" },
  {
    type: "p",
    text: `${SITE.name} ofrece 48 herramientas gratuitas en 8 categorías: códigos QR, PDF (unir, dividir, convertir), imágenes (comprimir, convertir), calculadoras, convertidores, texto, herramientas para desarrolladores y productividad. El servicio se ofrece "tal cual", sin garantía de disponibilidad ininterrumpida ni de que cada herramienta esté libre de errores.`,
  },
  { type: "h2", text: "2. Uso permitido" },
  {
    type: "p",
    text: "Puedes usar las herramientas para fines personales, educativos o comerciales, sin límite de uso. No está permitido usarlas para procesar o generar contenido ilegal, fraudulento, difamatorio o que infrinja derechos de terceros — por ejemplo, códigos QR con enlaces maliciosos o archivos que no tengas derecho a manipular.",
  },
  { type: "h2", text: "3. Responsabilidad sobre tus archivos y datos" },
  {
    type: "p",
    text: "Eres el único responsable del contenido que proceses en cualquier herramienta (archivos PDF o de imagen, texto, datos de contacto, códigos QR) y de cómo los distribuyas después. No supervisamos ni podemos supervisar ese contenido, porque el procesamiento ocurre en tu propio navegador y nunca llega a nuestros servidores.",
  },
  { type: "h2", text: "4. Propiedad intelectual" },
  {
    type: "p",
    text: "El diseño, código y marca del sitio son propiedad de sus operadores. Los archivos, códigos QR y resultados que generas con nuestras herramientas son tuyos: puedes usarlos, modificarlos y distribuirlos libremente, sin atribución.",
  },
  { type: "h2", text: "5. Publicidad" },
  {
    type: "p",
    text: "El sitio puede mostrar publicidad de terceros (como Google AdSense) para sostener el servicio gratuito. No garantizamos el contenido de los anuncios mostrados por estas redes publicitarias.",
  },
  { type: "h2", text: "6. Límite de responsabilidad" },
  {
    type: "p",
    text: "No nos hacemos responsables por errores de escaneo derivados de una impresión o distancia de lectura inadecuadas en un QR, por resultados inesperados al procesar archivos dañados o en formatos no soportados, por la disponibilidad de servicios externos de los que depende alguna herramienta (como las tasas de cambio del convertidor de moneda), ni por el uso que terceros den a información que hayas compartido.",
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
