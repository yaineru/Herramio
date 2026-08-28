/**
 * End-to-end billing test against the REAL Mercado Pago test environment.
 *
 * Creates genuine subscriptions on a Mercado Pago TEST account using their
 * official test cards, then drives our own webhook endpoint with correctly
 * signed notifications and checks what actually landed in the database.
 *
 * No real money can move: the account is a test user, the cards are
 * Mercado Pago's published test numbers, and the cardholder name is what
 * decides the outcome (APRO approved, CONT pending, OTHE rejected).
 *
 * Two rules this script follows throughout, both learned the hard way:
 *
 *  1. An HTTP status is never evidence. PostgREST answers an RLS-filtered
 *     write with 204, and our webhook answers a duplicate with 200. Every
 *     assertion here re-reads the database with the service role.
 *  2. Nothing is assumed about the provider. Statuses, amounts and
 *     external_reference are read back from Mercado Pago, not predicted.
 *
 * Requires the dev server on localhost:3001 and MERCADOPAGO_WEBHOOK_SECRET
 * set locally (any value — it only has to match what we sign with).
 *
 * Usage: node scripts/billing-e2e-test.mjs
 */
import { readFileSync } from "node:fs";
import { createHmac, randomUUID } from "node:crypto";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const MP = process.env.MERCADOPAGO_ACCESS_TOKEN;
const SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP = process.env.E2E_BASE_URL || "http://localhost:3001";

const PLANS = {
  proMonthly: { id: "f752a4e49c70436e9c6b4a453035a606", plan: "pro", interval: "month", amount: 29900 },
  proAnnual: { id: "3d37fa0a6fea499a802aae7b2628ce4b", plan: "pro", interval: "year", amount: 299000 },
  teamMonthly: { id: "fc83cd823f3648c88d159a68ea7fbe44", plan: "team", interval: "month", amount: 79900 },
};

const buyer = JSON.parse(readFileSync(".mp-test-buyer.json", "utf8"));
const user = JSON.parse(readFileSync(".mp-e2e-user.json", "utf8"));

let passed = 0;
const failures = [];
const created = [];

function check(ok, label, detail = "") {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (ok) passed++;
  else failures.push(label + (detail ? " — " + detail : ""));
}

const sbHeaders = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function sb(path, init = {}) {
  const res = await fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { ...sbHeaders, ...(init.headers ?? {}) } });
  const text = await res.text();
  return { ok: res.ok, status: res.status, json: text ? JSON.parse(text) : null };
}

async function mpFetch(path, init = {}) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${MP}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
}

/** Mercado Pago's official Colombian test card; the NAME decides the outcome. */
async function cardToken(holderName) {
  const { ok, json } = await mpFetch("/v1/card_tokens", {
    method: "POST",
    body: JSON.stringify({
      card_number: "4013540682746260",
      security_code: "123",
      expiration_month: 11,
      expiration_year: 2030,
      cardholder: { name: holderName, identification: { type: "CC", number: "123456789" } },
    }),
  });
  if (!ok) throw new Error(`card_token falló para ${holderName}`);
  return json.id;
}

async function subscribe(plan, holderName, externalReference) {
  const token = await cardToken(holderName);
  const { ok, status, json } = await mpFetch("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      preapproval_plan_id: plan.id,
      card_token_id: token,
      payer_email: buyer.email,
      external_reference: externalReference,
      status: "authorized",
    }),
  });
  if (ok) created.push(json.id);
  return { ok, status, json };
}

/**
 * Signs a notification exactly the way Mercado Pago does, so the route's
 * real validator runs. Manifest: id:<data.id>;request-id:<rid>;ts:<ts>;
 */
async function sendWebhook(resourceId, { type = "subscription_preapproval", requestId = randomUUID(), secret = SECRET, ts = Math.floor(Date.now() / 1000) } = {}) {
  const manifest = `id:${resourceId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  const res = await fetch(`${APP}/api/webhooks/mercadopago?type=${type}&data.id=${resourceId}`, {
    method: "POST",
    headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": requestId, "content-type": "application/json" },
    body: JSON.stringify({ type, data: { id: resourceId } }),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

const subscriptionsFor = async (userId) =>
  (await sb(`subscriptions?select=*&user_id=eq.${userId}`)).json ?? [];

// ---------------------------------------------------------------- run

console.log("\n=== 0. Requisitos ===");
check(Boolean(MP), "MERCADOPAGO_ACCESS_TOKEN presente");
check(Boolean(SECRET), "MERCADOPAGO_WEBHOOK_SECRET presente (valor local de firma)");
const health = await fetch(APP).then((r) => r.status).catch(() => 0);
check(health === 200, `servidor en ${APP}`, `HTTP ${health}`);
if (!MP || !SECRET || health !== 200) {
  console.log("\nFaltan requisitos. Abortado.\n");
  process.exit(1);
}

console.log("\n=== 1. Estado ANTES del pago ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
const before = await subscriptionsFor(user.id);
check(before.length === 0, "el usuario no tiene ninguna suscripción", "plan efectivo = Free");

console.log("\n=== 2. Pro Mensual · tarjeta APRO (aprobada) ===");
const proSub = await subscribe(PLANS.proMonthly, "APRO", user.id);
check(proSub.ok, "suscripción creada en Mercado Pago", `HTTP ${proSub.status}`);
check(proSub.json.status === "authorized", "estado en Mercado Pago", proSub.json.status);
check(proSub.json.external_reference === user.id, "external_reference conserva el id del usuario");
check(proSub.json.auto_recurring?.transaction_amount === PLANS.proMonthly.amount, "importe cobrado", `${proSub.json.auto_recurring?.transaction_amount} COP`);

console.log("\n=== 3. Webhook real firmado -> suscripción en Supabase ===");
const hook = await sendWebhook(proSub.json.id);
check(hook.status === 200, "el webhook responde 200", `HTTP ${hook.status}`);
let rows = await subscriptionsFor(user.id);
check(rows.length === 1, "existe exactamente 1 fila de suscripción", `${rows.length} filas`);
const row = rows[0] ?? {};
check(row.plan_id === "pro", "plan_id", row.plan_id);
check(row.status === "active", "status (authorized -> active)", row.status);
check(row.provider === "mercadopago", "provider", row.provider);
check(row.provider_subscription_id === proSub.json.id, "provider_subscription_id coincide");
check(row.user_id === user.id, "user_id correcto");
check(row.billing_interval === "month", "billing_interval", row.billing_interval);

console.log("\n=== 4. Entitlement (la entrada exacta que lee getEntitlements) ===");
const activeForEntitlement = (await sb(`subscriptions?select=plan_id&user_id=eq.${user.id}&status=in.(trialing,active,past_due)`)).json ?? [];
check(activeForEntitlement.length === 1 && activeForEntitlement[0].plan_id === "pro", "Free -> Pro: la consulta de entitlements resuelve 'pro'");

console.log("\n=== 5. Webhook duplicado ===");
const dup = await sendWebhook(proSub.json.id);
rows = await subscriptionsFor(user.id);
check(rows.length === 1, "sigue habiendo 1 sola suscripción", `${rows.length} filas`);
check(dup.status === 200, "responde 200 (no reintentar)", `HTTP ${dup.status}`);

console.log("\n=== 6. Evento antiguo después del nuevo (fuera de orden) ===");
const old = await sendWebhook(proSub.json.id, { ts: Math.floor(Date.now() / 1000) - 600 });
rows = await subscriptionsFor(user.id);
check(rows[0]?.status === "active", "el estado no retrocede", rows[0]?.status);
check(old.status === 200 || old.status === 400, "manejado sin corromper nada", `HTTP ${old.status}`);

console.log("\n=== 7. Webhook falsificado (firma inválida) ===");
const forged = await sendWebhook(proSub.json.id, { secret: "secreto-incorrecto" });
check(forged.status === 400, "rechazado con 400", `HTTP ${forged.status}`);
rows = await subscriptionsFor(user.id);
check(rows.length === 1 && rows[0].status === "active", "no escribió nada");

console.log("\n=== 8. Usuario inatribuible (external_reference que no es un usuario) ===");
const orphan = await subscribe(PLANS.proMonthly, "APRO", "HERRAMIO_PRO_MONTHLY");
check(orphan.ok, "suscripción creada con referencia no-UUID");
await sendWebhook(orphan.json.id);
const orphanRows = (await sb(`subscriptions?select=id&provider_subscription_id=eq.${orphan.json.id}`)).json ?? [];
check(orphanRows.length === 0, "no se otorgó a nadie", `${orphanRows.length} filas`);

console.log("\n=== 9. Pro Anual · no debe acabar en Pro Mensual ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
const annual = await subscribe(PLANS.proAnnual, "APRO", user.id);
check(annual.ok, "suscripción anual creada");
check(annual.json.auto_recurring?.transaction_amount === PLANS.proAnnual.amount, "importe anual", `${annual.json.auto_recurring?.transaction_amount} COP`);
await sendWebhook(annual.json.id);
rows = await subscriptionsFor(user.id);
check(rows[0]?.billing_interval === "year", "billing_interval = year", rows[0]?.billing_interval);
check(rows[0]?.plan_id === "pro", "plan_id = pro", rows[0]?.plan_id);

console.log("\n=== 10. Team ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
const team = await subscribe(PLANS.teamMonthly, "APRO", user.id);
check(team.ok, "suscripción de Team creada");
await sendWebhook(team.json.id);
rows = await subscriptionsFor(user.id);
check(rows[0]?.plan_id === "team", "plan_id = team", rows[0]?.plan_id);
check(team.json.auto_recurring?.transaction_amount === PLANS.teamMonthly.amount, "importe Team", `${team.json.auto_recurring?.transaction_amount} COP`);

console.log("\n=== 11. Pago PENDIENTE (tarjeta CONT) -> no debe dar Pro ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
const pending = await subscribe(PLANS.proMonthly, "CONT", user.id);
if (pending.ok) {
  console.log(`         (Mercado Pago devolvió status=${pending.json.status})`);
  await sendWebhook(pending.json.id);
  const entitled = (await sb(`subscriptions?select=plan_id&user_id=eq.${user.id}&status=in.(trialing,active,past_due)`)).json ?? [];
  // The only thing that matters: whatever row exists, it must not be one
  // the entitlement query treats as active.
  check(
    pending.json.status === "authorized" || entitled.length === 0,
    "un pago no confirmado no desbloquea Pro",
    `MP=${pending.json.status}, filas activas=${entitled.length}`,
  );
} else {
  check(true, "Mercado Pago rechazó la creación con tarjeta pendiente", `HTTP ${pending.status}`);
}

console.log("\n=== 12. Pago RECHAZADO (tarjeta OTHE) -> no debe dar Pro ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
const rejected = await subscribe(PLANS.proMonthly, "OTHE", user.id);
if (rejected.ok) {
  console.log(`         (Mercado Pago devolvió status=${rejected.json.status})`);
  await sendWebhook(rejected.json.id);
  const entitled = (await sb(`subscriptions?select=plan_id&user_id=eq.${user.id}&status=in.(trialing,active,past_due)`)).json ?? [];
  check(
    rejected.json.status !== "authorized" ? entitled.length === 0 : true,
    "un pago rechazado no desbloquea Pro",
    `MP=${rejected.json.status}, filas activas=${entitled.length}`,
  );
} else {
  check(true, "Mercado Pago rechazó la creación con tarjeta rechazada", `HTTP ${rejected.status}`);
}

console.log("\n=== 13. Cancelación: activo -> cancelado ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
const toCancel = await subscribe(PLANS.proMonthly, "APRO", user.id);
await sendWebhook(toCancel.json.id);
let cancelRows = await subscriptionsFor(user.id);
check(cancelRows[0]?.status === "active", "parte de un estado activo", cancelRows[0]?.status);

await mpFetch(`/preapproval/${toCancel.json.id}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });
await sendWebhook(toCancel.json.id);
cancelRows = await subscriptionsFor(user.id);
check(cancelRows[0]?.status === "canceled", "la cancelación se refleja en Supabase", cancelRows[0]?.status);
const stillEntitled = (await sb(`subscriptions?select=plan_id&user_id=eq.${user.id}&status=in.(trialing,active,past_due)`)).json ?? [];
check(stillEntitled.length === 0, "el acceso deja de aplicar tras cancelar", `${stillEntitled.length} filas activas`);

console.log("\n=== 14. Fuera de orden REAL (evento válido con estado ya superado) ===");
// The previous ordering check only proved the timestamp tolerance rejects
// a stale signature. This one is the real property: a notification that
// arrives AFTER a cancellation still re-reads Mercado Pago, so it writes
// the current state and cannot resurrect the old one.
await sendWebhook(toCancel.json.id);
cancelRows = await subscriptionsFor(user.id);
check(cancelRows[0]?.status === "canceled", "un evento tardío no revive la suscripción", cancelRows[0]?.status);

console.log("\n=== 15. Reconciliación Mercado Pago <-> Supabase ===");
// Same subscription, both sides, no divergence — including the cancelled
// state, which is the one most likely to drift.
const live = await mpFetch(`/preapproval/${toCancel.json.id}`);
rows = await subscriptionsFor(user.id);
const MP_TO_DB = { authorized: "active", cancelled: "canceled", paused: "past_due", pending: "incomplete" };
check(
  MP_TO_DB[live.json.status] === rows[0]?.status,
  "estados equivalentes",
  `MP=${live.json.status} / DB=${rows[0]?.status}`,
);
check(live.json.external_reference === rows[0]?.user_id, "mismo usuario en ambos lados");
check(live.json.id === rows[0]?.provider_subscription_id, "mismo id de suscripción en ambos lados");

// -------------------------------------------------------------- limpieza
console.log("\n=== 16. Limpieza ===");
await sb(`subscriptions?user_id=eq.${user.id}`, { method: "DELETE" });
let cancelled = 0;
for (const id of created) {
  // Idempotent: a subscription cancelled earlier in the run (section 13)
  // rejects a second cancellation, which is correct behaviour and not a
  // cleanup failure. What matters is the end state, so that is what is
  // checked.
  const current = await mpFetch(`/preapproval/${id}`);
  if (current.json?.status === "cancelled") {
    cancelled++;
    continue;
  }
  await mpFetch(`/preapproval/${id}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });
  const after = await mpFetch(`/preapproval/${id}`);
  if (after.json?.status === "cancelled") cancelled++;
}
check(cancelled === created.length, "ninguna suscripción de prueba queda activa en Mercado Pago", `${cancelled}/${created.length}`);
check((await subscriptionsFor(user.id)).length === 0, "filas de prueba borradas de Supabase");

console.log(
  failures.length === 0
    ? `\nBILLING TEST VERIFIED — ${passed} comprobaciones, 0 fallos.\n`
    : `\nBILLING TEST NOT VERIFIED — ${passed} correctas, ${failures.length} fallos:\n` +
        failures.map((f) => "  - " + f).join("\n") + "\n",
);
process.exit(failures.length === 0 ? 0 : 1);
