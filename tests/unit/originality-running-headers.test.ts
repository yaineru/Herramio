import { describe, expect, it } from "vitest";
import { findRunningLines, stripRunningHeaders } from "@/lib/originality/extract/running-headers";

/** Builds a page with a real interior, so "edge line" is a meaningful notion. */
function page(first: string, body: string[], last: string): string {
  return [first, ...body, last].join("\n");
}

describe("stripRunningHeaders", () => {
  it("removes a header that repeats on every page, page number and all", () => {
    const pages = [
      page("Universidad X - Tesis - Página 1", ["Primer párrafo real.", "mas cuerpo", "aun mas"], "cierre uno"),
      page("Universidad X - Tesis - Página 2", ["Segundo párrafo real.", "mas cuerpo", "aun mas"], "cierre dos"),
      page("Universidad X - Tesis - Página 3", ["Tercer párrafo real.", "mas cuerpo", "aun mas"], "cierre tres"),
    ];
    const out = stripRunningHeaders(pages).join("\n");
    expect(out).not.toMatch(/Universidad X/);
    expect(out).toContain("Primer párrafo real.");
    expect(out).toContain("Tercer párrafo real.");
  });

  it("removes a repeating footer as well as a header", () => {
    const pages = [
      page("Encabezado", ["Contenido uno.", "cuerpo a", "cuerpo b"], "Pie de página confidencial"),
      page("Encabezado", ["Contenido dos.", "cuerpo c", "cuerpo d"], "Pie de página confidencial"),
    ];
    const out = stripRunningHeaders(pages).join("\n");
    expect(out).not.toMatch(/Encabezado/);
    expect(out).not.toMatch(/Pie de página/);
    expect(out).toContain("Contenido uno.");
  });

  it("leaves a single-page document completely untouched", () => {
    // One page gives no evidence that any line is boilerplate.
    const pages = [page("Encabezado", ["Texto del documento.", "a", "b"], "fin")];
    expect(stripRunningHeaders(pages)).toEqual(pages);
  });

  it("ignores pages too short to have an interior", () => {
    // On a two-line page every line is an edge line, so a header cannot be
    // told apart from body text. Such pages must not drive the decision.
    const pages = ["Cabecera\nCuerpo uno.", "Cabecera\nCuerpo dos."];
    expect(stripRunningHeaders(pages)).toEqual(pages);
  });

  it("keeps a line that appears on only one page", () => {
    const pages = [
      page("Titulo unico", ["Cuerpo uno.", "a", "b"], "fin uno"),
      page("Otro titulo", ["Cuerpo dos.", "c", "d"], "fin dos"),
    ];
    const out = stripRunningHeaders(pages).join("\n");
    expect(out).toContain("Titulo unico");
    expect(out).toContain("Otro titulo");
  });

  it("keeps a repeated phrase that appears mid-page as real prose", () => {
    // Only edge lines are candidates, so genuine body text survives even
    // when it repeats — which is exactly what the engine must detect.
    const pages = [
      page("Cabecera", ["intro uno", "la frase repetida importante", "cierre uno"], "final uno"),
      page("Cabecera", ["intro dos", "la frase repetida importante", "cierre dos"], "final dos"),
    ];
    const out = stripRunningHeaders(pages).join("\n");
    expect(out).not.toMatch(/Cabecera/);
    expect((out.match(/la frase repetida importante/g) ?? []).length).toBe(2);
  });

  it("does not strip a long line even when it repeats", () => {
    const long =
      "Esta es una oración larga de contenido real que se repite deliberadamente entre páginas y supera con holgura el límite de un encabezado.";
    const pages = [
      page(long, ["Cuerpo uno.", "a", "b"], "fin uno"),
      page(long, ["Cuerpo dos.", "c", "d"], "fin dos"),
    ];
    expect(stripRunningHeaders(pages).join("\n")).toContain(long);
  });

  it("requires a majority of pages for a longer document", () => {
    const pages = [
      page("Ruido A", ["alfa", "beta", "gama"], "fin uno"),
      page("Ruido A", ["delta", "epsilon", "zeta"], "fin dos"),
      page("Distinto B", ["eta", "theta", "iota"], "fin tres"),
      page("Distinto C", ["kappa", "lambda", "mu"], "fin cuatro"),
      page("Distinto D", ["nu", "xi", "omicron"], "fin cinco"),
      page("Distinto E", ["pi", "rho", "sigma"], "fin seis"),
    ];
    // "Ruido A" hits 2 of 6 pages — below the 50% majority.
    expect(findRunningLines(pages).size).toBe(0);
  });

  it("returns pages unchanged when nothing repeats", () => {
    const pages = [
      page("Uno", ["Alfa", "a", "b"], "fin uno"),
      page("Dos", ["Beta", "c", "d"], "fin dos"),
    ];
    expect(stripRunningHeaders(pages)).toEqual(pages);
  });
});
