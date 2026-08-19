# Load testing

This module is deliberately separate from production traffic and from
monetization. It exists to answer capacity questions ("how does the server
behave at 500 concurrent users?"), never to generate page views, ad
impressions, or analytics events.

## Ground rules (do not violate)

- **Never run this against the live production domain.** Run it against
  `localhost`, a preview deployment, or a dedicated staging environment.
- Every request is tagged `X-Test-Traffic: true` and `?test=1`. The target
  endpoint (`src/app/api/test/ping`) only responds when
  `ALLOW_LOAD_TEST=true` is set **and** the request carries that header —
  it is a 403 everywhere else, including production by default.
- The script refuses to target a host that isn't `localhost` or doesn't
  contain `staging`, unless you pass `--force` (only do this for a test
  deployment you control, never for the real site).
- This never touches AdSense, GA4, or any user-facing marketing route — it
  only calls the dedicated test endpoint.

## Running a test

1. Start the app locally with load testing enabled:

   ```bash
   ALLOW_LOAD_TEST=true npm run dev
   ```

2. In another terminal, run the load test at increasing concurrency:

   ```bash
   node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=10 --duration=20
   node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=50 --duration=20
   node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=100 --duration=30
   node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=500 --duration=30
   node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=1000 --duration=30
   ```

3. Record requests/sec, average latency, p95, and p99 for each run (the
   script prints all four) and watch `npm run dev`'s terminal / your
   hosting provider's metrics for CPU and memory if available.

## Against a Vercel preview / staging deployment

Set `ALLOW_LOAD_TEST=true` as an environment variable on that specific
deployment only (Vercel → Project → Settings → Environment Variables,
scoped to Preview, not Production), then point `--url` at that deployment:

```bash
node tests/load/load-test.mjs --url=https://your-preview.vercel.app/api/test/ping --vus=100 --duration=30
```

Never set `ALLOW_LOAD_TEST=true` on the Production environment.

## Resultados de la última prueba (2026-08-19, tras la consolidación visual — 81 rutas, incl. /experiencia)

Ejecutada contra `npm run start` (build de producción) en local — **nunca**
contra `herramio.com` — con `ALLOW_LOAD_TEST=true` solo en el proceso
local. Endpoint: `/api/test/ping`.

| Usuarios concurrentes | Requests totales | Errores | Requests/seg | Latencia media | p95 | p99 |
|---|---|---|---|---|---|---|
| 10 | 28,524 | 0 | 1,425.8 | 7.0 ms | 13.3 ms | 16.6 ms |
| 50 | 28,714 | 0 | 1,433.9 | 34.8 ms | 50.7 ms | 63.3 ms |
| 100 | 42,675 | 0 | 1,420.2 | 70.2 ms | 93.0 ms | 107.2 ms |
| 500 | 44,069 | 0 | 1,453.8 | 341.4 ms | 407.9 ms | 433.5 ms |
| 1000 | 45,138 | 0 | 1,470.1 | 670.2 ms | 772.9 ms | 799.4 ms |

**Lectura**: cero errores en los cinco niveles. Los números son
prácticamente idénticos a la corrida anterior (antes del rediseño visual y
de agregar `/experiencia`, el hub interactivo y el spotlight de cursor) —
esperable, ya que todo el trabajo de esta ronda es cliente puro
(CSS/`requestAnimationFrame`) y `/api/test/ping` no ejecuta nada de eso.

**Contexto importante**: esto midió un único proceso `next start` en una
laptop de desarrollo, no la infraestructura real de Vercel. Producción en
Vercel escala horizontalmente entre múltiples instancias de función
serverless — el comportamiento real bajo carga en producción debería ser
igual o mejor que estos números, no peor. Esta prueba responde la pregunta
"¿el código del servidor se comporta bien bajo carga sostenida?" (sí), no
"¿cuál es la capacidad exacta de Vercel?" (esa cifra depende del plan de
Vercel contratado y no es algo que se pueda medir de forma segura y
controlada contra el dominio real sin arriesgar la experiencia de
usuarios reales, que es justamente lo que este módulo evita).

## Optional: k6

For more advanced scenarios (ramping stages, thresholds), install
[k6](https://k6.io/) and adapt the same target endpoint and headers:

```js
import http from "k6/http";

export const options = { vus: 100, duration: "30s" };

export default function () {
  http.get("http://localhost:3000/api/test/ping?test=1", {
    headers: { "X-Test-Traffic": "true" },
  });
}
```

Run with: `k6 run tests/load/k6-script.js`
