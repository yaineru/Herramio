# Proveedor de embeddings — investigación y decisión

Estado: **PREPARED, NOT CONFIGURED**. La arquitectura está lista y probada; falta
una API key para activarla. Este documento existe para que esa activación sea una
decisión tomada con datos, no en el momento.

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

No estimado sobre un documento hipotético: calculado sobre
`tests/fixtures/herramio_originalidad_prueba.pdf`, el documento de QA real.

```
633 palabras embebibles · 4 785 caracteres · 3 de 3 chunks superan el mínimo
Tokens estimados: 1 197 – 1 368
```

El rango existe porque el español consume más tokens por carácter que el inglés
(acentos, palabras más largas); se acota por ambos extremos en vez de fingir una
cifra exacta.

| Proveedor | Coste / documento | Coste / 1 000 documentos | Documentos que cubre un Pro de $3.99 |
|---|---|---|---|
| **OpenAI 3-small** | **$0.000024 – $0.000027** | **$0.027** | **145 833** |
| OpenAI 3-small (Batch) | $0.000012 – $0.000014 | $0.014 | 291 666 |
| Cohere embed-v4 | $0.000144 – $0.000164 | $0.164 | 24 305 |
| Voyage-4-large | $0.000215 – $0.000246 | $0.246 | 16 203 |

La conclusión operativa: con OpenAI, los embeddings **no son el factor limitante
del margen**. Un plan Pro absorbe seis cifras de documentos antes de que el coste
de embeddings importe. Lo que sí puede doler es la capa de análisis con LLM, que
es dos a tres órdenes de magnitud más cara por documento — por eso esa capa está
diseñada como opcional y bajo control de cuota.

El caché reduce esto aún más: la clave es
`sha256(provider:model:version:normalizedText)`, así que reanalizar un documento
sin cambios, o dos documentos que compartan un pasaje, cuesta un embedding y no
varios.

## Qué falta para activarlo

1. `EMBEDDING_PROVIDER=openai` y `EMBEDDING_PROVIDER_API_KEY=…` en Vercel.
2. Escribir el adaptador real en `src/lib/originality/semantic/provider.ts` y
   añadir `"openai"` a `IMPLEMENTED_PROVIDERS`, que hoy está vacío
   deliberadamente.
3. Ejecutar el benchmark semántico contra el golden dataset (léxico vs semántico
   vs híbrido) antes de mostrar nada al usuario.
4. Recalibrar el umbral con el sweep, igual que se hizo con el léxico.

Hasta que eso ocurra el sistema reporta `semantic_unavailable` y no inventa
ningún número. Esa es la conducta correcta y está cubierta por tests.

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
