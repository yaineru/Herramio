// Builders that turn structured form input into the exact string a QR code
// should encode, following the formats real scanners (iOS/Android camera) expect.

export function buildUrlPayload(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function buildTextPayload(text: string): string {
  return text;
}

export function buildWhatsAppPayload(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message.trim()) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export function buildWifiPayload(opts: {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}): string {
  const esc = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");
  const parts = [
    `WIFI:T:${opts.security}`,
    `S:${esc(opts.ssid)}`,
    opts.security === "nopass" ? "" : `P:${esc(opts.password)}`,
    opts.hidden ? "H:true" : "",
  ].filter(Boolean);
  return `${parts.join(";")};;`;
}

export function buildEmailPayload(opts: { to: string; subject: string; body: string }): string {
  const params = new URLSearchParams();
  if (opts.subject) params.set("subject", opts.subject);
  if (opts.body) params.set("body", opts.body);
  const query = params.toString();
  return `mailto:${opts.to}${query ? `?${query}` : ""}`;
}

export function buildPhonePayload(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function buildSmsPayload(opts: { phone: string; message: string }): string {
  const digits = opts.phone.replace(/[^\d+]/g, "");
  return opts.message
    ? `sms:${digits}?&body=${encodeURIComponent(opts.message)}`
    : `sms:${digits}`;
}

export function buildGeoPayload(opts: { lat: string; lng: string; query: string }): string {
  if (opts.query.trim()) {
    if (/^https?:\/\//i.test(opts.query.trim())) return opts.query.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opts.query)}`;
  }
  return `geo:${opts.lat},${opts.lng}`;
}

export function buildInstagramPayload(usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim().replace(/^@/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://instagram.com/${trimmed}`;
}

export function buildFacebookPayload(usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://facebook.com/${trimmed}`;
}

export type VCardInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
  address: string;
};

export function buildVCardPayload(v: VCardInput): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${v.lastName};${v.firstName};;;`,
    `FN:${[v.firstName, v.lastName].filter(Boolean).join(" ")}`,
    v.company ? `ORG:${v.company}` : "",
    v.title ? `TITLE:${v.title}` : "",
    v.phone ? `TEL;TYPE=CELL:${v.phone}` : "",
    v.email ? `EMAIL:${v.email}` : "",
    v.website ? `URL:${v.website}` : "",
    v.address ? `ADR:;;${v.address};;;;` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}
