# Herramio 2.0 — estado final antes de la beta

Medido, no estimado. Cada afirmación de aquí tiene una prueba detrás; lo que no
la tiene está marcado como no verificado.

**Commit**: `a8e569e` · **Tests**: 961 / 357 suites / 0 fallos / 0 skips ·
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

`PREPARED`, no integrado.

El aislamiento de contenido no confiable está construido y probado (14 tests):
fence con 12 bytes aleatorios, preámbulo que instruye reportar una inyección en
vez de obedecerla, truncado, y redacción de credenciales antes de enviar nada.
El motor determinista no construye ningún prompt, así que es inmune por
construcción.

Falta elegir modelo, escribir el adaptador y conectar. **No se hizo en esta
misión.**

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
- **Calidad visual a ojo.** Medida estructuralmente, no inspeccionada.
- **Paridad de entornos**: `NEXT_PUBLIC_SITE_URL` está en producción y falta en
  Preview. Sin impacto conocido, pero es una divergencia real.
