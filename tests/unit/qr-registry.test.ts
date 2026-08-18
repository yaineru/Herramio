import { describe, it, expect } from "vitest";
import { PAYLOAD_BUILDERS } from "@/lib/qr/registry";

describe("PAYLOAD_BUILDERS", () => {
  it("returns an empty string when required fields are missing", () => {
    expect(PAYLOAD_BUILDERS["qr-url"]({})).toBe("");
    expect(PAYLOAD_BUILDERS["qr-whatsapp"]({ phone: "" })).toBe("");
    expect(PAYLOAD_BUILDERS["qr-wifi"]({ ssid: "" })).toBe("");
    expect(PAYLOAD_BUILDERS["qr-vcard"]({ firstName: "", phone: "" })).toBe("");
  });

  it("builds a URL payload once required data is present", () => {
    expect(PAYLOAD_BUILDERS["qr-url"]({ url: "example.com" })).toBe("https://example.com");
  });

  it("builds a WhatsApp payload with a message", () => {
    const result = PAYLOAD_BUILDERS["qr-whatsapp"]({ phone: "5215512345678", message: "Hola" });
    expect(result).toBe("https://wa.me/5215512345678?text=Hola");
  });

  it("builds a WiFi payload with defaults", () => {
    const result = PAYLOAD_BUILDERS["qr-wifi"]({ ssid: "Casa", password: "1234", security: "WPA", hidden: false });
    expect(result).toBe("WIFI:T:WPA;S:Casa;P:1234;;");
  });

  it("builds a Google Maps payload from a plain address", () => {
    const result = PAYLOAD_BUILDERS["qr-google-maps"]({ query: "Bogotá, Colombia" });
    expect(result).toContain("google.com/maps/search");
  });

  it("builds an email payload", () => {
    const result = PAYLOAD_BUILDERS["qr-email"]({ to: "a@b.com", subject: "", body: "" });
    expect(result).toBe("mailto:a@b.com");
  });

  it("builds a phone payload", () => {
    expect(PAYLOAD_BUILDERS["qr-telefono"]({ phone: "+525512345678" })).toBe("tel:+525512345678");
  });

  it("builds a vCard once a first name is present", () => {
    const result = PAYLOAD_BUILDERS["qr-vcard"]({ firstName: "Ana", lastName: "", phone: "" });
    expect(result).toContain("FN:Ana");
  });
});
