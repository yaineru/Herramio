export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const HASH_ALGORITHMS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * MD5 is intentionally not offered: Web Crypto's subtle.digest does not
 * implement it, and MD5 is cryptographically broken — adding a userland
 * implementation just to support it isn't worth the extra dependency/code.
 */
export async function computeHash(input: string, algorithm: HashAlgorithm): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return toHex(digest);
}
