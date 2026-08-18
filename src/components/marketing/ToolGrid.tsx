import { TOOLS, type Tool } from "@/lib/tools/registry";
import type { CategoryId } from "@/lib/tools/categories";
import { ToolCard } from "@/components/marketing/ToolCard";

interface ToolGridProps {
  tools?: Tool[];
  category?: CategoryId;
}

export function ToolGrid({ tools, category }: ToolGridProps) {
  const list = tools ?? (category ? TOOLS.filter((t) => t.category === category) : TOOLS);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
