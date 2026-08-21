import { describe, it, expect } from "vitest";
import { parseJpegExif } from "@/lib/images/exif";

interface IfdEntrySpec {
  tag: number;
  type: 2 | 3 | 4 | 5; // ASCII | SHORT | LONG | RATIONAL
  value: string | number | [number, number][]; // rationals as [num, den] pairs
}

/** Builds a minimal little-endian TIFF IFD (+ its overflow data area) starting at `base` within `buf`, returns the byte length consumed. */
function writeIfd(buf: DataView, base: number, tiffStart: number, entries: IfdEntrySpec[], nextIfdOffset = 0): number {
  buf.setUint16(base, entries.length, true);
  let overflowCursor = base + 2 + entries.length * 12 + 4;
  const overflowStart = overflowCursor;

  entries.forEach((entry, i) => {
    const entryOffset = base + 2 + i * 12;
    buf.setUint16(entryOffset, entry.tag, true);
    buf.setUint16(entryOffset + 2, entry.type, true);

    if (entry.type === 2) {
      const str = entry.value as string;
      const bytes = str + "\0";
      buf.setUint32(entryOffset + 4, bytes.length, true);
      if (bytes.length <= 4) {
        for (let j = 0; j < bytes.length; j++) buf.setUint8(entryOffset + 8 + j, bytes.charCodeAt(j));
      } else {
        buf.setUint32(entryOffset + 8, overflowCursor - tiffStart, true);
        for (let j = 0; j < bytes.length; j++) buf.setUint8(overflowCursor + j, bytes.charCodeAt(j));
        overflowCursor += bytes.length;
      }
    } else if (entry.type === 3) {
      buf.setUint32(entryOffset + 4, 1, true);
      buf.setUint16(entryOffset + 8, entry.value as number, true);
    } else if (entry.type === 4) {
      buf.setUint32(entryOffset + 4, 1, true);
      buf.setUint32(entryOffset + 8, entry.value as number, true);
    } else if (entry.type === 5) {
      const rationals = entry.value as [number, number][];
      buf.setUint32(entryOffset + 4, rationals.length, true);
      buf.setUint32(entryOffset + 8, overflowCursor - tiffStart, true);
      rationals.forEach(([num, den], j) => {
        buf.setUint32(overflowCursor + j * 8, num, true);
        buf.setUint32(overflowCursor + j * 8 + 4, den, true);
      });
      overflowCursor += rationals.length * 8;
    }
  });

  buf.setUint32(base + 2 + entries.length * 12, nextIfdOffset, true);
  return overflowCursor - overflowStart + (overflowStart - base);
}

/** Builds a real JPEG byte buffer (SOI + APP1/Exif + EOI) with an IFD0 and optional GPS IFD. */
function buildTestJpeg(ifd0Entries: IfdEntrySpec[], gpsEntries?: IfdEntrySpec[]): ArrayBuffer {
  const size = 2048;
  const buf = new ArrayBuffer(size);
  const view = new DataView(buf);

  const tiffStart = 10; // right after SOI(2) + APP1 marker(2) + length(2) + "Exif\0\0"(6) - 2... computed below precisely
  view.setUint16(0, 0xffd8); // SOI

  const app1Start = 2;
  view.setUint16(app1Start, 0xffe1); // APP1 marker
  // length field written after we know the segment size

  const exifHeaderStart = app1Start + 4;
  const exifTag = "Exif\0\0";
  for (let i = 0; i < exifTag.length; i++) view.setUint8(exifHeaderStart + i, exifTag.charCodeAt(i));

  const tiffHeaderStart = exifHeaderStart + 6;
  view.setUint16(tiffHeaderStart, 0x4949, true); // "II" little-endian
  view.setUint16(tiffHeaderStart + 2, 42, true);
  view.setUint32(tiffHeaderStart + 4, 8, true); // IFD0 starts 8 bytes into the TIFF header

  const ifd0Base = tiffHeaderStart + 8;
  const entries = [...ifd0Entries];
  let gpsIfdBase = 0;
  if (gpsEntries) {
    // Reserve the GPS pointer tag; its value (offset) is patched in after we know where the GPS IFD lands.
    entries.push({ tag: 0x8825, type: 4, value: 0 });
  }

  const ifd0Size = writeIfd(view, ifd0Base, tiffHeaderStart, entries);
  let cursor = ifd0Base + ifd0Size;

  if (gpsEntries) {
    gpsIfdBase = cursor;
    const gpsSize = writeIfd(view, gpsIfdBase, tiffHeaderStart, gpsEntries);
    cursor = gpsIfdBase + gpsSize;
    // Patch the GPS pointer entry (last entry in ifd0) with the real offset.
    const gpsEntryIndex = entries.length - 1;
    const gpsEntryOffset = ifd0Base + 2 + gpsEntryIndex * 12;
    view.setUint32(gpsEntryOffset + 8, gpsIfdBase - tiffHeaderStart, true);
  }

  const segmentEnd = cursor;
  const segmentLength = segmentEnd - app1Start - 2; // length field excludes the marker itself, includes itself
  view.setUint16(app1Start + 2, segmentLength);

  view.setUint16(segmentEnd, 0xffd9); // EOI
  void tiffStart;

  return buf.slice(0, segmentEnd + 2);
}

describe("parseJpegExif", () => {
  it("returns null for a non-JPEG buffer", () => {
    const buf = new ArrayBuffer(10);
    expect(parseJpegExif(buf)).toBeNull();
  });

  it("returns null for a JPEG with no EXIF segment", () => {
    const buf = new ArrayBuffer(10);
    new DataView(buf).setUint16(0, 0xffd8);
    new DataView(buf).setUint16(2, 0xffd9);
    expect(parseJpegExif(buf)).toBeNull();
  });

  it("reads make, model, orientation and datetime from IFD0", () => {
    const jpeg = buildTestJpeg([
      { tag: 0x010f, type: 2, value: "TestCam" },
      { tag: 0x0110, type: 2, value: "Model X" },
      { tag: 0x0112, type: 3, value: 6 },
      { tag: 0x0132, type: 2, value: "2024:05:01 12:00:00" },
    ]);
    const result = parseJpegExif(jpeg);
    expect(result).not.toBeNull();
    expect(result?.make).toBe("TestCam");
    expect(result?.model).toBe("Model X");
    expect(result?.orientation).toBe(6);
    expect(result?.dateTime).toBe("2024:05:01 12:00:00");
  });

  it("reads GPS coordinates and converts them to decimal degrees", () => {
    const jpeg = buildTestJpeg(
      [{ tag: 0x010f, type: 2, value: "GeoCam" }],
      [
        { tag: 0x0001, type: 2, value: "N" },
        { tag: 0x0002, type: 5, value: [[40, 1], [26, 1], [46, 1]] }, // 40°26'46"N
        { tag: 0x0003, type: 2, value: "W" },
        { tag: 0x0004, type: 5, value: [[79, 1], [58, 1], [56, 1]] }, // 79°58'56"W
      ],
    );
    const result = parseJpegExif(jpeg);
    expect(result?.gpsLatitude).toBeCloseTo(40.446111, 4);
    expect(result?.gpsLongitude).toBeCloseTo(-79.982222, 4);
  });

  it("returns null when the image has no recognizable metadata at all", () => {
    const jpeg = buildTestJpeg([]);
    expect(parseJpegExif(jpeg)).toBeNull();
  });
});
