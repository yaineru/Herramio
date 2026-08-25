/**
 * Guards a redirect target coming from user input (query param, form field)
 * against open-redirect abuse — only a same-site relative path is trusted;
 * anything else (an absolute URL, a protocol-relative `//evil.com`) falls
 * back to `fallback`.
 */
export function safeRedirectPath(value: unknown, fallback: string): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
