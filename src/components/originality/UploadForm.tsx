"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, FileUp, LoaderCircle, Sparkles, UploadCloud } from "lucide-react";
import { uploadDocumentAction, type UploadActionState } from "@/lib/originality/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const initialState: UploadActionState = { error: null };
type UploadPhase = "idle" | "dragging" | "ready" | "uploading";

const PHASE_META: Record<
  UploadPhase,
  { label: string; hint: string; dot: string; bar: string; badge: string }
> = {
  idle: {
    label: "Listo para subir",
    hint: "PDF, DOCX o TXT",
    dot: "bg-slate-300",
    bar: "bg-slate-200",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
  },
  dragging: {
    label: "Soltando archivo",
    hint: "Suelta el documento para empezar",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  ready: {
    label: "Archivo listo",
    hint: "Pulsa «Analizar documento» para empezar",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  uploading: {
    label: "Subiendo documento",
    hint: "Validando formato y guardando archivo",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
};

/**
 * The phase is DERIVED, never stored.
 *
 * It used to live in state, kept in sync by an effect that also fought
 * two manual setPhase calls — the effect always won on the next render,
 * so those calls did nothing. It also mislabelled the most common moment
 * in the flow: choosing a file (before submitting anything) rendered
 * "Procesando análisis", claiming work that had not started. This screen
 * reports what the engine is doing, so it has to be right about it.
 *
 * Real processing — extraction, citations, matching — happens after the
 * redirect, and the report page's own poller reports it. Nothing here
 * should claim to know about that stage.
 */
function derivePhase(input: { isDragging: boolean; isPending: boolean; hasFile: boolean }): UploadPhase {
  if (input.isDragging) return "dragging";
  if (input.isPending) return "uploading";
  return input.hasFile ? "ready" : "idle";
}

export function UploadForm() {
  const [state, formAction, isPending] = useActionState(uploadDocumentAction, initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const phase = derivePhase({ isDragging, isPending, hasFile: Boolean(selectedFileName) });

  const stageItems = useMemo(
    () => [
      { key: "ready", text: "Archivo listo" },
      { key: "uploading", text: "Subiendo" },
    ],
    [],
  );

  const handleFileSelect = (file?: File | null) => {
    setSelectedFileName(file?.name ?? null);
  };

  return (
    <form
      action={formAction}
      onSubmit={() => AnalyticsEvents.documentUploadStarted()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        handleFileSelect(file);
      }}
      className={cn(
        "rounded-2xl border-2 border-dashed p-6 text-left transition-all duration-200 sm:p-8",
        isDragging
          ? "border-emerald-400 bg-emerald-50/60 elevation-brand"
          : "border-slate-300 bg-slate-50/80 hover:border-emerald-400 hover:bg-emerald-50/30",
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white elevation-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", PHASE_META[phase].badge)}>
              {PHASE_META[phase].label}
            </div>
            <p className="mt-3 text-sm text-slate-600">{PHASE_META[phase].hint}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>Originalidad, análisis responsable</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {stageItems.map((item, index) => {
          // Step 0 lights up once a file is chosen; step 1 once the upload
          // is actually running. Neither claims the analysis stage — that
          // happens after the redirect and the report page reports it.
          const isActive = index === 0 ? phase !== "idle" : phase === "uploading";
          const isComplete = index === 0 && (phase === "ready" || phase === "uploading");

          return (
            <div
              key={item.key}
              className={cn(
                "rounded-2xl border p-3 text-sm transition-all",
                isActive
                  ? "border-emerald-200 bg-white text-slate-900 elevation-brand"
                  : "border-slate-200 bg-white/70 text-slate-500",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{item.text}</span>
                {isComplete ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className={cn("h-2.5 w-2.5 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-300")} />}
              </div>
            </div>
          );
        })}
      </div>

      <label
        htmlFor="originality-file"
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center elevation-1 transition hover:border-emerald-300 hover:bg-emerald-50/20"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          {isPending ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <FileUp className="h-6 w-6" />}
        </div>
        <span className="mt-4 block text-base font-semibold text-slate-900">
          {selectedFileName ? `Archivo listo: ${selectedFileName}` : "Arrastra tu documento aquí o haz clic para elegirlo"}
        </span>
        <span className="mt-1 text-sm text-slate-500">PDF, DOCX o TXT</span>
      </label>

      <input
        id="originality-file"
        name="file"
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        required
        onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
        className="sr-only"
      />

      {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-500">
          Recomendado: documentos con texto claro y referencias bien formateadas. Esto ayuda a que la comparación sea más útil.
        </p>
        <div className="shrink-0">
          <SubmitButton>{isPending ? "Analizando..." : "Analizar documento"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}
