# Herramio — AdSense readiness

Medido con `scripts/content-audit.mjs`, que rastrea el sitemap de producción
(168 URLs) y analiza solo la región `<main>`. Contar el navbar y el pie haría
que toda página pareciera sustanciosa y ocultaría justo lo que hay que
encontrar.

**No se afirma en ningún punto que Google vaya a aprobar la cuenta.** Nadie
puede garantizar eso. El objetivo es que el sitio merezca aprobarse.

---

## Causa exacta del rechazo

**Desconocida.** No tengo acceso a la cuenta de AdSense ni al correo de Google;
el mensaje visible es el genérico que reciben todos. Si en AdSense → Sitios
aparece un motivo concreto o un *policy issue*, cambia las prioridades de este
documento.

Todo lo de abajo está clasificado por evidencia obtenida del propio sitio.

---

## Lo que NO estaba mal

Conviene decirlo porque contradice las suposiciones habituales y evita
"arreglar" lo que ya funcionaba:

| Señal | Medición |
|---|---|
| Títulos duplicados | 0 |
| Descripciones duplicadas | 0 |
| Canonicals faltantes | 0 |
| Páginas sin H1 único | 0 |
| Rutas privadas indexables | 0 |
| `noindex` accidental en contenido público | 0 |
| Claims prohibidas ("100 % preciso", "mejor que…") | 0 |
| Descargas engañosas, redirecciones forzadas | 0 |

Ejes SEO **19.7/20** y confianza **20/20** desde la primera auditoría.

---

## Problemas encontrados y corregidos

### 1. Páginas que parecían plantilla — ALTA

**Evidencia**: las 8 páginas de categoría solapaban **63–85 %** con
`/herramientas` (shingles de 5 palabras). Cada una era la misma rejilla de
herramientas, un párrafo, y dos preguntas FAQ **con texto idéntico** en las ocho
cambiando solo el nombre de la categoría.

**Corrección**: cada categoría responde ahora la pregunta con la que se llega
—"sé cuál es mi problema, no cuál de 23 herramientas lo resuelve"— mediante una
tabla tarea → herramienta, sus propias limitaciones honestas y preguntas
propias. Los enlaces internos salen de navegación útil, no espolvoreados.

**Verificación**:

| Página | Antes | Después |
|---|---|---|
| `/categoria/imagenes` | 0.85 | 0.57 |
| `/categoria/pdf` | 0.82 | 0.53 |
| `/categoria/qr` | 0.73 | 0.39 |
| `/categoria/texto` | 0.67 | 0.32 |

**Cero páginas por encima del umbral de casi-duplicado** (antes 8).

### 2. Contenido insuficiente en páginas clave — ALTA

| Página | Antes | Después |
|---|---|---|
| `/contacto` | 28 palabras | 264 |
| `/originalidad` (visitante anónimo) | 146 palabras, 1 h2 | 617, 6 h2 |
| `/precios` | 89 palabras | + 5 preguntas reales |

`/originalidad` es el producto insignia y mostraba menos texto que un conversor
de unidades, porque todo lo sustancial estaba tras el login — que es
exactamente lo que un revisor no ve.

**Ninguna página se rellenó para alcanzar un número de palabras.**

### 3. Sitio con un canal de contacto falso — ALTA

**Evidencia**: `/contacto` construía un enlace `mailto:` a `hola@herramio.com`.
**Ese buzón no existe.** Todo mensaje enviado se perdía, y al visitante se le
mostraba su cliente de correo abriéndose como si hubiera funcionado.

El mismo correo se enviaba además a Crossref como contacto del *polite pool*,
donde derrotaba su propósito entero: Crossref lo guarda para poder avisarnos, y
le estábamos dando un sitio incapaz de recibir correo.

**Corrección**: sistema real. El mensaje se guarda en Postgres y se gestiona en
`/admin` con estados (nuevo / revisado / resuelto / archivado). No se publica
ninguna dirección de correo, porque no hay ninguna que podamos garantizar.

**Verificación** (`scripts/verify-contact-security.mjs`, 15 comprobaciones
contra la base real):

- Sin política de lectura: **nadie** lee estas filas por RLS, ni las propias.
- Escritura anónima directa a la API rechazada (42501) — todo pasa por la
  Server Action, donde viven validación y rate limit.
- Nadie puede modificar ni borrar. Comprobado **releyendo con service role**,
  porque el PATCH respondía 204 en cualquier caso.
- «Tu mensaje fue enviado» solo aparece tras releer la fila insertada, y en
  ningún punto se dice que se haya enviado un correo, porque no se envía.

En producción: 0 apariciones de `hola@herramio.com`, 0 enlaces `mailto:`.

---

### 4. `/generador-qr` — la página más débil que quedaba

**Evidencia**: 241 palabras y **cero enlaces internos** en su propio
contenido, siendo una de las páginas más importantes del sitio. Tres de sus
cuatro preguntas FAQ eran las genéricas que aparecen en todas partes
(«¿necesito una cuenta?»). Es una página propia, no construida sobre
`ToolPageShell`, y por eso nunca heredó herramientas relacionadas ni FAQ
específica — las 129 herramientas del registro sí las tienen.

**Corrección**: responde las dos preguntas con las que se llega —qué tipo de
código necesito y de qué tamaño lo imprimo—. La lista de tipos hace además de
navegación real hacia las 14 páginas QR dedicadas. FAQ específica: tamaño de
impresión (1 cm por cada 10 cm de distancia), por qué estos códigos no se
pueden reapuntar tras imprimirlos, por qué un QR de WiFi falla en algunos
teléfonos, PNG frente a SVG.

**Verificación**: 241 → **738 palabras**, 0 → **12 enlaces internos**, 5 h2 +
5 h3, schema `HowTo` presente. Sale por completo de las 15 páginas más débiles.

---

## Estado actual (producción)

Desplegado el **2026-09-04** · commit **`8606172`**

| Métrica | Valor |
|---|---|
| Score global | **89.1 / 100** |
| Contenido | 16.2 / 20 |
| SEO | 19.7 / 20 |
| Navegación | 13.3 / 20 |
| Confianza | 20 / 20 |
| UX | 20 / 20 |
| Duplicación media | 0.2 |
| Páginas casi duplicadas | **0** |
| Mediana de palabras en `<main>` | 276 |

### Contacto verificado de extremo a extremo en producción

Mensaje enviado desde el formulario real en herramio.com, comprobado en la base
de datos (`topic`, `status=new`, `page_path=/contacto`, anónimo) y fixture
eliminado. Sin residuos: 0 filas de contacto, 0 documentos, 0 usuarios de
prueba.

---

## Lo que sigue flojo

Honestamente, y sin intención de arreglarlo solo para AdSense:

1. **Navegación (13.3/20)** — es el eje más bajo. Las páginas informativas
   (`/cookies`, `/terminos`, `/sobre-nosotros`) enlazan poco desde su propio
   contenido; dependen del pie de página.
2. **Blog** — 7 artículos de 200–400 palabras. Correctos, cortos.
3. **`/sobre-nosotros` y `/cookies`** — 179 y 161 palabras. Son páginas de
   trámite; no se inflaron a propósito.
4. **Páginas de herramienta** — mediana de 276 palabras. No es alarmante, y
   inflar 129 páginas a 1000 palabras sería exactamente el relleno que hay que
   evitar.

---

## Anuncios

**Apagados**, y así deben seguir mientras la cuenta esté desaprobada. Cero
variables de AdSense en Vercel.

Cuando se activen: secciones de contenido de Home, páginas de categoría (entre
la guía y la rejilla) y artículos del blog. **Nunca** junto a botones de
descarga, ni en el área de resultado de una herramienta, ni entre subir →
procesar → descargar.

---

## Recomendación sobre volver a solicitar

Los cambios ya están **en producción**. Google necesita volver a rastrear antes
de que una nueva solicitud signifique algo.

1. Comprobar que el formulario de contacto funciona de extremo a extremo.
2. Dejar pasar 1–2 semanas para que Google recorra el sitio de nuevo.
3. Solicitar revisión.

Lo que se puede afirmar con evidencia: las tres cosas que estaban
objetivamente mal —categorías casi duplicadas, páginas finas y un canal de
contacto falso— ya no lo están.
