import { describe, it, expect } from "vitest";
import {
  buildUrlPayload,
  buildWhatsAppPayload,
  buildWifiPayload,
  buildEmailPayload,
  buildPhonePayload,
  buildSmsPayload,
  buildGeoPayload,
  buildInstagramPayload,
  buildFacebookPayload,
  buildVCardPayload,
} from "@/lib/qr/payloads";

describe("buildUrlPayload", () => {
  it("passes through URLs that already have a protocol", () => {
    expect(buildUrlPayload("https://example.com")).toBe("https://example.com");
  });

  it("adds https:// when missing", () => {
    expect(buildUrlPayload("example.com")).toBe("https://example.com");
  });
});

describe("buildWhatsAppPayload", () => {
  it("builds a wa.me link without a message", () => {
    expect(buildWhatsAppPayload("+52 55 1234 5678", "")).toBe("https://wa.me/525512345678");
  });

  it("url-encodes the message", () => {
    const result = buildWhatsAppPayload("5215512345678", "Hola, ¿cómo estás?");
    expect(result).toBe("https://wa.me/5215512345678?text=Hola%2C%20%C2%BFc%C3%B3mo%20est%C3%A1s%3F");
  });
});

describe("buildWifiPayload", () => {
  it("builds a WPA network string", () => {
    const result = buildWifiPayload({ ssid: "MiRed", password: "clave123", security: "WPA", hidden: false });
    expect(result).toBe("WIFI:T:WPA;S:MiRed;P:clave123;;");
  });

  it("omits the password for open networks", () => {
    const result = buildWifiPayload({ ssid: "RedAbierta", password: "", security: "nopass", hidden: false });
    expect(result).toBe("WIFI:T:nopass;S:RedAbierta;;");
  });

  it("adds H:true for hidden networks", () => {
    const result = buildWifiPayload({ ssid: "Oculta", password: "1234", security: "WPA", hidden: true });
    expect(result).toBe("WIFI:T:WPA;S:Oculta;P:1234;H:true;;");
  });

  it("escapes special characters in ssid/password", () => {
    const result = buildWifiPayload({ ssid: 'Red;"raro"', password: "a,b\\c", security: "WPA", hidden: false });
    expect(result).toBe('WIFI:T:WPA;S:Red\\;\\"raro\\";P:a\\,b\\\\c;;');
  });
});

describe("buildEmailPayload", () => {
  it("builds a mailto link with subject and body", () => {
    const result = buildEmailPayload({ to: "a@b.com", subject: "Hola", body: "Mensaje" });
    expect(result).toBe("mailto:a@b.com?subject=Hola&body=Mensaje");
  });

  it("builds a bare mailto link with no params", () => {
    expect(buildEmailPayload({ to: "a@b.com", subject: "", body: "" })).toBe("mailto:a@b.com");
  });
});

describe("buildPhonePayload", () => {
  it("builds a tel link", () => {
    expect(buildPhonePayload("+52 55 1234 5678")).toBe("tel:+525512345678");
  });
});

describe("buildSmsPayload", () => {
  it("builds an sms link with a message", () => {
    expect(buildSmsPayload({ phone: "+525512345678", message: "Hola" })).toBe(
      "sms:+525512345678?&body=Hola",
    );
  });

  it("builds a bare sms link without a message", () => {
    expect(buildSmsPayload({ phone: "+525512345678", message: "" })).toBe("sms:+525512345678");
  });
});

describe("buildGeoPayload", () => {
  it("builds a Google Maps search link from a text query", () => {
    expect(buildGeoPayload({ lat: "", lng: "", query: "Torre Eiffel" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Torre%20Eiffel",
    );
  });

  it("passes through an existing Maps URL unchanged", () => {
    const url = "https://maps.app.goo.gl/abc123";
    expect(buildGeoPayload({ lat: "", lng: "", query: url })).toBe(url);
  });

  it("falls back to geo: coordinates when no query is given", () => {
    expect(buildGeoPayload({ lat: "19.43", lng: "-99.13", query: "" })).toBe("geo:19.43,-99.13");
  });
});

describe("buildInstagramPayload / buildFacebookPayload", () => {
  it("normalizes an @username into a full Instagram URL", () => {
    expect(buildInstagramPayload("@miusuario")).toBe("https://instagram.com/miusuario");
  });

  it("passes through a full Facebook URL unchanged", () => {
    expect(buildFacebookPayload("https://facebook.com/mipagina")).toBe(
      "https://facebook.com/mipagina",
    );
  });
});

describe("buildVCardPayload", () => {
  it("includes only the fields that were provided", () => {
    const vcard = buildVCardPayload({
      firstName: "Ana",
      lastName: "García",
      phone: "12345",
      email: "",
      company: "",
      title: "",
      website: "",
      address: "",
    });
    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("FN:Ana García");
    expect(vcard).toContain("TEL;TYPE=CELL:12345");
    expect(vcard).not.toContain("EMAIL:");
    expect(vcard).toContain("END:VCARD");
  });
});
