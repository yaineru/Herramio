# Arquitectura

Herramio está pensado para crecer de "13 herramientas QR" a "cientos de
herramientas en varias categorías" sin reescribir la aplicación. Esta guía
explica las piezas que lo permiten.

## Las dos capas de "registro" (no confundirlas)

Hay dos registros distintos con nombres parecidos — es importante no
mezclarlos:

1. **`src/lib/tools/registry.ts`** — el catálogo de producto: cada
   herramienta del sitio (`Tool`) con `id`, `slug`, `href`, `name`,
   `description`, `category`, `icon`, `keywords`, `status`, `relatedTools`.
   Lo consumen: el buscador (Ctrl/Cmd+K), `/herramientas`, las tarjetas
   (`ToolCard`), el sitemap y la sección "herramientas relacionadas" de cada
   página de herramienta.
2. **`src/lib/qr/registry.ts`** — lógica interna *solo* de generación de QR:
   mapea un `QrKind` (ej. `"qr-whatsapp"`) a la función que arma el payload
   que se codifica en el código QR (`PAYLOAD_BUILDERS`). Es específico del
   motor QR y no sabe nada de categorías, iconos o SEO.

Para las 13 herramientas QR actuales, el `id` en `tools/registry.ts` y el
`QrKind` en `qr/registry.ts` coinciden como string (`"qr-whatsapp"` en
ambos), pero conceptualmente son cosas distintas. Cuando se agregue una
categoría no-QR (PDF, imágenes...), esas herramientas **no** necesitarán
tocar `qr/registry.ts` en absoluto — solo `tools/registry.ts` y su propia
lógica de procesamiento.

## Categorías (`src/lib/tools/categories.ts`)

```ts
export type CategoryId = "qr" | "pdf" | "imagenes" | "calculadoras" | "convertidores" | "texto";
```

Cada categoría tiene un `status`: `"active"` (tiene herramientas reales) o
`"coming-soon"` (aparece en la home y en `/herramientas` marcada como
"Próximamente", sin enlazar a nada que no exista). Añadir una categoría
nueva es agregar una entrada a `CATEGORIES` — el resto de la UI (home,
catálogo, buscador) la recoge automáticamente.

## Cómo añadir una herramienta nueva (QR)

1. Si necesitas un formato de payload nuevo, agrégalo a `src/lib/qr/payloads.ts`.
2. Registra el builder en `PAYLOAD_BUILDERS` en `src/lib/qr/registry.ts`.
3. Agrega la entrada correspondiente en `TOOLS` en `src/lib/tools/registry.ts`
   (id, icono de `lucide-react`, keywords para el buscador, `relatedTools`).
4. Crea `src/app/qr-nueva-herramienta/page.tsx` siguiendo el patrón de
   `src/app/qr-url/page.tsx` (el más simple): `fields`, `seoContent`,
   `faqItems`, y renderiza `<ToolPageShell />`.
5. Listo — aparece automáticamente en `/herramientas`, en el buscador, en el
   sitemap, y como "relacionada" en cualquier otra herramienta que la
   referencie en su `relatedTools`.

## Cómo añadir una categoría nueva (ej. PDF)

Esto es un cambio más grande porque cada categoría probablemente necesita su
propia lógica de procesamiento (ej. comprimir un PDF requiere una librería
distinta a generar un QR). Pasos sugeridos:

1. Cambia el `status` de la categoría en `src/lib/tools/categories.ts` de
   `"coming-soon"` a `"active"` **solo cuando ya tengas al menos una
   herramienta real** — nunca actives una categoría vacía.
2. Crea `src/lib/pdf/` (o `imagenes/`, etc.) con la lógica de esa categoría,
   siguiendo el mismo espíritu que `src/lib/qr/`: builders puros y
   testeables, separados de los componentes de UI.
3. Agrega las herramientas nuevas a `TOOLS` en `src/lib/tools/registry.ts`
   con `category: "pdf"`.
4. Crea las páginas en `src/app/pdf-nombre-herramienta/` (o la ruta que
   definas) usando `ToolPageShell` si aplica, o un shell nuevo si la UI de
   esa categoría es muy distinta a un formulario + preview.
5. No conectes backend/base de datos a menos que la herramienta lo requiera
   de verdad — la mayoría de herramientas de PDF/imágenes pueden procesarse
   100% en el navegador (ej. con `pdf-lib`, `browser-image-compression`).

## El motor de generación QR

- `src/components/qr/QRGenerator.tsx` — orquestador genérico: recibe
  `fields: FieldConfig[]` (definición declarativa del formulario) y
  `toolId: QrKind`, resuelve el payload vía `PAYLOAD_BUILDERS[toolId]`, y
  renderiza formulario + personalización + preview + descarga.
- `src/components/qr/QRCodeCanvas.tsx` — envuelve `qr-code-styling` (única
  dependencia de terceros para el renderizado real del QR).
- Todo ocurre en el cliente: no hay endpoint de servidor involucrado en
  generar o descargar un QR.

## Buscador (Ctrl/Cmd+K)

- `src/lib/tools/search.ts` — funciones puras: `searchTools(query, tools)`
  filtra por nombre/descripción/categoría/keywords; `findMatchingComingSoonCategory`
  detecta cuando alguien busca algo de una categoría que existe pero aún no
  tiene herramientas (para mostrar "Próximamente" en vez de "no encontrado").
- `src/lib/search-events.ts` — bus de eventos minimalista
  (`openSearchPalette()` / `subscribeToSearchOpen()`) para que cualquier
  componente (Navbar, Hero, chips de ejemplo) pueda abrir el modal sin
  pasar props a través de todo el árbol.
- `src/components/search/SearchPalette.tsx` — el modal en sí: se monta una
  única vez en `src/app/layout.tsx`, escucha `Ctrl/Cmd+K` globalmente y el
  evento del bus, maneja navegación por teclado (flechas, Enter, Escape).
- `/herramientas` **no** usa el modal — tiene su propio filtro inline
  (`src/components/marketing/ToolCatalog.tsx`) porque en una página de
  catálogo dedicada un filtro inline es mejor UX que forzar un modal. Ambos
  reutilizan `searchTools()`.

## Estructura de carpetas relevante

```
src/
  app/
    qr-*/                    Páginas de herramientas QR (13)
    herramientas/             Catálogo con búsqueda + filtro por categoría
    generador-qr/              Generador universal (tabs de todos los tipos QR)
    blog/                      Blog + artículos
  components/
    qr/                        Motor de generación QR (genérico, reutilizable)
    marketing/                 ToolCard, ToolGrid, ToolCatalog, ToolPageShell, Hero, CategoryGrid
    search/                    SearchPalette, SearchTrigger
    layout/                    Navbar, Footer
    ads/                       AdSlot
  lib/
    tools/                     registry.ts (catálogo), categories.ts, search.ts
    qr/                        payloads.ts, registry.ts (PAYLOAD_BUILDERS), style.ts, fields.ts
    blog/                      posts.ts (contenido de artículos)
    site.ts                    SITE (marca), NAV_LINKS, FOOTER_LINKS
```

## Principios que se mantuvieron en el rebrand

- **Sin backend nuevo**: todo lo que existe hoy sigue siendo 100%
  client-side. No se agregó base de datos, autenticación ni pagos (ver
  `MONETIZATION.md` para cuándo consideraríamos eso).
- **Sin dependencias nuevas**: el buscador, las categorías y el rediseño se
  construyeron con lo que ya estaba instalado (`lucide-react`, Tailwind,
  React). No se agregó ninguna librería de UI, de estado global ni de
  fuzzy-search.
- **URLs estables**: ninguna ruta de herramienta QR cambió de dirección al
  re-marcar el sitio ni al introducir el catálogo de categorías.
