# Growth Roadmap — próximas herramientas

Este documento prioriza qué construir después del catálogo base de 13 herramientas QR (hoy 48 herramientas activas en 8 categorías — ver `TOOLS.md`).
**No es una lista de tareas confirmadas** — es un plan de priorización para
decidir juntos qué construir primero.

> **Actualización (Ronda 1)**: las "primeras 10 recomendadas" que cerraban
> originalmente este documento ya están construidas y activas en
> producción (`calc-porcentaje`, `calc-imc`, `conv-unidades`,
> `imagen-comprimir`, `imagen-convertir`, `pdf-unir`, `pdf-dividir`,
> `jpg-a-pdf`, `pdf-a-jpg`, `texto-contador-palabras`).
>
> **Actualización (Ronda 2)**: de las "próximas 10 recomendadas" que
> cerraban esta lista, 6 ya están construidas —
> `texto-generador-contraseñas`, `qr-lector`, `prod-temporizador` (como
> `productividad-temporizador`) y, además de lo priorizado aquí, se
> agregaron `calc-iva`, `calc-regla-de-tres`, `conv-temperatura`,
> `conv-moneda`, `texto-lorem-ipsum`, `texto-limpiar`,
> `productividad-cronometro`, `productividad-sorteador` y
> `productividad-generador-equipos` (no estaban en este roadmap como
> candidatas individuales, pero completaban de forma natural las
> categorías Calculadoras/Convertidores/Texto/Productividad ya iniciadas).
> También se construyó una categoría **Desarrolladores completa (8
> herramientas)** que no estaba contemplada en este documento — ver la
> sección nueva más abajo. `pdf-organizar`, `pdf-numerar`,
> `calc-calorias`, `calc-huso-horario`, `conv-numeros-romanos`,
> `imagen-redimensionar` e `imagen-recortar` siguen pendientes de la lista
> original. Quedan marcadas como ✅ en las tablas de abajo. El estado real
> y verificado de cada herramienta vive en
> [PRODUCT-ROADMAP.md](PRODUCT-ROADMAP.md) / [TOOLS.md](TOOLS.md) — este
> documento sigue siendo la referencia para priorizar lo que sigue.

## Cómo leer las columnas

- **Dificultad**: esfuerzo de desarrollo relativo dentro de este proyecto
  (Baja/Media/Alta), asumiendo que se mantiene 100% client-side cuando es
  posible, sin backend ni base de datos nuevos.
- **Utilidad**: qué tan real y frecuente es la necesidad que resuelve.
- **Monetización**: potencial de ingresos por publicidad, de forma
  cualitativa (Alta/Media/Baja) según el tipo de audiencia y CPM típico de
  la categoría (financiero/profesional suele pagar más que utilidades
  genéricas de estudiante).
- **Prioridad**: síntesis de las columnas anteriores + qué tan bien encaja
  con la arquitectura actual (`src/lib/tools/registry.ts`).
- **Dependencia técnica**: qué necesita la herramienta más allá de
  React/Tailwind — una librería cliente nueva, una API externa, o nada.

⚠️ **Ninguna cifra de volumen de búsqueda en este documento es un dato
medido** (no tengo acceso a Google Keyword Planner, Search Console con
histórico, ni herramientas como Ahrefs/SEMrush desde este entorno). Las
columnas de intención/prioridad son juicio cualitativo basado en qué tan
conocida y estable es la demanda de cada categoría de herramienta a nivel
general. Antes de invertir tiempo de desarrollo en una herramienta
específica, valida el volumen real con Google Keyword Planner o, una vez
haya tráfico, con Search Console.

---

## QR (categoría activa — 14 ya construidas)

| # | Herramienta | Estado |
|---|---|---|
| 1 | QR de URL | ✅ Activa |
| 2 | QR de WhatsApp | ✅ Activa |
| 3 | QR de WiFi | ✅ Activa |
| 4 | QR de texto | ✅ Activa |
| 5 | QR de Google Maps | ✅ Activa |
| 6 | QR de Instagram | ✅ Activa |
| 7 | QR de Facebook | ✅ Activa |
| 8 | QR de email | ✅ Activa |
| 9 | QR de teléfono | ✅ Activa |
| 10 | QR de SMS | ✅ Activa |
| 11 | QR de vCard | ✅ Activa |
| 12 | QR de menú | ✅ Activa |
| 13 | QR de negocio | ✅ Activa |
| 14 | Leer código QR (`qr-lector`) | ✅ Activa (Ronda 2) |

### Candidatas nuevas en QR

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `qr-lector` | Lector/escáner de QR online | "leer código qr online" | "escanear qr sin app", "decodificar qr" | Media | Alta — complementa las 13 herramientas de generación con el caso inverso | Media | ✅ Construida (`jsqr`, sube imagen — no cámara en vivo) |
| `qr-pdf` | QR que apunta a un PDF | "código qr para pdf" | "qr documento", "qr catálogo" | Baja | Media — caso de uso real (catálogos, fichas técnicas) | Media | Media | Ninguna (reutiliza `qr-url` con copy específico) |
| `qr-evento` | QR para evento/invitación | "qr para invitación" | "qr boda", "qr evento" | Baja | Media | Media | Media | Ninguna (variante de contenido de `qr-url`/`qr-vcard`) |
| `qr-pago` | QR de pago (Yape/Nequi/enlace de pago) | "qr para cobrar" | "qr pago negocio" | Media | Alta en mercados con pagos QR (LatAm) | Alta | Media-Alta | Ninguna si es solo un enlace; investigar formatos específicos por país antes de prometer compatibilidad |

## PDF (coming-soon)

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `pdf-unir` | Unir archivos PDF | "unir pdf online" | "combinar pdf", "juntar pdf gratis" | Baja | Alta | Alta | **Alta** | `pdf-lib` (client-side) |
| `pdf-dividir` | Dividir/separar PDF | "dividir pdf online" | "separar páginas pdf" | Baja | Alta | Alta | **Alta** | `pdf-lib` (client-side) |
| `pdf-comprimir` | Comprimir PDF | "comprimir pdf online" | "reducir tamaño pdf" | Alta | Alta (una de las búsquedas más frecuentes de la categoría) | Alta | Media (alto valor, pero compresión real de PDF client-side es no trivial: recompresión de imágenes internas, no solo re-empaquetado) | `pdf-lib` + reprocesamiento de imágenes internas; evaluar límites de calidad |
| `pdf-a-jpg` | Convertir PDF a JPG | "pdf a jpg" | "convertir pdf a imagen" | Media | Alta | Alta | **Alta** | `pdf.js` (renderizar páginas a canvas) |
| `jpg-a-pdf` | Convertir JPG a PDF | "jpg a pdf" | "imagen a pdf online" | Baja | Alta | Alta | **Alta** | `jsPDF` o `pdf-lib` |
| `pdf-rotar` | Rotar páginas de PDF | "rotar pdf online" | "girar página pdf" | Baja | Media | Media | Media | `pdf-lib` |
| `pdf-eliminar-paginas` | Eliminar páginas de un PDF | "eliminar página pdf" | "quitar hoja pdf" | Baja | Media | Media | Media | `pdf-lib` |
| `pdf-proteger` | Proteger PDF con contraseña | "poner contraseña a pdf" | "proteger pdf online" | Media | Media | Media | Media | `pdf-lib` (soporte de cifrado limitado — validar antes de prometer) |
| `pdf-desproteger` | Quitar contraseña de PDF | "quitar contraseña pdf" | "desbloquear pdf" | Media | Media | Media-Baja (tema sensible, revisar políticas de AdSense en contenido "quitar protección") | Baja-Media | `pdf-lib`/`pdf.js` |
| `pdf-organizar` | Reordenar páginas de PDF | "reordenar páginas pdf" | "organizar pdf online" | Media | Media | Media | Media | `pdf-lib` + UI de arrastrar y soltar |
| `pdf-numerar` | Añadir números de página a PDF | "numerar páginas pdf" | "agregar numeración pdf" | Baja | Media | Media | Media | `pdf-lib` |

## Imágenes (coming-soon)

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `imagen-comprimir` | Comprimir imagen (JPG/PNG) | "comprimir imagen online" | "reducir peso de imagen" | Baja | Alta | Alta | **Alta** | Canvas API nativo o `browser-image-compression` |
| `imagen-convertir` | Convertir formato de imagen | "convertir jpg a png" | "webp a jpg", "png a jpg" | Baja | Alta | Alta | **Alta** | Canvas API nativo |
| `imagen-redimensionar` | Redimensionar imagen | "cambiar tamaño de imagen online" | "resize imagen" | Baja | Alta | Media | **Alta** | Canvas API nativo |
| `imagen-recortar` | Recortar imagen | "recortar imagen online" | "cortar foto" | Baja | Alta | Media | Alta | Canvas API + librería de crop UI |
| `imagen-a-base64` | Convertir imagen a Base64 | "imagen a base64" | "base64 encoder imagen" | Baja | Media (audiencia developer, nicho pero fácil) | Baja-Media | Media | Ninguna |
| `imagen-quitar-fondo` | Quitar fondo de imagen | "quitar fondo de imagen online" | "remove background" | Alta | Alta (tendencia creciente) | Alta | Media (alto valor, pero requiere modelo de ML — no es trivial mantenerlo 100% client-side con buena calidad) | Modelo tfjs client-side o API externa — decidir arquitectura antes de comprometerse |
| `imagen-marca-agua` | Añadir marca de agua a imagen | "poner marca de agua a foto" | "watermark online" | Media | Media | Media | Media | Canvas API |
| `imagen-rotar` | Rotar/voltear imagen | "rotar imagen online" | "girar foto online" | Baja | Media | Media | Media | Canvas API |
| `imagen-comparar` | Comparar dos imágenes (diferencias) | "comparar imágenes online" | "diferencias entre fotos" | Media | Baja-Media (nicho) | Baja | Baja | Canvas API |

## Calculadoras (coming-soon)

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `calc-porcentaje` | Calculadora de porcentajes | "calculadora de porcentajes" | "sacar porcentaje online" | Baja | Alta | Media | **Alta** | Ninguna |
| `calc-imc` | Calculadora de IMC | "calculadora de imc" | "índice de masa corporal" | Baja | Alta | Media | **Alta** | Ninguna |
| `calc-edad` | Calculadora de edad | "calculadora de edad" | "cuántos años tengo" | Baja | Alta | Baja-Media | ✅ Construida (Ronda 3) | Ninguna |
| `calc-prestamo` | Calculadora de préstamo/cuota | "calculadora de préstamo" | "simulador de crédito" | Media | Alta | Alta (CPM financiero suele ser mayor) | **Alta** | Ninguna (matemática pura) |
| `calc-propinas` | Calculadora de propina | "calculadora de propina" | "split de cuenta" | Baja | Media | Baja-Media | Media | Ninguna |
| `calc-descuento` | Calculadora de descuentos | "calculadora de descuento" | "precio con descuento" | Baja | Media | Media | ✅ Construida | Ninguna |
| `calc-fecha` | Calculadora de diferencia entre fechas | "calculadora de fechas" | "días entre fechas" | Baja | Media | Baja-Media | ✅ Construida (Ronda 3) | Ninguna |
| `calc-interes-compuesto` | Calculadora de interés compuesto | "calculadora interés compuesto" | "simulador de inversión" | Media | Media (audiencia con intención financiera) | Alta | Media-Alta | Ninguna |
| `calc-calorias` | Calculadora de calorías diarias | "calculadora de calorías" | "calorías diarias necesarias" | Baja | Alta | Media | Alta | Ninguna |
| `calc-huso-horario` | Conversor de husos horarios | "conversor de zona horaria" | "hora en otro país" | Media | Alta | Media | Media-Alta | `Intl.DateTimeFormat` nativo |
| `calc-vacaciones` | Calculadora de días de vacaciones/laborables | "calculadora días laborables" | "días hábiles entre fechas" | Media | Media | Baja-Media | Media | Ninguna |

## Convertidores (coming-soon)

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `conv-unidades` | Convertidor de unidades (longitud, peso, volumen) | "convertidor de unidades" | "kg a lb", "km a millas" | Baja | Alta | Media | ✅ Construida | Ninguna |
| `conv-moneda` | Convertidor de moneda | "convertidor de moneda" | "dólar a peso hoy" | Media | Alta | Alta | ✅ Construida — vía `api.frankfurter.app` (gratis, sin key, ~30 monedas; no cubre COP/ARS/CLP/PEN, se documentó la limitación en vez de inventar cobertura) | `api.frankfurter.app` |
| `conv-temperatura` | Convertidor de temperatura | "convertidor de temperatura" | "celsius a fahrenheit" | Baja | Alta | Baja-Media | ✅ Construida | Ninguna |
| `conv-texto-mayusculas` | Convertidor de texto a mayúsculas/minúsculas | "texto a mayúsculas online" | "convertir mayúsculas" | Baja | Media | Baja | Media | Ninguna |
| `conv-velocidad` | Convertidor de velocidad | "convertidor de velocidad" | "km/h a mph" | Baja | Baja-Media | Baja | Baja | Ninguna |
| `conv-numeros-romanos` | Convertidor de números romanos | "números romanos online" | "convertir a números romanos" | Baja | Media (tráfico escolar estable) | Baja | Media | Ninguna |

## Texto (coming-soon)

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `texto-contador-palabras` | Contador de palabras y caracteres | "contador de palabras" | "contar caracteres online" | Baja | Alta (estudiantes, redactores, SEO) | Media | **Alta** | Ninguna |
| `texto-generador-contraseñas` | Generador de contraseñas seguras | "generador de contraseñas" | "crear contraseña segura" | Baja | Alta | Media-Alta | ✅ Construida — usa `crypto.getRandomValues` | Ninguna |
| `texto-lorem-ipsum` | Generador de Lorem Ipsum | "generador de lorem ipsum" | "texto de relleno" | Baja | Media (audiencia developer/diseño, nicho) | Baja | ✅ Construida | Ninguna |
| `texto-eliminar-duplicados` | Eliminar líneas duplicadas | "eliminar líneas duplicadas" | "quitar duplicados de texto" | Baja | Media (nicho developer/datos) | Baja | Baja-Media | Ninguna |
| `texto-diff` | Comparador de texto (diff) | "comparar dos textos online" | "diff de texto" | Media | Media (nicho developer) | Baja-Media | Media | Ninguna, pero UI de diff requiere cuidado |
| `texto-a-voz` | Texto a voz | "texto a voz online" | "text to speech gratis" | Media | Alta | Media | Media-Alta | Web Speech API (nativa del navegador, sin costo) |
| `texto-tiempo-lectura` | Calculadora de tiempo de lectura | "calculadora tiempo de lectura" | "cuánto se tarda en leer un texto" | Baja | Media (nicho blogueros/creadores) | Baja-Media | Media | Ninguna |
| `texto-mayuscula-inicial` | Corrector de mayúsculas iniciales (Title Case) | "convertir a title case" | "poner mayúscula inicial online" | Baja | Media | Baja | Media | Ninguna |

## Productividad (categoría activa — 4 construidas)

| Slug propuesto | Nombre | Keyword principal | Keywords secundarias | Dificultad | Utilidad | Monetización | Prioridad | Dependencia técnica |
|---|---|---|---|---|---|---|---|---|
| `prod-temporizador` | Temporizador Pomodoro online | "temporizador pomodoro" | "pomodoro timer online" | Baja | Alta (nicho de estudiantes/productividad muy activo) | Media | ✅ Construida (`productividad-temporizador`) | Ninguna |
| `prod-cronometro` | Cronómetro online | "cronómetro online" | "stopwatch online" | Baja | Media | Baja-Media | ✅ Construida (`productividad-cronometro`) | Ninguna |
| — | Sorteador de nombres | "sorteador de nombres" | "random name picker" | Baja | Media-Alta (giveaways, sorteos, clase) | Media | ✅ Construida (`productividad-sorteador`, no estaba en el roadmap original) | Ninguna |
| — | Generador de equipos aleatorios | "generador de equipos aleatorios" | "team randomizer" | Baja | Media (deportes, dinámicas de grupo) | Media | ✅ Construida (`productividad-generador-equipos`, no estaba en el roadmap original) | Ninguna |
| `prod-notas-rapidas` | Notas rápidas sin registro (guardadas en el navegador) | "notas rápidas online" | "bloc de notas online" | Baja | Media | Baja-Media | Media | `localStorage` (sin backend) |
| `prod-lista-tareas` | Lista de tareas simple (sin cuenta) | "lista de tareas online" | "to do list gratis sin registro" | Baja | Media-Alta | Media | Media-Alta | `localStorage` (sin backend) |
| `prod-generador-codigo-barras` | Generador de código de barras | "generador de código de barras" | "crear código de barras online" | Baja | Media (nicho negocios/inventario) | Media | Media | Librería de barcode (ej. `jsbarcode`) — mismo espíritu que el motor QR actual |

## Desarrolladores (activa — 10 construidas)

No estaba contemplada en la versión original de este roadmap; se identificó
durante la Ronda 2 como una categoría de alto encaje con el patrón
"100% client-side + APIs nativas del navegador" que ya define el resto del
producto, y con audiencia (developers) que suele tener mayor CPM
publicitario que utilidades genéricas.

| Herramienta | Keyword principal | Prioridad | Dependencia técnica |
|---|---|---|---|
| Formateador de JSON | "json formatter online" | ✅ Construida | Ninguna (`JSON.parse`/`stringify`) |
| Base64 encode/decode | "base64 encode decode online" | ✅ Construida | Ninguna (`btoa`/`atob`) |
| URL encode/decode | "url encoder decoder" | ✅ Construida | Ninguna (`encodeURIComponent`) |
| Generador de UUID | "uuid generator online" | ✅ Construida | Ninguna (`crypto.randomUUID`) |
| Generador de hash (SHA-1/256/384/512) | "sha256 online" | ✅ Construida | Ninguna (`crypto.subtle.digest`; MD5 excluido a propósito, ver `PRODUCT-ROADMAP.md`) |
| Probador de regex | "regex tester online" | ✅ Construida | Ninguna (con tope de tamaño/coincidencias por ReDoS) |
| Convertidor de timestamp Unix | "unix timestamp converter" | ✅ Construida | Ninguna |
| Escapar/desescapar HTML | "html escape online" | ✅ Construida | Ninguna |
| Convertidor de color (HEX/RGB/HSL) | "hex to rgb", "color picker online" | ✅ Construida (Ronda 3) | Ninguna |
| Convertidor CSV ↔ JSON | "csv to json online" | ✅ Construida (Ronda 3) | Ninguna (parser CSV propio) |

Candidatas naturales para una próxima ronda en esta categoría (no
construidas todavía): comparador de JSON (diff), generador de contraseñas
específico para desarrolladores (.env), formateador de CSS/SQL, generador
de Cron expressions. Ninguna se construyó en esta ronda para no diluir
calidad con cantidad — quedan como propuestas, no compromisos.

---

## Primer lote — ✅ construido (Ronda 1)

Del lote original recomendado, estas 9 ya están activas en producción:
`imagen-comprimir`, `imagen-convertir`, `pdf-unir`, `pdf-dividir`,
`calc-porcentaje`, `calc-imc`, `conv-unidades`, `texto-contador-palabras`,
`pdf-a-jpg` / `jpg-a-pdf`. Esto ya abrió las 5 categorías que estaban
"Próximamente" (PDF, Imágenes, Calculadoras, Convertidores, Texto) con
contenido real cada una.

## Segundo lote — ✅ construido (Ronda 2)

De las "próximas 10 recomendadas" que seguían: `texto-generador-contraseñas`,
`qr-lector` y `prod-temporizador` (como `productividad-temporizador`) están
construidas. `pdf-organizar`, `pdf-numerar`, `calc-calorias`,
`calc-huso-horario`, `conv-numeros-romanos`, `imagen-redimensionar` e
`imagen-recortar` **no** se construyeron en esta ronda — se priorizó en su
lugar completar Calculadoras/Convertidores/Texto/Productividad y abrir la
categoría Desarrolladores completa (ver arriba), por mejor encaje con
"¿por qué alguien buscaría esto en Google / por qué Herramio y no otra
página?". Todas las categorías del catálogo (8) están activas hoy — ya no
queda ninguna en `"coming-soon"`.

## Próximas 10 recomendadas (Ronda 3)

Con dos lotes resueltos, este es el siguiente grupo priorizado por la
misma lógica (dificultad baja + utilidad alta + sin dependencias externas
inciertas), combinando lo que quedó pendiente de rondas anteriores con
nuevas candidatas de Desarrolladores:

1. **`pdf-organizar`** — Reordenar páginas de PDF (pendiente de Ronda 2)
2. **`pdf-numerar`** — Añadir números de página a PDF (pendiente de Ronda 2)
3. **`imagen-redimensionar`** — Redimensionar imagen (pendiente de Ronda 2)
4. **`imagen-recortar`** — Recortar imagen (pendiente de Ronda 2)
5. **`calc-calorias`** — Calculadora de calorías diarias (pendiente de Ronda 2)
6. **`calc-huso-horario`** — Conversor de husos horarios (pendiente de Ronda 2)
7. **`calc-prestamo`** — Calculadora de préstamo/cuota (CPM financiero alto)
8. **`conv-numeros-romanos`** — Convertidor de números romanos (pendiente de Ronda 2)
9. **`dev-json-diff`** — Comparador de JSON (diff) — nicho developer, complementa el formateador ya activo
10. **`dev-color-picker`** — Conversor de color HEX↔RGB↔HSL — nicho developer/diseño, dificultad baja

## Nota sobre `qr-lector` (lector de QR)

Vale la pena mencionar aparte: es la única herramienta que **no** requiere
abrir una categoría nueva (vive dentro de "QR", ya activa) y tiene sinergia
directa con las 13 herramientas existentes vía interlinking. Candidata
fuerte para ir junto con, o incluso antes que, el primer lote de PDF.
