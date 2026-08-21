export interface DiffToken {
  value: string;
  type: "equal" | "added" | "removed";
}

/**
 * Word-level diff via the classic LCS (longest common subsequence) table.
 * Splits on whitespace, keeping the separators attached to each token so
 * the rebuilt text preserves spacing. O(n*m) — fine for PDF-page-sized text,
 * not meant for whole-book documents.
 */
export const MAX_DIFF_CELLS = 4_000_000;

export function diffWords(a: string, b: string): DiffToken[] {
  const tokensA = a.split(/(\s+)/).filter((t) => t !== "");
  const tokensB = b.split(/(\s+)/).filter((t) => t !== "");

  const n = tokensA.length;
  const m = tokensB.length;
  if (n * m > MAX_DIFF_CELLS) {
    throw new Error("Los documentos son demasiado largos para compararlos palabra por palabra.");
  }
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = tokensA[i] === tokensB[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (tokensA[i] === tokensB[j]) {
      result.push({ value: tokensA[i], type: "equal" });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ value: tokensA[i], type: "removed" });
      i++;
    } else {
      result.push({ value: tokensB[j], type: "added" });
      j++;
    }
  }
  while (i < n) {
    result.push({ value: tokensA[i], type: "removed" });
    i++;
  }
  while (j < m) {
    result.push({ value: tokensB[j], type: "added" });
    j++;
  }

  return result;
}
