import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getDocumentsForCurrentUser, getMonthlyAnalysisCount } from "@/lib/originality/queries";
import { checkUsageLimit } from "@/lib/plans/limits";
import { UploadForm } from "@/components/originality/UploadForm";
import { DocumentHistoryList } from "@/components/originality/DocumentHistoryList";
import { AnalyticsPageEvent } from "@/components/AnalyticsPageEvent";

export const metadata: Metadata = buildMetadata({
  title: "Análisis de originalidad",
  description:
    "Analiza la originalidad de tus documentos académicos: coincidencias textuales, citas y referencias. Un índice de similitud, no un veredicto.",
  path: "/originalidad",
});

export default async function OriginalityPage() {
  const user = await getCurrentUser();

  return (
    <div className="container-page py-10">
      <AnalyticsPageEvent event="originality_viewed" />
      <Breadcrumbs items={[{ href: "/originalidad", label: "Originalidad" }]} />

      <div className="mx-auto mt-8 max-w-6xl rounded-[30px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 shadow-[0_22px_52px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Producto estrella</p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-900 sm:text-5xl">Análisis de originalidad</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Sube un documento y revisa similitudes, citas y referencias antes de entregarlo. Pensado para ayudarte a revisar tu trabajo con criterio humano, no como un veredicto automático.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/registro">
                <Button size="lg">Probar Originalidad</Button>
              </Link>
              <Link href="/iniciar-sesion">
                <Button size="lg" variant="outline">
                  Iniciar sesión
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              {[
                "Verificación de citas",
                "Indicadores de similitud",
                "Reflexión asistida",
              ].map((pill) => (
                <span key={pill} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-emerald-200 bg-white p-5 shadow-[0_18px_34px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Privacidad
              </span>
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Similitud</div>
                <div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900">12.4%</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Citas</div>
                <div className="mt-2 text-sm font-medium text-slate-800">8 correctamente atribuidas</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Privacidad</div>
                <div className="mt-2 text-sm font-medium text-slate-800">Tus documentos quedan privados para ti y tu equipo.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        {user ? (
          <AuthenticatedContent userId={user.id} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm text-slate-600">Necesitas una cuenta para analizar documentos.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/registro">
                <Button size="sm">Crear cuenta gratis</Button>
              </Link>
              <Link href="/iniciar-sesion">
                <Button size="sm" variant="outline">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <Card className="mt-8 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Cómo interpretar el resultado
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              El <strong>índice de similitud</strong> no determina por sí solo la existencia de plagio — requiere interpretación humana.
            </li>
            <li>Las citas correctamente atribuidas no se cuentan como similitud preocupante.</li>
            <li>
              Hoy comparamos contra tus propios documentos anteriores (y los de tu equipo, si aplica) — todavía no consultamos fuentes de internet ni usamos similitud semántica; ver detalles en el informe de cada documento.
            </li>
            <li>Tus documentos son privados: solo tú (y tu equipo, si lo subiste ahí) pueden verlos.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

async function AuthenticatedContent({ userId }: { userId: string }) {
  const [entitlements, monthlyCount, documents] = await Promise.all([
    getEntitlements(),
    getMonthlyAnalysisCount(userId),
    getDocumentsForCurrentUser(),
  ]);
  const limit = checkUsageLimit(entitlements, "originality_analyses_per_month", monthlyCount);

  return (
    <>
      <UploadForm />
      {limit.limit !== null && (
        <p className="mt-3 text-center text-xs text-slate-400">
          {limit.remaining} de {limit.limit} análisis restantes este mes en tu plan.{" "}
          {!limit.allowed && (
            <Link href="/precios" className="font-medium text-emerald-600 hover:underline">
              Mejora tu plan
            </Link>
          )}
        </p>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Tus documentos</h2>
        <DocumentHistoryList documents={documents} />
      </div>
    </>
  );
}
