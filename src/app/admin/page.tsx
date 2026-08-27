import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { isCurrentUserAdmin } from "@/lib/admin/auth";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { listFeedback, getFeedbackCounts } from "@/lib/admin/feedback";
import { FeedbackCenter, FeedbackSummary } from "@/components/admin/FeedbackCenter";
import { formatCurrencyFromCents } from "@/lib/plans/format";

// Deliberately not indexed and deliberately not linked from anywhere in
// the nav — see robots.ts for the disallow rule.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  // notFound() instead of a redirect: a redirect confirms the route
  // exists to anyone probing it; a 404 doesn't.
  if (!(await isCurrentUserAdmin())) notFound();

  const [metrics, feedback, feedbackCounts] = await Promise.all([
    getAdminMetrics(),
    listFeedback(),
    getFeedbackCounts(),
  ]);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Panel de administración</h1>
      <p className="mt-1 text-sm text-slate-500">Métricas de solo lectura. El feedback sí se gestiona desde aquí.</p>

      {/* First, above the metrics: during a beta this is the section
          that most often turns into work, and an inbox nobody scrolls to
          is an inbox nobody reads. */}
      <Card className="mt-8 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Feedback de la beta</h2>
        <p className="mt-1 text-xs text-slate-500">
          Lo que llega desde el botón «Comentar» del workspace y de los informes.
        </p>
        <div className="mt-4">
          <FeedbackSummary counts={feedbackCounts} />
        </div>
        <div className="mt-5">
          <FeedbackCenter items={feedback} />
        </div>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Usuarios totales</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.totalUsers}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">MRR estimado</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrencyFromCents(metrics.mrrCents, "usd")}</p>
          <p className="mt-1 text-xs text-slate-400">Excluye suscripciones en past_due (pago no confirmado)</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pagos pendientes (past_due)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.pastDueCount}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Suscripciones personales activas por plan</h2>
          {metrics.personalSubscriptionsByPlan.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Ninguna todavía.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {metrics.personalSubscriptionsByPlan.map((row) => (
                <li key={row.planId} className="flex justify-between">
                  <span className="text-slate-600">{row.planId}</span>
                  <span className="font-medium text-slate-900">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Equipos activos por plan</h2>
          {metrics.teamSubscriptionsByPlan.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Ninguno todavía.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {metrics.teamSubscriptionsByPlan.map((row) => (
                <li key={row.planId} className="flex justify-between">
                  <span className="text-slate-600">{row.planId}</span>
                  <span className="font-medium text-slate-900">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Herramientas más usadas (usuarios registrados, 30 días)</h2>
        {metrics.topTools.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Sin datos todavía.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-sm">
            {metrics.topTools.map((t) => (
              <li key={t.toolId} className="flex justify-between">
                <span className="text-slate-600">{t.toolName}</span>
                <span className="font-medium text-slate-900">{t.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Originalidad (análisis de documentos)</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Documentos totales</p>
            <p className="mt-1 font-semibold text-slate-900">{metrics.originality.totalDocuments}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Últimos 30 días</p>
            <p className="mt-1 font-semibold text-slate-900">{metrics.originality.analysesLast30Days}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Palabras procesadas</p>
            <p className="mt-1 font-semibold text-slate-900">{metrics.originality.totalWordsProcessed.toLocaleString("es-CO")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Por estado</p>
            <p className="mt-1 text-xs text-slate-600">
              {metrics.originality.documentsByStatus.map((s) => `${s.status}: ${s.count}`).join(" · ") || "—"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Últimos eventos de webhook</h2>
        {metrics.recentWebhookEvents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Ninguno procesado todavía.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-xs">
            {metrics.recentWebhookEvents.map((e) => (
              <li key={`${e.provider}:${e.eventId}`} className="flex justify-between gap-4 text-slate-500">
                <span className="truncate">
                  <span className="font-medium text-slate-700">{e.provider}</span> · {e.eventType}
                </span>
                <span className="shrink-0">{new Date(e.receivedAt).toLocaleString("es-CO")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
