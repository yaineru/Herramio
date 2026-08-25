import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin",
          "/cuenta",
          "/facturacion",
          "/auth/",
          "/iniciar-sesion",
          "/registro",
          "/recuperar-contrasena",
          "/actualizar-contrasena",
          "/originalidad/", // individual document reports are private, auth-gated — only the /originalidad landing page is public
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
