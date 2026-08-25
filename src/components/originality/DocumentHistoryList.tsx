import Link from "next/link";
import { FileText } from "lucide-react";
import type { OriginalityDocument } from "@/lib/originality/types";

const STATUS_LABELS: Record<string, string> = {
  uploaded: "En cola",
  processing: "Procesando",
  analyzing: "Analizando",
  completed: "Completado",
  failed: "Error",
};

export function DocumentHistoryList({ documents }: { documents: OriginalityDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no has analizado ningún documento.</p>;
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id}>
          <Link
            href={`/originalidad/${doc.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-slate-300 hover:shadow-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate font-medium text-slate-900">{doc.originalFilename}</span>
            </span>
            <span
              className={
                doc.status === "failed"
                  ? "shrink-0 text-xs font-medium text-red-600"
                  : doc.status === "completed"
                    ? "shrink-0 text-xs font-medium text-emerald-600"
                    : "shrink-0 text-xs font-medium text-slate-400"
              }
            >
              {STATUS_LABELS[doc.status] ?? doc.status}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
