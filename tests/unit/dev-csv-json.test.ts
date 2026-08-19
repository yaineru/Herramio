import { describe, it, expect } from "vitest";
import { csvToJson, jsonToCsv } from "@/lib/dev/csv-json";

describe("csvToJson", () => {
  it("converts a simple CSV to an array of objects", () => {
    const result = csvToJson("name,age\nAna,30\nBeto,25");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toEqual([
        { name: "Ana", age: "30" },
        { name: "Beto", age: "25" },
      ]);
    }
  });

  it("handles quoted fields containing commas", () => {
    const result = csvToJson('name,city\n"Doe, John","New York"');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toEqual([{ name: "Doe, John", city: "New York" }]);
    }
  });

  it("handles escaped double quotes inside a quoted field", () => {
    const result = csvToJson('quote\n"She said ""hi"""');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toEqual([{ quote: 'She said "hi"' }]);
    }
  });

  it("fills missing trailing fields with an empty string", () => {
    const result = csvToJson("a,b,c\n1,2");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.value)).toEqual([{ a: "1", b: "2", c: "" }]);
    }
  });

  it("rejects empty input", () => {
    expect(csvToJson("   ").ok).toBe(false);
  });
});

describe("jsonToCsv", () => {
  it("converts an array of objects to CSV", () => {
    const result = jsonToCsv(JSON.stringify([{ name: "Ana", age: 30 }]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("name,age\nAna,30");
  });

  it("quotes fields containing commas", () => {
    const result = jsonToCsv(JSON.stringify([{ city: "New York, NY" }]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe('city\n"New York, NY"');
  });

  it("unions headers across objects with different keys", () => {
    const result = jsonToCsv(JSON.stringify([{ a: 1 }, { b: 2 }]));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const lines = result.value.split("\n");
      expect(lines[0]).toBe("a,b");
    }
  });

  it("rejects invalid JSON", () => {
    expect(jsonToCsv("{not json").ok).toBe(false);
  });

  it("rejects a JSON value that isn't an array of objects", () => {
    expect(jsonToCsv('{"a": 1}').ok).toBe(false);
    expect(jsonToCsv("[1, 2, 3]").ok).toBe(false);
  });

  it("round-trips csvToJson -> jsonToCsv for simple data", () => {
    const csv = "name,age\nAna,30\nBeto,25";
    const jsonResult = csvToJson(csv);
    expect(jsonResult.ok).toBe(true);
    if (!jsonResult.ok) return;
    const csvResult = jsonToCsv(jsonResult.value);
    expect(csvResult.ok).toBe(true);
    if (csvResult.ok) expect(csvResult.value).toBe(csv);
  });
});
