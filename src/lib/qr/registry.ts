import type { FieldValues } from "@/lib/qr/fields";
import {
  buildUrlPayload,
  buildTextPayload,
  buildWhatsAppPayload,
  buildWifiPayload,
  buildEmailPayload,
  buildPhonePayload,
  buildSmsPayload,
  buildGeoPayload,
  buildInstagramPayload,
  buildFacebookPayload,
  buildVCardPayload,
  type WifiSecurity,
} from "@/lib/qr/payloads";

export type QrKind =
  | "qr-url"
  | "qr-texto"
  | "qr-whatsapp"
  | "qr-wifi"
  | "qr-google-maps"
  | "qr-instagram"
  | "qr-facebook"
  | "qr-email"
  | "qr-telefono"
  | "qr-sms"
  | "qr-vcard"
  | "qr-menu"
  | "qr-negocio";

const str = (v: string | boolean | undefined) => (typeof v === "string" ? v : "");
const bool = (v: string | boolean | undefined) => Boolean(v);

export const PAYLOAD_BUILDERS: Record<QrKind, (values: FieldValues) => string> = {
  "qr-url": (v) => {
    const url = str(v.url).trim();
    return url ? buildUrlPayload(url) : "";
  },
  "qr-texto": (v) => buildTextPayload(str(v.text).trim()),
  "qr-whatsapp": (v) => {
    const phone = str(v.phone).trim();
    return phone ? buildWhatsAppPayload(phone, str(v.message)) : "";
  },
  "qr-wifi": (v) => {
    const ssid = str(v.ssid).trim();
    if (!ssid) return "";
    return buildWifiPayload({
      ssid,
      password: str(v.password),
      security: (str(v.security) || "WPA") as WifiSecurity,
      hidden: bool(v.hidden),
    });
  },
  "qr-google-maps": (v) => {
    const query = str(v.query).trim();
    return query ? buildGeoPayload({ lat: "", lng: "", query }) : "";
  },
  "qr-instagram": (v) => {
    const username = str(v.username).trim();
    return username ? buildInstagramPayload(username) : "";
  },
  "qr-facebook": (v) => {
    const username = str(v.username).trim();
    return username ? buildFacebookPayload(username) : "";
  },
  "qr-email": (v) => {
    const to = str(v.to).trim();
    return to ? buildEmailPayload({ to, subject: str(v.subject), body: str(v.body) }) : "";
  },
  "qr-telefono": (v) => {
    const phone = str(v.phone).trim();
    return phone ? buildPhonePayload(phone) : "";
  },
  "qr-sms": (v) => {
    const phone = str(v.phone).trim();
    return phone ? buildSmsPayload({ phone, message: str(v.message) }) : "";
  },
  "qr-vcard": (v) => {
    const firstName = str(v.firstName).trim();
    const phone = str(v.phone).trim();
    if (!firstName && !phone) return "";
    return buildVCardPayload({
      firstName,
      lastName: str(v.lastName),
      phone,
      email: str(v.email),
      company: str(v.company),
      title: str(v.title),
      website: str(v.website),
      address: str(v.address),
    });
  },
  "qr-menu": (v) => {
    const url = str(v.url).trim();
    return url ? buildUrlPayload(url) : "";
  },
  "qr-negocio": (v) => {
    const url = str(v.url).trim();
    return url ? buildUrlPayload(url) : "";
  },
};
