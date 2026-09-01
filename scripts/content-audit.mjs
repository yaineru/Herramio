/**
 * Crawls the public site and reports what a search-quality reviewer would
 * actually see on each page.
 *
 * Fetches the rendered HTML rather than reading the source, because the
 * question is not "did we pass a prop" but "what is on the page". It
 * measures the MAIN region only — counting the shared navbar and footer as
 * content would make every page look substantial and hide the exact
 * problem this is meant to find.
 *
 * Deliberately reports several independent signals instead of one number.
 * Word count alone is a bad proxy: a 900-word page repeating the same
 * paragraph on 40 URLs is worse than a 200-word page that answers a real
 * question. So duplication across pages is measured too, and it is
 * weighted as heavily as length.
 *
 * Usage:
 *   node scripts/content-audit.mjs                 # against localhost:3001
 *   node scripts/content-audit.mjs https://herramio.com
 */
const BASE = process.argv[2] || "http://localhost:3001";
const CONCURRENCY = 6;

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (text) => (text ? text.split(/\s+/).filter((w) => w.length > 1).length : 0);

function attr(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

/** The <main> region: page content without the shared chrome. */
function mainRegion(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function analyse(url, html) {
  const main = mainRegion(html);
  const mainText = strip(main);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1]));
  const h2s = [...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => strip(m[1]));
  const h3s = [...main.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => strip(m[1]));

  const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((m) => {
      try {
        const parsed = JSON.parse(m[1]);
        return (Array.isArray(parsed) ? parsed : [parsed]).map((x) => x["@type"]).filter(Boolean);
      } catch {
        return [];
      }
    });

  // Internal links inside main only: the navbar and footer link everywhere
  // on every page, so counting them measures the template, not the page.
  const internal = new Set(
    [...main.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/$/, "")).filter(Boolean),
  );

  const robots = attr(html, /<meta[^>]*name="robots"[^>]*content="([^"]*)"/i) ?? "";

  return {
    url,
    title: attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: attr(html, /<meta[^>]*name="description"[^>]*content="([^"]*)"/i),
    canonical: attr(html, /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i),
    h1: h1s[0] ?? null,
    h1Count: h1s.length,
    h2Count: h2s.length,
    h3Count: h3s.length,
    headings: [...h2s, ...h3s],
    mainWords: words(mainText),
    mainText,
    internalLinks: internal.size,
    jsonLd,
    noindex: /noindex/i.test(robots),
  };
}

async function fetchPage(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
    if (!res.ok) return { url: path, error: `HTTP ${res.status}` };
    return analyse(path, await res.text());
  } catch (error) {
    return { url: path, error: String(error).slice(0, 60) };
  }
}

// ------------------------------------------------------------ discover
const sitemapXml = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/")
  .map((p) => p.replace(/\/$/, "") || "/");

console.log(`\nRastreando ${urls.length} URLs del sitemap en ${BASE}\n`);

const pages = [];
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = await Promise.all(urls.slice(i, i + CONCURRENCY).map(fetchPage));
  pages.push(...batch);
  process.stdout.write(`  ${Math.min(i + CONCURRENCY, urls.length)}/${urls.length}\r`);
}
console.log(" ".repeat(30));

const ok = pages.filter((p) => !p.error);
const failed = pages.filter((p) => p.error);

// ---------------------------------------------------------- duplication
/**
 * Shingle-based near-duplicate detection between MAIN regions.
 *
 * "Pages that differ only by one word" is a specific Google complaint, and
 * exact-string comparison would miss it entirely. This reuses the same
 * idea as the originality engine: overlapping word triples, compared by
 * containment.
 */
function shingles(text, size = 5) {
  const w = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const set = new Set();
  for (let i = 0; i + size <= w.length; i++) set.add(w.slice(i, i + size).join(" "));
  return set;
}

const withShingles = ok.map((p) => ({ ...p, sh: shingles(p.mainText) }));
for (const page of withShingles) {
  let worst = 0;
  let twin = null;
  for (const other of withShingles) {
    if (other.url === page.url || page.sh.size < 20 || other.sh.size < 20) continue;
    let shared = 0;
    for (const s of page.sh) if (other.sh.has(s)) shared++;
    const overlap = shared / Math.min(page.sh.size, other.sh.size);
    if (overlap > worst) {
      worst = overlap;
      twin = other.url;
    }
  }
  page.duplication = +worst.toFixed(3);
  page.twin = twin;
}

const titleCounts = new Map();
const descCounts = new Map();
for (const p of ok) {
  if (p.title) titleCounts.set(p.title, (titleCounts.get(p.title) ?? 0) + 1);
  if (p.description) descCounts.set(p.description, (descCounts.get(p.description) ?? 0) + 1);
}

// --------------------------------------------------------------- score
/**
 * Five axes, each 0-20. Nothing here is a proxy for "will Google approve";
 * they are the things a reviewer can check and a reader can feel.
 */
function score(p) {
  const content =
    (p.mainWords >= 450 ? 8 : p.mainWords >= 250 ? 6 : p.mainWords >= 120 ? 3 : 0) +
    (p.h2Count + p.h3Count >= 4 ? 6 : p.h2Count + p.h3Count >= 2 ? 4 : p.h2Count >= 1 ? 2 : 0) +
    (p.duplication < 0.3 ? 6 : p.duplication < 0.5 ? 4 : p.duplication < 0.7 ? 2 : 0);

  const seo =
    (p.title && p.title.length >= 15 && p.title.length <= 65 ? 5 : p.title ? 3 : 0) +
    (p.description && p.description.length >= 70 && p.description.length <= 165 ? 5 : p.description ? 3 : 0) +
    (p.canonical ? 4 : 0) +
    (p.h1Count === 1 ? 4 : 0) +
    ((titleCounts.get(p.title) ?? 0) === 1 ? 2 : 0);

  const navigation =
    (p.internalLinks >= 12 ? 10 : p.internalLinks >= 6 ? 7 : p.internalLinks >= 3 ? 4 : 0) +
    (p.jsonLd.includes("BreadcrumbList") ? 5 : 0) +
    (p.internalLinks >= 3 ? 5 : 0);

  const trust = (p.jsonLd.length > 0 ? 8 : 0) + (p.canonical ? 6 : 0) + (!p.noindex ? 6 : 0);

  const ux = (p.h1Count === 1 ? 7 : 0) + (p.h2Count >= 1 ? 7 : 0) + (p.mainWords >= 120 ? 6 : 0);

  const clamp = (n) => Math.max(0, Math.min(20, n));
  const parts = { content: clamp(content), seo: clamp(seo), navigation: clamp(navigation), trust: clamp(trust), ux: clamp(ux) };
  return { ...parts, total: parts.content + parts.seo + parts.navigation + parts.trust + parts.ux };
}

for (const p of withShingles) p.score = score(p);

// -------------------------------------------------------------- report
const avg = (arr, f) => (arr.length ? +(arr.reduce((s, x) => s + f(x), 0) / arr.length).toFixed(1) : 0);
const sorted = [...withShingles].sort((a, b) => a.score.total - b.score.total);

console.log("=== RESUMEN ===");
console.log(`  páginas rastreadas   : ${ok.length} (${failed.length} con error)`);
console.log(`  palabras en <main>   : mediana ${withShingles.map((p) => p.mainWords).sort((a, b) => a - b)[Math.floor(ok.length / 2)]}, media ${avg(ok, (p) => p.mainWords)}`);
console.log(`  duplicación media    : ${avg(withShingles, (p) => p.duplication)}`);
console.log(`  títulos duplicados   : ${[...titleCounts.values()].filter((n) => n > 1).length}`);
console.log(`  descripciones dup.   : ${[...descCounts.values()].filter((n) => n > 1).length}`);
console.log(`  sin canonical        : ${ok.filter((p) => !p.canonical).length}`);
console.log(`  sin H1 único         : ${ok.filter((p) => p.h1Count !== 1).length}`);
console.log(`  noindex en sitemap   : ${ok.filter((p) => p.noindex).length}`);
console.log(`  SCORE GLOBAL         : ${avg(withShingles, (p) => p.score.total)} / 100`);

console.log("\n=== MEDIAS POR EJE ===");
for (const axis of ["content", "seo", "navigation", "trust", "ux"]) {
  console.log(`  ${axis.padEnd(11)} ${avg(withShingles, (p) => p.score[axis])} / 20`);
}

console.log("\n=== 15 PÁGINAS MÁS DÉBILES ===");
for (const p of sorted.slice(0, 15)) {
  console.log(
    `  ${String(p.score.total).padStart(3)}/100  ${p.url.padEnd(34)} ${String(p.mainWords).padStart(4)}w  h2/h3=${p.h2Count}/${p.h3Count}  dup=${p.duplication}  links=${p.internalLinks}`,
  );
}

const nearDupes = withShingles.filter((p) => p.duplication >= 0.6).sort((a, b) => b.duplication - a.duplication);
if (nearDupes.length) {
  console.log(`\n=== CASI DUPLICADAS (>=0.60 de solapamiento) — ${nearDupes.length} ===`);
  for (const p of nearDupes.slice(0, 12)) console.log(`  ${p.duplication}  ${p.url}  ~  ${p.twin}`);
}

if (failed.length) {
  console.log("\n=== ERRORES ===");
  for (const f of failed.slice(0, 10)) console.log(`  ${f.url}: ${f.error}`);
}
console.log();
