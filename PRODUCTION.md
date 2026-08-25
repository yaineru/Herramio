# Producción — arquitectura, despliegue y estado real

Este documento es la referencia técnica para operar Herramio en
producción. Para el negocio/pricing ver `MONETIZATION.md`; para el motor
de análisis de originalidad ver `ORIGINALITY.md`. Aquí: qué es real, qué
está verificado, y qué bloquea (o no) el lanzamiento.

## Arquitectura (resumen)

Next.js 16 (App Router) + Supabase (Postgres, Auth, Storage) + Vercel.
Todas las páginas de herramientas son Server Components (0 páginas
`"use client"` en `src/app` — confirmado por auditoría); los widgets
interactivos son Client Components importados dentro de esas páginas. Las
129 herramientas comparten una sola capa (`ToolPageShell` — adopción
100%, confirmada por auditoría: `grep -rl ToolPageShell src/app | wc -l`
= 129), así que cambios de layout/estados/breadcrumbs/anuncios se hacen
en un solo lugar, no en 129 páginas.

## Migraciones — estado real (verificado por REST, no asumido)

| Migración | Contenido | Estado |
|---|---|---|
| `0001_init.sql` | Esquema base: perfiles, planes, workspaces, suscripciones, uso, favoritos, invitaciones, webhooks | ✅ Aplicada |
| `0002_seed_plans.sql` | Filas iniciales de planes | ✅ Aplicada |
| `0003_pricing_and_entitlements_rework.sql` | Precios mensual/anual, metadata jsonb, ids de precio por intervalo | ✅ Aplicada |
| `0004_rate_limiting.sql` | Rate limiting de auth (signup/login/reset) | ✅ Aplicada y **probada en vivo** (ver Seguridad) |
| `0005_originality_analysis.sql` | 7 tablas + bucket de Originalidad | ✅ Aplicada y **probada en vivo end-to-end** |
| `0006_reference_verification.sql` | Columnas de verificación de referencias vía Crossref | ✅ Aplicada (confirmado por REST) |
| `0007_semantic_embeddings.sql` | pgvector + tabla de embeddings + búsqueda semántica + columnas de costo | ✅ **Aplicada y verificada contra la base real** — ver "Verificación de 0007" abajo. No cambia el comportamiento: sin proveedor de embeddings, el pipeline funciona igual que antes. |

Ninguna migración ya aplicada fue editada después del hecho — cada cambio
de esquema posterior es un archivo nuevo, nunca una reescritura de uno ya
corrido contra la base real (regla seguida estrictamente durante todo el
proyecto, incluso cuando se descubrió a mitad de sesión que 0001/0002 ya
habían sido aplicadas).

## Seguridad — probada con ataques reales, no solo revisada en código

Cada uno de estos se ejecutó contra el proyecto Supabase real esta sesión,
usando usuarios de prueba reales creados y luego eliminados (nunca quedó
data de prueba en producción):

| Ataque intentado | Resultado |
|---|---|
| `INSERT` en `subscriptions` para auto-asignarse plan Pro | ❌ Rechazado — `42501 row-level security policy` |
| `PATCH` en `plans` para cambiar el precio como usuario autenticado no-admin | ❌ Bloqueado (verificado releyendo la fila — un `204`/`200` de PostgREST no es prueba de éxito por sí solo, ver nota abajo) |
| Leer el `profiles` de otro usuario real por su id | ❌ Vacío — RLS filtra correctamente |
| `increment_tool_usage()` con un `owner_id` ajeno | ❌ `not authorized` — el chequeo interno de la función funciona |
| Subir un archivo dentro de la carpeta de storage de otro usuario | ❌ `403 row-level security policy` |
| Listar la carpeta de storage de otro usuario | ❌ Lista vacía |
| Abrir `/originalidad/{id}` de un documento ajeno, autenticado como otro usuario | ❌ `404` real (confirmado por el código de estado HTTP de la navegación, no solo por el texto de la página) |
| Llamar `check_and_record_rate_limit()` directamente como usuario autenticado (para neutralizar su propio límite) | ❌ `42501 permission denied` — el `revoke execute` de la migración funciona |
| Ejecutable renombrado a `.pdf` (magic-byte spoofing) | ❌ Rechazado por `hasExpectedMagicBytes()` (test de regresión incluido) |
| Nombre de archivo con `../../etc/passwd` | ❌ Saneado antes de construir la ruta de storage (test de regresión incluido) |

**Nota metodológica importante, encontrada durante esta auditoría**:
PostgREST devuelve `204`/`200` en un `PATCH`/`INSERT` bloqueado por RLS sin
filas afectadas — un código de éxito HTTP **no** es evidencia de que la
escritura ocurrió. Cada prueba de arriba se verificó releyendo el dato
real, no confiando en el código de estado.

**No probado todavía** (requeriría credenciales que no existen): ataques
contra el checkout/webhook de Mercado Pago o Stripe (no hay cuenta activa
en ninguno).

## Verificación de 0007 (pgvector) contra la base real

No "debería estar aplicada" — comprobado consultando el proyecto real:

| Elemento | Resultado |
|---|---|
| Tabla `document_chunk_embeddings` | ✅ existe y responde |
| Columnas de costo en `originality_reports` (`embeddings_generated`, `source_queries_run`, `processing_ms`) | ✅ existen |
| Función `match_document_chunks(...)` | ✅ existe y es invocable (HTTP 200) |
| Contrato de dimensión 1536 | ✅ **impuesto por la base**: insertar un vector de 3 dimensiones devuelve `22000: expected 1536 dimensions, not 3` |

### Aislamiento vectorial A/B — probado con usuarios y embeddings reales

Se sembraron dos usuarios reales, cada uno con documento, chunk y fila de
embedding real, usando **vectores idénticos entre ambos** — el escenario
donde una fuga sería máximamente probable. Cada usuario buscó excluyendo
su propio documento, de modo que cualquier fila devuelta solo podría ser
del otro.

| Ataque | Resultado |
|---|---|
| A busca vía `match_document_chunks` (su doc excluido) | `[]` — **no** devolvió el chunk de B |
| B busca vía `match_document_chunks` (su doc excluido) | `[]` — **no** devolvió el chunk de A |
| A lee directamente la fila de embedding de B | `[]` |
| A lee directamente el texto del chunk de B | `[]` |
| A inserta un embedding sobre el chunk de B | `403` — `42501 row-level security policy` |
| A borra el embedding de B | `204`, pero **la fila sigue existiendo** (verificado releyendo con service role) |

Ese último caso es la razón por la que estas pruebas releen el dato:
PostgREST devuelve `204` en un DELETE bloqueado por RLS sin filas
afectadas, así que el código de estado por sí solo no prueba nada.

Todos los datos de prueba (usuarios, documentos, chunks, embeddings)
fueron eliminados y se verificó que la base quedó vacía.

## Storage

Bucket `originality-documents`: **privado** (`public: false`, confirmado
vía la API de Storage). Políticas RLS sobre `storage.objects` restringen
lectura/escritura/borrado al prefijo `{auth.uid()}/...` propio — probado
con un intento real de subir y listar la carpeta de otro usuario (ver
tabla de arriba).

## Vercel — probado con despliegues reales, no solo asumido

Esta era la advertencia repetida en sesiones anteriores: *"pdfjs-dist bajo
el output file tracing serverless de Vercel es la única pieza sin
verificar fuera de este entorno."* Se verificó — y **la advertencia
estaba justificada**: se encontró un bug real que rompía la extracción de
PDF en producción, invisible en local.

**Cómo se probó**: se hicieron despliegues Preview reales
(`vercel deploy`, no producción) contra el proyecto Vercel ya conectado, y
se accedió a ellos mediante `vercel curl` (bypassa la protección SSO de
los Preview Deployments de forma autenticada, sin exponer nada
públicamente). Se confirmó primero que páginas normales cargan
correctamente y leen datos reales de Supabase (`/precios` devolvió los
precios reales `399`/`999`/`2999` centavos, no datos de prueba).

**El bug real, encontrado y corregido**:

1. La extracción de PDF (`pdfjs-dist` importado directamente) fallaba en
   Vercel con `ReferenceError: DOMMatrix is not defined` — un global de
   navegador que pdfjs-dist necesita internamente incluso para extracción
   de texto pura, ausente en el runtime Node de Vercel. **Nunca apareció
   en local** porque el entorno de desarrollo local resulta compatible por
   razones no relacionadas con el código del proyecto.
2. Cambiar a `pdf-parse` (que resuelve `DOMMatrix` vía `@napi-rs/canvas`,
   un binario nativo) solo cambió el síntoma: `Cannot find module
   '@napi-rs/canvas'` — el rastreo de archivos de Next.js/Turbopack no
   incluía el binario nativo anidado dos niveles dentro de
   `node_modules/pdf-parse/node_modules/`.
3. Después de marcar los paquetes como `serverExternalPackages` (para que
   Next.js no intente empaquetarlos) y agregar
   `outputFileTracingIncludes` explícito para el binario nativo de
   `@napi-rs/canvas` **y** el archivo `pdf.worker.mjs` de su copia anidada
   de `pdfjs-dist` (otro archivo que el rastreo se perdía), la extracción
   funcionó correctamente — confirmado con un endpoint de diagnóstico
   temporal que generó un PDF real en memoria, lo subió al mismo
   despliegue Preview, y devolvió el texto extraído correctamente:
   `{"ok":true,"pages":["Vercel diagnostic: Herramio Originalidad extraction works."]}`.
   El endpoint de diagnóstico se eliminó inmediatamente después — nunca
   estuvo pensado para quedarse.

La configuración final vive en `next.config.ts` (`serverExternalPackages`
+ `outputFileTracingIncludes`), aplicada de forma amplia (`"/**"`, no solo
a la ruta de originalidad) para que una futura ruta que también use
extracción de PDF no vuelva a caer en el mismo problema silenciosamente.

**mammoth** (extracción de DOCX) se auditó por el mismo riesgo — sus
dependencias son 100% JavaScript puro, sin binarios nativos, así que no
comparte este problema.

**Lo que no se pudo probar todavía**: el flujo completo de subida de
archivo a través de la UI real desplegada (el navegador automatizado
disponible no puede manejar un `<input type="file">` real, y la
protección SSO de Preview Deployments impide navegación normal del
navegador — solo `vercel curl`, que no reproduce fácilmente un POST
multipart de Server Action). Lo que sí se verificó de forma real y
directa es exactamente la pieza que preocupaba: que la extracción de PDF
en sí funciona en el runtime real de Vercel.

## Rendimiento — hallazgos reales de la auditoría

- **0 páginas Client Component** en `src/app` (confirmado por grep) — el
  registro de 129 herramientas (`src/lib/tools/registry.ts`, ~1850
  líneas) se usa solo en Server Components, así que nunca se envía al
  navegador como JS. La preocupación de "no cargar las 129 herramientas
  en cada página" ya está resuelta por la arquitectura, no requirió
  ningún cambio.
- El pipeline de Originalidad corre dentro de la función serverless vía
  `after()` de Next.js (no bloquea la respuesta HTTP, no requiere una cola
  externa) — ver la limitación real documentada en `ORIGINALITY.md` sobre
  documentos grandes y el timeout de Vercel.
- No se auditó bundle size, Core Web Vitals reales, ni N+1 de base de
  datos en esta sesión más allá de lo anterior — **declarado
  explícitamente como no hecho**, no como "está bien".

## SEO

`robots.ts` excluye explícitamente: `/admin`, `/cuenta`, `/facturacion`,
`/auth/`, páginas de auth, y `/originalidad/` (los informes individuales
— privados). `/originalidad` (la landing) sí está en el sitemap. No se
auditaron Core Web Vitals ni metadata de cada una de las 129 páginas en
esta sesión.

## Variables de entorno

Ver `.env.example` para la lista completa con comentarios. Resumen por
dónde son necesarias (nunca se muestran valores):

| Variable | Development | Preview/Production | Notas |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | ✅ configurada | ✅ configurada (confirmado en Vercel) | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ configurada | ✅ configurada (confirmado en Vercel) | server-only |
| `BILLING_PROVIDER` | opcional (default `mercadopago`) | igual | |
| `MERCADOPAGO_ACCESS_TOKEN` / `_WEBHOOK_SECRET` | ⛔ vacía | ⛔ vacía | **Fase final del proyecto, deliberadamente** — ver abajo |
| `STRIPE_SECRET_KEY` / `_WEBHOOK_SECRET` | ⛔ vacía | ⛔ vacía | Alternativa futura, no es el default |
| `ADMIN_EMAILS` | opcional | ⛔ vacía en Vercel | Sin esto, `/admin` es inaccesible para todos (falla cerrado, correcto) |
| `NEXT_PUBLIC_ADS_ENABLED` / AdSense | según `MONETIZATION.md` | igual | |

Ninguna variable nueva es necesaria para Originalidad (Crossref no usa
API key).

## Backups de Supabase

**No verificado en esta sesión** — la política de backups (frecuencia,
retención, point-in-time recovery) depende del plan de Supabase
contratado, algo que debes confirmar directamente en el Dashboard
(Settings → Database → Backups). No se ejecutó ningún cambio destructivo
sobre la base real durante este trabajo; toda prueba con datos reales fue
creada y eliminada dentro de la misma sesión.

## Retención de datos (Originalidad)

Diseño actual: un documento eliminado por su dueño (`deleteDocumentAction`)
borra el archivo de storage y la fila de `documents`, que en cascada borra
chunks/citas/referencias/coincidencias/informe — no queda nada huérfano.
**No implementado**: limpieza automática de documentos atascados en
`processing`/`analyzing` (si el proceso en `after()` muriera a mitad de
camino sin llegar al `catch`, algo no observado en las pruebas de esta
sesión pero tampoco descartable en producción). Si eso llega a pasar, hoy
requeriría una corrección manual vía SQL; una limpieza automática (ej. un
cron que marque como `failed` cualquier documento con más de N horas en
un estado no terminal) es la mejora obvia si se observa en producción.

## Mercado Pago — decisión explícita: última fase

**Los cobros NO forman parte del camino crítico.** Es una decisión de
producto tomada a propósito, no una tarea olvidada ni un bloqueo.

Orden de prioridad acordado:

1. Design system + UX de producto
2. Originalidad 2.0
3. Seguridad / rendimiento / fiabilidad
4. Vercel + endurecimiento de producción
5. Beta real
6. Observabilidad + métricas
7. **Mercado Pago**
8. Producción de cobros

Toda la arquitectura de billing (`BillingProvider`, entitlements, planes,
paywall, checkout, webhooks, mocks, tests) **ya existe y está probada con
mocks**. Nada del producto depende de ella para funcionar: un usuario
puede registrarse, usar las 129 herramientas, guardar favoritos, y
analizar documentos en Originalidad sin que exista ninguna cuenta de
pagos.

Cuando llegue esa fase, lo que hará falta configurar está en
`MONETIZATION.md` ("Cómo probar pagos en modo test"): cuenta, credenciales
de prueba, planes en el proveedor, URL de webhook, y el paso a
credenciales de producción.

## Checklist de lanzamiento

### CRÍTICO (bloquea producción)
- Ninguno identificado para las funciones ya construidas (auth, planes,
  favoritos, `/admin`, Originalidad sin Mercado Pago) — todas verificadas
  en vivo esta sesión.
- Cobros reales: bloqueados por falta de cuenta de Mercado Pago/Stripe —
  **esto es esperado, no un defecto**.

### IMPORTANTE (antes de escalar)
- Verificar la política de backups de Supabase directamente en el
  Dashboard.
- Probar el flujo de subida real (multipart) contra un despliegue de
  Vercel sin protección — lo verificado esta sesión fue la extracción de
  PDF en sí (la pieza que realmente preocupaba), no el POST de subida
  completo, porque la protección SSO de Preview Deployments bloqueó la
  navegación normal del navegador automatizado.
- Limpieza automática de documentos atascados (ver arriba) si el volumen
  real lo justifica.
- Rate limiting solo cubre auth — no hay límite de requests para las 129
  herramientas (deliberado, no tienen costo de servidor real que proteger
  — ver `MONETIZATION.md`).

### OPCIONAL (mejoras futuras, no bloquean nada)
- Búsqueda semántica / embeddings, búsqueda web externa, análisis de
  escritura por IA en Originalidad — arquitectura lista
  (`src/lib/originality/providers.ts`), sin proveedor configurado, ver
  `ORIGINALITY.md` para exactamente qué se necesita activar cada uno.
- Rediseño visual completo / design system formal — no ejecutado esta
  sesión (ver razones en el informe de esta fase).
