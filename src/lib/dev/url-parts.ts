export interface UrlParts {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  queryParams: { key: string; value: string }[];
}

/** Parses a URL string into its components using the browser's own URL parser — returns null for an invalid/unparseable URL. */
export function parseUrlParts(input: string): UrlParts | null {
  try {
    const url = new URL(input);
    const queryParams: { key: string; value: string }[] = [];
    url.searchParams.forEach((value, key) => queryParams.push({ key, value }));
    return {
      protocol: url.protocol.replace(/:$/, ""),
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      queryParams,
    };
  } catch {
    return null;
  }
}

/** Parses a raw query string (with or without a leading "?") into key/value pairs, decoding percent-encoding. */
export function parseQueryString(input: string): { key: string; value: string }[] {
  const cleaned = input.startsWith("?") ? input.slice(1) : input;
  if (cleaned.trim() === "") return [];
  const params = new URLSearchParams(cleaned);
  const result: { key: string; value: string }[] = [];
  params.forEach((value, key) => result.push({ key, value }));
  return result;
}
