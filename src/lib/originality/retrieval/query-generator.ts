/**
 * Selects which fragments of a document are worth spending a search query
 * on. Searching every sentence would be slow and expensive for no gain —
 * most sentences are generic filler that match everything.
 *
 * Scores each candidate on how *distinctive* it is: long enough to be
 * specific, rich in uncommon vocabulary, and not built entirely from stock
 * academic phrasing. Pure and deterministic, so the selection is testable
 * and reproducible without calling any provider.
 */

export interface SourceQuery {
  text: string;
  /** 0–1. Higher means more likely to identify a specific source. */
  qualityScore: number;
  /** Which chunk this came from, so a hit can be traced back to the document. */
  chunkSequence: number;
  reason: string;
}

// Extremely common words carry no identifying power. Deliberately small
// and Spanish/English mixed — the catalogue is bilingual.
const STOPWORDS = new Set([
  "the","and","for","that","this","with","from","are","was","were","been","have","has","had","not","but","its",
  "which","their","would","could","should","there","these","those","than","then","when","where","what","who",
  "los","las","del","que","con","por","para","una","uno","como","más","pero","sus","este","esta","estos","estas",
  "sobre","entre","desde","hasta","cuando","donde","porque","también","muy","fue","han","son","ser","hacer",
]);

// Phrases that appear in essentially every academic text. A candidate made
// mostly of these identifies nothing.
const GENERIC_ACADEMIC_PHRASES = [
  "in this study", "the results show", "it is important to note", "further research is needed",
  "the purpose of this", "in conclusion", "on the other hand", "as shown in",
  "en este estudio", "los resultados muestran", "es importante señalar", "por otro lado",
  "en conclusión", "el objetivo de este", "se puede observar",
];

const MIN_WORDS = 8;
const MAX_WORDS = 25;

function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Scores how distinctive a fragment is. The components are separate and
 * commented so a bad selection can be diagnosed rather than guessed at.
 */
export function scoreQueryCandidate(text: string): { score: number; reason: string } {
  const all = words(text);
  if (all.length < MIN_WORDS) return { score: 0, reason: "demasiado corto para identificar una fuente" };

  const content = all.filter((w) => !STOPWORDS.has(w) && w.length > 3);
  if (content.length === 0) return { score: 0, reason: "solo contiene palabras muy comunes" };

  const lower = text.toLowerCase();
  const genericHits = GENERIC_ACADEMIC_PHRASES.filter((p) => lower.includes(p)).length;

  // Lexical variety: repeated words mean less unique signal.
  const uniqueRatio = new Set(content).size / content.length;
  // Longer words correlate with technical/domain terminology.
  const avgLen = content.reduce((s, w) => s + w.length, 0) / content.length;
  const lengthSignal = Math.min(1, Math.max(0, (avgLen - 4) / 4));
  // Content density: how much of the fragment is substantive.
  const density = content.length / all.length;
  // Generic phrasing actively subtracts — such a fragment matches everything.
  const genericPenalty = Math.min(0.6, genericHits * 0.3);

  const score = Math.max(0, Math.min(1, uniqueRatio * 0.35 + lengthSignal * 0.35 + density * 0.3 - genericPenalty));

  const reason =
    genericHits > 0
      ? "contiene frases académicas genéricas que aparecen en cualquier texto"
      : score >= 0.6
        ? "vocabulario específico y poco repetitivo"
        : "poco distintivo";

  return { score, reason };
}

/** Trims a chunk to a search-sized window, preferring its most content-dense span. */
function toQueryWindow(text: string): string {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length <= MAX_WORDS) return tokens.join(" ");

  let bestStart = 0;
  let bestScore = -1;
  for (let i = 0; i + MAX_WORDS <= tokens.length; i += 5) {
    const window = tokens.slice(i, i + MAX_WORDS).join(" ");
    const { score } = scoreQueryCandidate(window);
    if (score > bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }
  return tokens.slice(bestStart, bestStart + MAX_WORDS).join(" ");
}

export interface GenerateQueriesOptions {
  /** Hard cap on queries per document — the primary cost control. */
  maxQueries?: number;
  /** Fragments below this are not worth a network call. */
  minQuality?: number;
}

/**
 * Picks the best query fragments across a document's chunks, at most one
 * per chunk so a single dense paragraph can't consume the whole budget.
 */
export function generateSourceQueries(
  chunks: { sequence: number; text: string }[],
  options: GenerateQueriesOptions = {},
): SourceQuery[] {
  const maxQueries = options.maxQueries ?? 8;
  const minQuality = options.minQuality ?? 0.45;

  const candidates: SourceQuery[] = [];
  for (const chunk of chunks) {
    const text = toQueryWindow(chunk.text);
    const { score, reason } = scoreQueryCandidate(text);
    if (score < minQuality) continue;
    candidates.push({ text, qualityScore: score, chunkSequence: chunk.sequence, reason });
  }

  return candidates.sort((a, b) => b.qualityScore - a.qualityScore).slice(0, maxQueries);
}
