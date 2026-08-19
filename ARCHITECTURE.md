# Arquitectura

Herramio está pensado para crecer de "13 herramientas QR" a "cientos de
herramientas en varias categorías" sin reescribir la aplicación. Hoy tiene
48 herramientas activas en 8 categorías — QR, PDF, Imágenes, Calculadoras,
Convertidores, Texto, Desarrolladores y Productividad (ver `TOOLS.md` para
el listado completo y `PRODUCT-ROADMAP.md` para el detalle técnico de
cada una) — todas construidas reutilizando el mismo `ToolPageShell`. Esta
guía explica las piezas que lo permiten.

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

Para las 13 herramientas QR, el `id` en `tools/registry.ts` y el
`QrKind` en `qr/registry.ts` coinciden como string (`"qr-whatsapp"` en
ambos), pero conceptualmente son cosas distintas. Cuando se agregue una
categoría no-QR (PDF, imágenes...), esas herramientas **no** necesitarán
tocar `qr/registry.ts` en absoluto — solo `tools/registry.ts` y su propia
lógica de procesamiento.

## Categorías (`src/lib/tools/categories.ts`)

```ts
export type CategoryId =
  | "qr" | "pdf" | "imagenes" | "calculadoras" | "convertidores" | "texto"
  | "desarrolladores" | "productividad";
```

Cada categoría tiene un `status`: `"active"` (tiene herramientas reales) o
`"coming-soon"` (aparece en la home y en `/herramientas` marcada como
"Próximamente", sin enlazar a nada que no exista). Añadir una categoría
nueva es agregar una entrada a `CATEGORIES` — el resto de la UI (home,
catálogo, buscador) la recoge automáticamente. Hoy las 8 categorías están
`"active"` — no queda ninguna `"coming-soon"`, aunque el mecanismo sigue
siendo el mismo para la próxima categoría que se agregue.

## `ToolPageShell` es genérico — este es el patrón para cualquier herramienta

`ToolPageShell` (`src/components/marketing/ToolPageShell.tsx`) no sabe nada
de QR específicamente: recibe `toolId`, `toolName`, `eyebrow`, `intro`,
`seoContent`, `faqItems` y **`children`** — el widget interactivo real. Esto
es lo que permite que la misma shell sirva para un generador de QR, una
calculadora o un subidor de archivos PDF sin duplicar breadcrumb, JSON-LD,
FAQ, AdSlots ni la sección de "herramientas relacionadas".

### Cómo añadir una herramienta nueva

1. Si la herramienta tiene lógica de cálculo o transformación, escríbela
   como funciones puras y testeables en `src/lib/<categoria>/` (ver
   `src/lib/calculators/percentage.ts` o `src/lib/converters/units.ts` como
   ejemplos simples, o `src/lib/pdf/pdf-engine.ts` para un caso con
   dependencias de terceros).
2. Construye el componente de UI en `src/components/tools/` (formulario +
   estados de vacío/cargando/error/éxito). Para herramientas con archivos,
   reutiliza `FileDropZone` y, si necesitan reordenar varios archivos,
   `ReorderableFileList`.
3. Agrega la entrada en `TOOLS` en `src/lib/tools/registry.ts` (id, icono de
   `lucide-react`, keywords para el buscador, `category`, `relatedTools`).
4. Crea `src/app/<slug>/page.tsx`: `buildMetadata()` + `<ToolPageShell>`
   envolviendo tu componente como `children`. Ejemplos: `src/app/calc-porcentaje/page.tsx`
   (calculadora simple) o `src/app/pdf-unir/page.tsx` (con archivos).
5. Si la categoría todavía está `"coming-soon"` en `src/lib/tools/categories.ts`,
   cámbiala a `"active"` **solo después de confirmar que la página funciona
   de extremo a extremo** — nunca antes.
6. Listo — aparece automáticamente en `/herramientas`, el buscador, el
   sitemap, y como "relacionada" en cualquier otra herramienta que la
   referencie en su `relatedTools`.

No conectes backend ni base de datos a menos que la herramienta lo requiera
de verdad — todo lo construido hasta ahora (QR, PDF, imágenes,
calculadoras, convertidores, texto) es 100% client-side.

## Motores de procesamiento por categoría

Cada categoría con lógica no trivial tiene su propio motor en `src/lib/`,
separado de los componentes de UI, siguiendo el mismo espíritu que
`src/lib/qr/`:

- **`src/lib/calculators/`** — porcentaje (`percentage.ts`), IMC (`bmi.ts`). Funciones puras, sin dependencias.
- **`src/lib/converters/units.ts`** — conversión de unidades por categoría (longitud, peso, temperatura, área, volumen, tiempo). Sin dependencias ni APIs externas.
- **`src/lib/text/word-stats.ts`** — conteo de palabras/caracteres/párrafos. Sin dependencias.
- **`src/lib/images/canvas-image.ts`** — comprimir y convertir imágenes con la Canvas API nativa (`drawImage` + `toBlob`). Sin dependencias de terceros.
- **`src/lib/pdf/`** — `pdf-engine.ts` (unir, dividir, imágenes→PDF, vía `pdf-lib`) y `pdf-render.ts` (PDF→JPG, vía `pdfjs-dist`, importado dinámicamente **solo** desde `/pdf-a-jpg`). Ver `PRODUCT-ROADMAP.md` para por qué se eligieron estas dos librerías y no otras.
- **`src/lib/text/`** — contraseñas (`password.ts`, vía `crypto.getRandomValues`), Lorem Ipsum (`lorem-ipsum.ts`), limpiar texto (`clean-text.ts`). Sin dependencias.
- **`src/lib/dev/`** — las 8 herramientas de Desarrolladores: `json-tool.ts`, `base64.ts`, `url-encoding.ts`, `uuid.ts` (`crypto.randomUUID`), `hash.ts` (`crypto.subtle.digest`), `regex-tester.ts` (con tope de tamaño/coincidencias por mitigación de ReDoS), `timestamp.ts`, `html-escape.ts`. Todas usan solo APIs nativas del navegador — cero dependencias nuevas.
- **`src/lib/productivity/`** — `time-format.ts` (formato de temporizador/cronómetro), `raffle.ts` (sorteo, Fisher-Yates shuffle), `teams.ts` (reparto de equipos). Sin dependencias.
- **`src/lib/qr/decode.ts`** — lectura de QR desde una imagen subida, vía `jsqr` (importado dinámicamente solo en `/qr-lector`), reutilizando `loadImageFile`/`drawImageToCanvas` de `canvas-image.ts` en vez de duplicar la lógica de carga de imágenes.
- **`src/lib/converters/currency.ts`** — única excepción a "100% sin red": consulta `api.frankfurter.app` (tasas de cambio reales, sin API key). El resto del catálogo no hace llamadas de red.

Todos estos motores importan sus dependencias de terceros con `import()`
dinámico dentro de la función que las usa (mismo patrón que
`QRCodeCanvas.tsx` ya usaba para `qr-code-styling`), así que ninguna página
paga el costo de bundle de una librería que no necesita.

## Favoritos e historial reciente (`src/lib/favorites.ts`, `src/lib/history.ts`)

Ambos viven enteramente en `localStorage` del navegador — nunca se envían
a un servidor. Siguen el mismo patrón que `src/lib/consent.ts`
(`useSyncExternalStore` + `CustomEvent`) en vez de leer `localStorage`
dentro de un `useEffect` y llamar `setState`: eso evitaría el mismatch de
hidratación SSR/cliente (el servidor no tiene acceso a `localStorage`) y el
problema de renders en cascada que React marca como anti-patrón.

Un componente que lee el store **debe** usar el valor que devuelve
`useSyncExternalStore(...)` (o derivarlo de él) — nunca llamar a
`getFavorites()`/`getHistory()` directamente en el cuerpo del componente,
porque eso rompe la garantía de que el primer render en cliente coincide
con el HTML del servidor. `FavoriteButton.tsx` y
`FavoritesAndHistoryView.tsx` son la referencia de cómo hacerlo bien.

El historial solo guarda `slug`, `nombre` y `timestamp` por diseño — nunca
contenido de archivos, texto ingresado ni ningún dato sensible; ver el tipo
`HistoryEntry` en `src/lib/history.ts`.

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

## Sistema de interacción/movimiento (`src/lib/motion/`)

Añadido en la ronda de consolidación visual y extendido en la ronda de
consolidación SaaS (spotlight global, hub de categorías, `/experiencia`).
Ver [INTERACTIONS.md](INTERACTIONS.md) para la guía completa de uso —
aquí solo el resumen arquitectónico. Toda animación dirigida por el mouse
sigue el mismo patrón para no bloquear el hilo principal ni pelear con
React:

- **Cálculo puro y testeable** en `src/lib/motion/motion-math.ts`
  (`computeGlowPosition`, `computeProximity`, `computeTilt`,
  `computeMagneticOffset`...) — sin DOM, sin React, cubierto por
  `tests/unit/motion-math.test.ts`.
- **Gate de preferencias** en `src/lib/motion/preferences.ts`
  (`motionEffectsEnabled()`): combina `(pointer: fine) and (hover: hover)`
  con `prefers-reduced-motion` — si el dispositivo es táctil o el usuario
  pidió menos movimiento, el `useEffect` del componente ni siquiera
  registra el listener de `pointermove`.
- **Nunca `setState` en cada movimiento del mouse**: los componentes
  (`HeroBackground`, `TiltWrapper`, `MagneticButton`) escriben directamente
  `element.style.transform`/`setProperty` dentro de un callback de
  `requestAnimationFrame`, con un `rafRef` que evita encolar más de un
  frame pendiente a la vez.
- **`TiltWrapper` está separado de `ToolCard`** a propósito: `ToolCard` es
  un Server Component (necesita renderizar `tool.icon`, una referencia a
  función, que no puede cruzar el límite Server→Client como prop).
  `TiltWrapper` es un Client Component que solo recibe `children` ya
  renderizados — ese es el único dato que sí puede cruzar el límite. Si
  vas a envolver contenido de un Server Component con un efecto de mouse
  nuevo, replica este patrón en vez de convertir el Server Component en
  `"use client"`.
- **`Reveal`** (`src/components/marketing/Reveal.tsx`) anima con
  `IntersectionObserver` + opacidad/transform CSS — nunca `display:none`,
  para que el contenido siga presente para lectores de pantalla y
  crawlers aunque la animación no haya corrido todavía.
- `prefers-reduced-motion` se respeta en dos capas: JS (gate de arriba,
  para los efectos de mouse) y CSS (`motion-reduce:` de Tailwind, para las
  transiciones de `Reveal` y el brillo del Hero).

## Estructura de carpetas relevante

```
src/
  app/
    qr-*/                    Páginas de herramientas QR (13)
    calc-*/, conv-*/          Calculadoras y convertidores
    imagen-*/                 Herramientas de imágenes
    pdf-*/, jpg-a-pdf/        Herramientas de PDF
    texto-*/                  Herramientas de texto
    herramientas/             Catálogo con búsqueda + filtro por categoría
    generador-qr/              Generador universal (tabs de todos los tipos QR)
    blog/                      Blog + artículos
  components/
    qr/                        Motor de generación QR (genérico, reutilizable)
    tools/                     Componentes de herramientas no-QR + FileDropZone, ReorderableFileList
    marketing/                 ToolCard, ToolGrid, ToolCatalog, ToolPageShell, Hero, CategoryGrid
    search/                    SearchPalette, SearchTrigger
    layout/                    Navbar, Footer
    ads/                       AdSlot
  lib/
    tools/                     registry.ts (catálogo), categories.ts, search.ts
    qr/                        payloads.ts, registry.ts (PAYLOAD_BUILDERS), style.ts, fields.ts
    calculators/, converters/, text/, images/, pdf/   Motores por categoría (ver arriba)
    blog/                      posts.ts (contenido de artículos)
    site.ts                    SITE (marca), NAV_LINKS, FOOTER_LINKS
```

## Principios que se han mantenido

- **Sin backend nuevo**: todo lo que existe hoy sigue siendo 100%
  client-side, incluidas las herramientas de PDF e imágenes. No se agregó
  base de datos, autenticación ni pagos (ver `MONETIZATION.md` para cuándo
  consideraríamos eso).
- **Dependencias nuevas, solo cuando no había alternativa nativa**: el
  buscador, las categorías, las calculadoras, los convertidores y las
  herramientas de imágenes se construyeron sin ninguna librería nueva
  (Canvas API y JS puro). Las únicas dos dependencias añadidas —
  `pdf-lib` y `pdfjs-dist` — se investigaron primero (ver
  `PRODUCT-ROADMAP.md`) porque no existe forma nativa de manipular o
  renderizar PDFs en el navegador; ambas se cargan con `import()` dinámico
  solo donde se usan.
- **URLs estables**: ninguna ruta de herramienta existente cambió de
  dirección al re-marcar el sitio, introducir el catálogo de categorías, ni
  al agregar las herramientas de PDF/imágenes/calculadoras/convertidores/texto.

## Decisión: sin dark mode (por ahora)

Evaluado explícitamente y descartado a propósito, no por falta de tiempo.
Antes de decidir, se midió el estado real del código (no una suposición):
**84 archivos** usan colores literales de Tailwind (`bg-white`,
`text-slate-*`, etc.) directamente, y **0 archivos** usan la variante
`dark:` o tokens semánticos de color (`bg-background`, `text-foreground`...).
Ningún componente fue construido pensando en un segundo tema.

Implementar dark mode correctamente exigiría migrar esos ~84 archivos a
tokens semánticos (vía CSS custom properties + `@theme` de Tailwind v4) y
volver a probar visualmente las 44 páginas de herramientas — el tipo de
cambio masivo, de alto riesgo y bajo valor inmediato que las reglas de esta
ronda piden evitar explícitamente ("si agregarlo genera demasiada
complejidad o rompe diseño, no lo hagas"). Un toggle superficial (solo
invertir fondo/texto sin pasar por cada componente) se descartó también,
porque produciría contrastes rotos en herramientas con estados de color
semántico (verde=éxito, rojo=error, ámbar=advertencia) que dependen del
tema claro para verse bien.

**Si se retoma en el futuro**: la ruta correcta es introducir tokens
semánticos (`--color-surface`, `--color-text`, `--color-border`...) en
`globals.css` sobre `@theme`, migrar un área pequeña primero (por ejemplo,
`ToolPageShell` y sus hijos directos) para validar el patrón, y expandir
herramienta por herramienta — nunca en un solo cambio masivo.
