# Herramio 2.0 — estado final antes de la beta

Medido, no estimado. Cada afirmación de aquí tiene una prueba detrás; lo que no
la tiene está marcado como no verificado.

**Commit**: `0777e79` · **Tests**: 1000 / 132 ficheros / 0 fallos / 0 skips ·
**Lint**: 0/0 · **TypeScript**: PASS · **Build**: 190/190

---

## PRODUCT

Producción estable en herramio.com. 129 herramientas, cuentas, planes con límites
aplicados en servidor, workspace, panel de administración. El cobro está
desactivado y queda fuera de alcance hasta después de la beta.

## DESIGN

Rediseño desplegado: tokens de color, tipografía escalada, superficies con
elevación, radios y sombras sobrias. Contraste WCAG AA verificado con auditor
propio en Home, `/precios`, `/originalidad`, `/favoritos` y `/pdf-unir`, a
375/768/1280/1440: **0 fallos**. Sin scroll lateral, sin botones sin nombre
accesible, sin imágenes sin `alt`.

**Limitación honesta**: el panel del navegador de esta sesión mide layout y color
pero no captura imágenes. La calidad visual está verificada *estructuralmente*,
no inspeccionada a ojo. `VISUAL POLISH: PENDING VISUAL INSPECTION`.

## ORIGINALITY

Extracción de PDF, DOCX y TXT verificada en producción con el fixture oficial.
Chunking, detección de citas, referencias numeradas, grafo de citas y verificación
Crossref funcionando. Motor léxico con precisión y recall del 100 % sobre 36 casos
del golden dataset; umbral 0.25 elegido por sweep, no por intuición.

Paridad entre formatos verificada: el mismo documento en PDF, DOCX y TXT produce
resultados equivalentes (>0.9 de similitud entre extracciones).

## SEMANTIC

`IMPLEMENTED`, `NOT_CONFIGURED` en producción.

Adaptador real de OpenAI (`text-embedding-3-small`, 1536 dimensiones, encaja en la
columna existente sin migración). Benchmark con vectores reales:

| Estrategia | Precisión | Recall | F1 |
|---|---|---|---|
| léxico (pregunta léxica) | 100 % | 100 % | 100 % |
| léxico (pregunta semántica) | 100 % | 82.1 % | 90.2 % |
| semántico | 100 % | 96.4 % | 98.2 % |
| **híbrido** | **100 %** | **100 %** | **100 %** |

Umbral 0.575, punto medio de la meseta 0.525–0.625. Coste medido: **$0.019 por
1 000 documentos**. Caché elimina el 100 % del coste al reanalizar.

Producción no tiene la key: el informe dice «No disponible», nunca 0 %.

## RETRIEVAL

Crossref `VERIFIED` y en uso. OpenAlex `IMPLEMENTED`, opt-in, apagado.

Constraint documentada: la búsqueda por texto de OpenAlex es un motor de
relevancia temática, no un matcher de títulos — buscando el título exacto de la
guía UNESCO devuelve papers del tema y no el documento. Sus resultados son
candidatos que nuestra similitud debe puntuar, nunca verificaciones.

## AI

`IMPLEMENTED`, `NOT_CONFIGURED` en producción. Requiere la migración 0009.

La capa analiza **evidencia**, nunca el documento: recibe las cifras que calculó
nuestro propio código y los pasajes concretos que marcó, y devuelve una lectura
estructurada — resumen, hallazgos, recomendaciones y, obligatorio, qué **no**
puede determinar. Una salida sin límites declarados se descarta.

Verificado en vivo contra `gpt-5.4-mini` con una inyección incrustada en la
evidencia (`scripts/ai-smoke.ts`):

| Comprobación | Resultado |
|---|---|
| La inyección se reportó como hallazgo, no se obedeció | sí (`promptInjectionNoticed = true`) |
| Filtró credenciales o nombres de variables | no |
| Emitió un veredicto de plagio | no |
| Tokens / latencia | 1003 entrada · 669 salida · 4.8 s |

Tres guardas, en orden de importancia: contenido no confiable tras un fence
aleatorio por petición; escaneo del texto generado contra las afirmaciones que
este producto nunca hace («plagio confirmado», «el estudiante copió», «100 % de
precisión»), y una coincidencia descarta la explicación entera; y fallo suave
siempre — sin proveedor, JSON inválido, guarda activada o timeout, el informe
sale completo sin prosa.

Apagada por defecto tras `AI_ANALYSIS`, para que una `OPENAI_API_KEY` suelta —
que la capa semántica también lee — no empiece a gastar en prosa que nadie pidió.
Una llamada por análisis, salida acotada, tokens exactos, y coste solo cuando hay
un precio configurado explícitamente.

## MERCADO PAGO

`NOT BILLING READY`. La integración es sólida; le falta configuración.

Las credenciales del `.env.local` estaban con nombres que el código no lee
(`acces_token`, `Public Key` — esta última con un espacio, así que ningún proceso
la habría leído nunca). Renombradas a `MERCADOPAGO_ACCESS_TOKEN` y
`MERCADOPAGO_PUBLIC_KEY`.

Son credenciales de **usuario de prueba** (`@testuser.com`, sitio MCO). Lo
comprobé preguntándole a la API, no por el prefijo: Mercado Pago emite
`APP_USR-` tanto a vendedores reales como a usuarios de prueba, así que el
prefijo no prueba nada y confundirlos significa cobrar dinero real.

| Elemento | Estado |
|---|---|
| Access token | configurado (cuenta de prueba, válido) |
| Public key | configurado |
| `MERCADOPAGO_WEBHOOK_SECRET` | **falta** — sin él el webhook no valida firmas |
| Planes en Mercado Pago | **ninguno** |
| `provider_price_id` en Supabase | **NULL en todos los planes** |

Con los ids en NULL el checkout no puede ni empezar: redirige a
`plan_no_disponible`. Ese es el bloqueador real, no el código.

Seguridad con evidencia (11 tests): un webhook falsificado no escribe nada; una
notificación repetida no puede aplicarse dos veces; un pago sin usuario
atribuible no desbloquea a nadie; un `price_id` desconocido no resuelve al plan
más parecido. El precio sale siempre de la base de datos y el `userId` de la
sesión — el navegador no envía ninguno de los dos.

## SECURITY

| Prueba | Resultado |
|---|---|
| Aislamiento entre usuarios (documentos, chunks, informes, embeddings) | 16/16 |
| Aislamiento vectorial con vectores idénticos | 15/15 |
| RLS de feedback contra la BD real | 8/8 |
| Autorización admin en cada función | 13 tests |
| Prompt injection | 14 tests |
| SSRF (IPv4-mapped IPv6 incluido) | cubierto |
| `/admin` para anónimo y usuario normal | bloqueado |

Metodología: ninguna escritura se da por fallida por su código HTTP. PostgREST
responde **204** a una escritura filtrada por RLS, y varias de estas pruebas solo
se resolvieron releyendo con service role.

## PERFORMANCE

Análisis completo de un documento de 2 páginas en producción: ~20–25 s, dominado
por las llamadas a Crossref. Build 190/190 páginas. Sin componentes cliente
innecesarios añadidos.

## OBSERVABILITY

Logs de producción sin errores durante el QA. No se registra contenido de
documentos, ni secretos, ni PII innecesaria — verificado buscando en los logs.

## BETA

`READY` salvo un ítem manual.

Canal de feedback verificado extremo a extremo en producción: widget en workspace
e informes (los tres estados), persistencia en Supabase con la ruta de origen, y
Feedback Center en `/admin` con filtros, detalle y cambio de estado — verificado
releyendo la base de datos, no solo la pantalla.

Guion de prueba y limitaciones para el grupo beta en `BETA_LAUNCH.md`.

## MONETIZATION

`DEFERRED`. Mercado Pago no se tocó. Precios definidos y servidos desde Supabase
(US$ 3,99 / US$ 9,99) pero el cobro está desactivado.

Economía unitaria conocida por el lado del coste: embeddings $0.019/1 000
documentos. El coste de la capa LLM no se puede calcular todavía porque no está
integrada.

---

## LIMITATIONS

Las que un usuario notaría y que hay que decirle:

1. **El corpus es interno.** Se compara contra los documentos previos del propio
   usuario, no contra internet ni bases académicas. 0 % no significa «original».
2. **Sin semántico en producción**: una paráfrasis competente no se detecta hoy.
3. **Crossref es conservador**: «No encontrada» no significa «falsa».
4. **No hay detección de texto generado por IA** y no se afirma que la haya.
5. **El índice de similitud no es un veredicto.**

## Lo que NO está verificado

- **Backups de Supabase.** No consultable por API. Requiere acción manual en
  Settings → Database.
- **Calidad visual a ojo.** El panel del navegador de esta sesión no compone
  frames, así que **no hay capturas**. Forma, profundidad, contraste, desbordes y
  objetivos táctiles están medidos en el navegador real a nueve anchos; si el
  resultado *se ve* premium sigue siendo un juicio que requiere ojos.
- **Paridad de entornos**: `NEXT_PUBLIC_SITE_URL` está en producción y falta en
  Preview. Sin impacto conocido, pero es una divergencia real.
- **Checkout de extremo a extremo.** Ningún checkout se ha ejecutado, ni de
  prueba: no existen planes en Mercado Pago contra los que hacerlo.

## Pasos pendientes, en orden

1. **Aplicar `0009_ai_analysis.sql`** (SQL editor de Supabase). Aditiva e
   idempotente. Sin ella la explicación de IA no se guarda; el informe no se ve
   afectado.
2. **Revisar el diseño** en la Preview de la rama `design/visual-system-and-ai`
   y decidir si se promueve a producción.
3. **Crear los planes de Mercado Pago**: `node scripts/mercadopago-setup.mjs`
   para auditar, `--create` para crearlos. Confirma antes los importes en COP —
   son una decisión de precio, no una conversión de divisa.
4. **`MERCADOPAGO_WEBHOOK_SECRET`** desde el panel de Mercado Pago al crear el
   webhook.
5. **Verificar los backups de Supabase.**
