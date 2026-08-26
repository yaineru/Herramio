import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";
import { deleteDocumentAction } from "@/lib/originality/actions";
import type { OriginalityDocument } from "@/lib/originality/types";

const STATUS_LABELS: Record<string, string> = {
  uploaded: "En cola",
  processing: "Procesando",
  analyzing: "Analizando",
  completed: "Completado",
  failed: "Error",
};

const STATUS_CLASSES: Record<string, string> = {
  failed: "text-red-700",
  completed: "text-emerald-700",
};

export function DocumentHistoryList({ documents }: { documents: OriginalityDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no has analizado ningún documento.</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-slate-300 hover:shadow-sm"
        >
          <Link href={`/originalidad/${doc.id}`} className="flex min-w-0 flex-1 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate font-medium text-slate-900">{doc.originalFilename}</span>
          </Link>

          <span className={`shrink-0 text-xs font-medium ${STATUS_CLASSES[doc.status] ?? "text-slate-600"}`}>
            {STATUS_LABELS[doc.status] ?? doc.status}
          </span>

          {/*
            Delete lives here, not only on the report page, because the
            report page only offers it once an analysis has COMPLETED. A
            document whose analysis failed rendered an error card with a
            "Volver" button and nothing else, so the user had no way to
            remove their own upload and the file stayed in storage
            indefinitely. Deleting is the one action that must work in
            every state, including the broken ones.
          */}
          <form action={deleteDocumentAction.bind(null, doc.id)} className="shrink-0">
            <button
              type="submit"
              aria-label={`Eliminar ${doc.originalFilename}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
