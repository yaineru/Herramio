/**
 * Real A/B tenant-isolation proof for the vector layer.
 *
 * Creates two throwaway users, gives each a document with one chunk and
 * one embedding, then tries — as each user, with that user's own JWT — to
 * reach the other's data by every route the schema exposes: the vector
 * search RPC, a direct table select, and insert/update/delete against the
 * other tenant's rows.
 *
 * The vectors are deliberately IDENTICAL. That is the whole point: if
 * isolation were leaking, a cosine similarity of 1.0 guarantees the
 * neighbour search would surface the other tenant's chunk. Using different
 * vectors could hide a leak behind a low similarity score and produce a
 * false all-clear.
 *
 * PostgREST answers a write that RLS filtered away with 204/200, not 403 —
 * so a status code is never accepted as proof here. Every write attempt is
 * followed by a service-role re-read of the actual row, and the assertion
 * is made against the stored data.
 *
 * Everything created is removed at the end, including on failure.
 *
 * Usage:  node scripts/verify-vector-isolation.mjs
 */

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_BASE || !SERVICE || !ANON) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const DIMENSIONS = 1536;
const MODEL = `isolation-test-${randomUUID().slice(0, 8)}`;
// Identical on both sides, so cosine similarity between them is exactly 1.
const SHARED_VECTOR = Array.from({ length: DIMENSIONS }, (_, i) => ((i % 7) + 1) / 10);

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`  ${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function rest(path, { token = SERVICE, method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: token === SERVICE ? SERVICE : ANON,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body (e.g. empty 204) */
  }
  return { status: res.status, json, text };
}

async function adminCreateUser(email, password) {
  const res = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`create user failed: ${JSON.stringify(json)}`);
  return json.id;
}

async function signIn(email, password) {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`sign in failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function adminDeleteUser(id) {
  await fetch(`${URL_BASE}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
}

async function rpc(token, body) {
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/match_document_chunks`, {
    method: "POST",
    headers: {
      apikey: token === SERVICE ? SERVICE : ANON,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

async function seed(userId, label) {
  const doc = await rest("documents", {
    method: "POST",
    prefer: "return=representation",
    body: {
      user_id: userId,
      original_filename: `${label}.pdf`,
      mime_type: "application/pdf",
      file_size_bytes: 1024,
      storage_path: `isolation-test/${randomUUID()}.pdf`,
      status: "completed",
    },
  });
  if (!doc.json?.[0]) throw new Error(`seed document failed: ${doc.text}`);
  const documentId = doc.json[0].id;

  const chunk = await rest("document_chunks", {
    method: "POST",
    prefer: "return=representation",
    body: {
      document_id: documentId,
      sequence: 0,
      text: `Secret content belonging to ${label} only.`,
      normalized_text: `secret content belonging to ${label} only`,
      word_count: 6,
    },
  });
  if (!chunk.json?.[0]) throw new Error(`seed chunk failed: ${chunk.text}`);
  const chunkId = chunk.json[0].id;

  const emb = await rest("document_chunk_embeddings", {
    method: "POST",
    body: { chunk_id: chunkId, model: MODEL, dimensions: DIMENSIONS, embedding: JSON.stringify(SHARED_VECTOR) },
  });
  if (emb.status >= 300) throw new Error(`seed embedding failed: ${emb.text}`);

  return { documentId, chunkId };
}

async function main() {
  const stamp = randomUUID().slice(0, 8);
  const users = [
    { label: "userA", email: `isolation-a-${stamp}@herramio-test.invalid`, password: `Pw-${randomUUID()}` },
    { label: "userB", email: `isolation-b-${stamp}@herramio-test.invalid`, password: `Pw-${randomUUID()}` },
  ];

  const created = [];
  try {
    console.log("\nSeeding two tenants with IDENTICAL vectors (cosine similarity 1.0)...\n");
    for (const u of users) {
      u.id = await adminCreateUser(u.email, u.password);
      created.push(u.id);
      u.token = await signIn(u.email, u.password);
      Object.assign(u, await seed(u.id, u.label));
    }
    const [A, B] = users;

    console.log("\n1. Vector search RPC — each tenant queries with the shared vector\n");
    for (const [self, other] of [
      [A, B],
      [B, A],
    ]) {
      const { status, json } = await rpc(self.token, {
        p_embedding: SHARED_VECTOR,
        p_model: MODEL,
        // Exclude only the caller's OWN document, so the other tenant's
        // chunk is the single remaining perfect match. If isolation leaks,
        // it appears here with similarity 1.0.
        p_exclude_document_id: self.documentId,
        p_match_threshold: 0.5,
        p_match_count: 20,
      });
      const rows = Array.isArray(json) ? json : [];
      const leaked = rows.filter((r) => r.document_id === other.documentId);
      check(
        `${self.label} RPC cannot see ${other.label}'s chunk`,
        status === 200 && leaked.length === 0,
        `status=${status} rows=${rows.length} leaked=${leaked.length}`,
      );
    }

    console.log("\n2. Direct table SELECT\n");
    for (const [self, other] of [
      [A, B],
      [B, A],
    ]) {
      const doc = await rest(`documents?id=eq.${other.documentId}&select=id`, { token: self.token });
      check(
        `${self.label} cannot SELECT ${other.label}'s document`,
        Array.isArray(doc.json) && doc.json.length === 0,
        `rows=${Array.isArray(doc.json) ? doc.json.length : "?"}`,
      );

      const chunk = await rest(`document_chunks?id=eq.${other.chunkId}&select=id,text`, { token: self.token });
      check(
        `${self.label} cannot SELECT ${other.label}'s chunk text`,
        Array.isArray(chunk.json) && chunk.json.length === 0,
        `rows=${Array.isArray(chunk.json) ? chunk.json.length : "?"}`,
      );

      const emb = await rest(`document_chunk_embeddings?chunk_id=eq.${other.chunkId}&select=chunk_id`, {
        token: self.token,
      });
      check(
        `${self.label} cannot SELECT ${other.label}'s embedding`,
        Array.isArray(emb.json) && emb.json.length === 0,
        `rows=${Array.isArray(emb.json) ? emb.json.length : "?"}`,
      );
    }

    console.log("\n3. Writes against the other tenant — verified by re-reading, never by status code\n");

    // UPDATE someone else's chunk text.
    const upd = await rest(`document_chunks?id=eq.${B.chunkId}`, {
      token: A.token,
      method: "PATCH",
      body: { text: "TAMPERED BY USER A" },
    });
    const afterUpd = await rest(`document_chunks?id=eq.${B.chunkId}&select=text`);
    check(
      "userA UPDATE of userB's chunk did not change the stored row",
      afterUpd.json?.[0]?.text?.includes("userB"),
      `http=${upd.status} stored="${afterUpd.json?.[0]?.text ?? "?"}"`,
    );

    // DELETE someone else's embedding.
    const del = await rest(`document_chunk_embeddings?chunk_id=eq.${B.chunkId}`, {
      token: A.token,
      method: "DELETE",
    });
    const afterDel = await rest(`document_chunk_embeddings?chunk_id=eq.${B.chunkId}&select=chunk_id`);
    check(
      "userA DELETE of userB's embedding did not remove the row",
      Array.isArray(afterDel.json) && afterDel.json.length === 1,
      `http=${del.status} rowsRemaining=${Array.isArray(afterDel.json) ? afterDel.json.length : "?"}`,
    );

    // INSERT a chunk into someone else's document.
    const ins = await rest("document_chunks", {
      token: A.token,
      method: "POST",
      body: {
        document_id: B.documentId,
        sequence: 99,
        text: "INJECTED BY USER A",
        normalized_text: "injected by user a",
        word_count: 4,
      },
    });
    const afterIns = await rest(`document_chunks?document_id=eq.${B.documentId}&select=id`);
    check(
      "userA INSERT into userB's document did not create a row",
      Array.isArray(afterIns.json) && afterIns.json.length === 1,
      `http=${ins.status} chunksInBDoc=${Array.isArray(afterIns.json) ? afterIns.json.length : "?"}`,
    );

    console.log("\n4. Anonymous access\n");
    const anonRpc = await rpc(ANON, {
      p_embedding: SHARED_VECTOR,
      p_model: MODEL,
      p_exclude_document_id: randomUUID(),
      p_match_threshold: 0.5,
      p_match_count: 20,
    });
    check("anon cannot execute the vector search RPC", anonRpc.status === 403 || anonRpc.status === 401, `status=${anonRpc.status}`);

    const anonDocs = await rest("documents?select=id&limit=5", { token: ANON });
    check(
      "anon cannot list documents",
      !Array.isArray(anonDocs.json) || anonDocs.json.length === 0,
      `rows=${Array.isArray(anonDocs.json) ? anonDocs.json.length : "denied"}`,
    );

    console.log("\n5. Control: each tenant CAN reach its own data (proves the test isn't vacuous)\n");
    for (const self of [A, B]) {
      const own = await rest(`document_chunks?id=eq.${self.chunkId}&select=id,text`, { token: self.token });
      check(`${self.label} can read its OWN chunk`, Array.isArray(own.json) && own.json.length === 1, `rows=${own.json?.length ?? 0}`);
    }
  } finally {
    console.log("\nCleaning up...");
    for (const id of created) await adminDeleteUser(id);
    // Documents cascade from auth.users; the embedding rows cascade from
    // chunks. Sweep the model tag anyway in case a user delete was partial.
    await rest(`document_chunk_embeddings?model=eq.${MODEL}`, { method: "DELETE" });
    const leftover = await rest(`document_chunk_embeddings?model=eq.${MODEL}&select=chunk_id`);
    console.log(`  removed ${created.length} test users; leftover embedding rows: ${Array.isArray(leftover.json) ? leftover.json.length : "?"}`);
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.log("FAILED:");
    for (const f of failed) console.log(`  - ${f.name} (${f.detail})`);
    process.exit(1);
  }
  console.log("Vector layer tenant isolation: VERIFIED\n");
}

main().catch((err) => {
  console.error("\nverification aborted:", err.message);
  process.exit(1);
});
