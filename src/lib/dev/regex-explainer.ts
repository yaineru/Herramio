export interface RegexToken {
  raw: string;
  description: string;
}

const ESCAPE_DESCRIPTIONS: Record<string, string> = {
  d: "un dígito (0-9)",
  D: "cualquier carácter que no sea un dígito",
  w: "un carácter de palabra (letra, número o guion bajo)",
  W: "cualquier carácter que no sea de palabra",
  s: "un espacio en blanco",
  S: "cualquier carácter que no sea espacio en blanco",
  b: "un límite de palabra",
  B: "una posición que no es límite de palabra",
  n: "un salto de línea",
  t: "un tabulador",
  r: "un retorno de carro",
};

function describeCharClass(content: string): string {
  const negated = content.startsWith("^");
  const body = negated ? content.slice(1) : content;
  return `${negated ? "cualquier carácter EXCEPTO" : "uno de estos caracteres"}: ${body || "(vacío)"}`;
}

function quantifierSuffix(pattern: string, index: number): { text: string; length: number } | null {
  const char = pattern[index];
  if (char === "*") return { text: " (cero o más veces)", length: 1 };
  if (char === "+") return { text: " (una o más veces)", length: 1 };
  if (char === "?") return { text: " (cero o una vez, opcional)", length: 1 };
  if (char === "{") {
    const match = pattern.slice(index).match(/^\{(\d+)(,(\d*))?\}/);
    if (match) {
      const min = match[1];
      const hasComma = match[2] !== undefined;
      const max = match[3];
      let text: string;
      if (!hasComma) text = ` (exactamente ${min} veces)`;
      else if (max === "" || max === undefined) text = ` (${min} o más veces)`;
      else text = ` (entre ${min} y ${max} veces)`;
      return { text, length: match[0].length };
    }
  }
  return null;
}

/**
 * Rule-based, single-pass explanation of a regex pattern's structure —
 * literals, character classes, common escapes, groups, alternation and
 * quantifiers. It describes standard regex syntax, not the author's intent;
 * unusual or malformed patterns may produce a partial or literal reading.
 */
export function explainRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let i = 0;

  function attachQuantifier(baseDescription: string, rawSoFar: string): void {
    const q = quantifierSuffix(pattern, i);
    if (q) {
      tokens.push({ raw: rawSoFar + pattern.slice(i, i + q.length), description: baseDescription + q.text });
      i += q.length;
    } else {
      tokens.push({ raw: rawSoFar, description: baseDescription });
    }
  }

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === "^") {
      tokens.push({ raw: "^", description: "inicio de la línea/cadena" });
      i++;
    } else if (char === "$") {
      tokens.push({ raw: "$", description: "final de la línea/cadena" });
      i++;
    } else if (char === ".") {
      i++;
      attachQuantifier("cualquier carácter", ".");
    } else if (char === "|") {
      tokens.push({ raw: "|", description: "o (alternancia)" });
      i++;
    } else if (char === "\\") {
      const next = pattern[i + 1];
      const raw = `\\${next ?? ""}`;
      const desc = next !== undefined && ESCAPE_DESCRIPTIONS[next] ? ESCAPE_DESCRIPTIONS[next] : `el carácter literal "${next}"`;
      i += 2;
      attachQuantifier(desc, raw);
    } else if (char === "[") {
      const end = pattern.indexOf("]", i + 1);
      const content = end === -1 ? pattern.slice(i + 1) : pattern.slice(i + 1, end);
      const raw = end === -1 ? pattern.slice(i) : pattern.slice(i, end + 1);
      i = end === -1 ? pattern.length : end + 1;
      attachQuantifier(describeCharClass(content), raw);
    } else if (char === "(") {
      let label = "grupo";
      let contentStart = i + 1;
      if (pattern.startsWith("(?:", i)) {
        label = "grupo (sin captura)";
        contentStart = i + 3;
      } else if (pattern.startsWith("(?<", i)) {
        const nameEnd = pattern.indexOf(">", i + 3);
        const name = nameEnd === -1 ? "" : pattern.slice(i + 3, nameEnd);
        label = `grupo con nombre "${name}"`;
        contentStart = nameEnd === -1 ? i + 3 : nameEnd + 1;
      }
      let depth = 1;
      let j = contentStart;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === "(") depth++;
        else if (pattern[j] === ")") depth--;
        j++;
      }
      const closeIndex = depth === 0 ? j - 1 : pattern.length;
      const inner = pattern.slice(contentStart, closeIndex);
      const raw = pattern.slice(i, closeIndex + (depth === 0 ? 1 : 0));
      i = closeIndex + (depth === 0 ? 1 : 0);
      const innerTokens = explainRegex(inner);
      const innerSummary = innerTokens.map((t) => t.description).join(", ");
      attachQuantifier(`${label} que contiene: ${innerSummary || "(vacío)"}`, raw);
    } else {
      i++;
      attachQuantifier(`el carácter literal "${char}"`, char);
    }
  }

  return tokens;
}
