import { describe, it, expect } from "vitest";
import { extractHashtags } from "@/lib/text/extract-hashtags";

describe("extractHashtags", () => {
  it("extracts hashtags from text", () => {
    expect(extractHashtags("Me encanta #viajar y el #verano")).toEqual(["#verano", "#viajar"]);
  });

  it("deduplicates case-insensitively, keeping the first casing seen", () => {
    expect(extractHashtags("#Viaje #viaje #VIAJE")).toEqual(["#Viaje"]);
  });

  it("supports accented letters", () => {
    expect(extractHashtags("#viajé #diseño")).toEqual(["#diseño", "#viajé"]);
  });

  it("returns an empty array when there are no hashtags", () => {
    expect(extractHashtags("texto sin etiquetas")).toEqual([]);
  });

  it("does not treat a bare # as a hashtag", () => {
    expect(extractHashtags("precio: # 5")).toEqual([]);
  });

  it("sorts the results alphabetically", () => {
    expect(extractHashtags("#zebra #ana #manzana")).toEqual(["#ana", "#manzana", "#zebra"]);
  });
});
