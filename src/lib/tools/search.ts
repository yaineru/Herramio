import { CATEGORIES, type Category } from "@/lib/tools/categories";
import { TOOLS, type Tool } from "@/lib/tools/registry";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Matches by name, description, keywords, and category name/id. */
export function searchTools(query: string, tools: Tool[] = TOOLS): Tool[] {
  const q = normalize(query.trim());
  if (!q) return [];

  return tools.filter((tool) => {
    const haystack = [
      tool.name,
      tool.shortName,
      tool.description,
      tool.category,
      ...tool.keywords,
    ]
      .map(normalize)
      .join(" ");
    return haystack.includes(q);
  });
}

/**
 * When a search matches a coming-soon category (e.g. "pdf") but no tool
 * exists yet, surface that category instead of a flat "not found" — it's
 * more honest about where the product is headed than pretending nothing
 * was typed.
 */
export function findMatchingComingSoonCategory(query: string): Category | undefined {
  const q = normalize(query.trim());
  if (!q) return undefined;
  return CATEGORIES.find(
    (category) => category.status === "coming-soon" && normalize(category.name).includes(q),
  );
}
