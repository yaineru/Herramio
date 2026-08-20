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

export const NAV_LINKS = [
  { href: "/generador-qr", label: "Generador QR" },
  { href: "/herramientas", label: "Herramientas" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
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
  empresa: [
    { href: "/sobre-nosotros", label: "Sobre nosotros" },
    { href: "/experiencia", label: "La experiencia Herramio" },
    { href: "/contacto", label: "Contacto" },
    { href: "/blog", label: "Blog" },
  ],
  legal: [
    { href: "/privacidad", label: "Privacidad" },
    { href: "/terminos", label: "Términos de uso" },
    { href: "/cookies", label: "Cookies" },
  ],
};
