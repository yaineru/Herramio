import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { FileText, Quote, BookOpen, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getDocumentById,
  getDocumentChunks,
  getDocumentCitations,
  getDocumentReferences,
  getDocumentMatches,
  getReportForDocument,
} from "@/lib/originality/queries";
import { deleteDocumentAction } from "@/lib/originality/actions";
import { buildCitationGraph } from "@/lib/originality/citation-graph";
import { DocumentStatusPoller } from "@/components/originality/DocumentStatusPoller";
import { EvidenceViewer } from "@/components/originality/EvidenceViewer";
import { ScoreCard } from "@/components/originality/ScoreCard";
import { EngineStatusBanner, ExternalSearchNotice } from "@/components/originality/EngineStatusBanner";
import { ReferenceStatusBadge, ReferenceStatusLegend } from "@/components/originality/ReferenceStatusBadge";
import { AnalyticsPageEvent } from "@/components/AnalyticsPageEvent";

export const metadata: Metadata = buildMetadata({
  title: "Informe de originalidad",
  description: "Resultado del análisis de similitud de tu documento.",
  path: "/originalidad",
});

const STATUS_MESSAGES: Record<string, string> = {
  uploaded: "Tu documento está en cola para procesarse.",
  processing: "Extrayendo el texto de tu documento...",
  analyzing: "Buscando coincidencias y analizando citas...",
};

export default async function OriginalityDocumentPage({ params }: PageProps<"/originalidad/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/iniciar-sesion?next=/originalidad/${id}`);

  const document = await getDocumentById(id);
  if (!document) notFound();

  const isOwner = document.userId === user.id;

  if (document.status === "failed") {
    return (
      <div className="container-page py-10">
        <Breadcrumbs items={[{ href: "/originalidad", label: "Originalidad" }, { href: `/originalidad/${id}`, label: document.originalFilename }]} />
        <div className="mx-auto mt-6 max-w-lg">
          <Card className="p-6">
            <h1 className="text-xl font-bold text-slate-900">No se pudo analizar este documento</h1>
            <p className="mt-2 text-sm text-slate-600">{document.failureReason ?? "Ocurrió un error inesperado."}</p>
            {/* Deleting has to be reachable from the failed state too. It
                used to offer only "Volver", which left the user with an
                upload they could not remove and a file sitting in storage
                with nothing pointing at it. */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href="/originalidad">
                <Button size="sm" variant="outline">
                  Volver
                </Button>
              </Link>
              {isOwner && (
                <form action={deleteDocumentAction.bind(null, id)}>
                  <Button type="submit" size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Eliminar documento
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (document.status !== "completed") {
    return (
      <div className="container-page py-10">
        <Breadcrumbs items={[{ href: "/originalidad", label: "Originalidad" }, { href: `/originalidad/${id}`, label: document.originalFilename }]} />
        <div className="mx-auto mt-6 max-w-lg">
          <Card className="p-6">
            <h1 className="text-xl font-bold text-slate-900">{document.originalFilename}</h1>
            <p className="mt-2 text-sm text-slate-500">{STATUS_MESSAGES[document.status] ?? document.status}</p>
            <div className="mt-4">
              <DocumentStatusPoller documentId={id} initialStatus={document.status} />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const [report, chunks, citations, references, matches] = await Promise.all([
    getReportForDocument(id),
    getDocumentChunks(id),
    getDocumentCitations(id),
    getDocumentReferences(id),
    getDocumentMatches(id),
  ]);

  if (!report) notFound();

  const citationGraph = buildCitationGraph(citations, references);

  return (
    <div className="container-page py-10">
      <AnalyticsPageEvent event="report_viewed" params={{ document_id: id }} />
      <Breadcrumbs items={[{ href: "/originalidad", label: "Originalidad" }, { href: `/originalidad/${id}`, label: document.originalFilename }]} />

      {/* Wider than the old max-w-3xl: the side-by-side evidence panels need
          room on large screens, while the grid inside collapses on mobile. */}
      <div className="mx-auto mt-6 max-w-5xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Reporte ejecutivo</p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900 sm:text-3xl">{document.originalFilename}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {document.wordCount ?? "?"} palabras
              {document.pageCount ? ` · ${document.pageCount} páginas` : ""}
            </p>
          </div>
          {isOwner && (
            <form action={deleteDocumentAction.bind(null, id)}>
              <Button type="submit" size="sm" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Similitud total", value: `${Math.round(report.similarityIndex * 100)}%` },
            { label: "Citas detectadas", value: String(citations.length) },
            { label: "Referencias", value: String(references.length) },
            { label: "Coincidencias", value: String(matches.length) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.03)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-[-0.05em] text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <ScoreCard
          className="mt-6"
          ratio={report.similarityIndex}
          exactRatio={report.exactRatio}
          nearRatio={report.nearExactRatio}
          semanticAvailable={false}
        />

        <EngineStatusBanner
          className="mt-6"
          engines={[
            { name: "Léxico", state: "active", detail: "activo" },
            { name: "Crossref", state: "verified", detail: "referencias verificadas" },
            { name: "Semántico", state: "waiting", detail: "en espera" },
          ]}
        />

        <ExternalSearchNotice className="mt-4" />

        <Card className="mt-6 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Coincidencias encontradas
          </h2>
          <div className="mt-4">
            <EvidenceViewer documentId={id} chunks={chunks} matches={matches} citations={citations} />
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Quote className="h-4 w-4" />
            Citas detectadas ({citations.length})
          </h2>
          {citations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No se detectaron citas en el texto.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {citationGraph.entries.map(({ citation, matchedReference }) => (
                <li
                  key={citation.id}
                  className={
                    matchedReference
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                      : "rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                  }
                  title={
                    matchedReference
                      ? `Referencia encontrada: ${matchedReference.rawText}`
                      : "No se encontró una referencia que coincida con esta cita"
                  }
                >
                  {citation.rawText}
                  {matchedReference && " ✓"}
                </li>
              ))}
            </ul>
          )}

          {citationGraph.orphanCitations.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <p className="text-sm font-medium text-amber-900">
                {citationGraph.orphanCitations.length}{" "}
                {citationGraph.orphanCitations.length === 1 ? "cita sin" : "citas sin"} referencia encontrada
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Revisa si {citationGraph.orphanCitations.length === 1 ? "falta" : "faltan"} en tu bibliografía. También
                puede ser que la detección automática no las haya reconocido — vale la pena mirarlo, no es un error
                confirmado.
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {citationGraph.orphanCitations.map((c) => (
                  <li key={c.id} className="rounded-full bg-white px-2 py-0.5 text-xs text-amber-900">
                    {c.rawText}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {citationGraph.uncitedReferences.length > 0 && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-700">
                {citationGraph.uncitedReferences.length}{" "}
                {citationGraph.uncitedReferences.length === 1
                  ? "referencia no aparece citada"
                  : "referencias no aparecen citadas"}{" "}
                en el texto
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Es normal en listas de lectura recomendada. Solo revísalo si esperabas citarlas todas.
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Detección basada en patrones de formato — no verifica que la fuente citada sea real ni esté disponible.
            Las citas numéricas ([12]) no se cruzan con la bibliografía porque hacerlo por posición daría resultados
            poco fiables.
          </p>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <BookOpen className="h-4 w-4" />
            Referencias detectadas ({references.length})
          </h2>
          {references.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No se detectó una sección de referencias/bibliografía.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {references.map((r) => (
                <li key={r.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2">
                  <ReferenceStatusBadge status={r.verificationStatus} className="mt-0.5" />
                  <span className="min-w-0 break-words">
                    {r.rawText}
                    {r.verificationStatus === "verified" && r.matchedUrl && (
                      <>
                        {" — "}
                        <a
                          href={r.matchedUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          ver en Crossref
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {references.length > 0 && <ReferenceStatusLegend />}
        </Card>
      </div>
    </div>
  );
}
