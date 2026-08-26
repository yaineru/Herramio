/**
 * Finds and removes storage objects with no surviving `documents` row.
 *
 * These exist because the database and the object store are two systems
 * with one weak link between them. Deleting a document through the app
 * removes the file first and then the row, which is correct. But a row
 * removed any other way — a cascade from deleting an auth user, a direct
 * SQL delete, a failed insert after a successful upload — leaves the PDF
 * behind with nothing pointing at it. Measured during the release-candidate
 * QA runs: both times, the objects were still there after the users were
 * gone.
 *
 * That is a privacy problem before it is a housekeeping one. Someone who
 * deletes their account is entitled to expect their thesis is gone.
 *
 * Runs read-only by default. Deleting requires --apply, and every object
 * is listed before anything is removed.
 *
 *   node scripts/cleanup-orphan-storage.mjs           # report only
 *   node scripts/cleanup-orphan-storage.mjs --apply   # actually delete
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "originality-documents";
const APPLY = process.argv.includes("--apply");

if (!URL_BASE || !SERVICE) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function listPrefix(prefix) {
  const res = await fetch(`${URL_BASE}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  const json = await res.json().catch(() => []);
  return Array.isArray(json) ? json : [];
}

/**
 * Storage lists one level at a time, and paths here are
 * {userId}/{documentId}/{filename}, so this walks three levels rather
 * than assuming a flat namespace.
 */
async function listAllObjects() {
  const objects = [];
  for (const user of await listPrefix("")) {
    for (const doc of await listPrefix(user.name)) {
      const files = await listPrefix(`${user.name}/${doc.name}`);
      for (const file of files) {
        objects.push({ path: `${user.name}/${doc.name}/${file.name}`, userId: user.name, documentId: doc.name });
      }
    }
  }
  return objects;
}

async function knownStoragePaths() {
  const res = await fetch(`${URL_BASE}/rest/v1/documents?select=storage_path`, { headers });
  const rows = await res.json().catch(() => []);
  return new Set((Array.isArray(rows) ? rows : []).map((r) => r.storage_path).filter(Boolean));
}

const objects = await listAllObjects();
const known = await knownStoragePaths();
const orphans = objects.filter((o) => !known.has(o.path));

console.log(`\nObjetos en el bucket:      ${objects.length}`);
console.log(`Filas en documents:        ${known.size}`);
console.log(`Huérfanos (sin fila):      ${orphans.length}\n`);

if (orphans.length === 0) {
  console.log("Nada que limpiar.\n");
  process.exit(0);
}

for (const o of orphans) console.log(`  ${o.path}`);

if (!APPLY) {
  console.log(`\nModo informe. Ejecuta con --apply para eliminar estos ${orphans.length} objetos.\n`);
  process.exit(0);
}

const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}`, {
  method: "DELETE",
  headers,
  body: JSON.stringify({ prefixes: orphans.map((o) => o.path) }),
});
console.log(`\nDELETE -> ${res.status}`);

// Never trust the status code: re-read and count what actually survived.
const remaining = await listAllObjects();
const stillOrphaned = remaining.filter((o) => !known.has(o.path));
console.log(`Verificado releyendo — objetos restantes: ${remaining.length}, huérfanos restantes: ${stillOrphaned.length}`);
if (stillOrphaned.length > 0) {
  for (const o of stillOrphaned) console.log(`  NO BORRADO: ${o.path}`);
  process.exit(1);
}
console.log("Limpieza verificada.\n");
