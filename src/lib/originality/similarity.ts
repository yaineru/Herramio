export type MatchType = "exact" | "near_exact";

export interface ChunkComparisonResult {
  type: MatchType | null;
  score: number;
}

// Chosen by measurement, not intuition. tests/unit/originality-threshold-sweep.test.ts
// runs the whole golden dataset at every threshold from 0.05 to 0.95 and
// prints the table; the value below is the midpoint of the widest plateau
// where F1 is at its maximum:
//
//   0.05 – 0.10  precision drops (a stock phrase gets flagged)
//   0.15 – 0.35  F1 = 1.000  ← plateau, width 0.20
//   0.40 +       recall drops ("one sentence copied into a long original"
//                scores 0.364 and goes unreported)
//
// 0.25 is the midpoint, so it is maximally far from a behaviour change in
// either direction. It replaced 0.50, which sat outside the plateau and
// silently missed that sentence-in-a-long-document case — the single most
// realistic form of copying this engine has to catch.
//
// Verified against real prose, not only the synthetic set: on the QA
// document, genuinely uncopied Spanish academic text scores 0.000 even
// when written on the IDENTICAL topic, and the highest score between two
// non-copied chunks of the same real document is 0.059. The nearest real
// false positive is therefore ~0.19 below this bar.
const NEAR_EXACT_THRESHOLD = 0.25;

// 3-word n-grams. Calibrated by running the full golden dataset at sizes
// 3, 4 and 5 and reading the real numbers rather than picking a value
// that sounded reasonable:
//
//   size 5 → missed "two words inserted"  (0.448)
//   size 4 → missed "words deleted"       (0.444)
//   size 3 → catches every copy case, lowest at 0.632
//
// At all three sizes every non-copy case scores exactly 0.000, so the
// smaller window costs nothing in precision. The 0.000-vs-0.632 gap means
// the threshold is nowhere near a cliff edge.
//
// Why small trigrams don't cause incidental matches: the threshold is a
// *proportion*, not a count. Two unrelated documents sharing a stock
// phrase contribute one shared trigram out of ~20, i.e. ~0.05 — an order
// of magnitude below the 0.5 bar. Clearing 0.5 requires half the smaller
// chunk to overlap, which is a copy, not a coincidence.
const SHINGLE_SIZE = 3;

// Containment is only trustworthy above this many shingles. A one-line
// chunk like "Introduction" yields a single shingle, and containment
// would score it 1.0 against any document that also contains that word —
// a false accusation generated from a heading. Jaccard alone governs
// chunks that small.
const MIN_SHINGLES_FOR_CONTAINMENT = 5;

function shingles(normalizedText: string, size = SHINGLE_SIZE): Set<string> {
  const words = normalizedText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Set();
  if (words.length < size) return new Set([words.join(" ")]);

  const result = new Set<string>();
  for (let i = 0; i <= words.length - size; i++) {
    result.add(words.slice(i, i + size).join(" "));
  }
  return result;
}

function intersectionSize(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const shingle of a) {
    if (b.has(shingle)) count++;
  }
  return count;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = intersectionSize(a, b);
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Overlap coefficient — what fraction of the SMALLER text appears in the
 * larger one. Jaccard punishes length differences hard, so a paragraph
 * copied verbatim into a longer paragraph of original writing scores low
 * on Jaccard despite being a genuine copy; containment catches exactly
 * that case, which is one of the most common real-world patterns.
 */
export function containmentSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  return intersectionSize(a, b) / Math.min(a.size, b.size);
}

/**
 * Compares two ALREADY-NORMALIZED chunk texts. Exact match requires the
 * full normalized text to be identical (not just high overlap). Otherwise
 * the score is the stronger of two complementary signals: n-gram Jaccard
 * (overall resemblance) and containment (one text embedded in the other),
 * with containment gated behind a minimum size so short headings can't
 * manufacture a match.
 *
 * Deliberately lexical: this cannot and does not detect paraphrasing that
 * shares meaning but not wording — that needs semantic embeddings, which
 * aren't configured. The golden-dataset test asserts that limitation
 * explicitly so the product never claims otherwise.
 */
export function compareChunks(normalizedTextA: string, normalizedTextB: string): ChunkComparisonResult {
  if (!normalizedTextA || !normalizedTextB) return { type: null, score: 0 };
  if (normalizedTextA === normalizedTextB) return { type: "exact", score: 1 };

  const shinglesA = shingles(normalizedTextA);
  const shinglesB = shingles(normalizedTextB);

  const jaccard = jaccardSimilarity(shinglesA, shinglesB);
  const containmentEligible =
    shinglesA.size >= MIN_SHINGLES_FOR_CONTAINMENT && shinglesB.size >= MIN_SHINGLES_FOR_CONTAINMENT;
  const score = containmentEligible ? Math.max(jaccard, containmentSimilarity(shinglesA, shinglesB)) : jaccard;

  if (score >= NEAR_EXACT_THRESHOLD) return { type: "near_exact", score };
  return { type: null, score };
}
