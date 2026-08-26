/**
 * Cross-tenant isolation over a REAL analysed document.
 *
 * The vector-layer proof (verify-vector-isolation.mjs) seeds synthetic
 * rows. This one runs against the artefacts the actual pipeline produced
 * from the QA PDF — document, chunks, citations, references, matches,
 * report and the stored file — because those are what a real attacker
 * would go after.
 *
 * No status code is ever accepted as proof. Every write is re-read with
 * the service role and asserted against the stored data: PostgREST answers
 * an RLS-filtered write with 204, which reads as success and is not.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)).filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const state = JSON.parse(readFileSync(".e2e-users.json", "utf8"));
const [A, B] = state.users;
const DOC = process.argv[2];
if (!DOC) { console.error("usage: node scripts/verify-user-isolation.mjs <documentId>"); process.exit(1); }

const results = [];
const check = (name, passed, detail = "") => { results.push({ name, passed }); console.log(`  ${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`); };

async function signIn(u) {
  const r = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: u.email, password: u.password }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`sign in ${u.label}: ${JSON.stringify(j)}`);
  return j.access_token;
}

const rest = async (path, { token = SERVICE, method = "GET", body } = {}) => {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers: { apikey: token === SERVICE ? SERVICE : ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { /* empty */ }
  return { status: res.status, json };
};

const rows = (r) => (Array.isArray(r.json) ? r.json.length : -1);

const tokenB = await signIn(B);
const tokenA = await signIn(A);

// What actually exists, established with the service role first, so a
// "cannot see it" result can never be an artefact of the row not existing.
const chunkIds = (await rest(`document_chunks?document_id=eq.${DOC}&select=id`)).json.map((r) => r.id);
const storagePath = (await rest(`documents?id=eq.${DOC}&select=storage_path`)).json[0].storage_path;
console.log(`\nTarget: document ${DOC} owned by ${A.label}`);
console.log(`  ${chunkIds.length} chunks, storage at ${storagePath}\n`);

console.log("1. USER B reading USER A's artefacts\n");
for (const [label, path] of [
  ["document", `documents?id=eq.${DOC}&select=id`],
  ["chunks", `document_chunks?document_id=eq.${DOC}&select=id,text`],
  ["citations", `citations?document_id=eq.${DOC}&select=id`],
  ["references", `document_references?document_id=eq.${DOC}&select=id`],
  ["similarity matches", `similarity_matches?document_id=eq.${DOC}&select=id`],
  ["report", `originality_reports?document_id=eq.${DOC}&select=id`],
  ["embeddings", `document_chunk_embeddings?chunk_id=in.(${chunkIds.join(",")})&select=chunk_id`],
]) {
  const asB = await rest(path, { token: tokenB });
  const asService = await rest(path);
  check(`B cannot read A's ${label}`, rows(asB) === 0, `B sees ${rows(asB)}, service role sees ${rows(asService)}`);
}

console.log("\n2. USER B writing to USER A's artefacts — verified by re-reading\n");

const originalText = (await rest(`document_chunks?id=eq.${chunkIds[0]}&select=text`)).json[0].text;
const upd = await rest(`document_chunks?id=eq.${chunkIds[0]}`, { token: tokenB, method: "PATCH", body: { text: "TAMPERED BY USER B" } });
const afterUpd = (await rest(`document_chunks?id=eq.${chunkIds[0]}&select=text`)).json[0].text;
check("B UPDATE of A's chunk left the stored text unchanged", afterUpd === originalText, `http=${upd.status}`);

const del = await rest(`documents?id=eq.${DOC}`, { token: tokenB, method: "DELETE" });
const afterDel = await rest(`documents?id=eq.${DOC}&select=id`);
check("B DELETE of A's document did not remove it", rows(afterDel) === 1, `http=${del.status}`);

const delChunks = await rest(`document_chunks?document_id=eq.${DOC}`, { token: tokenB, method: "DELETE" });
const afterDelChunks = await rest(`document_chunks?document_id=eq.${DOC}&select=id`);
check("B DELETE of A's chunks removed nothing", rows(afterDelChunks) === chunkIds.length, `http=${delChunks.status} remaining=${rows(afterDelChunks)}`);

const ins = await rest("document_chunks", {
  token: tokenB, method: "POST",
  body: { document_id: DOC, sequence: 999, text: "INJECTED BY B", normalized_text: "injected by b", word_count: 3 },
});
const afterIns = await rest(`document_chunks?document_id=eq.${DOC}&select=id`);
check("B INSERT into A's document created no row", rows(afterIns) === chunkIds.length, `http=${ins.status}`);

console.log("\n3. Storage\n");
const storageAsB = await fetch(`${URL_BASE}/storage/v1/object/originality-documents/${storagePath}`, {
  headers: { apikey: ANON, Authorization: `Bearer ${tokenB}` },
});
check("B cannot download A's uploaded file", storageAsB.status >= 400, `status=${storageAsB.status}`);

const storageAnon = await fetch(`${URL_BASE}/storage/v1/object/public/originality-documents/${storagePath}`);
check("the file is not publicly readable", storageAnon.status >= 400, `status=${storageAnon.status}`);

console.log("\n4. Control — USER A can reach their own data (proves the test is not vacuous)\n");
const ownDoc = await rest(`documents?id=eq.${DOC}&select=id`, { token: tokenA });
check("A can read their own document", rows(ownDoc) === 1);
const ownChunks = await rest(`document_chunks?document_id=eq.${DOC}&select=id`, { token: tokenA });
check("A can read their own chunks", rows(ownChunks) === chunkIds.length, `${rows(ownChunks)}/${chunkIds.length}`);
const storageAsA = await fetch(`${URL_BASE}/storage/v1/object/originality-documents/${storagePath}`, {
  headers: { apikey: ANON, Authorization: `Bearer ${tokenA}` },
});
check("A can download their own file", storageAsA.status === 200, `status=${storageAsA.status}`);

const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) { failed.forEach((f) => console.log(`  FAILED: ${f.name}`)); process.exit(1); }
console.log("Cross-tenant isolation over real pipeline output: VERIFIED\n");
