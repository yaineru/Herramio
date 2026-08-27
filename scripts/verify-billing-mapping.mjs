/**
 * Verifies that what Mercado Pago will CHARGE equals what the site
 * DISPLAYS, and that every plan id resolves back to exactly one plan.
 *
 * This is the check that a unit test cannot make. The tests prove the
 * lookup code is correct; this proves the DATA is, which is the half that
 * rots. A price edited in one place and not the other produces a site
 * advertising 29.900 and a checkout charging something else — the one
 * billing bug users notice immediately and never forgive.
 *
 * Read-only. Creates nothing, charges nothing.
 *
 * Usage: node scripts/verify-billing-mapping.mjs
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const failures = [];
const check = (ok, message) => {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${message}`);
  if (!ok) failures.push(message);
};

const money = (cents, currency) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

const plansRes = await fetch(`${SUPABASE_URL}/rest/v1/plans?select=*&order=sort_order`, {
  headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
});
const plans = await plansRes.json();

const mpRes = await fetch("https://api.mercadopago.com/preapproval_plan/search?limit=50", {
  headers: { Authorization: `Bearer ${TOKEN}` },
});
const mpPlans = (await mpRes.json()).results ?? [];
const byId = new Map(mpPlans.map((p) => [p.id, p]));

console.log("\n=== Cada price id resuelve a exactamente un plan ===");
// The webhook trusts this: it takes a price id off a verified subscription
// and asks which plan it is. Two rows sharing an id would silently grant
// the wrong plan, and nothing downstream would notice.
const seen = new Map();
for (const p of plans) {
  for (const [col, interval] of [
    ["provider_price_id_monthly", "month"],
    ["provider_price_id_annual", "year"],
  ]) {
    const id = p[col];
    if (!id) continue;
    if (seen.has(id)) failures.push(`price id ${id} duplicado: ${seen.get(id)} y ${p.id}/${interval}`);
    seen.set(id, `${p.id}/${interval}`);
  }
}
check(seen.size > 0, `${seen.size} price ids configurados`);
for (const [id, target] of seen) check(true, `${id} -> ${target}`);

console.log("\n=== El importe de Mercado Pago coincide con el precio mostrado ===");
for (const p of plans) {
  for (const [col, priceCol, interval, expectFreq] of [
    ["provider_price_id_monthly", "monthly_price_cents", "month", 1],
    ["provider_price_id_annual", "annual_price_cents", "year", 12],
  ]) {
    const id = p[col];
    if (!id) continue;
    const mp = byId.get(id);
    if (!mp) {
      check(false, `${p.id}/${interval}: el plan ${id} no existe en Mercado Pago`);
      continue;
    }
    const displayed = p[priceCol] / 100;
    const charged = mp.auto_recurring?.transaction_amount;
    check(
      displayed === charged,
      `${p.id}/${interval}: la web muestra ${money(p[priceCol], p.currency)} y MP cobra ${charged} ${mp.auto_recurring?.currency_id}`,
    );
    check(
      mp.auto_recurring?.currency_id?.toLowerCase() === p.currency?.toLowerCase(),
      `${p.id}/${interval}: moneda coincide (${p.currency} / ${mp.auto_recurring?.currency_id})`,
    );
    check(
      mp.auto_recurring?.frequency === expectFreq && mp.auto_recurring?.frequency_type === "months",
      `${p.id}/${interval}: frecuencia ${mp.auto_recurring?.frequency} ${mp.auto_recurring?.frequency_type}`,
    );
    check(mp.status === "active", `${p.id}/${interval}: plan activo en MP`);
  }
}

console.log("\n=== Planes de pago con checkout utilizable ===");
for (const p of plans.filter((x) => x.is_active && x.id !== "free")) {
  const hasAny = Boolean(p.provider_price_id_monthly || p.provider_price_id_annual);
  check(hasAny, `${p.id}: tiene al menos un price id (si no, el checkout redirige a plan_no_disponible)`);
}

console.log(
  failures.length === 0
    ? "\nTODO CORRECTO: lo que se muestra es lo que se cobra.\n"
    : `\n${failures.length} PROBLEMA(S):\n` + failures.map((f) => "  - " + f).join("\n") + "\n",
);
process.exit(failures.length === 0 ? 0 : 1);
