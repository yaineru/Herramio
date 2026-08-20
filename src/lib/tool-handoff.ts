/**
 * Transient, in-memory handoff of a File between two tool pages on a
 * client-side navigation — e.g. "convert the image I just compressed"
 * without making the user download and re-upload it.
 *
 * Deliberately NOT localStorage/sessionStorage: a File/Blob isn't
 * structured-cloneable into storage without a lossy base64 round-trip, and
 * this data is only ever meant to survive one same-tab navigation anyway.
 * A module-level variable does exactly that — it survives a Next.js
 * client-side route change (the module stays loaded) and is naturally gone
 * on a full reload or a new tab, which is the correct behavior here: the
 * target tool just falls back to its normal empty state.
 */
export interface ToolHandoff {
  sourceTool: string;
  targetTool: string;
  file: File;
}

let pendingHandoff: ToolHandoff | null = null;

export function setToolHandoff(handoff: ToolHandoff): void {
  pendingHandoff = handoff;
}

/** Returns the pending file and clears it, but only if it was meant for this exact tool — a stale or mistargeted handoff is discarded, never silently applied elsewhere. */
export function consumeToolHandoff(targetTool: string): File | null {
  if (!pendingHandoff || pendingHandoff.targetTool !== targetTool) return null;
  const { file } = pendingHandoff;
  pendingHandoff = null;
  return file;
}
