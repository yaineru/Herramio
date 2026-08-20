import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/text/slugify";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("Hola Mundo")).toBe("hola-mundo");
  });

  it("strips accents", () => {
    expect(slugify("Cómo Crear un Código QR")).toBe("como-crear-un-codigo-qr");
  });

  it("normalizes ñ to n, matching standard slugify conventions", () => {
    expect(slugify("Año Nuevo")).toBe("ano-nuevo");
  });

  it("removes special characters", () => {
    expect(slugify("¡Hola, mundo! ¿Qué tal?")).toBe("hola-mundo-que-tal");
  });

  it("collapses multiple spaces/hyphens into one", () => {
    expect(slugify("uno   dos---tres")).toBe("uno-dos-tres");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -hola-  ")).toBe("hola");
  });

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("keeps numbers", () => {
    expect(slugify("Top 10 herramientas 2026")).toBe("top-10-herramientas-2026");
  });
});
