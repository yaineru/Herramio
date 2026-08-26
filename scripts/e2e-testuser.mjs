/**
 * Creates or removes the throwaway QA users for the release-candidate E2E.
 * Kept as a script so the accounts are always identifiable, always
 * ephemeral, and always removable by the same code path that made them.
 *
 *   node scripts/e2e-testuser.mjs create
 *   node scripts/e2e-testuser.mjs cleanup
 *   node scripts/e2e-testuser.mjs residuals
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")]),
);
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const STATE = ".e2e-users.json";
// Everything the QA run creates carries this marker, so cleanup can find
// stragglers even if the user rows were removed first.
const MARKER = "herramio-e2e-test";
const BUCKET = "originality-documents";

const admin = (path, init = {}) =>
  fetch(`${URL_BASE}${path}`, {
    ...init,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });

async function create() {
  const stamp = randomUUID().slice(0, 8);
  const users = [];
  for (const label of ["A", "B"]) {
    const email = `${MARKER}-${label.toLowerCase()}-${stamp}@herramio-test.invalid`;
    const password = `Qa-${randomUUID()}`;
    const res = await admin("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`create ${label}: ${JSON.stringify(json)}`);
    users.push({ label: `TEST USER ${label}`, email, password, id: json.id });
  }
  writeFileSync(STATE, JSON.stringify({ marker: MARKER, users }, null, 2));
  console.log(JSON.stringify({ users: users.map((u) => ({ label: u.label, email: u.email, id: u.id })) }, null, 1));
}

async function listResiduals() {
  const q = async (path) => {
    const r = await admin(`/rest/v1/${path}`);
    const j = await r.json().catch(() => null);
    return Array.isArray(j) ? j : [];
  };
  const users = await admin("/auth/v1/admin/users?per_page=200").then((r) => r.json());
  const testUsers = (users.users || []).filter((u) => (u.email || "").includes(MARKER));
  const docs = await q(`documents?select=id,user_id,original_filename,storage_path&original_filename=like.*herramio_originalidad*`);
  const storage = await admin(`/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    body: JSON.stringify({ prefix: "", limit: 200 }),
  }).then((r) => r.json()).catch(() => []);
  return { testUsers, docs, storageEntries: Array.isArray(storage) ? storage.length : "n/a" };
}

async function cleanup() {
  if (!existsSync(STATE)) {
    console.log("no state file; nothing recorded to clean");
  }
  const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { users: [] };

  // Storage first, and it genuinely has to be first: deleting the auth
  // user cascades every DB row but leaves the uploaded file orphaned in
  // the bucket. Measured during the release-candidate run — the objects
  // were still there after both users were gone.
  //
  // The per-object DELETE URL form returns 400; the bulk endpoint takes
  // the paths in the body, so that is what this uses.
  for (const u of state.users) {
    const docs = await admin(`/rest/v1/documents?select=id,storage_path&user_id=eq.${u.id}`).then((r) => r.json()).catch(() => []);
    const paths = (Array.isArray(docs) ? docs : []).map((d) => d.storage_path).filter(Boolean);
    if (paths.length === 0) continue;
    const del = await admin(`/storage/v1/object/${BUCKET}`, { method: "DELETE", body: JSON.stringify({ prefixes: paths }) });
    console.log(`  storage bulk delete ${paths.length} object(s) -> ${del.status}`);
  }

  // Deleting the auth user cascades documents -> chunks -> citations,
  // references, matches, reports and embeddings via ON DELETE CASCADE.
  for (const u of state.users) {
    const res = await admin(`/auth/v1/admin/users/${u.id}`, { method: "DELETE" });
    console.log(`  user delete ${u.label} (${u.id}) -> ${res.status}`);
  }

  // Sweep any test user left from an aborted earlier run.
  const all = await admin("/auth/v1/admin/users?per_page=200").then((r) => r.json()).catch(() => ({}));
  for (const u of (all.users || []).filter((x) => (x.email || "").includes(MARKER))) {
    const res = await admin(`/auth/v1/admin/users/${u.id}`, { method: "DELETE" });
    console.log(`  swept stray ${u.email} -> ${res.status}`);
  }

  const residual = await listResiduals();
  console.log(JSON.stringify({ residualTestUsers: residual.testUsers.length, residualDocs: residual.docs.length }, null, 1));
  if (residual.testUsers.length === 0 && residual.docs.length === 0) console.log("CLEANUP VERIFIED: 0 residual test records");
  else console.log("CLEANUP INCOMPLETE");
}

const cmd = process.argv[2];
if (cmd === "create") await create();
else if (cmd === "cleanup") await cleanup();
else if (cmd === "residuals") console.log(JSON.stringify(await listResiduals(), null, 1));
else console.log("usage: create | cleanup | residuals");
