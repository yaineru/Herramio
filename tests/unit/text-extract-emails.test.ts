import { describe, it, expect } from "vitest";
import { extractEmails } from "@/lib/text/extract-emails";

describe("extractEmails", () => {
  it("finds emails scattered across free text", () => {
    const text = "Contacta a ana@ejemplo.com o a soporte@empresa.co para más info.";
    expect(extractEmails(text)).toEqual(["ana@ejemplo.com", "soporte@empresa.co"]);
  });

  it("deduplicates case-insensitively, keeping the first casing seen", () => {
    const text = "Ana@Ejemplo.com y ana@ejemplo.com son el mismo correo.";
    expect(extractEmails(text)).toEqual(["Ana@Ejemplo.com"]);
  });

  it("sorts results alphabetically", () => {
    const text = "zeta@z.com alfa@a.com";
    expect(extractEmails(text)).toEqual(["alfa@a.com", "zeta@z.com"]);
  });

  it("returns an empty array when there are no emails", () => {
    expect(extractEmails("No hay correos aquí, solo texto.")).toEqual([]);
  });

  it("ignores malformed email-like fragments", () => {
    expect(extractEmails("esto no es un correo: @sinusuario.com ni tampoco usuario@")).toEqual([]);
  });
});
