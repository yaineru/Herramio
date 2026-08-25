import { describe, it, expect } from "vitest";
import { compareChunks } from "@/lib/originality/similarity";
import { normalizeText } from "@/lib/originality/normalize";

/**
 * Calibration dataset for the similarity engine. Every expectation here is
 * a real measured outcome of the current algorithm, not an aspiration — if
 * the algorithm changes, these numbers change and the test fails loudly,
 * which is the point: it makes a silent behavior regression impossible.
 *
 * Documents are written to exercise the specific cases that matter for
 * academic integrity, including the ones the engine is expected to NOT
 * flag (a paraphrase without shared wording, unrelated text on the same
 * topic) — false positives are the most damaging failure mode for this
 * product, since they accuse a real person of something.
 */

const ORIGINAL = `Artificial intelligence is transforming higher education around the world today.
Universities are adopting new tools to support students and faculty in research and teaching.`;

const EXACT_COPY = ORIGINAL;

const NEAR_COPY_ONE_WORD_CHANGED = `Artificial intelligence is transforming higher education around the globe today.
Universities are adopting new tools to support students and faculty in research and teaching.`;

const NEAR_COPY_WORDS_INSERTED = `Artificial intelligence is rapidly transforming higher education around the world today.
Universities are increasingly adopting new tools to support students and faculty in research and teaching.`;

const PARAPHRASE_SAME_MEANING_DIFFERENT_WORDS = `Machine learning technologies are reshaping university-level instruction globally.
Academic institutions increasingly deploy software that assists scholars and teaching staff.`;

const RELATED_TOPIC_NOT_COPIED = `Online learning platforms have grown substantially in the past decade.
Many students now complete entire degree programs without attending a physical campus.`;

const UNRELATED = `The migratory patterns of arctic terns span from the Arctic to the Antarctic each year.
These birds experience more daylight than any other creature on the planet.`;

function compare(a: string, b: string) {
  return compareChunks(normalizeText(a), normalizeText(b));
}

describe("golden dataset: cases the engine MUST flag", () => {
  it("exact copy → exact match, score 1", () => {
    const result = compare(ORIGINAL, EXACT_COPY);
    expect(result.type).toBe("exact");
    expect(result.score).toBe(1);
  });

  it("near copy with one word changed → near_exact", () => {
    const result = compare(ORIGINAL, NEAR_COPY_ONE_WORD_CHANGED);
    expect(result.type).toBe("near_exact");
    expect(result.score).toBeGreaterThanOrEqual(0.5);
    expect(result.score).toBeLessThan(1);
  });

  it("near copy with words inserted → near_exact", () => {
    const result = compare(ORIGINAL, NEAR_COPY_WORDS_INSERTED);
    expect(result.type).toBe("near_exact");
    expect(result.score).toBeGreaterThanOrEqual(0.5);
  });
});

describe("golden dataset: cases the engine MUST NOT flag (false-positive guard)", () => {
  it("unrelated text → no match", () => {
    const result = compare(ORIGINAL, UNRELATED);
    expect(result.type).toBeNull();
  });

  it("related topic, independently written → no match", () => {
    const result = compare(ORIGINAL, RELATED_TOPIC_NOT_COPIED);
    expect(result.type).toBeNull();
  });

  it("true paraphrase (same meaning, different words) → NOT flagged by the lexical engine", () => {
    // This is a real, documented limitation, asserted here on purpose so it
    // can never be quietly misrepresented: n-gram overlap cannot detect a
    // rewrite that shares meaning but not wording. Catching this requires
    // semantic embeddings, which are not configured (see ORIGINALITY.md).
    // The product must therefore never claim to detect paraphrasing.
    const result = compare(ORIGINAL, PARAPHRASE_SAME_MEANING_DIFFERENT_WORDS);
    expect(result.type).toBeNull();
  });
});

describe("golden dataset: measured precision on this set", () => {
  it("flags 3/3 true copies and 0/3 non-copies (zero false positives on this set)", () => {
    const shouldFlag = [EXACT_COPY, NEAR_COPY_ONE_WORD_CHANGED, NEAR_COPY_WORDS_INSERTED];
    const shouldNotFlag = [UNRELATED, RELATED_TOPIC_NOT_COPIED, PARAPHRASE_SAME_MEANING_DIFFERENT_WORDS];

    const truePositives = shouldFlag.filter((doc) => compare(ORIGINAL, doc).type !== null).length;
    const falsePositives = shouldNotFlag.filter((doc) => compare(ORIGINAL, doc).type !== null).length;

    expect(truePositives).toBe(3);
    expect(falsePositives).toBe(0);
  });
});
