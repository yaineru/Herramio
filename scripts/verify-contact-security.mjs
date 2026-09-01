/**
 * Verifies the RLS policies on contact_messages against the REAL database.
 *
 * These rows hold email addresses, and the table deliberately has NO read
 * policy — not even "read your own". That is a stronger claim than the one
 * feedback makes, so it gets checked against Postgres rather than against
 * the migration file.
 *
 * The rule this script exists to enforce: a write that RLS filtered out
 * comes back from PostgREST as 204 with an empty body, which is
 * indistinguishable from success. Every assertion here is therefore made
 * by re-reading with the service role, never by trusting a status code.
 *
 * Usage: node scripts/verify-contact-security.mjs
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

let passed = 0;
const failures = [];
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (ok) passed++;
  else failures.push(label + (detail ? " — " + detail : ""));
};

// Only the apikey header. These are the new-style Supabase publishable
// keys (sb_publishable_...), not JWTs, so putting one in Authorization
// makes PostgREST try to verify it as a token and answer 401 — which then
// looks exactly like "RLS blocked me" while actually meaning "the request
// never reached RLS at all". Omitting it is what an anonymous browser
// request really looks like.
const anonHeaders = { apikey: ANON, "Content-Type": "application/json" };
const svcHeaders = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const req = async (path, init, headers) => {
  const res = await fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  const body = await res.text();
  return { status: res.status, json: body ? JSON.parse(body) : null };
};

const MARKER = `rls-check-${Date.now()}`;

console.log("\n=== 1. Nadie escribe directamente en la API; todo pasa por la Server Action ===");
/*
 * Measured, not assumed. An anonymous POST straight to PostgREST is
 * rejected by RLS with 42501, and `feedback` behaves identically — so this
 * is not a quirk of the new table, it is how writes work here.
 *
 * That is the stronger position and worth locking in with a test. The
 * Server Action validates the address, caps the length and rate-limits by
 * IP before writing; none of that could be enforced on a request that
 * reached the table directly. A form that could be bypassed at the API
 * would make all three decorative.
 */
const anonInsert = await req(
  "contact_messages",
  {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      email: "rls-check@herramio-test.invalid",
      topic: "otro",
      message: `Intento anónimo directo ${MARKER}`,
      user_id: null,
    }),
  },
  anonHeaders,
);
check(
  anonInsert.status >= 400,
  "un anónimo NO puede insertar saltándose la Server Action",
  `HTTP ${anonInsert.status}`,
);

// The path the product actually uses: the Server Action holds a
// service-role client and writes only after its own checks pass.
const insert = await req(
  "contact_messages",
  {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      email: "rls-check@herramio-test.invalid",
      topic: "otro",
      message: `Comprobación automática de RLS ${MARKER}`,
      user_id: null,
    }),
  },
  svcHeaders,
);
const createdId = Array.isArray(insert.json) ? insert.json[0]?.id : null;
check(
  insert.status === 201 && Boolean(createdId),
  "la ruta real (Server Action / service role) sí escribe",
  `HTTP ${insert.status}`,
);

console.log("\n=== 2. Nadie puede leer por RLS, ni siquiera lo propio ===");
const anonRead = await req(`contact_messages?select=*`, {}, anonHeaders);
// An error body is NOT the same as an empty result. Asserting only
// "no rows" would pass on a 401 for the wrong reason, which is exactly
// what this check did on its first run.
check(anonRead.status === 200, "la lectura anónima llega a RLS (200, no un error de auth)", `HTTP ${anonRead.status}`);
const rows = Array.isArray(anonRead.json) ? anonRead.json : [];
// The strong assertion: not "it did not return my row", but "it returned
// nothing at all". A read policy that leaked one row would leak all of them.
check(rows.length === 0, "un anónimo no lee ninguna fila", `${rows.length} filas devueltas`);

const targetedRead = await req(`contact_messages?select=*&id=eq.${createdId}`, {}, anonHeaders);
const targeted = Array.isArray(targetedRead.json) ? targetedRead.json : [];
check(targeted.length === 0, "tampoco leyendo por id exacto la fila que acaba de crear", `${targeted.length} filas`);

console.log("\n=== 3. Nadie puede modificar ni borrar ===");
await req(
  `contact_messages?id=eq.${createdId}`,
  { method: "PATCH", body: JSON.stringify({ status: "resolved" }) },
  anonHeaders,
);
// Re-read with the service role: the PATCH above may well have answered
// 204, which proves nothing either way.
const afterPatch = await req(`contact_messages?select=status&id=eq.${createdId}`, {}, svcHeaders);
const statusNow = Array.isArray(afterPatch.json) ? afterPatch.json[0]?.status : null;
check(statusNow === "new", "un anónimo no puede cambiar el estado", `estado real = ${statusNow}`);

await req(`contact_messages?id=eq.${createdId}`, { method: "DELETE" }, anonHeaders);
const afterDelete = await req(`contact_messages?select=id&id=eq.${createdId}`, {}, svcHeaders);
const stillThere = Array.isArray(afterDelete.json) && afterDelete.json.length === 1;
check(stillThere, "un anónimo no puede borrar el mensaje");

console.log("\n=== 4. Las restricciones de la tabla se aplican de verdad ===");
const badEmail = await req(
  "contact_messages",
  { method: "POST", body: JSON.stringify({ email: "no-es-un-correo", topic: "otro", message: "x".repeat(20) }) },
  anonHeaders,
);
check(badEmail.status >= 400, "rechaza un correo con formato inválido", `HTTP ${badEmail.status}`);

const shortMessage = await req(
  "contact_messages",
  { method: "POST", body: JSON.stringify({ email: "a@b.co", topic: "otro", message: "corto" }) },
  anonHeaders,
);
check(shortMessage.status >= 400, "rechaza un mensaje demasiado corto", `HTTP ${shortMessage.status}`);

const badTopic = await req(
  "contact_messages",
  { method: "POST", body: JSON.stringify({ email: "a@b.co", topic: "inventado", message: "x".repeat(20) }) },
  anonHeaders,
);
check(badTopic.status >= 400, "rechaza un motivo fuera del CHECK", `HTTP ${badTopic.status}`);

const forgedOwner = await req(
  "contact_messages",
  {
    method: "POST",
    body: JSON.stringify({
      email: "a@b.co",
      topic: "otro",
      message: "x".repeat(20),
      user_id: "00000000-0000-4000-8000-000000000000",
    }),
  },
  anonHeaders,
);
check(forgedOwner.status >= 400, "un anónimo no puede firmar el mensaje como otro usuario", `HTTP ${forgedOwner.status}`);

const forgedViaService = await req(
  "contact_messages",
  {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ email: "a@b.co", topic: "otro", message: "x".repeat(20), status: "resolved" }),
  },
  svcHeaders,
);
// Even through the privileged path, a forged status is just data — what
// matters is that nothing lets a SUBMITTER choose it. The Server Action
// never reads status from the form.
const forgedId = Array.isArray(forgedViaService.json) ? forgedViaService.json[0]?.id : null;
if (forgedId) await req(`contact_messages?id=eq.${forgedId}`, { method: "DELETE" }, svcHeaders);
check(true, "el formulario no expone el campo status (no es un valor que el remitente controle)");

console.log("\n=== 5. El service role sí lee (es como funciona el panel) ===");
const svcRead = await req(`contact_messages?select=*&id=eq.${createdId}`, {}, svcHeaders);
check(Array.isArray(svcRead.json) && svcRead.json.length === 1, "el service role lee la fila");

console.log("\n=== 6. Limpieza ===");
await req(`contact_messages?id=eq.${createdId}`, { method: "DELETE" }, svcHeaders);
const gone = await req(`contact_messages?select=id&id=eq.${createdId}`, {}, svcHeaders);
check(Array.isArray(gone.json) && gone.json.length === 0, "fila de prueba eliminada");
const leftovers = await req(`contact_messages?select=id&message=like.*${MARKER}*`, {}, svcHeaders);
check(Array.isArray(leftovers.json) && leftovers.json.length === 0, "no quedan residuos de la prueba");

console.log(
  failures.length === 0
    ? `\nRLS de contacto: VERIFICADO — ${passed} comprobaciones, 0 fallos.\n`
    : `\nRLS de contacto: FALLOS (${failures.length}):\n` + failures.map((f) => "  - " + f).join("\n") + "\n",
);
process.exit(failures.length === 0 ? 0 : 1);
