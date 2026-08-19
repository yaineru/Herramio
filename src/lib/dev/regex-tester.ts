export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexTestResult {
  ok: boolean;
  error?: string;
  matches: RegexMatch[];
  truncated: boolean;
}

// Hard caps protect the main thread from pathological (ReDoS-prone) patterns:
// there's no reliable way to "time out" a synchronous regex exec in JS, so we
// bound the work instead by capping input length and match count.
const MAX_INPUT_LENGTH = 20_000;
const MAX_MATCHES = 500;

export function testRegex(pattern: string, flags: string, text: string): RegexTestResult {
  if (text.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      error: `El texto supera el límite de ${MAX_INPUT_LENGTH.toLocaleString("es")} caracteres.`,
      matches: [],
      truncated: false,
    };
  }

  let regex: RegExp;
  try {
    const normalizedFlags = flags.includes("g") ? flags : `${flags}g`;
    regex = new RegExp(pattern, normalizedFlags);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Expresión regular inválida", matches: [], truncated: false };
  }

  const matches: RegexMatch[] = [];
  let truncated = false;
  let m: RegExpExecArray | null;
  let lastIndex = -1;

  while ((m = regex.exec(text)) !== null) {
    if (matches.length >= MAX_MATCHES) {
      truncated = true;
      break;
    }
    matches.push({ match: m[0], index: m.index, groups: m.slice(1).map((g) => g ?? "") });
    if (m.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }
    if (regex.lastIndex === lastIndex) break;
    lastIndex = regex.lastIndex;
  }

  return { ok: true, matches, truncated };
}
