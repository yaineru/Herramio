/**
 * Visual severity scale for similarity results.
 *
 * Pure presentation logic, deliberately separated from the evidence model
 * so a colour choice can never influence a classification (or vice versa).
 *
 * Language rule, enforced by test: severity describes what the number is
 * and what to do about it — never a verdict. "36%+" means "requires
 * review", not "plagiarism". The system cannot know intent, attribution
 * context, or field conventions, so it must not imply a conclusion a human
 * hasn't reached. Colour is always paired with a text label for the same
 * reason WCAG requires it: colour alone must never carry meaning.
 */

export type SeverityLevel = "low" | "moderate" | "high";

export interface SeverityPresentation {
  level: SeverityLevel;
  /** Short label. Never accusatory. */
  label: string;
  /** One line explaining what the reader should do. */
  guidance: string;
  /** Tailwind classes — tokens only, no raw hex, so the palette stays centralised. */
  textClass: string;
  bgClass: string;
  borderClass: string;
  /** For the score ring / progress fill. */
  strokeClass: string;
}

// Thresholds are presentation bands, not scientific cutoffs. They exist to
// order attention, and the copy says so.
const MODERATE_FLOOR = 0.16;
const HIGH_FLOOR = 0.36;

export function severityForRatio(ratio: number): SeverityPresentation {
  const clamped = Math.max(0, Math.min(1, ratio));

  if (clamped >= HIGH_FLOOR) {
    return {
      level: "high",
      label: "Requiere revisión",
      guidance: "Hay bastante texto coincidente. Revisa si necesita cita o comillas.",
      textClass: "text-rose-700",
      bgClass: "bg-rose-50",
      borderClass: "border-rose-200",
      strokeClass: "stroke-rose-500",
    };
  }

  if (clamped >= MODERATE_FLOOR) {
    return {
      level: "moderate",
      label: "Revisa algunos pasajes",
      guidance: "Coincidencias puntuales. Comprueba que las citadas estén bien atribuidas.",
      textClass: "text-amber-700",
      bgClass: "bg-amber-50",
      borderClass: "border-amber-200",
      strokeClass: "stroke-amber-500",
    };
  }

  return {
    level: "low",
    label: "Pocas coincidencias",
    guidance: "Se encontró poco texto en común con las fuentes analizadas.",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    strokeClass: "stroke-emerald-600",
  };
}

/** Engine badge states. `waiting` is a first-class state, styled as informational — never as an error. */
export type EngineState = "active" | "verified" | "waiting" | "unavailable";

export interface EnginePresentation {
  state: EngineState;
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
}

export function enginePresentation(state: EngineState, label: string): EnginePresentation {
  switch (state) {
    case "active":
      return {
        state,
        label,
        textClass: "text-emerald-800",
        bgClass: "bg-emerald-50",
        borderClass: "border-emerald-200",
        dotClass: "bg-emerald-600",
      };
    case "verified":
      return {
        state,
        label,
        textClass: "text-indigo-800",
        bgClass: "bg-indigo-50",
        borderClass: "border-indigo-200",
        dotClass: "bg-indigo-600",
      };
    case "waiting":
      // Neutral slate, not red: a capability that isn't switched on is not
      // a failure, and styling it like one would misrepresent the product.
      return {
        state,
        label,
        textClass: "text-slate-700",
        bgClass: "bg-slate-100",
        borderClass: "border-slate-300",
        dotClass: "bg-slate-500",
      };
    case "unavailable":
      return {
        state,
        label,
        textClass: "text-slate-600",
        bgClass: "bg-slate-50",
        borderClass: "border-slate-200",
        dotClass: "bg-slate-400",
      };
  }
}
