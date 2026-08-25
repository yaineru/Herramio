# Análisis de originalidad

Plataforma propia de análisis de integridad académica — inspirada
conceptualmente en herramientas como Turnitin, sin copiar su
implementación, marca, interfaz ni afirmar tener sus mismas fuentes. Todo
lo que hace este sistema es real y verificable en el código; lo que no
está configurado se etiqueta explícitamente como no disponible, nunca se
simula.

## Principio rector: honestidad del resultado

**Nunca** decimos "este documento tiene plagio" ni presentamos el
porcentaje como una verdad absoluta. El sistema usa **"índice de
similitud"**, siempre acompañado de: *"Un índice de similitud no
determina por sí solo la existencia de plagio. Requiere interpretación
humana."* — en la UI y en cada informe. Una cita correctamente atribuida
no cuenta como similitud preocupante. Una referencia no encontrada se
etiqueta "no detectada", nunca "falsa". Este principio no es solo texto:
está reflejado en el código (`computeReportScore` excluye coincidencias de
tipo `citation` del índice; `detectReferences`/`detectCitations` nunca
inventan un autor/año/título que no esté literalmente en el patrón
encontrado).

## Arquitectura del pipeline

```
Upload (Server Action, valida tipo/tamaño/límite de plan)
  ↓
Storage privado (Supabase Storage, bucket "originality-documents")
  ↓
after() de Next.js — corre tras responder, sin bloquear la petición
  ↓
Extracción de texto (server-side: pdfjs-dist para PDF, mammoth para DOCX)
  ↓
Normalización + Chunking (párrafos, ~220 palabras máx. por fragmento)
  ↓
Detección de citas y referencias (regex, no IA)
  ↓
Comparación contra el corpus interno disponible (tus documentos + los de
tu equipo, si aplica) — exact/near-exact matching (n-gram Jaccard)
  ↓
Cálculo del índice de similitud (fórmula transparente y reproducible)
  ↓
Reporte (Supabase) → UI
```

Todo el código vive en `src/lib/originality/`. Nada de esto usa IA
generativa ni servicios externos — es determinístico y gratis de operar.

## Tablas (migración `0005_originality_analysis.sql`)

| Tabla | Qué guarda |
|---|---|
| `documents` | Un archivo subido: dueño, workspace (si aplica), estado (`uploaded`→`processing`→`analyzing`→`completed`/`failed`), tamaño, páginas, palabras |
| `document_chunks` | Fragmentos de párrafo del texto extraído — texto original y normalizado |
| `citations` | Citas en el texto detectadas por patrón (APA/Vancouver/IEEE) — siempre "detected", nunca "verified" |
| `document_references` | Entradas de bibliografía detectadas — autor/año/título parseados *solo* cuando el patrón los captura con claridad; si no, quedan `null` |
| `document_sources` | Catálogo de fuentes externas — **existe pero está vacío** hasta que se configure un proveedor de búsqueda (ver abajo) |
| `similarity_matches` | Cada coincidencia encontrada: tipo (`exact`/`near_exact`/`semantic`/`citation`), score, contra qué documento u otra fuente |
| `originality_reports` | Un informe por documento: índice de similitud + desglose + `engine_version` |

RLS en las siete tablas: un usuario ve sus propios documentos y los de su
workspace (reutiliza `is_workspace_member()`, ya existente para Equipos);
nadie puede insertar/actualizar chunks, citas, referencias, coincidencias
ni reportes directamente — solo el pipeline (cliente de service role)
escribe esas tablas. **Probado con escrituras reales** (no solo leído en
el SQL): un usuario ajeno recibe un `404` real al intentar abrir
`/originalidad/{id}` de otro usuario (verificado en esta sesión creando
dos cuentas de prueba reales, subiendo un documento con una y
confirmando el bloqueo con la otra — luego eliminadas).

Storage: bucket `originality-documents`, **privado** (`public: false`),
con políticas RLS sobre `storage.objects` que solo permiten
leer/subir/borrar bajo el prefijo `{auth.uid()}/...` del propio usuario.
El archivo original nunca se expone por URL pública ni a miembros del
workspace directamente — solo el dueño puede acceder al archivo en sí; el
resto del equipo ve los resultados del análisis (chunks, coincidencias,
informe), no el binario.

## Algoritmo de similitud (real, sin IA)

`src/lib/originality/similarity.ts`:

- **Exacto**: el texto normalizado de dos fragmentos es idéntico → 100%.
- **Cercano**: el mayor de dos señales complementarias sobre n-gramas de
  **4 palabras**: Jaccard (parecido global) y *containment* (un texto
  contenido dentro del otro). Umbral: 50%.
- Por debajo del umbral: no se considera coincidencia (no se guarda una
  fila con score bajo "por si acaso").

### Calibración medida (`tests/unit/originality-golden-dataset.test.ts`)

Existe un dataset controlado — copia exacta, copia con una palabra
cambiada, copia con palabras insertadas, paráfrasis real, tema
relacionado escrito de forma independiente, y texto no relacionado — y
los tests afirman resultados **medidos**, no aspiraciones: si el
algoritmo cambia, fallan.

Dos correcciones reales que salieron de construir ese dataset:

1. **Fallo de recall**: insertar dos palabras en un pasaje copiado hacía
   que el motor lo perdiera por completo (medido: 0.448 con n-gramas de 5,
   por debajo del umbral) — justo la evasión más obvia. Medido a 3, 4 y 5
   palabras: los no-copiados puntúan **exactamente 0.000** en todos los
   tamaños, así que bajar a 4 mejora el recall (0.517) sin acercarse
   siquiera a un falso positivo.
2. **Caso real que Jaccard no cubría**: un párrafo copiado *dentro* de un
   párrafo más largo de escritura propia puntúa bajo en Jaccard por la
   diferencia de longitud, aunque sea copia literal. De ahí *containment*.
   Con un guardarraíl: containment solo cuenta si ambos fragmentos tienen
   ≥5 n-gramas, porque si no un encabezado de una palabra ("Introducción")
   puntuaría 1.00 contra cualquier documento que contenga esa palabra —
   una acusación fabricada a partir de un título. Ambos casos tienen test
   de regresión.

**Limitación afirmada explícitamente en el propio dataset**: el motor es
léxico y **no detecta paráfrasis** (mismo significado, palabras
distintas). Hay un test que lo comprueba a propósito, para que el producto
nunca pueda afirmar lo contrario sin que salte. Detectarlo requiere
embeddings semánticos, no configurados.

`src/lib/originality/report-score.ts`: el índice de similitud es
`(fragmentos con coincidencia exacta + fragmentos con coincidencia
cercana) / total de fragmentos` — cada fragmento cuenta como máximo una
vez (su mejor coincidencia), así que un párrafo que aparece en tres
fuentes no infla el índice. Las coincidencias de tipo `citation` **no**
suman al índice — una cita bien atribuida no es "similitud preocupante".

## Qué corpus se compara hoy (y por qué)

Auditado antes de construir nada: este proyecto **no tenía** ningún
proveedor de IA, de embeddings ni de búsqueda web configurado (confirmado
por grep en `package.json` y en todo `src/` — cero SDKs de OpenAI,
Anthropic, Cohere, ni de búsqueda). Sin uno de esos, el único corpus de
comparación honesto que existe es **tus propios documentos anteriores** (y
los de tu equipo, si el documento se subió en un workspace) — nunca
documentos de otros usuarios no relacionados. Esto es real, útil (detecta
reutilización propia entre entregas) y no requiere ninguna credencial
externa.

**Verificado en vivo**: subir el mismo documento dos veces produjo
correctamente un índice de similitud del 100% contra la primera subida.

## Extracción de texto — decisiones y limitaciones reales

- **PDF**: `pdf-parse` (`src/lib/originality/extract/pdf.ts`) — **no**
  `pdfjs-dist` directamente. La primera versión de este archivo importaba
  `pdfjs-dist` directamente y reconstruía saltos de línea a mano con una
  heurística de posición Y; funcionaba en local pero **falló en un
  despliegue Vercel real** con `DOMMatrix is not defined` (un global de
  navegador ausente en el runtime Node de Vercel). Se cambió a `pdf-parse`
  (que resuelve `DOMMatrix` vía `@napi-rs/canvas`, un binario nativo) y
  además se necesitó configurar `serverExternalPackages` +
  `outputFileTracingIncludes` en `next.config.ts` para que Vercel incluya
  el binario nativo y el worker de pdfjs-dist en el paquete desplegado —
  sin eso, el binario/worker no viajaban al servidor y la extracción
  fallaba igual con otro error. Todo esto se diagnosticó y confirmó
  corregido con despliegues Preview reales (`vercel deploy` +
  `vercel curl`), no en local — ver `PRODUCTION.md` para la cronología
  completa del bug. `pdf-parse` también reemplaza la reconstrucción manual
  de líneas/párrafos por sus propias opciones (`lineEnforce`,
  `lineThreshold`) — menos código propio, comportamiento más probado.
- **DOCX**: `mammoth` (`extract/docx.ts`) — extracción de texto plano,
  ignora estilos/imágenes. Sus dependencias son 100% JavaScript puro (sin
  binarios nativos, verificado), así que no comparte el riesgo de
  despliegue que tuvo el PDF. No probado con un `.docx` real todavía —
  declarado aquí explícitamente en vez de callarse.
- **TXT**: trivial, `Buffer.toString("utf-8")`.
- **PDF escaneado (sin capa de texto)**: se detecta (`isEmpty: true`) y el
  documento pasa a `failed` con un mensaje claro: *"...necesita OCR, que
  esta versión todavía no soporta."* Nunca se informa un 0% de similitud
  como si el documento sí se hubiera analizado.
- **Sí se probó en Vercel** — ver `PRODUCTION.md` para la verificación
  completa (homepage, `/precios` leyendo datos reales de Supabase, y
  extracción de PDF confirmada funcionando en el runtime real tras el fix
  de arriba). Lo único de Originalidad no probado contra el despliegue
  real es el flujo de subida completo vía la UI (bloqueado por la
  protección SSO de Preview Deployments frente al navegador automatizado
  disponible, no por el código).

## Procesamiento: sin cola de trabajos (por ahora)

El pipeline corre dentro de la función serverless usando `after()` de
Next.js (nativo, sin Redis/BullMQ/cola externa) — la respuesta al usuario
vuelve de inmediato tras subir el archivo, y el análisis corre después,
sin bloquear esa respuesta. Razonable mientras los documentos estén
acotados por `originality_max_file_size_mb` (5–20 MB según plan); si en el
futuro hace falta procesar documentos mucho más grandes o con mayor
volumen, una cola real (Vercel Cron + una tabla de jobs, o un servicio
dedicado) es el siguiente paso honesto — no construido ahora porque no
hace falta todavía.

## Límites por plan (`plans.metadata` — placeholders, no una decisión de negocio investigada)

```
Gratis:  3 análisis/mes, 5 MB máx.
Pro:     50 análisis/mes, 20 MB máx.
Equipo:  200 análisis/mes, 20 MB máx.
```

Números conservadores puestos para que el sistema de límites tenga algo
real que aplicar — cámbialos con un `UPDATE` en `plans`, igual que
`favorites_limit`:

```sql
update public.plans set metadata = metadata || '{"originality_analyses_per_month": 10}'::jsonb where id = 'free';
```

`checkUsageLimit()` (la misma función que ya gateaba favoritos) lee estos
valores — nunca hay un `if (plan === "pro")` en el código de límites.

## Seguridad de archivos

- **Nunca confía en la extensión ni en el `Content-Type` del navegador**:
  cada subida se valida contra los primeros bytes reales del archivo
  (`%PDF` para PDF, `PK` para DOCX/zip) — `src/lib/originality/validate.ts`,
  con tests que incluyen el ataque concreto que esto previene (un
  ejecutable renombrado a `.pdf`).
- Nombre de archivo saneado antes de construir la ruta de storage (sin
  `/`, `\`, ni caracteres fuera de un conjunto seguro) — previene path
  traversal.
- Nunca se ejecuta el archivo subido ni se interpreta su contenido más
  allá de extraer texto.
- Límite de tamaño aplicado *antes* de subir a storage (por plan).

## Verificación de referencias — real, gratuita, sin credencial (Crossref)

`src/lib/originality/providers/crossref.ts` — la única pieza del roadmap
de proveedores que **sí está activa** hoy, porque investigué primero
(no asumí) y confirmé que Crossref es genuinamente gratuito y sin cuenta:
su propia documentación dice explícitamente "no signup or registration is
required". Cada referencia detectada (hasta 15 por documento, en lotes de
3 para no saturar su API) se consulta contra su índice bibliográfico
público. `verified` = Crossref encontró un trabajo indexado con DOI que
coincide; `not_found` **nunca** significa "falsa" — el índice de Crossref
no es exhaustivo (libros, tesis, trabajo no anglófono suelen faltar). Solo
lee la respuesta JSON propia de Crossref — nunca sigue el DOI/URL que
devuelve para descargar contenido de terceros, así que no tiene la
superficie de SSRF que tendría un fetcher de URLs arbitrarias.
Migración `0006_reference_verification.sql` **ya aplicada**.

### El bug de deshonestidad que se encontró y corrigió aquí

Probando el pipeline completo contra Crossref real con referencias
**inventadas a propósito**, ambas volvieron marcadas `verified` con DOIs
de papers reales pero **completamente ajenos**. Es decir: el sistema
estaba validando citas falsas. Exactamente lo que este producto nunca
debe hacer.

Causa medida (no supuesta): `query.bibliographic` de Crossref **siempre**
devuelve su mejor coincidencia difusa, sin ningún umbral de calidad, y su
campo `score` es inservible como confianza — una consulta de puro sinsentido
puntuó **30.0** mientras un paper real puntuó **29.8**.

Corrección, en dos partes, ambas medidas contra la API real:

1. **Comparar el título devuelto con lo consultado**, con una métrica
   propia (solapamiento de palabras significativas). Sin esto no hay forma
   de distinguir un acierto de un disparate.
2. **Revisar 10 candidatos, no 1.** El primer resultado suele ser un
   trabajo derivado que comparte palabras: consultar el canónico
   "Attention Is All You Need" devolvía primero "Text-Guided Attention is
   All You Need for Zero-Shot Robustness…". Escaneando 10 y quedándose con
   el mejor título, aparece el paper real (similitud 1.00).

**Umbral deliberadamente alto (0.8)**, con una consecuencia honesta:
algunas referencias legítimas se reportan `not_found` (ejemplo medido: el
paper canónico de BERT). Es el intercambio correcto — una referencia real
marcada "no encontrada" no acusa a nadie de nada (la UI lo explica), pero
un "verificada" falso le daría credibilidad a una cita inventada, que es
precisamente el daño que esta función existe para evitar. Medido tras el
fix: 0 falsos positivos sobre referencias inventadas, 1 falso negativo
conocido.

## Grafo cita ↔ referencia

`src/lib/originality/citation-graph.ts` — cruza las citas del texto con
las entradas de la bibliografía por apellido + año, y reporta:

- **Citas huérfanas**: aparecen en el texto pero no hay referencia que
  coincida. Presentado como "revisa si falta en tu bibliografía", nunca
  como error confirmado (la detección automática también puede fallar).
- **Referencias no citadas**: están en la bibliografía pero no aparecen
  citadas. Presentado como nota neutra — es normal en listas de lectura
  recomendada.

Deliberadamente **no** cruza citas numéricas (`[12]`) con la bibliografía:
hacerlo por posición produce respuestas que parecen seguras y fallan a
menudo, y en una herramienta de autorrevisión un aviso equivocado es peor
que ningún aviso. Verificado end-to-end contra la base real: en un
documento de prueba con una cita enlazada, una huérfana y una referencia
no citada, el grafo identificó exactamente las tres.

## Coincidencias conscientes de la cita ("citation-aware")

Si un fragmento con coincidencia también contiene una cita detectada
(`citations.chunk_id`), la UI lo etiqueta **"Coincidencia atribuida"** en
vez de "Requiere revisión" — con un color neutro, no ámbar/rojo. Esto es
lógica pura sobre datos ya existentes (sin nueva tabla ni proveedor
externo): `src/components/originality/MatchesList.tsx` cruza
`similarity_matches.chunk_id` contra `citations.chunk_id`.

## Proveedores todavía no configurados — interfaces listas, nada fabricado

`src/lib/originality/providers.ts` define tres interfaces limpias
(`EmbeddingProvider`, `WebSearchProvider`, `AiAnalysisProvider`); las tres
funciones `get*Provider()` devuelven `null` hoy. Nada en el pipeline llama
a ninguna — implementarlas es agregar una clase que cumpla la interfaz,
nunca rediseñar el pipeline.

### Cómo activar similitud semántica

Requiere: una API key de un proveedor de embeddings (OpenAI, Cohere,
Voyage...) + una migración que agregue una columna `vector` (pgvector) a
`document_chunks` y un índice `ivfflat`/`hnsw`. **Investigado esta
sesión**: Supabase soporta la extensión `pgvector` de forma nativa
(`create extension vector`) — no hace falta infraestructura externa
cuando llegue el momento. Deliberadamente **no se activó la extensión
todavía**: el tamaño del vector depende del modelo de embeddings elegido,
así que agregar la columna antes de decidir el proveedor arriesgaría tener
que rehacer la migración. Sin esto, `semantic_ratio` en cada informe
siempre será `0` y la UI lo etiqueta "No disponible".

Para configurar el proveedor sin inventar credenciales, el proyecto acepta
estas variables en `.env.local` o en el entorno del despliegue:

```bash
EMBEDDING_PROVIDER=mock|openai|cohere|voyage
EMBEDDING_PROVIDER_API_KEY=
```

- `mock`: útil para pruebas locales y CI.
- `openai`, `cohere`, `voyage`: requieren la key real del proveedor y la
  implementación del adaptador correspondiente. Hasta que exista esa
  credencial, el sistema debe seguir en modo seguro y honesto: semantic
  analysis unavailable, no score inventado.

El adaptador actual es un punto de integración real y testeado en
`src/lib/originality/semantic/provider.ts`, pero el entorno de este repo
no incluye una credencial real; por eso permanece desactivado por
defecto y no se fabrica una métrica semántica que no exista.

### Cómo activar búsqueda de fuentes externas

Requiere: una API key de un proveedor de búsqueda pagado (los que se
investigaron —Bing/Google Custom Search/SerpAPI/Tavily/Exa— todos cobran
u obligan cuenta) **o** una API key gratuita de OpenAlex (250M+ trabajos
académicos, CC0) — **investigado esta sesión y descartado por ahora**:
OpenAlex empezó a exigir una cuenta/API key gratuita recientemente (antes
no la pedía), y crear esa cuenta es una decisión que te corresponde a ti,
no algo para hacer en tu nombre sin pedirlo. Sin ninguno de los dos,
`document_sources` permanece vacía y el informe dice explícitamente "No
se consultaron fuentes externas de internet (no configurado)".

### Cómo activar el indicador de escritura asistida por IA

Requiere: una API key de un LLM. Debe presentarse siempre como
probabilístico (`estimatedProbability` + `confidence`, nunca un veredicto)
— ver el comentario en `AiWritingAnalysisResult`. No implementado.

## Costos potenciales si se activan los proveedores de arriba

- **Embeddings**: costo por token procesado, proporcional a
  `word_count` de cada documento — mitigar con `originality_max_file_size_mb`
  y cacheando embeddings por chunk (no recalcular si el chunk no cambió).
- **Búsqueda web**: costo por consulta — el pipeline debe seleccionar
  fragmentos "informativos" (frases largas o poco comunes), no buscar
  cada oración, para mantener esto acotado.
- **Análisis de IA de escritura**: costo por documento (una llamada, no
  por fragmento).

Hoy: **costo marginal $0** por análisis — todo es CPU local (Node), sin
llamada a ningún proveedor externo.

## Variables de entorno

Ninguna nueva variable es necesaria para lo que está implementado hoy —
todo corre con las credenciales de Supabase que ya existían. Si se
activa un proveedor de embeddings/búsqueda/IA en el futuro, cada uno
necesitará su propia API key (`EMBEDDING_PROVIDER_API_KEY`,
`WEB_SEARCH_PROVIDER_API_KEY`, `AI_ANALYSIS_PROVIDER_API_KEY` — nombres
sugeridos, no configurados todavía).

## Analítica

`AnalyticsEvents`: `originalityViewed`, `documentUploadStarted`,
`documentUploaded`, `analysisStarted/Completed/Failed` (disparados
client-side sobre un cambio de estado *observado* por polling real del
documento — nunca antes de que el servidor lo haya registrado),
`reportViewed`, `sourceClicked`, `upgradeFromOriginality`.

## Métricas medidas (no estimadas)

`src/lib/originality/evaluation/` contiene el dataset dorado y el cálculo
real de precision/recall. `tests/unit/originality-evaluation.test.ts` lo
ejecuta contra el motor real en cada `npm test` e **imprime los números**,
para que no vivan solo en un documento que puede quedar desactualizado.

Medición actual sobre 10 casos controlados:

```
total=10  TP=6 FP=0 TN=4 FN=0  precision=100.0%  recall=100.0%  f1=100.0%
```

Cómo leerlo con honestidad: son 10 casos, no un benchmark académico. El
`100% recall` es **sobre los casos que un motor léxico debe detectar**; la
paráfrasis real está contada como negativo correcto porque el producto
**no afirma** detectarla. Hay un test dedicado que falla si eso cambia
silenciosamente en cualquier dirección.

El dataset encontró un bug real que los tests escritos a mano no cubrían:
**eliminar palabras** de un pasaje copiado lo hacía indetectable (recall
83%). Midiendo n-gramas de 3/4/5 sobre todos los casos, el tamaño 3
detecta los 6 casos de copia (el más bajo en 0.632) mientras los 4 casos
no-copia puntúan **exactamente 0.000** — separación total, sin fragilidad
de umbral. Ver el comentario en `similarity.ts` para por qué trigramas no
generan coincidencias incidentales (el umbral es una *proporción*, no un
conteo).

## Modelo de evidencia

`src/lib/originality/evidence.ts` mantiene cada señal separada y
explicable en vez de colapsarlas en un número opaco: `lexicalScore`,
`semanticScore` (null = no evaluado, nunca "sin parecido"), `isCited`,
`sourceConfidence`. `classifyMatch()` produce la clasificación **y la
explicación** que ve el usuario.

Regla de producto codificada y testeada: **la cita se comprueba primero**.
Un fragmento citado se clasifica como "Coincidencia atribuida" aunque
coincida palabra por palabra — citar no es copiar. Hay un test que
recorre todas las etiquetas y explicaciones y falla si alguna llegara a
contener la palabra "plagio".

## Regla anti-fabricación del proveedor semántico (bug real corregido)

`buildEmbeddingProviderFromEnv()` llegó a devolver un
`MockEmbeddingProvider` **etiquetado como proveedor real**
(`openai-text-embedding-3-small`, `cohere-embed-v3`, `voyage-3`) en
cuanto existiera cualquier API key. Es decir: sin llamar nunca a OpenAI,
habría mostrado similitud fabricada a alguien que está decidiendo si otra
persona plagió, y habría **persistido esos vectores falsos** en
`document_chunk_embeddings` bajo un nombre de modelo real — envenenando
el corpus para el día en que se conecte un adaptador auténtico.

Corregido, con dos garantías ahora testeadas:

1. **El mock nunca sustituye a un proveedor real.** Nombrar un proveedor
   sin adaptador implementado devuelve `null` y registra por qué; la UI
   dice "análisis semántico no disponible", que es la verdad.
2. **El mock nunca se activa en producción**, ni siquiera si se configura
   explícitamente — una variable de entorno perdida no puede encender
   análisis falso para usuarios reales.

Los adaptadores preparados (OpenAI/Cohere/Voyage) **lanzan excepción** en
vez de devolver vectores inventados. Están escritos, no conectados.

Estado exacto, sin ambigüedad:

| Componente | Estado |
|---|---|
| Abstracción de proveedor, batching, caché, versionado | **IMPLEMENTADO** |
| pgvector, tabla, índice HNSW, función de búsqueda | **IMPLEMENTADO Y VERIFICADO** en la base real |
| Aislamiento A/B de vectores | **VERIFICADO** con usuarios y embeddings reales |
| Adaptadores OpenAI / Cohere / Voyage | **PREPARADOS** (lanzan, no fabrican) |
| Embeddings reales generados alguna vez | **NO** — ninguno. Falta credencial |
| Similitud semántica en informes | **NO CONFIGURADA** — `semantic_ratio` sigue en 0 |

## Motor semántico — construido, sin proveedor conectado

Infraestructura completa y testeada, **inactiva** por ausencia de API key:

- `semantic/provider.ts` — interfaz `EmbeddingProvider` con metadata de
  modelo/dimensiones/batch. `getEmbeddingProvider()` devuelve `null` hoy,
  y `null` es un estado esperado: significa "no evaluado", nunca un score
  inventado.
- `semantic/embed-chunks.ts` — batching según el límite del proveedor,
  caché por (texto normalizado + modelo) para no repetir embeddings, y
  descarte de fragmentos cortos (<12 palabras): encabezados desperdician
  cuota y además contaminan el espacio vectorial.
- `0007_semantic_embeddings.sql` — pgvector nativo de Supabase (no se
  añadió base vectorial externa: el corpus es por usuario/workspace,
  muy por debajo de donde una Pinecone/Weaviate se justifica), tabla
  separada por modelo, índice HNSW con distancia coseno, y
  `match_document_chunks()` que **reaplica las reglas de visibilidad del
  usuario dentro de la función** — nunca puede devolver fragmentos de
  documentos que el solicitante no podría leer directamente.
- La migración también añade `embeddings_generated`, `source_queries_run`
  y `processing_ms` al informe, para poder responder cuánto cuesta
  realmente ejecutar un análisis antes de ponerle precio.

**Aplicar `0007` no activa nada**: sin proveedor, `semantic_ratio` sigue
siendo 0 y la UI sigue diciendo "no disponible".

## Rendimiento medido

Análisis completo end-to-end contra la base real, documento corto (46
palabras, 1 página, con verificación Crossref real incluida):
**~4.7 segundos**. Dominado por las llamadas de red a Crossref, no por el
matching local.

## Comparación de documentos (A vs B)

`src/lib/originality/comparison/compare-documents.ts` — **implementado**.

Deliberadamente **no** es un segundo motor: reutiliza el mismo chunker, el
mismo comparador léxico/near y el mismo modelo de evidencia híbrida que el
pipeline principal, de modo que un cambio en el matching no pueda aplicarse
a un camino y al otro no.

- Es puro y síncrono: sin base de datos, sin storage, sin red. La
  extracción ocurre aguas arriba, así que se puede testear sin fixtures y
  sirve tanto para "comparar dos subidas" como para "comparar contra un
  repositorio".
- El titular usa **cobertura máxima, no promedio**: un documento corto
  copiado íntegro dentro de uno largo sigue reportando alto. Promediar
  ocultaría justo el caso que más importa. Hay un test que lo fija.
- Si no hay proveedor semántico, el resultado incluye
  `semanticNotice` con el texto exacto que se muestra: *"El análisis
  semántico no está configurado… una reescritura con otras palabras no
  aparecería aquí."* Nunca guarda silencio sobre lo que no evaluó.
- Una comparación cruda A-vs-B **nunca** clasifica como "atribuida": el
  contexto de citas pertenece al pipeline de documento único, y afirmar
  atribución sin ese contexto sería inventarla.
- El scorer semántico entra por inyección (`semanticScorer`), así que
  conectar un proveedor real no requiere tocar este motor. Los tests
  inyectan puntuaciones para verificar el cableado — **no** fabrican
  embeddings.

## Arquitectura de recuperación de fuentes

Construida, **sin proveedores activos** — y eso es lo que reporta.

- `retrieval/query-generator.ts` — decide qué fragmentos merecen una
  consulta. Puntúa cada candidato por variedad léxica, longitud media de
  palabra (proxy de terminología técnica) y densidad de contenido, y
  **penaliza frases académicas de relleno** ("en este estudio", "los
  resultados muestran") que aparecen en cualquier texto y no identifican
  nada. Presupuesto máximo de consultas por documento: buscar cada frase
  sería caro e inútil.
- `retrieval/providers.ts` — contratos `SearchProvider`, adaptadores
  OpenAlex y web-search. Ambos **lanzan excepción** si no están
  configurados, en lugar de devolver lista vacía: una lista vacía es
  indistinguible de "busqué y no encontré nada", y esa ambigüedad es
  precisamente lo que no queremos.
- `deduplicateCandidates()` — colapsa el mismo trabajo devuelto bajo
  varias URLs (editorial, espejo, preprint) usando DOI → URL normalizada →
  título. Sin esto, tres copias del mismo paper parecerían tres fuentes
  independientes corroborando lo mismo.
- `retrieval/ranker.ts` — **la confianza en la fuente es independiente de
  la similitud del texto**. Que el texto coincida no prueba que hayas
  identificado bien de dónde salió. La relevancia que reporte el proveedor
  aporta como mucho un desempate mínimo, nunca decide: es la lección
  directa de Crossref, cuyo `score` puntuó más alto un disparate que un
  paper real.

### OpenAlex

Investigado: **ahora exige cuenta y API key gratuita** (antes no la
pedía). Adaptador escrito, inactivo. Crear esa cuenta es una decisión
tuya, no algo a hacer en tu nombre.

## Seguridad de fetching externo (SSRF)

`retrieval/url-guard.ts` — construido antes que cualquier fetcher, a
propósito.

Bloquea: esquemas no http(s), `localhost` en todas sus grafías, loopback,
todos los rangos IPv4 privados/reservados, IPv6 privado, puertos de
servicios internos (bases de datos, Redis, daemon de Docker), y sufijos
`.internal`/`.local`. Los redirects se revalidan **en cada salto** — validar
solo la URL inicial es la forma más común de derrotar una protección SSRF.

**Bypass real encontrado por su propio test**: `::ffff:169.254.169.254`
(el endpoint de metadatos de la nube disfrazado de IPv6) pasaba limpio,
porque el parser de URL lo normaliza a forma hexadecimal
(`::ffff:a9fe:a9fe`) antes de que el guard lo viera, y la comprobación
solo cubría la forma con puntos. Corregido decodificando también el
hexadecimal, con test para ambas grafías.

Limitación declarada: un hostname que *resuelve* a una IP privada (DNS
rebinding) no puede detectarse en una función pura. Requiere resolver
primero y fijar el socket a la IP comprobada, y eso corresponde al
fetcher — está documentado en el propio archivo para que no se olvide
cuando se implemente.

## Qué falta / limitaciones honestas

- Similitud semántica, búsqueda de fuentes externas, e indicador de
  escritura por IA: arquitectura lista, sin proveedor configurado (ver
  arriba) — nunca fabricados en la UI.
- Sección de documento (Introducción/Metodología/...) no se clasifica —
  fragmentar por párrafo es lo único que se hace; una etiqueta de sección
  inventada sería peor que ninguna.
- Sin comparación entre dos documentos elegidos manualmente ("Comparar
  trabajos") — el modelo de datos no lo impide, no se construyó todavía.
- Sin exportar el informe a PDF — el modelo de datos no lo impide.
- La verificación de referencias (Crossref) solo cubre trabajos con DOI
  indexados ahí — un libro o tesis real puede seguir mostrando "no
  encontrada" sin que eso signifique nada malo (ver sección dedicada
  arriba).
- Sin reactivar el procesamiento si `after()` falla a mitad de camino en
  un cold start de Vercel (no observado en las pruebas locales, pero no
  descartable en producción sin verificarlo ahí).
- No probado en un despliegue real de Vercel — ver la nota sobre pdfjs-dist
  arriba.
