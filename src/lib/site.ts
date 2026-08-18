export const SITE = {
  name: "Herramio",
  shortName: "Herramio",
  tagline: "Todas tus herramientas online, en un solo lugar.",
  taglineAlt: "Herramientas online rápidas, gratis y sin complicaciones.",
  description:
    "Herramientas online gratuitas para convertir, calcular, crear y resolver tareas en segundos: códigos QR, y muy pronto PDF, imágenes, calculadoras y más.",
  // Update NEXT_PUBLIC_SITE_URL in .env.local / Vercel once the domain is connected.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.herramio.app",
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
    { href: "/herramientas?categoria=qr", label: "QR" },
    { href: "/herramientas?categoria=pdf", label: "PDF" },
    { href: "/herramientas?categoria=imagenes", label: "Imágenes" },
    { href: "/herramientas?categoria=calculadoras", label: "Calculadoras" },
    { href: "/herramientas?categoria=convertidores", label: "Convertidores" },
  ],
  empresa: [
    { href: "/sobre-nosotros", label: "Sobre nosotros" },
    { href: "/contacto", label: "Contacto" },
    { href: "/blog", label: "Blog" },
  ],
  legal: [
    { href: "/privacidad", label: "Privacidad" },
    { href: "/terminos", label: "Términos de uso" },
    { href: "/cookies", label: "Cookies" },
  ],
};
