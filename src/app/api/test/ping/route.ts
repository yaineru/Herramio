import { NextResponse } from "next/server";

/**
 * Endpoint reserved for load-testing tools (see /tests/load). It never runs
 * unless ALLOW_LOAD_TEST=true AND the request self-identifies as synthetic
 * traffic — this keeps load tests from ever touching real user-facing pages,
 * ad impressions, or analytics, and keeps this endpoint dead in production
 * by default (ALLOW_LOAD_TEST defaults to false).
 */
export async function GET(request: Request) {
  if (process.env.ALLOW_LOAD_TEST !== "true") {
    return NextResponse.json({ error: "Load testing is disabled on this deployment." }, { status: 403 });
  }

  const isTestTraffic = request.headers.get("x-test-traffic") === "true";
  if (!isTestTraffic) {
    return NextResponse.json(
      { error: "Missing X-Test-Traffic header. This endpoint only accepts identified test traffic." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, ts: Date.now() });
}
