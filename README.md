# Herramio — Plataforma de herramientas online

"Todas tus herramientas online, en un solo lugar." Plataforma web gratuita
de herramientas para convertir, calcular, crear y resolver tareas en
segundos. Hoy ofrece 13 herramientas para generar y personalizar códigos QR
(URL, WhatsApp, WiFi, texto, email, teléfono, SMS, vCard, Google Maps,
Instagram, Facebook, menú de restaurante y negocios); la arquitectura ya
está preparada para sumar progresivamente PDF, imágenes, calculadoras,
convertidores y texto. Construida con Next.js (App Router), TypeScript y
Tailwind CSS, pensada para SEO orgánico, contenido de blog y monetización
futura con publicidad.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- Generación de QR 100% en el cliente con [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) (sin backend, sin almacenar el contenido de tus QR)
- Buscador de herramientas (Ctrl/Cmd+K) construido sin dependencias adicionales
- **Vitest** para pruebas unitarias
- Preparado para **Vercel**, **Google Analytics 4**, **Google Search Console** y **Google AdSense**

## Requisitos

- Node.js 18.18+ (recomendado 20+)
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Script              | Qué hace                                             |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo con Turbopack                  |
| `npm run build`      | Build de producción                                   |
| `npm run start`      | Sirve el build de producción                          |
| `npm run lint`       | ESLint                                                |
| `npm run test`       | Pruebas unitarias (Vitest)                            |
| `npm run test:watch` | Pruebas unitarias en modo watch                       |
| `npm run load:test`  | Prueba de carga contra un endpoint de test (ver `TESTING.md`) |

## Variables de entorno

Copia `.env.example` a `.env.local` y complétalo. Ver el detalle de cada
variable en ese archivo. Ninguna es obligatoria para correr el sitio en
local: por defecto la analítica y los anuncios están desactivados.

## Estructura del proyecto

```
src/
  app/                  Rutas (App Router): home, herramientas QR, blog, legal
  components/
    layout/             Navbar, Footer
    marketing/          ToolCard, ToolGrid, ToolCatalog, ToolPageShell, Hero, CategoryGrid...
    search/              SearchPalette (Ctrl/Cmd+K), SearchTrigger
    qr/                 Motor de generación QR (QRGenerator, QRCustomizer...)
    ads/                AdSlot (placeholders / AdSense real)
    social/             ShareButtons
  lib/
    tools/              registry.ts (catálogo de herramientas), categories.ts, search.ts
    qr/                 Builders de payload (WiFi, vCard, WhatsApp...), estilos, registry de PAYLOAD_BUILDERS
    blog/               Contenido de artículos del blog
    site.ts             Configuración global de marca (SITE), navegación, footer
    seo.ts              Helper de metadata (title, OG, canonical)
    analytics.ts        Eventos GA4
    consent.ts          Consentimiento de cookies (useSyncExternalStore)
tests/
  unit/                 Pruebas Vitest (builders de payload, contraste, registry)
  load/                 Prueba de carga aislada de producción (ver TESTING.md)
```

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para el detalle de cómo funciona el
catálogo de herramientas/categorías y cómo escalarlo.

## Cómo agregar una nueva herramienta QR

1. Agrega el tipo de payload en `src/lib/qr/payloads.ts` si es un formato nuevo.
2. Registra el builder en `PAYLOAD_BUILDERS` en `src/lib/qr/registry.ts` (clave `QrKind`).
3. Agrega la entrada en `TOOLS` en `src/lib/tools/registry.ts` (icono, keywords, `relatedTools`).
4. Crea `src/app/qr-nueva-herramienta/page.tsx` usando `ToolPageShell` como las
   herramientas existentes (`src/app/qr-url/page.tsx` es el ejemplo más simple).
5. Aparece automáticamente en `/herramientas`, el buscador y el sitemap.

## Documentación relacionada

- [BRANDING.md](BRANDING.md) — identidad de marca, logo, cómo evitar referencias a la marca antigua
- [ARCHITECTURE.md](ARCHITECTURE.md) — catálogo de herramientas/categorías, cómo escalar a nuevas categorías
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel, dominio propio, Search Console
- [SEO.md](SEO.md) — arquitectura SEO, sitemap, metadata, contenido
- [MONETIZATION.md](MONETIZATION.md) — cómo activar AdSense sin romper UX
- [TESTING.md](TESTING.md) — pruebas unitarias y pruebas de carga seguras
- [CONTENT-GROWTH.md](CONTENT-GROWTH.md) — estrategia de contenido y 50 ideas de video
