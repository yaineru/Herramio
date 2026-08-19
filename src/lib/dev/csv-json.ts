export type CsvJsonResult = { ok: true; value: string } | { ok: false; error: string };

/** RFC 4180-ish CSV parser: handles quoted fields with embedded commas, newlines, and "" escaped quotes. */
function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < csv.length) {
    const char = csv[i];

    if (inQuotes) {
      if (char === '"') {
        if (csv[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\r") {
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  row.push(field);
  rows.push(row);

  // Drop a single trailing empty row caused by a trailing newline.
  if (rows.length > 1 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }
  return rows;
}

export function csvToJson(csv: string): CsvJsonResult {
  const trimmed = csv.trim();
  if (!trimmed) return { ok: false, error: "Pega un CSV para convertir." };

  try {
    const rows = parseCsvRows(csv.trim());
    if (rows.length < 1) return { ok: false, error: "El CSV está vacío." };

    const [headers, ...dataRows] = rows;
    const objects = dataRows.map((cells) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = cells[i] ?? "";
      });
      return obj;
    });

    return { ok: true, value: JSON.stringify(objects, null, 2) };
  } catch {
    return { ok: false, error: "No se pudo interpretar el CSV." };
  }
}

function csvEscapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function jsonToCsv(json: string): CsvJsonResult {
  const trimmed = json.trim();
  if (!trimmed) return { ok: false, error: "Pega un JSON para convertir." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "JSON inválido." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { ok: false, error: "El JSON debe ser un array de objetos, no vacío." };
  }
  if (!parsed.every((item) => typeof item === "object" && item !== null && !Array.isArray(item))) {
    return { ok: false, error: "Cada elemento del array debe ser un objeto." };
  }

  const objects = parsed as Record<string, unknown>[];
  const headers = Array.from(new Set(objects.flatMap((obj) => Object.keys(obj))));

  const lines = [
    headers.map(csvEscapeField).join(","),
    ...objects.map((obj) => headers.map((h) => csvEscapeField(obj[h] === undefined || obj[h] === null ? "" : String(obj[h]))).join(",")),
  ];

  return { ok: true, value: lines.join("\n") };
}
