import { describe, it, expect } from "vitest";
import { jsonToTypeScript } from "@/lib/dev/json-to-typescript";

describe("jsonToTypeScript", () => {
  it("generates a flat interface for a simple object", () => {
    const result = jsonToTypeScript({ name: "Ana", age: 30, active: true }, "User");
    expect(result).toContain("interface User {");
    expect(result).toContain("name: string;");
    expect(result).toContain("age: number;");
    expect(result).toContain("active: boolean;");
  });

  it("generates a nested interface for a nested object", () => {
    const result = jsonToTypeScript({ user: { name: "Ana" } }, "Root");
    expect(result).toContain("interface Root {");
    expect(result).toContain("user: User;");
    expect(result).toContain("interface User {");
    expect(result).toContain("name: string;");
  });

  it("infers an array-of-primitives type", () => {
    const result = jsonToTypeScript({ tags: ["a", "b"] }, "Root");
    expect(result).toContain("tags: string[];");
  });

  it("infers an array-of-objects type using a merged shape", () => {
    const result = jsonToTypeScript({ items: [{ id: 1 }, { id: 2 }] }, "Root");
    expect(result).toContain("items: Item[];");
    expect(result).toContain("interface Item {");
    expect(result).toContain("id: number;");
  });

  it("marks fields only present in some array items as optional", () => {
    const result = jsonToTypeScript({ items: [{ id: 1, note: "x" }, { id: 2 }] }, "Root");
    expect(result).toMatch(/note\??: string;/);
  });

  it("quotes property names that are not valid identifiers", () => {
    const result = jsonToTypeScript({ "first-name": "Ana" }, "Root");
    expect(result).toContain('"first-name": string;');
  });

  it("handles null values", () => {
    const result = jsonToTypeScript({ deletedAt: null }, "Root");
    expect(result).toContain("deletedAt: null;");
  });

  it("gives distinct names to interfaces that would otherwise collide", () => {
    const result = jsonToTypeScript({ a: { profile: { name: "x" } }, b: { profile: { age: 1 } } }, "Root");
    expect(result).toContain("interface Profile {");
    expect(result).toContain("interface Profile2 {");
  });
});
