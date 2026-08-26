# Proveedor de embeddings — investigación y decisión

Estado: **PROVIDER ACTIVO Y MEDIDO** en local. El adaptador real de OpenAI está
conectado, el benchmark corrió con vectores reales, y el umbral está calibrado por
sweep. Pendiente: integrarlo en el pipeline de análisis y desplegarlo.

## Recomendación

**OpenAI `text-embedding-3-small`.** Una sola integración, no tres.

## Comparación

Precios consultados en agosto de 2026. Ver fuentes al final.

| | OpenAI `text-embedding-3-small` | Cohere `embed-v4` | Voyage `voyage-4-large` |
|---|---|---|---|
| Precio | **$0.02 / M tokens** ($0.01 en Batch API) | $0.12 / M | ~$0.18 / M |
| Dimensiones | **1536 nativas** | distintas | distintas |
| Contexto | 8 191 tokens | 128 K | 32 K |
| Calidad | MTEB 62.3 · MIRACL 44.0 | MTEB 66.3 | mejor recuperación medida (+8.2 % NDCG@10 sobre Cohere) |
| Fuerte en | coste, dimensionalidad | escrituras no latinas (árabe, hindi, japonés, chino) | calidad pura de recuperación |

## Por qué OpenAI para este producto concreto

**1. La columna ya es `vector(1536)`.** La migración 0007 declara
`embedding extensions.vector(1536)` con índice HNSW y `vector_cosine_ops`.
`text-embedding-3-small` produce 1536 dimensiones de forma nativa: se conecta sin
tocar el esquema. Cohere y Voyage exigirían una migración nueva, reconstruir el
índice HNSW y decidir qué hacer con los vectores ya almacenados. El proyecto ya
tiene una regla explícita de no rehacer migraciones aplicadas, y este es
exactamente el caso que esa regla protege.

**2. La ventaja de Cohere no aplica aquí.** Su diferencial documentado es la
calidad en escrituras no latinas. Los documentos de Herramio son texto académico
en español — alfabeto latino. Se pagaría 6× por una mejora que este corpus no
recibe.

**3. Voyage gana en calidad, pero no en el margen que importa.** Su ventaja es
sobre otros modelos de embeddings. Frente a lo que hoy tiene Herramio — un motor
léxico que no detecta paráfrasis en absoluto — los tres proveedores son un salto
enorme y comparable. Pagar 9× por el último tramo de calidad antes de tener un
solo usuario de pago es optimizar la variable equivocada.

**4. La ventana de contexto no es un factor.** Los chunks se limitan a 220
palabras (~300 tokens). Los 128 K de Cohere y los 32 K de Voyage no se usarían;
los 8 191 de OpenAI sobran por más de un orden de magnitud.

## Coste real medido

Medido con `scripts/measure-document-cost.mjs`, que corre la extracción y el
chunking reales sobre `tests/fixtures/herramio_originalidad_prueba.pdf` y usa el
contador de tokens que devuelve la propia API de OpenAI. No es una estimación por
caracteres: la estimación previa daba 1 197–1 368 tokens y el número real es **958**,
un 25 % menos.

```
2 paginas · 611 palabras · 3 chunks · 3 embebibles · 0 omitidos

1a pasada (fria)      1 llamada   958 tokens   cacheMiss=3   1393ms   $0.00001916
2a pasada (cacheada)  0 llamadas    0 tokens   cacheHit=3       0ms   $0.00000000
```

| | Medido |
|---|---|
| Coste de este documento | **$0.00001916** |
| Por 1 000 documentos | **$0.0192** |
| Documentos que cubre un Pro de $3.99 | **208 246** |
| Ahorro del caché al reanalizar | **100 %** (0 llamadas) |
| Llamadas por documento | **1** (3 chunks en un solo lote) |

Comparado con las alternativas al mismo volumen: Cohere embed-v4 costaría
~$0.115 / 1 000 documentos y Voyage-4-large ~$0.172 / 1 000 — seis y nueve veces más
por una mejora que este corpus no recibe.

La conclusión operativa: los embeddings **no son el factor limitante del margen**.
Lo que sí puede doler es la capa de análisis con LLM, dos a tres órdenes de magnitud
más cara por documento — por eso esa capa se diseña como opcional y con cuota.

## Resultados del benchmark

Medido con `scripts/semantic-benchmark.mjs` sobre los 36 casos del golden dataset,
con vectores reales. Resultados completos en `tests/fixtures/semantic-benchmark.json`
y fijados por `tests/unit/originality-semantic-benchmark.test.ts`.

| Strategy | Precision | Recall | F1 | FP | FN |
|---|---|---|---|---|---|
| lexical (pregunta léxica) | 100.0 % | 100.0 % | 100.0 % | 0 | 0 |
| lexical (pregunta semántica) | 100.0 % | 82.1 % | 90.2 % | 0 | 5 |
| semantic | 100.0 % | 96.4 % | 98.2 % | 0 | 1 |
| **hybrid** | **100.0 %** | **100.0 %** | **100.0 %** | **0** | **0** |

La segunda fila es la que justifica el gasto: el mismo motor léxico, evaluado contra
la pregunta que importa ("¿este texto deriva de la fuente?"), pierde las cinco
paráfrasis. El semántico las recupera **sin coste en precisión**.

**Umbral semántico: 0.575**, punto medio de la meseta 0.525–0.625 donde F1 es máximo.

Un matiz que conviene no esconder: en este dataset las dos clases **se solapan**. El
caso derivado más bajo puntúa 0.4221 (una frase copiada dentro de un documento largo,
diluida en el embedding del conjunto) y el no-derivado más alto puntúa 0.5112 (una
definición de manual del mismo término). Ningún umbral los separa limpiamente, así
que 0.575 se sitúa por encima de ambos: sacrifica ese fragmento antes que acusar a
quien escribió una definición estándar. No cuesta nada en conjunto porque el motor
léxico sí lo atrapa por containment (0.3636). Ese es todo el argumento para correr
los dos.

## Qué falta

Hecho: adaptador real, resolución endurecida, benchmark, umbral calibrado, coste
medido, tests de regresión.

Pendiente:

1. **Integrar en el pipeline.** `runOriginalityPipeline` todavía no genera ni
   persiste embeddings, y `semanticRatio` está fijo en 0. El motor está validado
   pero aún no toca un documento de usuario.
2. **Desplegar en Preview** con `EMBEDDING_PROVIDER=openai` y la key, y correr el
   flujo real allí antes de tocar producción.

Mientras el paso 1 no exista, el sistema sigue reportando `semantic_unavailable`,
que es la conducta correcta y está cubierta por tests.

## Riesgo a vigilar cuando se active

Un proveedor de embeddings es una llamada de red por lote, con coste y latencia.
Lo que hoy es un pipeline determinista y sin dependencias externas pasa a tener
un modo de fallo nuevo: el proveedor caído o lento. El adaptador ya contempla
`timeout`, `maxRetries` y lotes, pero la decisión de producto —¿el análisis falla,
o se completa en modo léxico y lo dice?— debe ser explícita. La respuesta
coherente con el resto del sistema es la segunda: entregar el informe léxico y
declarar el semántico como no disponible, nunca fingir que se ejecutó.

## Fuentes

- [OpenAI API pricing in 2026](https://www.cloudzero.com/blog/openai-pricing/)
- [OpenAI Embedding Pricing 2026 — EmbeddingCost](https://embeddingcost.com/openai)
- [New embedding models and API updates — OpenAI](https://openai.com/index/new-embedding-models-and-api-updates/)
- [Cohere Embed Pricing: embed-v4](https://embeddingcost.com/cohere)
- [Embedding Models Comparison 2026: OpenAI vs Cohere vs Voyage vs BGE](https://reintech.io/blog/embedding-models-comparison-2026-openai-cohere-voyage-bge)
- [Voyage 3.5 vs OpenAI vs Cohere Embedding Models 2026](https://www.buildmvpfast.com/blog/best-embedding-model-comparison-voyage-openai-cohere-2026)
- [Embedding Model Specs 2026: Dimensions, Price per 1M Tokens, MTEB](https://pecollective.com/tools/text-embedding-models-compared/)
