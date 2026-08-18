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
    text: `Última actualización: 18 de agosto de 2026. En ${SITE.name} tratamos de recopilar la menor cantidad de datos posible. Esta política explica qué información manejamos y por qué.`,
  },
  { type: "h2", text: "1. Contenido de tus códigos QR" },
  {
    type: "p",
    text: "La generación de códigos QR ocurre completamente en tu navegador. No enviamos ni almacenamos en nuestros servidores el contenido que codificas (enlaces, textos, contraseñas de WiFi, datos de contacto, etc.). Si cierras la pestaña, esa información desaparece de nuestro lado por completo, porque nunca estuvo en nuestro lado para empezar.",
  },
  { type: "h2", text: "2. Analítica web (Google Analytics)" },
  {
    type: "p",
    text: "Si aceptas cookies de analítica en el aviso correspondiente, usamos Google Analytics 4 para entender qué páginas y herramientas se usan más. Esto incluye eventos como qué tipo de QR generaste o descargaste, pero nunca el contenido específico que introdujiste (por ejemplo, registramos que usaste el QR de WiFi, pero no el nombre de tu red ni tu contraseña).",
  },
  { type: "h2", text: "3. Publicidad" },
  {
    type: "p",
    text: "Cuando la publicidad esté activa en el sitio, podremos mostrar anuncios a través de Google AdSense, que puede usar cookies para personalizar los anuncios según tu actividad de navegación. Puedes rechazar estas cookies desde el aviso de cookies o desde la configuración de anuncios de Google.",
  },
  { type: "h2", text: "4. Cookies" },
  {
    type: "p",
    text: "Usamos cookies esenciales (para recordar tu elección de consentimiento) y, si las aceptas, cookies de analítica y publicidad. Puedes revisar el detalle completo en nuestra política de cookies.",
  },
  { type: "h2", text: "5. Datos de contacto" },
  {
    type: "p",
    text: "Si nos escribes a través de la página de contacto, la información que compartas se envía directamente a nuestro correo mediante tu propio cliente de correo — no queda almacenada en una base de datos de nuestro sitio.",
  },
  { type: "h2", text: "6. Tus derechos" },
  {
    type: "p",
    text: "Puedes rechazar las cookies no esenciales en cualquier momento desde el aviso de cookies. Como no almacenamos datos personales en servidores propios más allá de lo indicado, no mantenemos perfiles de usuario que requieran solicitudes de acceso o eliminación adicionales.",
  },
  { type: "h2", text: "7. Menores de edad" },
  {
    type: "p",
    text: "Nuestras herramientas están dirigidas a un público general y no solicitan intencionalmente datos personales de menores de edad.",
  },
  { type: "h2", text: "8. Cambios a esta política" },
  {
    type: "p",
    text: "Podemos actualizar esta política ocasionalmente para reflejar cambios en nuestras herramientas o en la normativa aplicable. La fecha de última actualización se muestra al inicio de esta página.",
  },
  { type: "h2", text: "9. Contacto" },
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
