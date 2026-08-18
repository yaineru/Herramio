import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { FAQ } from "@/components/marketing/FAQ";
import { JsonLd, faqPageSchema } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Preguntas frecuentes",
  description: `Respuestas a las dudas más comunes sobre ${SITE.name}: herramientas disponibles, privacidad, descargas y más.`,
  path: "/faq",
});

const GENERAL = [
  {
    question: "¿Qué es un código QR?",
    answer:
      "Es una imagen cuadrada de puntos que almacena información digital — un enlace, texto, datos de contacto — y que cualquier cámara de celular puede leer al instante.",
  },
  {
    question: "¿Es realmente gratis usar todas las herramientas?",
    answer:
      "Sí. La generación, personalización y descarga en PNG y SVG de todos los tipos de QR es completamente gratuita, sin límite de uso ni registro.",
  },
  {
    question: "¿Necesito instalar algo o crear una cuenta?",
    answer: "No, todo funciona directamente desde el navegador, sin instalar nada ni registrarte.",
  },
];

const TECHNICAL = [
  {
    question: "¿Los códigos QR generados caducan?",
    answer:
      "No. Son códigos QR estáticos: la información queda codificada directamente en el patrón, por lo que funcionan indefinidamente mientras el contenido al que apuntan (por ejemplo, una página web) siga existiendo.",
  },
  {
    question: "¿Cuál es la diferencia entre PNG y SVG?",
    answer:
      "PNG es una imagen rasterizada, ideal para uso digital. SVG es un formato vectorial que escala a cualquier tamaño sin perder calidad, ideal para impresión grande.",
  },
  {
    question: "¿Puedo agregar mi logo al QR?",
    answer:
      "Sí, en el panel de personalización de cada herramienta puedes subir una imagen. Recomendamos usar corrección de errores alta (Q o H) cuando incluyas un logo.",
  },
  {
    question: "¿Qué pasa si mi QR no se escanea bien?",
    answer:
      "Las causas más comunes son bajo contraste entre colores, tamaño insuficiente para la distancia de escaneo, o un logo demasiado grande sin suficiente corrección de errores. Revisa nuestra guía de impresión en el blog para más detalles.",
  },
];

const PRIVACY = [
  {
    question: "¿Guardan la información que pongo en mis QR?",
    answer:
      "No. La generación del código QR ocurre en tu propio navegador; no almacenamos el contenido de tus códigos en un servidor.",
  },
  {
    question: "¿Qué datos recopilan sobre mí?",
    answer:
      "Usamos Google Analytics para entender el uso general del sitio (páginas vistas, herramientas usadas) solo si aceptas cookies de analítica. Consulta nuestra política de privacidad para el detalle completo.",
  },
];

const ALL_ITEMS = [...GENERAL, ...TECHNICAL, ...PRIVACY];

export default function FaqPage() {
  return (
    <div className="container-page py-10">
      <JsonLd data={faqPageSchema(ALL_ITEMS)} />
      <Breadcrumbs items={[{ href: "/faq", label: "FAQ" }]} />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Preguntas frecuentes</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        ¿No encuentras lo que buscas? Escríbenos desde la página de{" "}
        <a href="/contacto" className="font-medium text-emerald-700 underline">
          contacto
        </a>
        .
      </p>

      <div className="mx-auto mt-10 max-w-2xl space-y-10">
        <FAQ title="General" items={GENERAL} />
        <FAQ title="Uso técnico" items={TECHNICAL} />
        <FAQ title="Privacidad y datos" items={PRIVACY} />
      </div>
    </div>
  );
}
