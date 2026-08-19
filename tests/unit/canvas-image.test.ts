import { describe, it, expect } from "vitest";
import { formatBytes, extensionForMime, isSupportedImageType } from "@/lib/images/canvas-image";

describe("formatBytes", () => {
  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });
  it("formats kilobytes", () => {
    expect(formatBytes(780 * 1024)).toBe("780.0 KB");
  });
  it("formats megabytes", () => {
    expect(formatBytes(2.4 * 1024 * 1024)).toBe("2.40 MB");
  });
});

describe("extensionForMime", () => {
  it("maps known mime types", () => {
    expect(extensionForMime("image/jpeg")).toBe("jpg");
    expect(extensionForMime("image/png")).toBe("png");
    expect(extensionForMime("image/webp")).toBe("webp");
  });
  it("falls back for unknown types", () => {
    expect(extensionForMime("image/gif")).toBe("bin");
  });
});

describe("isSupportedImageType", () => {
  it("accepts jpeg/png/webp", () => {
    expect(isSupportedImageType("image/jpeg")).toBe(true);
    expect(isSupportedImageType("image/png")).toBe(true);
    expect(isSupportedImageType("image/webp")).toBe(true);
  });
  it("rejects other types", () => {
    expect(isSupportedImageType("image/gif")).toBe(false);
    expect(isSupportedImageType("application/pdf")).toBe(false);
  });
});
