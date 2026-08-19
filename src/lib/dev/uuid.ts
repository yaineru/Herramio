/** Generates one or more RFC 4122 v4 UUIDs using the native Web Crypto API. */
export function generateUuids(count: number): string[] {
  const n = Math.max(1, Math.min(count, 100));
  return Array.from({ length: n }, () => crypto.randomUUID());
}
