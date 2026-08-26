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
  | "substitutions"
  | "formatting_changes"
  | "fragment_in_unique_text"
  | "synonym_paraphrase"
  | "restructured_paraphrase"
  | "voice_change"
  | "common_definition"
  | "short_common_phrase"
  | "orphan_citation"
  | "uncited_reference"
  | "mixed_document"
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
  /**
   * What a SEMANTIC engine should conclude. Defaults to `shouldMatch`.
   *
   * These are two different questions and conflating them produces
   * nonsense metrics. `shouldMatch` asks "is there shared wording?" — a
   * paraphrase answers no, correctly. The semantic question is "was this
   * text derived from the source?", and a paraphrase answers yes. The
   * first benchmark run scored every paraphrase the semantic engine
   * caught as a false positive, which measured the engine against the
   * wrong ground truth and made it look far worse than it is.
   *
   * The line is derivation, not topic: a passage rewritten from the
   * source should match; a passage written independently about the same
   * subject should not, however similar the vocabulary.
   */
  semanticShouldMatch?: boolean;
  note: string;
}

/** Ground truth for the semantic engine, falling back to the lexical label. */
export function expectedSemanticMatch(c: GoldenCase): boolean {
  return c.semanticShouldMatch ?? c.shouldMatch;
}

export const SOURCE_TEXT = `Artificial intelligence is transforming higher education around the world today.
Universities are adopting new tools to support students and faculty in research and teaching.`;

/**
 * The two sentences of SOURCE_TEXT, derived rather than retyped so a case
 * built from a fragment can never drift out of sync with the source it is
 * supposed to be copying.
 */
const [S1, S2] = SOURCE_TEXT.split("\n");

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
    semanticShouldMatch: true,
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
    semanticShouldMatch: true,
    note: "Paráfrasis con cita — la atribución ayuda, pero el motor léxico sigue sin detectar la reescritura.",
  },
  {
    id: "misattributed_citation",
    kind: "misattributed_citation",
    text: `According to Jones (2022), artificial intelligence is transforming higher education around the world today. Universities are adopting new tools to support students and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Cita que no corresponde a la referencia: el contenido sigue siendo copia, pero la atribución es incorrecta y debe resolverse en la capa de citas, no en el motor léxico.",
  },
// ---- NEAR: substitutions, reordering, formatting ----
  {
    id: "reordered_clauses",
    kind: "reordered",
    text: `Around the world today, artificial intelligence is transforming higher education.
To support students and faculty in research and teaching, universities are adopting new tools.`,
    shouldMatch: true,
    note: "Cláusulas reordenadas — mismas palabras, distinto orden. El shingling de 3 pierde los límites reordenados pero conserva los tramos internos.",
  },
  {
    id: "synonym_substitutions",
    kind: "substitutions",
    text: `Artificial intelligence is transforming university education around the world today.
Universities are adopting new instruments to support learners and faculty in research and teaching.`,
    shouldMatch: true,
    note: "Tres sustituciones léxicas dispersas — evasión típica de buscar-y-reemplazar.",
  },
  {
    id: "heavy_substitutions",
    kind: "substitutions",
    text: `Machine intelligence is reshaping tertiary schooling across the planet nowadays.
Colleges are embracing fresh instruments to assist pupils and staff in study and instruction.`,
    shouldMatch: false,
    semanticOnly: true,
    semanticShouldMatch: true,
    note: "Sustitución de casi todos los términos — fuera del alcance léxico por diseño; sólo un motor semántico lo alcanzaría.",
  },
  {
    id: "formatting_changes",
    kind: "formatting_changes",
    text: `   Artificial   intelligence  is transforming   higher education around the world today.

	 Universities are adopting new tools to support students   and faculty in research and teaching.   `,
    shouldMatch: true,
    note: "Sólo cambia el espaciado/tabulación — la normalización debe absorberlo por completo.",
  },

  // ---- PARTIAL ----
  {
    id: "fragment_in_unique_text",
    kind: "fragment_in_unique_text",
    text: `My dissertation examines rural connectivity and its effect on secondary schooling outcomes.
Fieldwork was carried out over eleven months across four provinces with limited infrastructure.
${S1}
The remaining chapters develop an original framework for evaluating those outcomes locally.
No previous study in this region combined household surveys with school administrative records.`,
    shouldMatch: true,
    note: "Una sola frase copiada dentro de texto propio extenso — el caso que containment debe rescatar y Jaccard puro pierde.",
  },

  // ---- PARAPHRASE ----
  {
    id: "synonym_paraphrase",
    kind: "synonym_paraphrase",
    text: `Machine learning is altering university-level education globally.
Institutions of higher learning are embracing novel instruments to aid learners and academics in scholarship and instruction.`,
    shouldMatch: false,
    semanticOnly: true,
    semanticShouldMatch: true,
    note: "Paráfrasis por sinónimos — límite léxico conocido y documentado.",
  },
  {
    id: "restructured_paraphrase",
    kind: "restructured_paraphrase",
    text: `Across universities worldwide, a shift is underway: the tools now being adopted to help both faculty and students with teaching and research are driven by artificial intelligence.`,
    shouldMatch: false,
    semanticOnly: true,
    semanticShouldMatch: true,
    note: "Misma idea reestructurada en una sola oración — límite léxico conocido.",
  },
  {
    id: "voice_change",
    kind: "voice_change",
    text: `Higher education around the world today is being transformed by artificial intelligence.
New tools to support students and faculty in research and teaching are being adopted by universities.`,
    shouldMatch: true,
    note: "Activa a pasiva conservando el vocabulario — quedan tramos contiguos suficientes para el motor léxico.",
  },

  // ---- FALSE POSITIVE ----
  {
    id: "common_definition",
    kind: "common_definition",
    text: `Artificial intelligence is the field of computer science concerned with building systems that perform tasks normally requiring human intelligence.`,
    shouldMatch: false,
    note: "Definición estándar de un término — comparte vocabulario con la fuente pero es lenguaje común, no copia. Un falso positivo aquí destruiría la credibilidad del informe.",
  },
  {
    id: "short_common_phrase",
    kind: "short_common_phrase",
    text: `In recent years, around the world today, many things have changed.`,
    shouldMatch: false,
    note: "Frase corta y común que solapa con la fuente por casualidad — no debe puntuar.",
  },

  // ---- CITATION ----
  {
    id: "orphan_citation",
    kind: "orphan_citation",
    text: `As Martinez (2019) demonstrates, ${S1}
${S2}`,
    shouldMatch: true,
    note: "Cita cuya referencia no aparece en la bibliografía — el texto sigue siendo copia; lo huérfano se resuelve en el grafo de citas, no en el motor léxico.",
  },
  {
    id: "uncited_reference",
    kind: "uncited_reference",
    text: `${S1}
${S2}
Referencias
Martinez, L. (2019). Digital transformation in universities. Academic Press.`,
    shouldMatch: true,
    note: "Referencia listada pero nunca citada en el cuerpo — la copia se detecta igual; la referencia sin citar es señal informativa aparte.",
  },

  // ---- MIXED ----
  {
    id: "mixed_document",
    kind: "mixed_document",
    text: `Introduction
This chapter sets out the scope of the study and its methodological commitments in detail.
${S1}
Machine learning is altering university-level education globally, according to several observers.
As Smith (2024) notes, "${S2}"
The analysis that follows is entirely my own and draws on data collected during fieldwork.`,
    shouldMatch: true,
    note: "Documento mixto: texto original + copia literal + paráfrasis + cita atribuida en un solo pasaje. Debe coincidir por los tramos literales sin que el resto los diluya.",
  },
];
