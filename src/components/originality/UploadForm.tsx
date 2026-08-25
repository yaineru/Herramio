"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadDocumentAction, type UploadActionState } from "@/lib/originality/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AnalyticsEvents } from "@/lib/analytics";

const initialState: UploadActionState = { error: null };

export function UploadForm() {
  const [state, formAction] = useActionState(uploadDocumentAction, initialState);

  return (
    <form
      action={formAction}
      onSubmit={() => AnalyticsEvents.documentUploadStarted()}
      className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
    >
      <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
      <label htmlFor="originality-file" className="mt-3 block cursor-pointer text-sm font-medium text-slate-700">
        Arrastra tu documento aquí o haz clic para elegirlo
      </label>
      <p className="mt-1 text-xs text-slate-400">PDF, DOCX o TXT</p>
      <input
        id="originality-file"
        name="file"
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        required
        className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
      />
      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      <div className="mt-4">
        <SubmitButton>Analizar documento</SubmitButton>
      </div>
    </form>
  );
}
