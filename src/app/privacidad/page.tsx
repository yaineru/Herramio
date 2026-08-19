import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ContentBlocks } from "@/components/marketing/ContentBlocks";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Política de privacidad",
  description: `Cómo ${SITE.name} recopila, usa y protege tus datos al utilizar nuestras herramientas online.`,
  path: "/privacidad",
});

const content: ContentBlock[] = [
  {
    type: "p",
    text: `Última actualización: 19 de agosto de 2026. ${SITE.name} ofrece 48 herramientas gratuitas en 8 categorías — QR, PDF, imágenes, calculadoras, convertidores, texto, desarrolladores y productividad. Tratamos de recopilar la menor cantidad de datos posible. Esta política explica qué información manejamos, herramienta por herramienta, y por qué.`,
  },
  { type: "h2", text: "1. Los archivos y datos que procesas en las herramientas" },
  {
    type: "p",
    text: "Todas nuestras herramientas — códigos QR, unir/dividir PDF, convertir JPG a PDF, comprimir y convertir imágenes, calculadoras, convertidores de unidades, texto, contraseñas, JSON, Base64, hashes, UUID, regex, timestamps, colores, CSV, fechas, y las de productividad — procesan lo que subes o escribes completamente en tu navegador, usando únicamente las capacidades del navegador (Canvas, Web Crypto, etc.). Nunca subimos tus archivos, textos ni datos a un servidor nuestro. Si cierras la pestaña, esa información desaparece de nuestro lado por completo, porque nunca estuvo en nuestro lado para empezar.",
  },
  { type: "h2", text: "2. La única excepción: el convertidor de moneda" },
  {
    type: "p",
    text: "El convertidor de moneda es la única herramienta que no funciona 100% sin conexión: para mostrar tasas de cambio reales, consulta la API pública de Frankfurter (frankfurter.dev), que republica tasas de referencia del Banco Central Europeo. Esa consulta envía únicamente el código de la moneda que elegiste (por ejemplo \"USD\") — nunca ningún dato personal ni ninguna cantidad que hayas escrito. No se requiere ni se usa una clave de API.",
  },
  { type: "h2", text: "3. Favoritos e historial reciente" },
  {
    type: "p",
    text: "Si marcas una herramienta como favorita o la usas, guardamos esa información únicamente en el almacenamiento local de tu propio navegador (localStorage) — nunca en un servidor. El historial guarda solo el nombre de la herramienta y la fecha de uso, nunca el contenido, archivos o datos que introdujiste en ella. Puedes borrar este historial en cualquier momento desde la página de Favoritos, o borrando los datos del sitio desde la configuración de tu navegador.",
  },
  { type: "h2", text: "4. Analítica web (Google Analytics)" },
  {
    type: "p",
    text: "Si aceptas cookies de analítica en el aviso correspondiente, usamos Google Analytics 4 para entender qué páginas y herramientas se usan más. Esto incluye eventos como qué herramienta abriste, usaste o de qué tipo descargaste un resultado, pero nunca el contenido específico que introdujiste (por ejemplo, registramos que usaste el comprimir de imágenes, pero no la imagen que subiste).",
  },
  { type: "h2", text: "5. Publicidad" },
  {
    type: "p",
    text: "Hoy no mostramos anuncios reales en el sitio. Cuando la publicidad esté activa, podremos mostrar anuncios a través de Google AdSense, que puede usar cookies para personalizar los anuncios según tu actividad de navegación. Puedes rechazar estas cookies desde el aviso de cookies o desde la configuración de anuncios de Google.",
  },
  { type: "h2", text: "6. Cookies" },
  {
    type: "p",
    text: "Usamos cookies esenciales (para recordar tu elección de consentimiento) y, si las aceptas, cookies de analítica y publicidad. Puedes revisar el detalle completo en nuestra política de cookies.",
  },
  { type: "h2", text: "7. Datos de contacto" },
  {
    type: "p",
    text: "Si nos escribes a través de la página de contacto, el formulario abre tu propio cliente de correo con el mensaje ya redactado — el envío ocurre desde tu correo al nuestro directamente. No queda almacenado en una base de datos de nuestro sitio.",
  },
  { type: "h2", text: "8. Tus derechos" },
  {
    type: "p",
    text: "Puedes rechazar las cookies no esenciales en cualquier momento desde el aviso de cookies, y borrar favoritos/historial desde tu navegador. Como no almacenamos datos personales en servidores propios más allá de lo indicado, no mantenemos perfiles de usuario que requieran solicitudes de acceso o eliminación adicionales.",
  },
  { type: "h2", text: "9. Sin registro" },
  {
    type: "p",
    text: "Ninguna herramienta de Herramio requiere crear una cuenta ni iniciar sesión. No pedimos tu correo, nombre ni ningún dato personal para usar cualquiera de las 48 herramientas.",
  },
  { type: "h2", text: "10. Menores de edad" },
  {
    type: "p",
    text: "Nuestras herramientas están dirigidas a un público general y no solicitan intencionalmente datos personales de menores de edad.",
  },
  { type: "h2", text: "11. Cambios a esta política" },
  {
    type: "p",
    text: "Podemos actualizar esta política ocasionalmente para reflejar cambios en nuestras herramientas o en la normativa aplicable. La fecha de última actualización se muestra al inicio de esta página.",
  },
  { type: "h2", text: "12. Contacto" },
  {
    type: "p",
    text: "Si tienes preguntas sobre esta política de privacidad, escríbenos desde nuestra página de contacto.",
  },
];

export default function PrivacidadPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/privacidad", label: "Privacidad" }]} />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Política de privacidad</h1>
      <div className="mx-auto mt-6 max-w-2xl">
        <ContentBlocks blocks={content} />
      </div>
    </div>
  );
}
