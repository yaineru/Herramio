/**
 * Real RLS proof for the feedback table.
 *
 * The admin panel reads feedback through the service role, which bypasses
 * RLS entirely. That makes the database policies the last line of defence
 * for everything that is NOT the admin panel — a leaked anon key, a
 * future client-side query, a mistake in a Server Action. So they get
 * tested directly rather than inferred from the UI behaving correctly.
 *
 * No status code is taken as proof: every write is re-read with the
 * service role, because PostgREST answers an RLS-filtered write with a
 * success status and an empty body.
 *
 * Everything created here is removed at the end.
 *
 * Usage: node scripts/verify-feedback-security.mjs
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
);

const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_BASE || !SERVICE || !ANON) {
  console.error("Faltan variables de Supabase en .env.local");
  process.exit(1);
}

const MARKER = `rls-probe-${randomUUID().slice(0, 8)}`;
const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed });
  console.log(`  ${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };
const anonHeaders = (token) => ({ apikey: ANON, Authorization: `Bearer ${token ?? ANON}`, "Content-Type": "application/json" });

async function rest(path, { headers = svc, method = "GET", body } = {}) {
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
    /* empty body */
  }
  return { status: res.status, json };
}

const rows = (r) => (Array.isArray(r.json) ? r.json.length : -1);

async function adminCreateUser(email, password) {
  const res = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: svc,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`create user: ${JSON.stringify(json)}`);
  return json.id;
}

async function signIn(email, password) {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`sign in: ${JSON.stringify(json)}`);
  return json.access_token;
}

const created = [];
const stamp = randomUUID().slice(0, 8);
const users = [
  { label: "A", email: `${MARKER}-a-${stamp}@herramio-test.invalid`, password: `Pw-${randomUUID()}` },
  { label: "B", email: `${MARKER}-b-${stamp}@herramio-test.invalid`, password: `Pw-${randomUUID()}` },
];

try {
  for (const u of users) {
    u.id = await adminCreateUser(u.email, u.password);
    created.push(u.id);
    u.token = await signIn(u.email, u.password);
  }
  const [A, B] = users;

  console.log("\nSembrando un comentario de cada usuario\n");
  for (const u of [A, B]) {
    const r = await rest("feedback", {
      method: "POST",
      headers: { ...svc, Prefer: "return=representation" },
      body: { user_id: u.id, kind: "problem", message: `${MARKER} mensaje privado de ${u.label}`, page_path: "/cuenta", context: {} },
    });
    u.feedbackId = r.json?.[0]?.id;
    if (!u.feedbackId) throw new Error(`seed failed for ${u.label}`);
  }

  console.log("1. Lectura entre usuarios\n");
  const bSeesA = await rest(`feedback?id=eq.${A.feedbackId}&select=id,message`, { headers: anonHeaders(B.token) });
  check("B no puede leer el feedback de A", rows(bSeesA) === 0, `filas=${rows(bSeesA)}`);

  const aSeesOwn = await rest(`feedback?id=eq.${A.feedbackId}&select=id`, { headers: anonHeaders(A.token) });
  check("A SÍ puede leer el suyo (la prueba no es vacía)", rows(aSeesOwn) === 1, `filas=${rows(aSeesOwn)}`);

  const anonSees = await rest("feedback?select=id,message", { headers: anonHeaders(null) });
  check("anónimo no puede leer ningún feedback", rows(anonSees) === 0, `filas=${rows(anonSees)}`);

  console.log("\n2. Escritura — verificada releyendo, nunca por el código HTTP\n");
  const forged = await rest("feedback", {
    method: "POST",
    headers: anonHeaders(B.token),
    body: { user_id: A.id, kind: "comment", message: `${MARKER} firmado en nombre de A` },
  });
  const forgedStored = await rest(`feedback?user_id=eq.${A.id}&select=id,message`);
  const forgedLanded = (forgedStored.json ?? []).some((r) => r.message.includes("firmado en nombre de A"));
  check("B no puede firmar un comentario como A", !forgedLanded, `http=${forged.status}`);

  const patched = await rest(`feedback?id=eq.${A.feedbackId}`, {
    method: "PATCH",
    headers: anonHeaders(B.token),
    body: { message: "MANIPULADO POR B", status: "resolved" },
  });
  const afterPatch = await rest(`feedback?id=eq.${A.feedbackId}&select=message,status`);
  const untouched = afterPatch.json?.[0]?.message?.includes("mensaje privado de A") && afterPatch.json?.[0]?.status === "new";
  check("UPDATE de B sobre el feedback de A no cambió nada", Boolean(untouched), `http=${patched.status} guardado="${afterPatch.json?.[0]?.message?.slice(0, 34) ?? "?"}"`);

  const selfPatch = await rest(`feedback?id=eq.${A.feedbackId}`, {
    method: "PATCH",
    headers: anonHeaders(A.token),
    body: { status: "resolved" },
  });
  const afterSelfPatch = await rest(`feedback?id=eq.${A.feedbackId}&select=status`);
  check(
    "ni siquiera A puede marcar su propio feedback como resuelto",
    afterSelfPatch.json?.[0]?.status === "new",
    `http=${selfPatch.status} estado=${afterSelfPatch.json?.[0]?.status}`,
  );

  const deleted = await rest(`feedback?id=eq.${A.feedbackId}`, { method: "DELETE", headers: anonHeaders(A.token) });
  const afterDelete = await rest(`feedback?id=eq.${A.feedbackId}&select=id`);
  check(
    "A no puede borrar su propio feedback",
    rows(afterDelete) === 1,
    `http=${deleted.status} — borrarlo nos dejaría sin el dato justo cuando hace falta`,
  );

  console.log("\n3. Envío legítimo\n");
  const anonPost = await rest("feedback", {
    method: "POST",
    headers: anonHeaders(null),
    body: { user_id: null, kind: "idea", message: `${MARKER} enviado por un visitante anónimo` },
  });
  const anonStored = await rest(`feedback?select=id,message&message=like.*visitante an*`);
  check("un visitante anónimo SÍ puede enviar feedback", rows(anonStored) >= 1, `http=${anonPost.status}`);
} finally {
  console.log("\nLimpiando…");
  const mine = await rest(`feedback?select=id&message=like.*${MARKER}*`);
  for (const row of mine.json ?? []) await rest(`feedback?id=eq.${row.id}`, { method: "DELETE" });
  for (const id of created) {
    await fetch(`${URL_BASE}/auth/v1/admin/users/${id}`, { method: "DELETE", headers: svc });
  }
  const left = await rest(`feedback?select=id&message=like.*${MARKER}*`);
  console.log(`  verificado releyendo — filas de prueba restantes: ${rows(left)}`);
}

const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones superadas`);
if (failed.length) {
  for (const f of failed) console.log(`  FALLÓ: ${f.name}`);
  process.exit(1);
}
console.log("RLS de feedback: VERIFICADO\n");
