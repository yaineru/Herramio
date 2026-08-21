export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  orientation?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

// EXIF/TIFF tag type sizes in bytes, indexed by type id (1-12 per the TIFF 6.0 spec).
const TYPE_SIZES: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  6: 1, // SBYTE
  7: 1, // UNDEFINED
  8: 2, // SSHORT
  9: 4, // SLONG
  10: 8, // SRATIONAL
  11: 4, // FLOAT
  12: 8, // DOUBLE
};

type IfdValue = string | number | number[];

function readIfd(view: DataView, tiffStart: number, ifdOffset: number, little: boolean): Map<number, IfdValue> {
  const map = new Map<number, IfdValue>();
  if (ifdOffset + 2 > view.byteLength) return map;

  const entryCount = view.getUint16(ifdOffset, little);
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, little);
    const type = view.getUint16(entryOffset + 2, little);
    const numValues = view.getUint32(entryOffset + 4, little);
    const typeSize = TYPE_SIZES[type];
    if (!typeSize) continue;

    const totalSize = typeSize * numValues;
    const inlineOffset = entryOffset + 8;
    const dataOffset = totalSize <= 4 ? inlineOffset : tiffStart + view.getUint32(inlineOffset, little);
    if (dataOffset + totalSize > view.byteLength) continue;

    if (type === 2) {
      let str = "";
      for (let j = 0; j < Math.max(0, numValues - 1); j++) str += String.fromCharCode(view.getUint8(dataOffset + j));
      map.set(tag, str);
    } else if (type === 3) {
      map.set(tag, view.getUint16(dataOffset, little));
    } else if (type === 4) {
      map.set(tag, view.getUint32(dataOffset, little));
    } else if (type === 5 || type === 10) {
      const values: number[] = [];
      for (let j = 0; j < numValues; j++) {
        const num = view.getUint32(dataOffset + j * 8, little);
        const den = view.getUint32(dataOffset + j * 8 + 4, little);
        values.push(den !== 0 ? num / den : 0);
      }
      map.set(tag, values);
    }
  }
  return map;
}

function dmsToDecimal(dms: IfdValue | undefined, ref: IfdValue | undefined): number | undefined {
  if (!Array.isArray(dms) || dms.length !== 3 || typeof ref !== "string") return undefined;
  const [deg, min, sec] = dms;
  let decimal = deg + min / 60 + sec / 3600;
  if (ref === "S" || ref === "W") decimal = -decimal;
  return Math.round(decimal * 1e6) / 1e6;
}

function parseTiff(view: DataView, tiffStart: number): ExifData | null {
  if (tiffStart + 8 > view.byteLength) return null;
  const byteOrderMark = view.getUint16(tiffStart);
  const little = byteOrderMark === 0x4949; // "II"
  if (!little && byteOrderMark !== 0x4d4d) return null; // not "II" or "MM"

  const magic = view.getUint16(tiffStart + 2, little);
  if (magic !== 42) return null;

  const ifd0Offset = view.getUint32(tiffStart + 4, little);
  const ifd0 = readIfd(view, tiffStart, tiffStart + ifd0Offset, little);

  const result: ExifData = {};
  const make = ifd0.get(0x010f);
  if (typeof make === "string" && make.trim()) result.make = make.trim();
  const model = ifd0.get(0x0110);
  if (typeof model === "string" && model.trim()) result.model = model.trim();
  const dateTime = ifd0.get(0x0132);
  if (typeof dateTime === "string" && dateTime.trim()) result.dateTime = dateTime.trim();
  const orientation = ifd0.get(0x0112);
  if (typeof orientation === "number") result.orientation = orientation;

  const gpsPointer = ifd0.get(0x8825);
  if (typeof gpsPointer === "number") {
    const gpsIfd = readIfd(view, tiffStart, tiffStart + gpsPointer, little);
    const lat = dmsToDecimal(gpsIfd.get(0x0002), gpsIfd.get(0x0001));
    const lon = dmsToDecimal(gpsIfd.get(0x0004), gpsIfd.get(0x0003));
    if (lat !== undefined) result.gpsLatitude = lat;
    if (lon !== undefined) result.gpsLongitude = lon;
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Reads the EXIF metadata embedded in a JPEG file's APP1 segment (camera
 * make/model, capture date, orientation, GPS coordinates when present).
 * Returns null for JPEGs with no EXIF segment, or for non-JPEG files.
 * This only reads bytes — nothing here ever leaves the browser.
 */
export function parseJpegExif(buffer: ArrayBuffer): ExifData | null {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null; // not a JPEG (SOI marker)

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) break;
    if (marker === 0xffd8) {
      offset += 2;
      continue;
    }
    if (marker === 0xffd9 || marker === 0xffda) break; // end of image / start of scan — no more metadata segments follow

    const segmentLength = view.getUint16(offset + 2);
    if (marker === 0xffe1 && offset + 10 <= view.byteLength) {
      const h = offset + 4;
      const isExif =
        view.getUint8(h) === 0x45 &&
        view.getUint8(h + 1) === 0x78 &&
        view.getUint8(h + 2) === 0x69 &&
        view.getUint8(h + 3) === 0x66 &&
        view.getUint8(h + 4) === 0x00 &&
        view.getUint8(h + 5) === 0x00;
      if (isExif) return parseTiff(view, h + 6);
    }
    offset += 2 + segmentLength;
  }
  return null;
}
