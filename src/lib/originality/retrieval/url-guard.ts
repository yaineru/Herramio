/**
 * URL safety guard for any server-side fetch of a source discovered from
 * document content or a search provider.
 *
 * Threat model: the URL is attacker-influenced. A user controls the text
 * of their uploaded document, a search provider can return anything, and
 * a fetched page can redirect. Any of those can point at the internal
 * network — cloud metadata endpoints (169.254.169.254) are the classic
 * target and hand out credentials to whoever asks.
 *
 * Pure and synchronous so it is trivially testable and cannot itself
 * perform I/O. DNS-rebinding note in `assertSafeRedirect` below.
 */

export type UrlRejectionReason =
  | "invalid_url"
  | "blocked_scheme"
  | "blocked_host"
  | "private_address"
  | "blocked_port";

export interface UrlCheckResult {
  safe: boolean;
  reason: UrlRejectionReason | null;
  detail: string | null;
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

// Ports that are almost never legitimate public web content but are
// common internal services. 80/443/8080/8443 remain allowed.
const BLOCKED_PORTS = new Set([
  22, 23, 25, 110, 143, 445, 465, 587, 993, 995, // remote access / mail / SMB
  1433, 1521, 3306, 5432, 6379, 9200, 11211, 27017, // databases and caches
  2375, 2376, // docker daemon
]);

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
]);

function isPrivateIPv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums;

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // "this network"
  if (a === 169 && b === 254) return true; // link-local — cloud metadata lives here
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 192 && b === 0) return true; // 192.0.0.0/24 IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast + reserved + broadcast
  return false;
}

function isPrivateIPv6(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "::") return true; // loopback / unspecified
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
  if (h.startsWith("fe80")) return true; // link-local

  // IPv4-mapped addresses must be judged by their IPv4 part, or they are
  // a trivial bypass of every IPv4 rule above.
  //
  // Two spellings must both be handled: the dotted form a caller writes
  // (::ffff:169.254.169.254) and the HEX form the WHATWG URL parser
  // normalizes it into (::ffff:a9fe:a9fe). Checking only the dotted form
  // leaves the bypass wide open, because `new URL()` has already rewritten
  // it by the time this runs — verified against Node's parser.
  const dotted = h.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPrivateIPv4(dotted[1]);

  const hex = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const high = parseInt(hex[1], 16);
    const low = parseInt(hex[2], 16);
    const ipv4 = [(high >> 8) & 0xff, high & 0xff, (low >> 8) & 0xff, low & 0xff].join(".");
    return isPrivateIPv4(ipv4);
  }

  return false;
}

/**
 * Decides whether a URL may be fetched server-side.
 *
 * Hostnames that are not literal IPs still pass here — this cannot know
 * what they resolve to. Defence against a hostname resolving to a private
 * address (DNS rebinding) requires resolving first and pinning the socket
 * to the checked address, which belongs in the fetcher, not in a pure
 * function. `SourceFetcher` documents that requirement.
 */
export function checkUrlSafety(rawUrl: string): UrlCheckResult {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "invalid_url", detail: "No es una URL válida." };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { safe: false, reason: "blocked_scheme", detail: `Esquema no permitido: ${url.protocol}` };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { safe: false, reason: "blocked_host", detail: `Host bloqueado: ${hostname}` };
  }

  // Any hostname under .localhost resolves to loopback per RFC 6761.
  if (hostname.endsWith(".localhost") || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    return { safe: false, reason: "blocked_host", detail: `Host interno: ${hostname}` };
  }

  if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
    return { safe: false, reason: "private_address", detail: `Dirección privada o reservada: ${hostname}` };
  }

  if (url.port) {
    const port = Number(url.port);
    if (BLOCKED_PORTS.has(port)) {
      return { safe: false, reason: "blocked_port", detail: `Puerto bloqueado: ${port}` };
    }
  }

  return { safe: true, reason: null, detail: null };
}

/**
 * Re-checks a redirect target. Called for EVERY hop: validating only the
 * initial URL is the most common way SSRF protection is defeated — a
 * public URL that 302s to 169.254.169.254 passes a naive check.
 */
export function assertSafeRedirect(location: string, base: string): UrlCheckResult {
  try {
    return checkUrlSafety(new URL(location, base).toString());
  } catch {
    return { safe: false, reason: "invalid_url", detail: "Redirección inválida." };
  }
}

/** Limits enforced by the fetcher, kept beside the guard so they're reviewed together. */
export const FETCH_LIMITS = {
  timeoutMs: 8000,
  maxRedirects: 3,
  maxBytes: 2 * 1024 * 1024,
  allowedContentTypes: ["text/html", "text/plain", "application/xhtml+xml"],
} as const;

export function isAllowedContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const base = contentType.split(";")[0]!.trim().toLowerCase();
  return (FETCH_LIMITS.allowedContentTypes as readonly string[]).includes(base);
}
