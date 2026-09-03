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
import { OriginalityExplainer } from "@/components/originality/OriginalityExplainer";

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

      <div className="mx-auto mt-8 max-w-6xl rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 elevation-3 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Herramio Originalidad</p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-900 sm:text-5xl">
              Análisis de similitud y evidencia documental
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Para estudiantes, docentes e investigadores que necesitan revisar un trabajo antes de entregarlo o
              evaluarlo. Muestra qué coincide, con qué fuente, y si las citas y referencias se sostienen — con la
              evidencia delante, para que la conclusión la saque una persona.
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
                "Similitud léxica y semántica",
                "Evidencia lado a lado",
                "Citas y referencias",
                "Verificación con Crossref",
              ].map((pill) => (
                <span key={pill} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* The process, not a sample report.
              This panel used to show "12.4% de similitud" and "8 citas
              correctamente atribuidas" — invented figures styled as real
              output, on the page of a product whose credibility depends on
              never overstating what it measured. What someone deciding
              whether to sign up actually needs is what will happen. */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 elevation-2">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Cómo funciona
              </span>
              <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            </div>

            <ol className="mt-5 space-y-2.5">
              {[
                "Subes el documento (PDF, DOCX o TXT)",
                "Se extrae el texto y se divide en fragmentos",
                "Se buscan coincidencias y se guarda su evidencia",
                "Se detectan las citas y se contrastan las referencias",
                "Recibes el informe con el contexto de cada hallazgo",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-semibold text-white"
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">{step}</span>
                </li>
              ))}
            </ol>

            <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
              Tus documentos son privados: solo tú — y tu equipo, si lo subes ahí — podéis verlos, y puedes
              eliminarlos cuando quieras.
            </p>
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

      </div>

      <OriginalityExplainer />
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
