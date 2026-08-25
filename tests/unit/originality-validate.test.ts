import { describe, it, expect } from "vitest";
import { hasExpectedMagicBytes, sanitizeFilename } from "@/lib/originality/validate";

describe("hasExpectedMagicBytes", () => {
  it("accepts real PDF bytes for the PDF mime type", () => {
    const bytes = new TextEncoder().encode("%PDF-1.7\n...");
    expect(hasExpectedMagicBytes(bytes, "application/pdf")).toBe(true);
  });

  it("rejects a file claiming to be a PDF but whose bytes aren't", () => {
    const bytes = new TextEncoder().encode("Not actually a PDF at all");
    expect(hasExpectedMagicBytes(bytes, "application/pdf")).toBe(false);
  });

  it("rejects an executable disguised with a PDF Content-Type (the actual attack this guards against)", () => {
    const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // "MZ" — Windows PE header
    expect(hasExpectedMagicBytes(exeBytes, "application/pdf")).toBe(false);
  });

  it("accepts real DOCX (zip) bytes for the DOCX mime type", () => {
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    expect(
      hasExpectedMagicBytes(bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    ).toBe(true);
  });

  it("rejects a truncated/empty file", () => {
    expect(hasExpectedMagicBytes(new Uint8Array([]), "application/pdf")).toBe(false);
    expect(hasExpectedMagicBytes(new Uint8Array([0x25]), "application/pdf")).toBe(false);
  });

  it("always accepts text/plain — no reliable magic number exists for it", () => {
    expect(hasExpectedMagicBytes(new TextEncoder().encode("anything at all"), "text/plain")).toBe(true);
  });
});

describe("sanitizeFilename", () => {
  it("leaves a normal filename untouched", () => {
    expect(sanitizeFilename("my-essay_final.pdf")).toBe("my-essay_final.pdf");
  });

  it("strips path separators — the actual path-traversal defense", () => {
    expect(sanitizeFilename("../../etc/passwd")).not.toContain("/");
    expect(sanitizeFilename("..\\..\\windows\\system32\\config")).not.toContain("\\");
  });

  it("replaces other unsafe characters", () => {
    expect(sanitizeFilename("file<script>.pdf")).toBe("file_script_.pdf");
  });

  it("falls back to a default name for an empty filename", () => {
    expect(sanitizeFilename("")).toBe("documento");
  });

  it("replaces path separators with underscores rather than deleting them (never silently collapses a crafted traversal path to something that still resolves)", () => {
    expect(sanitizeFilename("///")).toBe("___");
  });

  it("caps extremely long filenames", () => {
    const long = "a".repeat(500) + ".pdf";
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(180);
  });
});
