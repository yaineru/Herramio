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
