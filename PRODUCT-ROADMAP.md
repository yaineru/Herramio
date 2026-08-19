# Product Roadmap — estado real del catálogo

Este documento es el registro de qué existe hoy en producción (o listo para
desplegar), a diferencia de `GROWTH-ROADMAP.md`, que es la lista priorizada
de candidatas futuras. Una herramienta solo pasa a `active` aquí cuando la
página realmente funciona de extremo a extremo — nunca antes.

Estados: **active** (funciona hoy) · **planned** (diseñada/priorizada, sin
construir) · **coming-soon** (la categoría existe en la navegación, sin
herramientas propias todavía).

## Herramientas activas

### QR (13 — construidas en fases anteriores)

| Herramienta | Ruta | Procesamiento | Dependencias |
|---|---|---|---|
| QR de URL | `/qr-url` | Cliente | `qr-code-styling` |
| QR de WhatsApp | `/qr-whatsapp` | Cliente | `qr-code-styling` |
| QR de WiFi | `/qr-wifi` | Cliente | `qr-code-styling` |
| QR de texto | `/qr-texto` | Cliente | `qr-code-styling` |
| QR de Google Maps | `/qr-google-maps` | Cliente | `qr-code-styling` |
| QR de Instagram | `/qr-instagram` | Cliente | `qr-code-styling` |
| QR de Facebook | `/qr-facebook` | Cliente | `qr-code-styling` |
| QR de correo | `/qr-email` | Cliente | `qr-code-styling` |
| QR de teléfono | `/qr-telefono` | Cliente | `qr-code-styling` |
| QR de SMS | `/qr-sms` | Cliente | `qr-code-styling` |
| QR de vCard | `/qr-vcard` | Cliente | `qr-code-styling` |
| QR de menú | `/qr-menu` | Cliente | `qr-code-styling` |
| QR de negocio | `/qr-negocio` | Cliente | `qr-code-styling` |

### Ronda 1 (10)

| Herramienta | Categoría | Ruta | Procesamiento | Dependencias | SEO objetivo | Monetización futura | Prioridad |
|---|---|---|---|---|---|---|---|
| Calculadora de Porcentaje | Calculadoras | `/calc-porcentaje` | Cliente (JS puro) | Ninguna | "calculadora de porcentaje", "sacar porcentaje" | Ads display | Alta |
| Contador de Palabras y Caracteres | Texto | `/texto-contador-palabras` | Cliente (JS puro) | Ninguna | "contador de palabras", "contador de caracteres" | Ads display | Alta |
| Comprimir Imagen | Imágenes | `/imagen-comprimir` | Cliente (Canvas API) | Ninguna | "comprimir imagen online", "comprimir jpg" | Ads display | Alta |
| Convertidor de Imágenes | Imágenes | `/imagen-convertir` | Cliente (Canvas API) | Ninguna | "convertir jpg a png", "png a webp" | Ads display | Alta |
| Calculadora de IMC | Calculadoras | `/calc-imc` | Cliente (JS puro) | Ninguna | "calculadora imc", "indice de masa corporal" | Ads display | Alta |
| Convertidor de Unidades | Convertidores | `/conv-unidades` | Cliente (JS puro) | Ninguna | "convertidor de unidades", "km a millas" | Ads display | Alta |
| Unir PDF | PDF | `/pdf-unir` | Cliente (`pdf-lib`) | `pdf-lib` (dinámica) | "unir pdf online", "combinar pdf" | Ads display | Alta |
| Dividir PDF | PDF | `/pdf-dividir` | Cliente (`pdf-lib`) | `pdf-lib` (dinámica) | "dividir pdf online", "extraer paginas pdf" | Ads display | Alta |
| JPG a PDF | PDF | `/jpg-a-pdf` | Cliente (`pdf-lib`) | `pdf-lib` (dinámica) | "jpg a pdf", "imagen a pdf" | Ads display | Alta |
| PDF a JPG | PDF | `/pdf-a-jpg` | Cliente (`pdf.js`) | `pdfjs-dist` (dinámica, aislada solo en esta página) | "pdf a jpg", "convertir pdf a imagen" | Ads display | Alta |

### Ronda 2 — Bloque A: contraseñas, lector QR, más calculadoras/convertidores (9)

| Herramienta | Categoría | Ruta | Procesamiento | Dependencias |
|---|---|---|---|---|
| Generador de Contraseñas Seguras | Texto | `/texto-generador-contrasenas` | Cliente (Web Crypto) | Ninguna |
| Leer Código QR | QR | `/qr-lector` | Cliente (`jsqr`) | `jsqr` (dinámica) |
| Calculadora de Descuento | Calculadoras | `/calc-descuento` | Cliente (JS puro) | Ninguna |
| Calculadora de IVA | Calculadoras | `/calc-iva` | Cliente (JS puro) | Ninguna |
| Calculadora de Regla de Tres | Calculadoras | `/calc-regla-de-tres` | Cliente (JS puro) | Ninguna |
| Convertidor de Temperatura | Convertidores | `/conv-temperatura` | Cliente (JS puro) | Ninguna |
| Convertidor de Moneda | Convertidores | `/conv-moneda` | Cliente + API externa | `api.frankfurter.app` (única excepción "no backend propio" — solo tasas de cambio, sin key, ~30 monedas) |
| Generador de Lorem Ipsum | Texto | `/texto-lorem-ipsum` | Cliente (JS puro) | Ninguna |
| Limpiador de Texto | Texto | `/texto-limpiar` | Cliente (JS puro) | Ninguna |

### Ronda 2 — Bloque B: categoría Desarrolladores, nueva (8)

| Herramienta | Ruta | Procesamiento |
|---|---|---|
| Formateador de JSON | `/dev-json-formatter` | Cliente (`JSON.parse`/`stringify`) |
| Base64 (codificar/decodificar) | `/dev-base64` | Cliente (`btoa`/`atob` + `TextEncoder`) |
| URL Encode/Decode | `/dev-url-encoder` | Cliente (`encodeURIComponent`) |
| Generador de UUID | `/dev-uuid-generator` | Cliente (`crypto.randomUUID`) |
| Generador de Hash (SHA-1/256/384/512) | `/dev-hash-generator` | Cliente (`crypto.subtle.digest`) |
| Probador de Regex | `/dev-regex-tester` | Cliente (JS `RegExp`, con tope de 20k caracteres / 500 coincidencias para mitigar ReDoS) |
| Convertidor de Timestamp Unix | `/dev-timestamp-converter` | Cliente (JS puro) |
| Escapar/Desescapar HTML | `/dev-html-escape` | Cliente (JS puro) |

MD5 se dejó fuera del generador de hash a propósito: `crypto.subtle.digest`
no lo implementa y, al estar roto criptográficamente, no justificaba añadir
una librería extra solo para ofrecerlo.

### Ronda 2 — Bloque C: categoría Productividad, activada (4)

| Herramienta | Ruta | Procesamiento |
|---|---|---|
| Temporizador Pomodoro | `/productividad-temporizador` | Cliente (`setInterval`) |
| Cronómetro | `/productividad-cronometro` | Cliente (`Date.now()`) |
| Sorteador de Nombres | `/productividad-sorteador` | Cliente (`Math.random`) |
| Generador de Equipos | `/productividad-generador-equipos` | Cliente (`Math.random`, Fisher-Yates) |

### Ronda 2 — Favoritos e historial reciente (transversal, no es una herramienta)

Sistema de favoritos (estrella en cada página de herramienta) e historial de
las últimas 12 visitas, ambos en `localStorage` del navegador — nunca se
sincronizan ni se envían a ningún servidor. El historial solo guarda
`slug`, `nombre` y `timestamp`; nunca contenido, archivos ni datos
ingresados en las herramientas. Ver `/favoritos` y `src/lib/favorites.ts` /
`src/lib/history.ts`.

**Notas de procesamiento**: las 44 herramientas activas son 100%
client-side — nada se sube a un servidor, con la única excepción declarada
del convertidor de moneda (tasas de cambio vía API pública, sin datos del
usuario involucrados). Toda dependencia no trivial (`pdf-lib`,
`pdfjs-dist`, `jsqr`) se carga con `import()` dinámico solo dentro de la
página que la necesita.

## Categorías: estado

| Categoría | Estado | Herramientas activas |
|---|---|---|
| QR | active | 14 |
| PDF | active | 4 |
| Imágenes | active | 2 |
| Calculadoras | active | 5 |
| Convertidores | active | 3 |
| Texto | active | 4 |
| Desarrolladores | active | 8 |
| Productividad | active | 4 |

**Total: 44 herramientas activas.**

## Próximas herramientas (planned)

La lista completa y priorizada de candidatas — con keyword principal,
intención de búsqueda, dificultad y prioridad — vive en
[GROWTH-ROADMAP.md](GROWTH-ROADMAP.md) para no duplicar contenido. Las
siguientes 10 recomendadas ahí (comprimir PDF, unir/numerar páginas,
más calculadoras, etc.) son el candidato natural para la próxima ronda de
desarrollo.

## Decisión técnica: por qué `pdf-lib` + `pdfjs-dist` y no otra cosa

Investigado antes de instalar nada (ver también `ARCHITECTURE.md`):

- **`pdf-lib`** (unir, dividir, JPG→PDF): pura JavaScript, sin WASM ni
  dependencias nativas, corre igual de bien en navegador y Node, y su API
  (`PDFDocument.load/create/copyPages/embedJpg/embedPng/save`) cubre
  exactamente unir/dividir/crear PDFs sin necesitar nada más pesado.
- **`pdfjs-dist`** (PDF→JPG, solo esa página): es la única opción madura
  para *renderizar* contenido de PDF a un canvas en el navegador — no hay
  forma nativa de rasterizar un PDF sin un motor de render completo. Es
  notablemente más pesado que `pdf-lib`, así que se carga exclusivamente
  con `import()` dinámico dentro de `/pdf-a-jpg` (ver
  `src/lib/pdf/pdf-render.ts`) y nunca se importa desde ningún otro lugar
  del código — ninguna otra página, ni siquiera las demás herramientas de
  PDF, paga ese costo de bundle.
- **Compresión de PDF** (`pdf-comprimir`, en `GROWTH-ROADMAP.md`) se dejó
  fuera de este lote a propósito: comprimir un PDF de verdad requiere
  recodificar las imágenes incrustadas dentro del archivo, algo que
  `pdf-lib` no hace de forma nativa — necesitaría una investigación aparte
  antes de comprometerse a una arquitectura.
