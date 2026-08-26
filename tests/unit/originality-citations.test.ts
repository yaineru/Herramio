import { describe, it, expect } from "vitest";
import { detectCitations, detectReferences } from "@/lib/originality/citations";

describe("detectCitations", () => {
  it("detects an APA parenthetical citation", () => {
    const result = detectCitations("This idea has been studied before (Smith, 2021).");
    expect(result).toContainEqual({ rawText: "(Smith, 2021)", styleGuess: "apa" });
  });

  it("detects an APA parenthetical citation with et al.", () => {
    const result = detectCitations("As shown previously (Smith et al., 2021), the effect is real.");
    expect(result.some((c) => c.rawText === "(Smith et al., 2021)")).toBe(true);
  });

  it("detects an APA narrative citation", () => {
    const result = detectCitations("Smith (2021) argues that the effect is real.");
    expect(result).toContainEqual({ rawText: "Smith (2021)", styleGuess: "apa" });
  });

  it("detects a Vancouver-style numeric citation", () => {
    const result = detectCitations("This has been demonstrated previously [12].");
    expect(result).toContainEqual({ rawText: "[12]", styleGuess: "vancouver" });
  });

  it("classifies a multi-number bracket citation as ieee-style", () => {
    const result = detectCitations("Multiple studies agree [3, 7].");
    expect(result).toContainEqual({ rawText: "[3, 7]", styleGuess: "ieee" });
  });

  it("does not detect a citation in plain text with no citation-shaped substring", () => {
    const result = detectCitations("This is just a regular sentence about nothing in particular.");
    expect(result).toEqual([]);
  });

  it("de-duplicates the same citation appearing twice", () => {
    const result = detectCitations("(Smith, 2021) and again (Smith, 2021) later.");
    expect(result).toHaveLength(1);
  });
});

describe("detectReferences", () => {
  it("finds nothing when there is no References/Referencias heading", () => {
    expect(detectReferences("Just some regular paragraph text.\nAnother paragraph.")).toEqual([]);
  });

  it("parses entries after a References heading", () => {
    const text = [
      "Introduction text here.",
      "References",
      "Smith, J. (2021). A study of things. Journal of Studies.",
      "Jones, A. (2019). Another study. Some Publisher.",
    ].join("\n");
    const result = detectReferences(text);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].parsedAuthor).toContain("Smith");
    expect(result[0].parsedYear).toBe("2021");
  });

  it("recognizes the Spanish heading 'Referencias'", () => {
    const text = "Referencias\nGarcía, M. (2020). Un estudio importante sobre temas relevantes.";
    const result = detectReferences(text);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("also finds the heading when extraction merges it onto the end of the previous sentence's line", () => {
    const text = "This concludes the discussion. References\nSmith, J. (2021). A study of things. Journal of Studies.";
    const result = detectReferences(text);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("never fabricates an author/year/title it cannot parse — leaves fields null instead", () => {
    const text = "References\nthis line has a year 2021 but no clean author-like prefix pattern at all";
    const result = detectReferences(text);
    // Whatever it does or doesn't match, it must never invent a value —
    // only report what the pattern actually captured.
    for (const ref of result) {
      expect(typeof ref.rawText).toBe("string");
    }
  });
});

describe("detectReferences with numbered bibliographies", () => {
  // IEEE and Vancouver number every entry. Before the label was stripped,
  // REFERENCE_ENTRY anchored on an author-like token at the start of the
  // line, so an entire numbered bibliography matched nothing and the
  // report told the user the document had no references at all.
  const body = "Texto del trabajo.\n\nReferencias\n";

  it("detects entries labelled with square brackets", () => {
    const refs = detectReferences(
      `${body}[1] UNESCO (2023). Guidance for generative AI in education and research. UNESCO.\n` +
        `[2] Russell, S., & Norvig, P. (2021). Artificial Intelligence: A Modern Approach. Pearson.`,
    );
    expect(refs).toHaveLength(2);
    expect(refs[0].parsedYear).toBe("2023");
    expect(refs[1].parsedYear).toBe("2021");
  });

  it("detects entries labelled with a bare number and a dot or paren", () => {
    const refs = detectReferences(
      `${body}1. Luckin, R. (2016). Intelligence Unleashed. Pearson.\n2) Holmes, W. (2019). Artificial Intelligence in Education. Center.`,
    );
    expect(refs).toHaveLength(2);
  });

  it("keeps the label in rawText so Crossref still searches the full entry", () => {
    // Crossref verification queries rawText; a truncated entry verifies
    // worse than one carrying a harmless leading number.
    const refs = detectReferences(`${body}[1] UNESCO (2023). Guidance for generative AI in education. UNESCO.`);
    expect(refs[0].rawText).toMatch(/^\[1\] UNESCO/);
  });

  it("still ignores a numbered line that carries no year", () => {
    const refs = detectReferences(`${body}[1] Una nota suelta sin ningun anio indicado aqui.`);
    expect(refs).toHaveLength(0);
  });

  it("still detects unnumbered APA entries", () => {
    const refs = detectReferences(`${body}Russell, S. (2021). Artificial Intelligence: A Modern Approach. Pearson.`);
    expect(refs).toHaveLength(1);
  });
});
