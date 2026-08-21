/**
 * Binary-searches a quality value (0.01–1) so that `measureSize(quality)`
 * lands at or under `targetBytes`, biasing toward the highest quality that
 * still fits. Decoupled from canvas/Blob so the search logic is unit
 * testable without a real image — the component supplies `measureSize` by
 * encoding into a canvas and reading `blob.size`.
 */
export async function binarySearchQuality(
  measureSize: (quality: number) => Promise<number>,
  targetBytes: number,
  iterations = 8,
): Promise<number> {
  let lo = 0.01;
  let hi = 1;
  let best = 0.01;

  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const size = await measureSize(mid);
    if (size <= targetBytes) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return best;
}
