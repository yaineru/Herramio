# Herramio — Plataforma de herramientas online

"Todas tus herramientas online, en un solo lugar." Plataforma web gratuita
de herramientas para convertir, calcular, crear y resolver tareas en
segundos. Hoy cubre **44 herramientas activas** en **8 categorías** — **QR**
(14), **PDF** (4), **Imágenes** (2), **Calculadoras** (5),
**Convertidores** (3), **Texto** (4), **Desarrolladores** (8, JSON/Base64/
hash/regex/UUID/timestamp/HTML) y **Productividad** (4, temporizador/
cronómetro/sorteador/equipos) — además de favoritos e historial reciente
guardados en el navegador. El catálogo exacto vive en
[TOOLS.md](TOOLS.md) y [PRODUCT-ROADMAP.md](PRODUCT-ROADMAP.md), siempre
actualizados. Construida con Next.js (App Router), TypeScript y Tailwind
CSS, pensada para SEO orgánico, contenido de blog y monetización futura
con publicidad. Home y `/experiencia` incluyen un sistema de interacción
con mouse (spotlight de cursor, tilt de tarjetas, botones magnéticos,
animaciones de scroll) — ver [INTERACTIONS.md](INTERACTIONS.md).

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- Generación de QR 100% en el cliente con [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling); lectura de QR con [`jsqr`](https://github.com/cozmo/jsQR) (sin backend, sin almacenar el contenido de tus QR)
- Herramientas de PDF 100% en el cliente con [`pdf-lib`](https://github.com/Hopding/pdf-lib) (unir/dividir/JPG→PDF) y [`pdfjs-dist`](https://github.com/mozilla/pdf.js) (PDF→JPG, aislado solo en esa página)
- Imágenes procesadas con la Canvas API nativa del navegador — sin librerías adicionales
- Herramientas de desarrolladores (JSON, Base64, hash, regex, UUID, timestamp, HTML) construidas solo con APIs nativas del navegador (`crypto.subtle`, `crypto.randomUUID`, `JSON`, `TextEncoder`...) — cero dependencias nuevas
- Favoritos e historial reciente en `localStorage`, vía `useSyncExternalStore` (mismo patrón que el consentimiento de cookies)
- Convertidor de moneda: única excepción al 100% client-side — consulta [api.frankfurter.app](https://frankfurter.app) (sin API key) para tasas de cambio reales, nunca datos del usuario
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
    tools/              Componentes de herramientas no-QR (calculadoras, imágenes, PDF)
    ads/                AdSlot (placeholders / AdSense real)
    social/             ShareButtons
  lib/
    tools/              registry.ts (catálogo de herramientas), categories.ts, search.ts
    qr/                 Builders de payload (WiFi, vCard, WhatsApp...), estilos, registry de PAYLOAD_BUILDERS, decode.ts (jsqr)
    calculators/        Lógica pura de calculadoras (porcentaje, IMC, descuento, IVA, regla de tres)
    converters/         Lógica pura de convertidores (unidades, temperatura, moneda)
    images/             Motor de imágenes con Canvas API (comprimir, convertir)
    pdf/                Motor de PDF (pdf-lib para unir/dividir/JPG→PDF; pdfjs-dist aislado para PDF→JPG)
    text/               Lógica pura de texto (contraseñas, lorem ipsum, limpiar texto)
    dev/                Lógica pura de herramientas de desarrolladores (json, base64, url, uuid, hash, regex, timestamp, html-escape)
    productivity/       Lógica pura de productividad (formato de tiempo, sorteo, equipos)
    blog/               Contenido de artículos del blog
    site.ts             Configuración global de marca (SITE), navegación, footer
    seo.ts              Helper de metadata (title, OG, canonical)
    analytics.ts        Eventos GA4
    consent.ts          Consentimiento de cookies (useSyncExternalStore)
    favorites.ts        Favoritos en localStorage (useSyncExternalStore)
    history.ts          Historial reciente en localStorage (solo slug/nombre/timestamp)
tests/
  unit/                 Pruebas Vitest (builders de payload, contraste, registry)
  load/                 Prueba de carga aislada de producción (ver TESTING.md)
```

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para el detalle de cómo funciona el
catálogo de herramientas/categorías y cómo escalarlo.

## Cómo agregar una nueva herramienta

`ToolPageShell` es genérico: recibe la herramienta interactiva como
`children`, así que sirve igual para QR, calculadoras, imágenes o PDF.

1. Escribe la lógica pura en `src/lib/<categoria>/` (testeable sin React) si la herramienta hace cálculos o transformaciones.
2. Construye el componente de UI en `src/components/tools/`.
3. Agrega la entrada en `TOOLS` en `src/lib/tools/registry.ts` (icono, keywords, `relatedTools`, `category`).
4. Crea `src/app/<slug>/page.tsx` con `buildMetadata()` + `<ToolPageShell>` envolviendo tu componente — usa `src/app/calc-porcentaje/page.tsx` como ejemplo simple, o `src/app/pdf-unir/page.tsx` para un caso con archivos.
5. Si la categoría todavía está en `"coming-soon"`, cámbiala a `"active"` en `src/lib/tools/categories.ts` solo después de confirmar que la página funciona de extremo a extremo.
6. Aparece automáticamente en `/herramientas`, el buscador y el sitemap.

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para el detalle completo y
[PRODUCT-ROADMAP.md](PRODUCT-ROADMAP.md) para el estado real de cada
herramienta (`active`/`planned`/`coming-soon`).

## Documentación relacionada

- [TOOLS.md](TOOLS.md) — catálogo completo de las 44 herramientas, generado desde el registry
- [PRODUCT-ROADMAP.md](PRODUCT-ROADMAP.md) — estado real de cada herramienta, dependencias, decisiones técnicas
- [GROWTH-ROADMAP.md](GROWTH-ROADMAP.md) — catálogo priorizado de próximas herramientas
- [BRANDING.md](BRANDING.md) — identidad de marca, logo, cómo evitar referencias a la marca antigua
- [ARCHITECTURE.md](ARCHITECTURE.md) — catálogo de herramientas/categorías, cómo escalar a nuevas categorías
- [INTERACTIONS.md](INTERACTIONS.md) — sistema de animación e interacción con mouse (Hero, tilt, spotlight, `/experiencia`)
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel, dominio propio, Search Console
- [SEO.md](SEO.md) — arquitectura SEO, sitemap, metadata, contenido
- [MONETIZATION.md](MONETIZATION.md) — cómo activar AdSense sin romper UX
- [TESTING.md](TESTING.md) — pruebas unitarias y pruebas de carga seguras
- [CONTENT-GROWTH.md](CONTENT-GROWTH.md) — estrategia de contenido e ideas de video
