/**
 * Golden dataset — the source of truth for whether the matching engine
 * actually works. Every case states what the engine SHOULD conclude, so
 * metrics are computed from real behavior rather than asserted by hand.
 *
 * `shouldMatch` is deliberately about the LEXICAL engine that exists
 * today. Cases that only a semantic engine could catch are marked
 * `semanticOnly: true` — they're expected NOT to match lexically, and
 * that expectation is itself the honest documentation of the current
 * limitation (see ORIGINALITY.md).
 */

export type CaseKind =
  | "exact_copy"
  | "exact_copy_long"
  | "case_variation"
  | "inserted_words"
  | "deleted_words"
  | "reordered"
  | "punctuation_only"
  | "split_sentences"
  | "merged_sentences"
  | "embedded_copy"
  | "multiple_fragments"
  | "short_fragment"
  | "common_heading"
  | "generic_heading"
  | "generic_academic"
  | "independent_concept"
  | "paraphrase"
  | "semantic_related"
  | "unrelated"
  | "cited_copy"
  | "uncited_copy"
  | "paraphrase_with_citation"
  | "misattributed_citation";

export interface GoldenCase {
  id: string;
  kind: CaseKind;
  /** Compared against SOURCE_TEXT. */
  text: string;
  /** What the lexical engine must conclude. */
  shouldMatch: boolean;
  /** True when only a semantic engine could plausibly catch this — documents a known lexical limitation. */
  semanticOnly?: boolean;
  note: string;
}

export const SOURCE_TEXT = `Artificial intelligence is transforming higher education around the world today.
Universities are adopting new tools to support students and faculty in research and teaching.`;

export const GOLDEN_CASES: GoldenCase[] = [
  {
    id: "exact",
    kind: "exact_copy",
    text: SOURCE_TEXT,
    shouldMatch: true,
    note: "Copia literal — debe detectarse siempre.",
  },
  {
    id: "exact_long",
    kind: "exact_copy_long",
    text: `${SOURCE_TEXT}\n\n${SOURCE_TEXT}\n\n${SOURCE_TEXT}`,
    shouldMatch: true,
    note: "Copia exacta larga — un fragmento largo mantiene la coincidencia y no debe ser una excepción.",
  },
  {
    id: "case_variation",
    kind: "case_variation",
    text: `ARTIFICIAL INTELLIGENCE IS TRANSFORMING HIGHER EDUCATION AROUND THE WORLD TODAY.
Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Cambio de mayúsculas — la normalización debe ignorarlo.",
  },
  {
    id: "one_word_changed",
    kind: "inserted_words",
    text: `Artificial intelligence is transforming higher education around the globe today.
Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Una palabra cambiada — evasión trivial.",
  },
  {
    id: "words_inserted",
    kind: "inserted_words",
    text: `Artificial intelligence is rapidly transforming higher education around the world today.
Universities are increasingly adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Dos palabras insertadas — el caso que rompía el motor antes del fix de n-gramas de 4.",
  },
  {
    id: "words_deleted",
    kind: "deleted_words",
    text: `Artificial intelligence is transforming education around the world.
Universities are adopting tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Palabras eliminadas.",
  },
  {
    id: "punctuation_changed",
    kind: "punctuation_only",
    text: `Artificial intelligence is transforming higher education around the world today;
Universities are adopting new tools to support students and faculty in research and teaching!`,
    shouldMatch: true,
    note: "Solo cambia puntuación — la normalización debe absorberlo.",
  },
  {
    id: "split_sentences",
    kind: "split_sentences",
    text: `Artificial intelligence is transforming higher education around the world today. Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Frases divididas — el mismo contenido con saltos de línea o separación distinta.",
  },
  {
    id: "merged_sentences",
    kind: "merged_sentences",
    text: `Artificial intelligence is transforming higher education around the world today. Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Frases fusionadas — la misma idea escrita en un bloque más compacto.",
  },
  {
    id: "embedded_copy",
    kind: "embedded_copy",
    text: `In this essay I will argue several points about modern schooling and its future.
Artificial intelligence is transforming higher education around the world today.
Universities are adopting new tools to support students and faculty in research and teaching.
I personally believe this shift raises important questions for students everywhere.`,
    shouldMatch: true,
    note: "Pasaje copiado dentro de texto propio más largo — el caso que Jaccard puro no cubre (por eso containment).",
  },
  {
    id: "multiple_fragments",
    kind: "multiple_fragments",
    text: `This paper discusses educational technology. Artificial intelligence is transforming higher education around the world today. Another section explains the role of universities. Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Múltiples fragmentos copiados en un documento más largo.",
  },
  {
    id: "short_fragment",
    kind: "short_fragment",
    text: `The university is adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Fragmento corto pero informativo — debe ser detectado sin depender de títulos genéricos.",
  },
  {
    id: "paraphrase",
    kind: "paraphrase",
    text: `Machine learning technologies are reshaping university-level instruction globally.
Academic institutions increasingly deploy software that assists scholars and teaching staff.`,
    shouldMatch: false,
    semanticOnly: true,
    note: "Paráfrasis real: mismo significado, palabras distintas. Un motor léxico NO puede detectarlo — limitación declarada.",
  },
  {
    id: "semantic_related",
    kind: "semantic_related",
    text: `Online learning platforms have grown substantially in the past decade.
Many students now complete entire degree programs without attending a physical campus.`,
    shouldMatch: false,
    note: "Mismo tema, escrito de forma independiente — NO debe marcarse (falso positivo si se marca).",
  },
  {
    id: "generic_heading",
    kind: "generic_heading",
    text: "Introduction",
    shouldMatch: false,
    note: "Encabezado de una palabra — containment lo puntuaría 1.0 sin el guardarraíl de tamaño mínimo. Marcarlo sería una acusación fabricada desde un título.",
  },
  {
    id: "common_heading",
    kind: "common_heading",
    text: "Background and context",
    shouldMatch: false,
    note: "Título común de una frase corta — no es evidencia de copia. Debe quedar fuera del motor léxico.",
  },
  {
    id: "generic_academic",
    kind: "generic_academic",
    text: `This paper explores the implications of technology in modern education and the role of institutions in learning and research.`,
    shouldMatch: false,
    note: "Frase académica genérica — mismo tema, no es copiado.",
  },
  {
    id: "independent_concept",
    kind: "independent_concept",
    text: `Students increasingly use digital platforms to organize coursework and collaborate with peers in online learning environments.`,
    shouldMatch: false,
    note: "Conceptos similares escritos independientemente — debe tratarse como no copiado.",
  },
  {
    id: "unrelated",
    kind: "unrelated",
    text: `The migratory patterns of arctic terns span from the Arctic to the Antarctic each year.
These birds experience more daylight than any other creature on the planet.`,
    shouldMatch: false,
    note: "Sin relación alguna.",
  },
  {
    id: "cited_copy",
    kind: "cited_copy",
    text: `According to Smith (2024), "Artificial intelligence is transforming higher education around the world today." Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Copia correctamente citada — se debe tratar como cita atribuida y no como copia sin atribución.",
  },
  {
    id: "uncited_copy",
    kind: "uncited_copy",
    text: `Smith argues that artificial intelligence is transforming higher education around the world today. Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Copia sin cita — debe considerarse coincidencia real y no ocultarla en una evaluación de citas.",
  },
  {
    id: "paraphrase_with_citation",
    kind: "paraphrase_with_citation",
    text: `Smith (2024) argues that machine learning is reshaping university teaching and institutions are adopting digital tools to support research and instruction.`,
    shouldMatch: false,
    semanticOnly: true,
    note: "Paráfrasis con cita — la atribución ayuda, pero el motor léxico sigue sin detectar la reescritura.",
  },
  {
    id: "misattributed_citation",
    kind: "misattributed_citation",
    text: `According to Jones (2022), artificial intelligence is transforming higher education around the world today. Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Cita que no corresponde a la referencia: el contenido sigue siendo copia, pero la atribución es incorrecta y debe resolverse en la capa de citas, no en el motor léxico.",
  },
];
