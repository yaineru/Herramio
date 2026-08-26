import { describe, expect, it } from "vitest";
import { compareChunks } from "@/lib/originality/similarity";
import { normalizeText } from "@/lib/originality/normalize";
import { GOLDEN_CASES, SOURCE_TEXT } from "@/lib/originality/evaluation/dataset";
import { findStableZone, formatSweep, sweepThresholds, type ScoredCase } from "@/lib/originality/evaluation/sweep";

/**
 * Measures the match threshold instead of asserting it. The sweep runs the
 * whole golden dataset at every candidate threshold and prints the table,
 * so the value in similarity.ts is defensible with numbers and any change
 * to the engine shows up here as a moved plateau.
 */

const THRESHOLDS = Array.from({ length: 19 }, (_, i) => +((i + 1) * 0.05).toFixed(2));

function scoreCases(): ScoredCase[] {
  const source = normalizeText(SOURCE_TEXT);
  return GOLDEN_CASES.map((c) => ({
    id: c.id,
    kind: c.kind,
    // compareChunks returns the raw score even when it declines to call it
    // a match, so the sweep is independent of the shipped threshold.
    score: compareChunks(source, normalizeText(c.text)).score,
    expected: c.shouldMatch,
    semanticOnly: c.semanticOnly === true,
  }));
}

describe("threshold sweep over the golden dataset", () => {
  const all = scoreCases();
  // Cases only a semantic engine could catch would count as permanent
  // false negatives at every threshold and would flatten the curve,
  // hiding where the lexical engine actually changes behaviour.
  const lexical = all.filter((c) => !c.semanticOnly);
  const rows = sweepThresholds(lexical, THRESHOLDS);

  it("prints the full sweep table", () => {
    console.log(`\n  Lexical engine — threshold sweep (${lexical.length} cases)\n${formatSweep(rows)}\n`);
    expect(rows).toHaveLength(THRESHOLDS.length);
  });

  it("finds a stable plateau rather than a single fragile peak", () => {
    const zone = findStableZone(rows);
    expect(zone).not.toBeNull();
    console.log(
      `\n  Stable zone: ${zone!.low.toFixed(2)} – ${zone!.high.toFixed(2)} ` +
        `(width ${zone!.width.toFixed(2)}, midpoint ${zone!.midpoint.toFixed(2)}, F1 ${zone!.bestF1.toFixed(3)})\n`,
    );
    // A plateau narrower than this would mean the threshold sits on a
    // cliff edge, where one new dataset case flips the engine's behaviour.
    expect(zone!.width).toBeGreaterThanOrEqual(0.1);
  });

  it("separates copies from non-copies with a real margin", () => {
    const copies = lexical.filter((c) => c.expected).map((c) => c.score);
    const nonCopies = lexical.filter((c) => !c.expected).map((c) => c.score);
    const lowestCopy = Math.min(...copies);
    const highestNonCopy = Math.max(...nonCopies);
    console.log(
      `\n  Lowest copy score: ${lowestCopy.toFixed(3)} | Highest non-copy score: ${highestNonCopy.toFixed(3)} ` +
        `| gap: ${(lowestCopy - highestNonCopy).toFixed(3)}\n`,
    );
    expect(lowestCopy).toBeGreaterThan(highestNonCopy);
  });

  it("never produces a false positive at the shipped threshold", () => {
    // Precision is the metric that protects a real person from a wrong
    // accusation, so it is the one held at 1.0 unconditionally.
    const shipped = rows.find((r) => Math.abs(r.threshold - 0.25) < 1e-9);
    expect(shipped).toBeDefined();
    expect(shipped!.falsePositiveIds).toEqual([]);
  });
});
