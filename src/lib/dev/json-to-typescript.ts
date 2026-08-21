type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Light heuristic singularization for array item interface names ("items" → "item", "categories" → "category"). Not a full English pluralization engine — just the common regular cases. */
function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.slice(0, -3) + "y";
  if (/(ses|xes|ches|shes)$/i.test(name)) return name.slice(0, -2);
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.slice(0, -1);
  return name;
}

function toPascalCase(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (cleaned === "") return "Item";
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function isPlainObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Merges the shape of every element in an array of objects into one interface — fields present in only some elements become optional. */
function mergeObjectShapes(items: { [key: string]: JsonValue }[]): { [key: string]: JsonValue } {
  const keys = new Set<string>();
  items.forEach((item) => Object.keys(item).forEach((k) => keys.add(k)));
  const merged: { [key: string]: JsonValue } = {};
  for (const key of keys) {
    const first = items.find((item) => key in item);
    if (first) merged[key] = first[key];
  }
  return merged;
}

interface GenerateContext {
  interfaces: string[];
  usedNames: Set<string>;
}

function uniqueName(base: string, ctx: GenerateContext): string {
  let name = base;
  let i = 2;
  while (ctx.usedNames.has(name)) {
    name = `${base}${i}`;
    i++;
  }
  ctx.usedNames.add(name);
  return name;
}

function typeForValue(value: JsonValue, nameHint: string, ctx: GenerateContext): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const objectItems = value.filter(isPlainObject);
    if (objectItems.length === value.length) {
      const merged = mergeObjectShapes(objectItems);
      return `${typeForValue(merged, singularize(nameHint), ctx)}[]`;
    }
    const elementTypes = Array.from(new Set(value.map((v) => typeForValue(v, nameHint, ctx))));
    return elementTypes.length === 1 ? `${elementTypes[0]}[]` : `(${elementTypes.join(" | ")})[]`;
  }
  if (isPlainObject(value)) {
    return generateInterface(value, nameHint, ctx);
  }
  return typeof value;
}

function generateInterface(obj: { [key: string]: JsonValue }, nameHint: string, ctx: GenerateContext): string {
  const name = uniqueName(toPascalCase(nameHint), ctx);
  const keys = Object.keys(obj);
  const isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
  const fields = keys.map((key) => {
    const fieldType = typeForValue(obj[key], key, ctx);
    const optional = obj[key] === undefined;
    const propertyName = isValidIdentifier.test(key) ? key : JSON.stringify(key);
    return `  ${propertyName}${optional ? "?" : ""}: ${fieldType};`;
  });
  ctx.interfaces.push(`interface ${name} {\n${fields.join("\n")}\n}`);
  return name;
}

/** Converts a parsed JSON value into TypeScript interface declarations, inferring nested object/array shapes. Root name defaults to "Root". */
export function jsonToTypeScript(value: JsonValue, rootName = "Root"): string {
  const ctx: GenerateContext = { interfaces: [], usedNames: new Set() };
  if (isPlainObject(value)) {
    generateInterface(value, rootName, ctx);
  } else if (Array.isArray(value)) {
    const objectItems = value.filter(isPlainObject);
    if (objectItems.length === value.length && value.length > 0) {
      const merged = mergeObjectShapes(objectItems);
      generateInterface(merged, rootName, ctx);
    } else {
      return `type ${toPascalCase(rootName)} = ${typeForValue(value, rootName, ctx)};`;
    }
  } else {
    return `type ${toPascalCase(rootName)} = ${typeof value};`;
  }
  return ctx.interfaces.join("\n\n");
}
