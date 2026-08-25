"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getDocumentStatusAction } from "@/lib/originality/actions";
import { AnalyticsEvents } from "@/lib/analytics";

const POLL_INTERVAL_MS = 2500;
const TERMINAL_STATUSES = new Set(["completed", "failed"]);

const STATUS_LABELS: Record<string, string> = {
  uploaded: "En cola...",
  processing: "Extrayendo texto...",
  analyzing: "Buscando coincidencias...",
  completed: "Completado",
  failed: "Error",
};

/**
 * Polls the document's real status (no optimistic/fake progress bar) and
 * refreshes the page once it reaches a terminal state, so the server-
 * rendered report appears without a manual reload. Analytics transitions
 * fire only off an actually-observed status change.
 */
export function DocumentStatusPoller({ documentId, initialStatus }: { documentId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const router = useRouter();
  const firedStarted = useRef(false);

  useEffect(() => {
    if (TERMINAL_STATUSES.has(status)) return;

    const interval = setInterval(async () => {
      const snapshot = await getDocumentStatusAction(documentId);
      if (!snapshot) return;

      if (snapshot.status !== status) {
        if (snapshot.status === "processing" && !firedStarted.current) {
          firedStarted.current = true;
          AnalyticsEvents.analysisStarted(documentId);
        }
        if (snapshot.status === "completed") AnalyticsEvents.analysisCompleted(documentId);
        if (snapshot.status === "failed") AnalyticsEvents.analysisFailed(documentId);

        setStatus(snapshot.status);
        if (TERMINAL_STATUSES.has(snapshot.status)) router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [documentId, status, router]);

  if (TERMINAL_STATUSES.has(status)) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      {STATUS_LABELS[status] ?? status}
    </div>
  );
}
