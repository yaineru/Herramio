import { NextResponse, type NextRequest } from "next/server";
import { stripeProvider } from "@/lib/billing/providers/stripe-provider";
import { applyBillingSubscriptionEvent } from "@/lib/billing/apply-webhook-event";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let event;
  try {
    event = await stripeProvider.verifyAndParseWebhook({ rawBody, headers: request.headers, url: new URL(request.url) });
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency: insert-before-process. A primary-key conflict means this
  // exact event id was already handled — ack and stop, never process twice.
  const { error: insertError } = await admin
    .from("webhook_events")
    .insert({ provider: "stripe", event_id: event.providerEventId, event_type: event.kind });
  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    console.error("No se pudo registrar el evento de webhook:", insertError);
    return NextResponse.json({ error: "storage error" }, { status: 500 });
  }

  try {
    if (event.kind === "subscription_event") {
      await applyBillingSubscriptionEvent("stripe", event.subscription);
    }
  } catch (err) {
    console.error("Error procesando el webhook de Stripe:", err);
    return NextResponse.json({ error: "processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
