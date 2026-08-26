import { computeMetrics, classifyOutcome, type EvaluatedCase, type EvaluationMetrics } from "@/lib/originality/evaluation/metrics";

/**
 * Threshold sweep over the golden dataset.
 *
 * The match threshold is the single most consequential number in the
 * engine: too high and real copies go unreported, too low and the product
 * accuses people of copying stock phrases. Picking it by intuition is how
 * a similarity tool ends up untrustworthy, so it is chosen by measuring
 * every candidate against the whole dataset and reading the result.
 *
 * What we look for is not the peak F1 — a peak that sits on a cliff edge
 * is fragile, and one new dataset case would move it. We look for the
 * widest *plateau*: a contiguous run of thresholds that all score the same
 * best F1. The midpoint of that plateau is maximally far from the nearest
 * behaviour change in either direction.
 */

export interface SweepRow extends EvaluationMetrics {
  threshold: number;
  /** Ids of the cases this threshold gets wrong, so a regression names names. */
  falsePositiveIds: string[];
  falseNegativeIds: string[];
}

export interface ScoredCase {
  id: string;
  kind: string;
  /** Raw similarity score, independent of any threshold. */
  score: number;
  /** What the engine should conclude. */
  expected: boolean;
  /** Cases only a semantic engine could catch — excluded from lexical recall. */
  semanticOnly: boolean;
}

export function sweepThresholds(cases: ScoredCase[], thresholds: number[]): SweepRow[] {
  return thresholds.map((threshold) => {
    const evaluated: EvaluatedCase[] = cases.map((c) => {
      const actual = c.score >= threshold;
      return { id: c.id, expected: c.expected, actual, outcome: classifyOutcome(c.expected, actual) };
    });

    return {
      threshold,
      ...computeMetrics(evaluated),
      falsePositiveIds: evaluated.filter((e) => e.outcome === "FP").map((e) => e.id),
      falseNegativeIds: evaluated.filter((e) => e.outcome === "FN").map((e) => e.id),
    };
  });
}

export interface StableZone {
  /** Lowest threshold achieving the best F1. */
  low: number;
  /** Highest threshold achieving the best F1. */
  high: number;
  /** Furthest point from a behaviour change in either direction. */
  midpoint: number;
  bestF1: number;
  width: number;
}

/**
 * Finds the widest contiguous run of thresholds sharing the best F1.
 * Returns null when no threshold separates the classes at all.
 */
export function findStableZone(rows: SweepRow[]): StableZone | null {
  if (rows.length === 0) return null;
  // A null F1 means the threshold flagged nothing at all — that is not a
  // candidate for "best", so it is floored to 0 rather than propagated.
  const f1Of = (row: SweepRow) => row.f1 ?? 0;
  const bestF1 = Math.max(...rows.map(f1Of));
  if (bestF1 === 0) return null;

  let best: { start: number; end: number } | null = null;
  let start: number | null = null;

  rows.forEach((row, index) => {
    const isBest = Math.abs(f1Of(row) - bestF1) < 1e-9;
    if (isBest && start === null) start = index;
    if ((!isBest || index === rows.length - 1) && start !== null) {
      const end = isBest ? index : index - 1;
      if (!best || end - start > best.end - best.start) best = { start, end };
      start = null;
    }
  });

  if (!best) return null;
  const zone: { start: number; end: number } = best;
  const low = rows[zone.start].threshold;
  const high = rows[zone.end].threshold;
  return { low, high, midpoint: (low + high) / 2, bestF1, width: high - low };
}

/** "  n/a" when a metric is undefined because nothing was flagged. */
function fmt(value: number | null): string {
  return value === null ? "  n/a" : value.toFixed(3);
}

/** Renders the sweep as a fixed-width table for test output. */
export function formatSweep(rows: SweepRow[]): string {
  const header = "  thr    P      R      F1     TP TN FP FN  misses";
  const body = rows.map((r) => {
    const misses = [...r.falsePositiveIds.map((id) => `+${id}`), ...r.falseNegativeIds.map((id) => `-${id}`)];
    return (
      `  ${r.threshold.toFixed(2)}   ${fmt(r.precision)}  ${fmt(r.recall)}  ${fmt(r.f1)}  ` +
      `${String(r.truePositives).padStart(2)} ${String(r.trueNegatives).padStart(2)} ` +
      `${String(r.falsePositives).padStart(2)} ${String(r.falseNegatives).padStart(2)}  ${misses.join(" ")}`
    );
  });
  return [header, ...body].join("\n");
}
