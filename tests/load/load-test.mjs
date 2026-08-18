#!/usr/bin/env node
/**
 * Minimal concurrency load test with zero external dependencies (Node 18+
 * built-in fetch). Built for the QR toolkit's rule that load testing must
 * never touch production or generate ad/analytics traffic:
 *
 *   - Every request is tagged with the X-Test-Traffic header and a ?test=1
 *     query param, so the target endpoint (see src/app/api/test/ping) can
 *     identify and gate synthetic traffic explicitly.
 *   - By default this script refuses to run against anything that isn't
 *     localhost or a host containing "staging". Pass --force to override
 *     for a dedicated test deployment you control.
 *   - It only ever hits the URL you pass explicitly — never the production
 *     marketing pages or ad slots.
 *
 * Usage:
 *   node tests/load/load-test.mjs --url=http://localhost:3000/api/test/ping --vus=100 --duration=30
 *
 * Flags:
 *   --url        Target URL (required)
 *   --vus        Concurrent virtual users (default: 10)
 *   --duration   Test duration in seconds (default: 20)
 *   --force      Allow running against a non-localhost/staging host
 */

function parseArgs(argv) {
  const args = { url: "", vus: 10, duration: 20, force: false };
  for (const raw of argv.slice(2)) {
    const [key, value] = raw.replace(/^--/, "").split("=");
    if (key === "url") args.url = value;
    else if (key === "vus") args.vus = Number(value);
    else if (key === "duration") args.duration = Number(value);
    else if (key === "force") args.force = true;
  }
  return args;
}

function assertSafeTarget(url, force) {
  const host = new URL(url).hostname;
  const looksSafe = host === "localhost" || host === "127.0.0.1" || host.includes("staging");
  if (!looksSafe && !force) {
    console.error(
      `Refusing to load-test "${host}": it doesn't look like localhost or a staging host.\n` +
        `If this really is a dedicated test deployment (never production), re-run with --force.`,
    );
    process.exit(1);
  }
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

async function runVirtualUser(url, endAt, latencies, counters) {
  while (Date.now() < endAt) {
    const started = performance.now();
    try {
      const target = new URL(url);
      target.searchParams.set("test", "1");
      const res = await fetch(target, {
        headers: { "X-Test-Traffic": "true" },
      });
      latencies.push(performance.now() - started);
      if (res.ok) counters.success += 1;
      else counters.error += 1;
    } catch {
      latencies.push(performance.now() - started);
      counters.error += 1;
    }
  }
}

async function main() {
  const { url, vus, duration, force } = parseArgs(process.argv);
  if (!url) {
    console.error("Missing --url. Example: --url=http://localhost:3000/api/test/ping");
    process.exit(1);
  }
  assertSafeTarget(url, force);

  console.log(`Load test: ${vus} virtual users for ${duration}s against ${url}`);
  console.log("All requests are tagged as TEST_TRAFFIC (X-Test-Traffic header + ?test=1).\n");

  const latencies = [];
  const counters = { success: 0, error: 0 };
  const startedAt = Date.now();
  const endAt = startedAt + duration * 1000;

  await Promise.all(
    Array.from({ length: vus }, () => runVirtualUser(url, endAt, latencies, counters)),
  );

  const elapsedSec = (Date.now() - startedAt) / 1000;
  const sorted = [...latencies].sort((a, b) => a - b);
  const total = counters.success + counters.error;
  const avg = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);

  console.log("Results");
  console.log("-------");
  console.log(`Total requests:   ${total}`);
  console.log(`Successful:       ${counters.success}`);
  console.log(`Errors:           ${counters.error}`);
  console.log(`Requests/sec:     ${(total / elapsedSec).toFixed(1)}`);
  console.log(`Avg latency:      ${avg.toFixed(1)} ms`);
  console.log(`p95 latency:      ${percentile(sorted, 95).toFixed(1)} ms`);
  console.log(`p99 latency:      ${percentile(sorted, 99).toFixed(1)} ms`);
}

main();
