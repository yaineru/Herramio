# SEO

## Arquitectura implementada

- **Metadata por página**: cada ruta define `title`, `description` y
  `canonical` únicos mediante `buildMetadata()` (`src/lib/seo.ts`). El
  `<title>` real usa el `template` del layout raíz (`%s | Herramio`), así que
  cada página solo declara su título corto — nunca dupliques el nombre del
  sitio al llamar a `buildMetadata` (esto causó un bug real de título
  duplicado durante el desarrollo — ver la nota en `src/lib/seo.ts`).
- **Open Graph / Twitter Cards**: configurados globalmente en
  `src/app/layout.tsx` y por página en `buildMetadata()`. La imagen OG por
  defecto se genera dinámicamente en `src/app/opengraph-image.tsx` (usa
  `next/og`) y se hereda automáticamente en todas las rutas que no definan
  una propia.
- **JSON-LD / Schema.org**: `Organization` y `WebSite` en el layout raíz;
  `SoftwareApplication` y `FAQPage` en cada herramienta; `Article` en cada
  post de blog; `BreadcrumbList` en el componente `Breadcrumbs`. Ver
  `src/components/JsonLd.tsx`.
- **Sitemap** (`src/app/sitemap.ts`): incluye todas las páginas estáticas,
  las herramientas con `status: "active"` en `src/lib/tools/registry.ts` y
  todos los artículos del blog automáticamente — al agregar una herramienta
  activa o un post a `BLOG_POSTS`, aparece en el sitemap sin tocar este
  archivo. Las categorías `"coming-soon"` nunca generan URLs propias hasta
  que tengan herramientas reales (hoy las 8 categorías del catálogo están
  `"active"` — ver `TOOLS.md` — pero el mecanismo sigue vigente para la
  próxima categoría que se agregue).
- **Robots** (`src/app/robots.ts`): permite todo excepto `/api/` y `/_next/`,
  y referencia el sitemap.
- **Manifest** (`src/app/manifest.ts`): PWA básico con ícono y colores de marca.

## SEO programático (sin páginas basura)

Las herramientas QR (`/qr-*`) son SEO programático **con utilidad real**:
cada una resuelve una búsqueda específica ("QR de WhatsApp", "QR de WiFi")
con una herramienta funcional, contenido explicativo único, FAQ propia y
ejemplos — no son páginas duplicadas con una plantilla vacía. Este mismo
principio aplicó al abrir cada categoría nueva (PDF, Imágenes,
Calculadoras, Convertidores, Texto, Desarrolladores, Productividad): una
categoría solo pasa a `status: "active"` en `src/lib/tools/categories.ts`
cuando tiene
herramientas reales — nunca se publican páginas de categoría vacías o con
contenido genérico. Antes de agregar una nueva página `/qr-*` (o de otra
categoría), verifica que:

1. Existe una intención de búsqueda real detrás (usa Google Keyword Planner
   o Google Trends si tienes dudas).
2. La herramienta hace algo distinto a las demás (no es una URL más apuntando
   a la misma lógica sin diferenciación).
3. El contenido SEO (sección "Cómo usarlo", FAQ) es específico de esa
   herramienta, no una copia genérica.

## Blog

Los artículos viven en `src/lib/blog/posts.ts`. Cada uno debe:

- Responder una pregunta de búsqueda real y específica (revisa el patrón de
  los 8 artículos existentes: guías paso a paso, con ejemplos concretos).
- Tener al menos 400-600 palabras de contenido sustancial (no relleno).
- Enlazar a la herramienta relacionada (`relatedTool`) y, cuando aplique,
  la herramienta debe enlazar de vuelta al artículo (ver `qr-whatsapp`,
  `qr-wifi`, `qr-google-maps`, `qr-menu`, `qr-vcard`).

## Checklist antes de publicar contenido nuevo

- [ ] Title único, descriptivo, bajo ~60 caracteres
- [ ] Meta description única, bajo ~155 caracteres
- [ ] Al menos un enlace interno hacia y desde la página
- [ ] Encabezados jerárquicos correctos (un solo `h1`, luego `h2`/`h3`)
- [ ] Sin contenido duplicado de otra página del sitio

## Después del deploy

Ver `DEPLOYMENT.md` para los pasos de Google Search Console (verificación,
envío de sitemap, indexación manual de páginas clave).

## Core Web Vitals / rendimiento SEO

- Fuente `Inter` cargada vía `next/font` (self-hosted, sin bloqueo de render).
- Generación de QR 100% client-side: sin round-trip a servidor, sin
  penalización de TTFB por la interacción principal.
- Componentes de servidor por defecto; solo los que necesitan interactividad
  (`QRGenerator`, `Navbar`, `CookieBanner`, etc.) son `"use client"`.
- Imágenes: el proyecto no usa fotografías pesadas por diseño (iconografía
  `lucide-react` + SVG inline); si agregas imágenes reales, usa siempre
  `next/image`.
