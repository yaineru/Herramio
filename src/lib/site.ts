import { TOOLS } from "@/lib/tools/registry";

export const SITE = {
  name: "Herramio",
  shortName: "Herramio",
  tagline: "Todas tus herramientas online, en un solo lugar.",
  taglineAlt: "Herramientas online rápidas, gratis y sin complicaciones.",
  description: `${TOOLS.length} herramientas online gratuitas para convertir, calcular, crear y resolver tareas en segundos: códigos QR, PDF, imágenes, calculadoras, convertidores, texto, desarrolladores y productividad.`,
  // Update NEXT_PUBLIC_SITE_URL in .env.local / Vercel once the domain is connected.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.herramio.com",
  locale: "es",
  twitter: "@herramio",
} as const;

/**
 * Four items, deliberately.
 *
 * The bar used to carry five links plus a QR button, which put Generador
 * QR, Blog and FAQ at the same visual weight as the two things Herramio
 * actually sells. A header that lists everything communicates nothing:
 * the reader has to rank six options before understanding what the
 * product is.
 *
 * Now the top level IS the product structure — tools, and the document
 * analysis product — with pricing as the third. Blog and FAQ stay one
 * click away in the footer, where reference material belongs.
 */
export const NAV_LINKS = [
  { href: "/herramientas", label: "Herramientas" },
  { href: "/originalidad", label: "Originalidad" },
  { href: "/precios", label: "Precios" },
];

export const FOOTER_LINKS = {
  herramientas: [
    { href: "/categoria/qr", label: "QR" },
    { href: "/categoria/pdf", label: "PDF" },
    { href: "/categoria/imagenes", label: "Imágenes" },
    { href: "/categoria/calculadoras", label: "Calculadoras" },
    { href: "/categoria/convertidores", label: "Convertidores" },
    { href: "/categoria/texto", label: "Texto" },
    { href: "/categoria/desarrolladores", label: "Desarrolladores" },
    { href: "/categoria/productividad", label: "Productividad" },
  ],
  // FAQ and the blog moved down here when the header dropped to four
  // items: reference material people look up on purpose, not top-level
  // navigation that competes with the product.
  empresa: [
    { href: "/sobre-nosotros", label: "Sobre nosotros" },
    { href: "/experiencia", label: "La experiencia Herramio" },
    { href: "/contacto", label: "Contacto" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "Preguntas frecuentes" },
  ],
  legal: [
    { href: "/privacidad", label: "Privacidad" },
    { href: "/terminos", label: "Términos de uso" },
    { href: "/cookies", label: "Cookies" },
  ],
};
