/**
 * Measures what one real document actually costs to embed.
 *
 * Runs the real extraction + chunking pipeline over the QA PDF, then
 * embeds exactly the chunks the app would embed, with the app's cache
 * key. Reports token counts from OpenAI's own usage field rather than
 * estimating from characters, and runs the whole thing twice to prove the
 * cache eliminates the second pass.
 *
 * Nothing is persisted. Usage: node scripts/measure-document-cost.mjs
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PDFParse } from "pdf-parse";

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
const PRICE_PER_MTOKEN = 0.02;
const BATCH = 32;
const MAX_CHUNK_WORDS = 220;
const MIN_WORDS_FOR_EMBEDDING = 12;
const EDGE_LINES = 2;
const MIN_LINES_FOR_EDGES = EDGE_LINES * 2 + 1;

// --- extraction, mirroring extract/index.ts + running-headers.ts -------
const parser = new PDFParse({ data: new Uint8Array(readFileSync("tests/fixtures/herramio_originalidad_prueba.pdf")) });
const parsed = await parser.getText({ pageJoiner: "" });
const pages = parsed.pages.map((p) => p.text.trim());

const fingerprint = (l) => l.trim().toLowerCase().replace(/\d+/g, "#").replace(/\s+/g, " ");
const counts = new Map();
for (const page of pages) {
  const lines = page.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < MIN_LINES_FOR_EDGES) continue;
  for (const line of new Set([...lines.slice(0, EDGE_LINES), ...lines.slice(-EDGE_LINES)])) {
    if (line.length > 120) continue;
    counts.set(fingerprint(line), (counts.get(fingerprint(line)) ?? 0) + 1);
  }
}
const threshold = Math.max(2, Math.ceil(pages.length * 0.5));
const running = new Set([...counts.entries()].filter(([, n]) => n >= threshold).map(([k]) => k));
const stripped = pages.map((page) => {
  const lines = page.split(/\n/);
  if (lines.filter((l) => l.trim()).length < MIN_LINES_FOR_EDGES) return page;
  return lines
    .filter((line, i) => {
      const t = line.trim();
      if (!t) return true;
      const before = lines.slice(0, i).filter((l) => l.trim()).length;
      const after = lines.slice(i + 1).filter((l) => l.trim()).length;
      const atEdge = before < EDGE_LINES || after < EDGE_LINES;
      return !(atEdge && running.has(fingerprint(t)));
    })
    .join("\n")
    .trim();
});
const text = stripped.join("\n\n");

// --- chunking, mirroring chunk.ts -------------------------------------
const countWords = (t) => (t.match(/\S+/g) ?? []).length;
const chunks = [];
for (const paragraph of text.split(/\n\s*\n+/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean)) {
  if (countWords(paragraph) <= MAX_CHUNK_WORDS) {
    chunks.push(paragraph);
    continue;
  }
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)/g) ?? [paragraph];
  let buffer = "";
  for (const s of sentences) {
    if (buffer && countWords(buffer) + countWords(s) > MAX_CHUNK_WORDS) {
      chunks.push(buffer.trim());
      buffer = "";
    }
    buffer += s;
  }
  if (buffer.trim()) chunks.push(buffer.trim());
}

const normalize = (raw) =>
  raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const embeddable = chunks.filter((c) => countWords(c) >= MIN_WORDS_FOR_EMBEDDING).map(normalize);
const skipped = chunks.length - embeddable.length;

// --- embed, twice, to prove the cache ---------------------------------
const cache = new Map();
const cacheKey = (t) => createHash("sha256").update(`openai:${MODEL}:v1:${t}`).digest("hex");

async function run(label) {
  let apiCalls = 0;
  let tokens = 0;
  let hits = 0;
  let misses = 0;
  const started = Date.now();
  const pending = [];
  for (const t of embeddable) {
    if (cache.has(cacheKey(t))) hits++;
    else {
      misses++;
      pending.push(t);
    }
  }
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: batch, encoding_format: "float" }),
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const json = await res.json();
    apiCalls++;
    tokens += json.usage?.total_tokens ?? 0;
    batch.forEach((t, k) => cache.set(cacheKey(t), json.data[k].embedding));
  }
  const ms = Date.now() - started;
  const cost = (tokens / 1e6) * PRICE_PER_MTOKEN;
  console.log(
    `  ${label.padEnd(22)} llamadas=${apiCalls}  tokens=${String(tokens).padStart(4)}  ` +
      `cacheHit=${hits}  cacheMiss=${misses}  ${String(ms).padStart(5)}ms  $${cost.toFixed(8)}`,
  );
  return { apiCalls, tokens, hits, misses, ms, cost };
}

console.log(`\nDocumento: herramio_originalidad_prueba.pdf`);
console.log(`  paginas=${pages.length}  palabras=${countWords(text)}  chunks=${chunks.length}  embebibles=${embeddable.length}  omitidos=${skipped}\n`);

const first = await run("1a pasada (fria)");
const second = await run("2a pasada (cacheada)");

const perThousand = first.cost * 1000;
console.log(`\n  Coste real de este documento: $${first.cost.toFixed(8)}`);
console.log(`  Por 1 000 documentos:         $${perThousand.toFixed(4)}`);
console.log(`  Un plan Pro de $3.99 cubre:   ${Math.floor(3.99 / first.cost).toLocaleString("es")} documentos de este tamano`);
console.log(`  Ahorro por cache en reanalisis: ${second.apiCalls === 0 ? "100% (0 llamadas)" : `${second.apiCalls} llamadas`}\n`);
