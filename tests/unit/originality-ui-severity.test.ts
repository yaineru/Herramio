import { describe, expect, it } from "vitest";
import { enginePresentation, severityForRatio, type SeverityLevel } from "@/lib/originality/ui/severity";

describe("severityForRatio", () => {
  it("maps the documented bands", () => {
    const cases: [number, SeverityLevel][] = [
      [0, "low"],
      [0.15, "low"],
      [0.16, "moderate"],
      [0.35, "moderate"],
      [0.36, "high"],
      [1, "high"],
    ];
    for (const [ratio, level] of cases) {
      expect(severityForRatio(ratio).level, `ratio ${ratio}`).toBe(level);
    }
  });

  it("clamps out-of-range input instead of throwing", () => {
    expect(severityForRatio(-0.5).level).toBe("low");
    expect(severityForRatio(4).level).toBe("high");
    expect(severityForRatio(Number.NaN).level).toBe("low");
  });

  it("never renders a verdict — no severity label accuses the user", () => {
    // The engine measures textual overlap. It cannot know intent or
    // attribution context, so no label may assert plagiarism, copying or
    // fraud. This is the product's core honesty rule, not a wording taste.
    const forbidden = ["plagio", "plagiado", "copiado", "copia", "fraude", "deshonest"];
    for (const ratio of [0, 0.2, 0.5, 0.99]) {
      const { label, guidance } = severityForRatio(ratio);
      const text = `${label} ${guidance}`.toLowerCase();
      for (const word of forbidden) {
        expect(text, `ratio ${ratio} label/guidance`).not.toContain(word);
      }
    }
  });

  it("always pairs colour with a text label so colour is never the only signal", () => {
    for (const ratio of [0, 0.2, 0.5]) {
      const s = severityForRatio(ratio);
      expect(s.label.trim().length).toBeGreaterThan(0);
      expect(s.guidance.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses distinct colour tokens per band and no raw hex values", () => {
    const bands = [0, 0.2, 0.5].map(severityForRatio);
    const strokes = new Set(bands.map((b) => b.strokeClass));
    expect(strokes.size).toBe(3);
    for (const b of bands) {
      expect(`${b.textClass} ${b.bgClass} ${b.borderClass} ${b.strokeClass}`).not.toMatch(/#|\[/);
    }
  });
});

describe("enginePresentation", () => {
  it("styles a not-yet-enabled engine as informational, never as an error", () => {
    // A capability that is switched off is not a failure. Painting it red
    // would tell the user something broke when nothing did.
    for (const state of ["waiting", "unavailable"] as const) {
      const p = enginePresentation(state, "Semántico");
      const classes = `${p.textClass} ${p.bgClass} ${p.borderClass} ${p.dotClass}`;
      expect(classes, state).not.toMatch(/red|rose|amber|orange|yellow/);
      expect(classes, state).toMatch(/slate/);
    }
  });

  it("keeps the caller's label verbatim", () => {
    expect(enginePresentation("active", "Léxico").label).toBe("Léxico");
  });

  it("returns a presentation for every state", () => {
    for (const state of ["active", "verified", "waiting", "unavailable"] as const) {
      expect(enginePresentation(state, "x").state).toBe(state);
    }
  });
});
