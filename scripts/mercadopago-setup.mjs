/**
 * Audits the Mercado Pago configuration and, on request, creates the
 * subscription plans that checkout needs.
 *
 * Why this is a script and not part of the app: creating preapproval plans
 * writes to a payment provider. That is a deliberate, human-approved act,
 * not something an analysis pipeline or a deploy should ever do on its own.
 *
 * SAFETY. It refuses to create anything on a real seller account. Mercado
 * Pago issues APP_USR- credentials to BOTH real sellers and test users, so
 * the prefix proves nothing; the only reliable check is asking the API who
 * the token belongs to. A test user's email is @testuser.com. Running this
 * against a live account would create plans that can take real money from
 * real people, so that path requires --i-understand-this-is-a-real-account
 * and says so in plain language first.
 *
 * Usage:
 *   node scripts/mercadopago-setup.mjs            # audit only, writes nothing
 *   node scripts/mercadopago-setup.mjs --create   # create plans + store ids
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CREATE = process.argv.includes("--create");
const FORCE_REAL = process.argv.includes("--i-understand-this-is-a-real-account");

/**
 * The approved COP prices — the single source for BOTH sides.
 *
 * Each entry drives the Mercado Pago plan that charges the money AND the
 * `plans` row the pricing page renders from. They cannot drift apart
 * because there is only one number: a site advertising 29.900 while the
 * checkout charges something else is the one billing bug users notice
 * immediately and never forgive.
 *
 * A Colombian Mercado Pago account can only charge COP, which is why
 * these are not conversions of the old USD figures — they are prices,
 * decided as prices.
 *
 * `cents` is what the database stores (COP has no minor unit in practice,
 * but the column is integer cents for every currency, so 29.900 COP is
 * 2 990 000).
 */
const PLANS = [
  {
    planId: "pro",
    interval: "month",
    reference: "HERRAMIO_PRO_MONTHLY",
    reason: "Herramio Pro Mensual",
    amount: 29900,
    frequency: 1,
  },
  {
    planId: "pro",
    interval: "year",
    reference: "HERRAMIO_PRO_YEARLY",
    reason: "Herramio Pro Anual",
    amount: 299000,
    frequency: 12,
  },
  {
    planId: "team",
    interval: "month",
    reference: "HERRAMIO_TEAM_MONTHLY",
    reason: "Herramio Team Mensual",
    amount: 79900,
    frequency: 1,
  },
];

const CURRENCY = "COP";

const state = (v) => (v ? "configurado" : "FALTA");

function line(name, value) {
  console.log(`  ${name.padEnd(30)} ${state(value)}`);
}

async function mp(path, init = {}) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function supabase(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

console.log("\n=== Configuración (nombres y estado, nunca valores) ===");
line("MERCADOPAGO_ACCESS_TOKEN", TOKEN);
line("MERCADOPAGO_PUBLIC_KEY", process.env.MERCADOPAGO_PUBLIC_KEY);
line("MERCADOPAGO_WEBHOOK_SECRET", process.env.MERCADOPAGO_WEBHOOK_SECRET);
line("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
line("SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY);

if (!TOKEN) {
  console.error("\nSin MERCADOPAGO_ACCESS_TOKEN no se puede continuar.");
  process.exit(1);
}

const me = await mp("/users/me");
if (!me.ok) {
  console.error(`\nEl token no es válido (HTTP ${me.status}).`);
  process.exit(1);
}
const email = me.json.email ?? "";
const isTestUser = /^test_user/i.test(email) || /testuser\.com$/i.test(email);

console.log("\n=== Cuenta ===");
console.log(`  site_id        ${me.json.site_id}  (país ${me.json.country_id})`);
console.log(`  tipo de cuenta ${isTestUser ? "CUENTA DE PRUEBA" : "CUENTA REAL — cobra dinero de verdad"}`);

if (!isTestUser && CREATE && !FORCE_REAL) {
  console.error(
    "\nDETENIDO. Estas credenciales son de una cuenta real, no de prueba.\n" +
      "Crear planes aquí produce cobros reales a personas reales.\n" +
      "Usa credenciales de un usuario de prueba, o si de verdad quieres hacerlo en producción:\n" +
      "  node scripts/mercadopago-setup.mjs --create --i-understand-this-is-a-real-account",
  );
  process.exit(1);
}

const existing = await mp("/preapproval_plan/search?limit=50");
const found = existing.json.results ?? [];
console.log("\n=== Planes en Mercado Pago ===");
if (found.length === 0) console.log("  ninguno");
for (const p of found) {
  const a = p.auto_recurring ?? {};
  console.log(`  ${p.id}  ${p.status.padEnd(8)} "${p.reason}"  ${a.transaction_amount} ${a.currency_id} /${a.frequency} ${a.frequency_type}`);
}

const { json: dbPlans } = await supabase("plans?select=id,provider_price_id_monthly,provider_price_id_annual&order=sort_order");
console.log("\n=== Planes en Supabase ===");
for (const p of dbPlans ?? []) {
  console.log(`  ${p.id.padEnd(13)} mensual=${p.provider_price_id_monthly ?? "NULL"}  anual=${p.provider_price_id_annual ?? "NULL"}`);
}

if (!CREATE) {
  const missing = (dbPlans ?? []).filter((p) => ["pro", "team"].includes(p.id) && !p.provider_price_id_monthly);
  console.log(
    missing.length
      ? "\nCheckout NO puede funcionar todavía: faltan los ids de plan del proveedor.\n" +
          "Ejecuta con --create para crearlos y guardarlos."
      : "\nCheckout tiene todo lo que necesita.",
  );
  process.exit(0);
}

console.log("\n=== Creando planes ===");
for (const plan of PLANS) {
  const already = found.find((p) => p.reason === plan.reason && p.status === "active");
  let id = already?.id;

  if (id) {
    console.log(`  = ${plan.reason}: ya existía (${id})`);
  } else {
    const res = await mp("/preapproval_plan", {
      method: "POST",
      body: JSON.stringify({
        reason: plan.reason,
        // Identifies the PLAN. Not to be confused with the
        // external_reference on a subscription, which carries the Herramio
        // user id and is how the webhook attributes a payment to a person.
        external_reference: plan.reference,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: "months",
          transaction_amount: plan.amount,
          currency_id: CURRENCY,
        },
        back_url: "https://herramio.com/cuenta?checkout=exito",
      }),
    });
    if (!res.ok) {
      console.error(`  x ${plan.reason}: HTTP ${res.status} ${JSON.stringify(res.json).slice(0, 240)}`);
      continue;
    }
    id = res.json.id;
    console.log(`  + ${plan.reason}: ${id}`);
  }

  // Both sides written from the same constant: the provider plan id AND
  // the price the site displays. This is what makes a mismatch between
  // the pricing page and the checkout impossible rather than unlikely.
  const column = plan.interval === "year" ? "provider_price_id_annual" : "provider_price_id_monthly";
  const priceColumn = plan.interval === "year" ? "annual_price_cents" : "monthly_price_cents";
  const patch = {
    [column]: id,
    [priceColumn]: plan.amount * 100,
    provider: "mercadopago",
    currency: CURRENCY.toLowerCase(),
  };
  const upd = await supabase(`plans?id=eq.${plan.planId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  // PostgREST answers a filtered-out update with success and an empty
  // body, so the write is confirmed by reading the row back, never by
  // the status code.
  const row = Array.isArray(upd.json) ? upd.json[0] : null;
  const wrote = row?.[column] === id && row?.[priceColumn] === plan.amount * 100;
  console.log(
    `    ${wrote ? `guardado: ${column}=${id}, ${priceColumn}=${plan.amount * 100} (${CURRENCY})` : "NO se guardó — revisa " + column}`,
  );
}

console.log("\nListo. Falta MERCADOPAGO_WEBHOOK_SECRET para que el webhook valide firmas.");
