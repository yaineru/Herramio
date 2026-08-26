/**
 * Measures LEXICAL vs SEMANTIC vs HYBRID on the golden dataset using REAL
 * OpenAI embeddings.
 *
 * Lives as a script, not a test: it makes paid network calls, and the test
 * suite has to stay offline and deterministic. It writes its results to
 * tests/fixtures/semantic-benchmark.json so a test can assert against
 * measured numbers without re-spending.
 *
 * Nothing here is persisted to the database. This measures the engine; it
 * does not populate a corpus.
 *
 * Usage: node scripts/semantic-benchmark.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("OPENAI_API_KEY no configurada");
  process.exit(1);
}

const MODEL = "text-embedding-3-small";
const BATCH = 32;

// Node 24 can import a .ts module directly (type stripping), which keeps
// the dataset a single source of truth instead of a copy that can drift.
const dataset = await import(pathToFileURL("src/lib/originality/evaluation/dataset.ts").href);
const { GOLDEN_CASES, SOURCE_TEXT, expectedSemanticMatch } = dataset;

// --- lexical engine, mirroring similarity.ts exactly -----------------
const SHINGLE = 3;
const MIN_SHINGLES = 5;
const LEXICAL_THRESHOLD = 0.25;

const normalize = (raw) =>
  raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

function shingles(text, size = SHINGLE) {
  const w = text.split(/\s+/).filter(Boolean);
  if (!w.length) return new Set();
  if (w.length < size) return new Set([w.join(" ")]);
  const s = new Set();
  for (let i = 0; i <= w.length - size; i++) s.add(w.slice(i, i + size).join(" "));
  return s;
}

const intersect = (a, b) => {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n;
};

function lexicalScore(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const sa = shingles(na);
  const sb = shingles(nb);
  const i = intersect(sa, sb);
  const union = sa.size + sb.size - i;
  const jaccard = union === 0 ? 0 : i / union;
  const eligible = sa.size >= MIN_SHINGLES && sb.size >= MIN_SHINGLES;
  return eligible ? Math.max(jaccard, i / Math.min(sa.size, sb.size)) : jaccard;
}

// --- real embeddings, using the app's cache key shape ----------------
const cache = new Map();
const cacheKey = (t) => createHash("sha256").update(`openai:${MODEL}:v1:${t}`).digest("hex");
const usage = { apiCalls: 0, apiTokens: 0, cacheHits: 0, cacheMisses: 0, embedMs: 0 };

async function embedAll(texts) {
  const pending = [];
  for (const t of texts) {
    if (cache.has(cacheKey(t))) usage.cacheHits++;
    else {
      usage.cacheMisses++;
      if (!pending.includes(t)) pending.push(t);
    }
  }
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const started = Date.now();
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: batch, encoding_format: "float" }),
    });
    usage.embedMs += Date.now() - started;
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    usage.apiCalls++;
    usage.apiTokens += json.usage?.total_tokens ?? 0;
    if (json.data.length !== batch.length) throw new Error("vector count mismatch");
    batch.forEach((t, k) => cache.set(cacheKey(t), json.data[k].embedding));
  }
  return texts.map((t) => cache.get(cacheKey(t)));
}

function cosine(a, b) {
  let d = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    d += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? d / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

// --- score every case ------------------------------------------------
const texts = [SOURCE_TEXT, ...GOLDEN_CASES.map((c) => c.text)];
const vectors = await embedAll(texts);
const sourceVec = vectors[0];

const scored = GOLDEN_CASES.map((c, i) => ({
  id: c.id,
  kind: c.kind,
  // Two different ground truths, deliberately. "shouldMatch" asks
  // whether wording is shared; "expectedSemantic" asks whether the text
  // was derived from the source. A paraphrase answers no to the first
  // and yes to the second, and scoring semantic against the lexical
  // label is what made the first run look far worse than it was.
  expected: c.shouldMatch,
  expectedSemantic: expectedSemanticMatch(c),
  semanticOnly: c.semanticOnly === true,
  lexical: +lexicalScore(SOURCE_TEXT, c.text).toFixed(4),
  semantic: +cosine(sourceVec, vectors[i + 1]).toFixed(4),
}));

function metrics(rows, decide, truth = (r) => r.expected) {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;
  const falsePositives = [];
  const falseNegatives = [];
  for (const r of rows) {
    const actual = decide(r);
    if (truth(r) && actual) tp++;
    else if (!truth(r) && !actual) tn++;
    else if (!truth(r) && actual) {
      fp++;
      falsePositives.push(r.id);
    } else {
      fn++;
      falseNegatives.push(r.id);
    }
  }
  const precision = tp + fp === 0 ? null : tp / (tp + fp);
  const recall = tp + fn === 0 ? null : tp / (tp + fn);
  const f1 =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);
  return { tp, tn, fp, fn, precision, recall, f1, falsePositives, falseNegatives };
}

const SEM_THRESHOLDS = [];
for (let t = 0.5; t <= 0.95001; t += 0.025) SEM_THRESHOLDS.push(+t.toFixed(3));

const semanticSweep = SEM_THRESHOLDS.map((threshold) => ({
  threshold,
  ...metrics(scored, (r) => r.semantic >= threshold, (r) => r.expectedSemantic),
}));

const bestF1 = Math.max(...semanticSweep.map((r) => r.f1 ?? 0));
const plateau = semanticSweep.filter((r) => Math.abs((r.f1 ?? 0) - bestF1) < 1e-9);
const semanticThreshold = plateau.length
  ? +((plateau[0].threshold + plateau[plateau.length - 1].threshold) / 2).toFixed(3)
  : null;

const isLexical = (r) => r.lexical >= LEXICAL_THRESHOLD;
const isSemantic = (r) => r.semantic >= (semanticThreshold ?? 0.8);

const results = {
  measuredAt: new Date().toISOString(),
  model: MODEL,
  dimensions: 1536,
  cases: GOLDEN_CASES.length,
  lexicalThreshold: LEXICAL_THRESHOLD,
  semanticThreshold,
  semanticPlateau: plateau.length ? [plateau[0].threshold, plateau[plateau.length - 1].threshold] : null,
  strategies: {
    // Lexical is scored on the lexical question, semantic on the semantic
    // one. Hybrid claims to catch anything derived, so it answers the
    // semantic question too — that is the harder bar and the honest one.
    lexical: metrics(scored, isLexical),
    // The same lexical engine, asked the semantic question. This is the
    // row that shows what semantic actually buys: it is the baseline
    // hybrid has to beat, and it is where the five paraphrases go missing.
    "lexical (semantic q.)": metrics(scored, isLexical, (r) => r.expectedSemantic),
    semantic: metrics(scored, isSemantic, (r) => r.expectedSemantic),
    hybrid: metrics(scored, (r) => isLexical(r) || isSemantic(r), (r) => r.expectedSemantic),
  },
  semanticSweep,
  perCase: scored,
  usage: { ...usage, estimatedCostUsd: +((usage.apiTokens / 1e6) * 0.02).toFixed(8) },
};

writeFileSync("tests/fixtures/semantic-benchmark.json", JSON.stringify(results, null, 2));

// --- report ----------------------------------------------------------
const pct = (v) => (v === null ? "  n/a" : `${(v * 100).toFixed(1).padStart(5)}%`);
console.log(
  `\nModelo: ${MODEL} | ${GOLDEN_CASES.length} casos | ${usage.apiCalls} llamadas | ${usage.apiTokens} tokens | $${results.usage.estimatedCostUsd}\n`,
);
console.log("| Strategy              | Precision | Recall |     F1 | FP | FN |");
console.log("|-----------------------|-----------|--------|--------|----|----|");
for (const [name, m] of Object.entries(results.strategies)) {
  console.log(
    `| ${name.padEnd(21)} |    ${pct(m.precision)} | ${pct(m.recall)} | ${pct(m.f1)} | ${String(m.fp).padStart(2)} | ${String(m.fn).padStart(2)} |`,
  );
}
console.log(
  `\nUmbral semantico: ${semanticThreshold} (meseta ${results.semanticPlateau?.[0]} - ${results.semanticPlateau?.[1]}, F1 ${(bestF1 * 100).toFixed(1)}%)\n`,
);
console.log("Sweep semantico:");
console.log("  thr      P      R      F1  FP FN");
for (const r of semanticSweep) {
  console.log(
    `  ${r.threshold.toFixed(3)} ${pct(r.precision)} ${pct(r.recall)} ${pct(r.f1)} ${String(r.fp).padStart(3)} ${String(r.fn).padStart(2)}`,
  );
}
console.log("\nCasos que solo el motor semantico podria alcanzar:");
for (const r of scored.filter((x) => x.semanticOnly)) {
  console.log(
    `  ${r.id.padEnd(26)} lexical=${r.lexical.toFixed(3)}  semantic=${r.semantic.toFixed(3)}  ${isSemantic(r) ? "DETECTADO" : "perdido"}`,
  );
}
console.log("\nNo-copias con mayor score semantico (riesgo de falso positivo):");
for (const r of scored.filter((x) => !x.expectedSemantic).sort((a, b) => b.semantic - a.semantic).slice(0, 8)) {
  console.log(`  ${r.id.padEnd(26)} semantic=${r.semantic.toFixed(3)}  (${r.kind})`);
}
