export interface ParsedUserAgent {
  browser: string;
  browserVersion: string | null;
  os: string;
}

/** Best-effort User-Agent parser covering the major browsers and OSes — heuristic, not exhaustive. */
export function parseUserAgent(ua: string): ParsedUserAgent {
  let browser = "Desconocido";
  let browserVersion: string | null = null;

  const edgeMatch = ua.match(/Edg\/([\d.]+)/);
  const operaMatch = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
  const safariMatch = /Safari\//.test(ua) && /Version\/([\d.]+)/.test(ua) ? ua.match(/Version\/([\d.]+)/) : null;

  if (edgeMatch) {
    browser = "Edge";
    browserVersion = edgeMatch[1];
  } else if (operaMatch) {
    browser = "Opera";
    browserVersion = operaMatch[1];
  } else if (firefoxMatch) {
    browser = "Firefox";
    browserVersion = firefoxMatch[1];
  } else if (chromeMatch) {
    browser = "Chrome";
    browserVersion = chromeMatch[1];
  } else if (safariMatch) {
    browser = "Safari";
    browserVersion = safariMatch[1];
  }

  let os = "Desconocido";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS"; // must precede Mac OS X — iOS UAs contain "like Mac OS X"
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, browserVersion, os };
}
