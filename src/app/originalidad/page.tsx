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

      <div className="mx-auto mt-6 max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Análisis de originalidad</h1>
        <p className="mt-3 text-slate-500">
          Sube un documento y obtén un índice de similitud, citas y referencias detectadas. Pensado para ayudarte a
          revisar tu propio trabajo antes de entregarlo — no un veredicto automático.
        </p>
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
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Cómo interpretar el resultado
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              El <strong>índice de similitud</strong> no determina por sí solo la existencia de plagio — requiere
              interpretación humana.
            </li>
            <li>Las citas correctamente atribuidas no se cuentan como similitud preocupante.</li>
            <li>
              Hoy comparamos contra tus propios documentos anteriores (y los de tu equipo, si aplica) — todavía no
              consultamos fuentes de internet ni usamos similitud semántica; ver detalles en el informe de cada
              documento.
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
