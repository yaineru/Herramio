import type { ContentBlock } from "@/lib/blog/types";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map((block, i) => renderBlock(block, i))}</>;
}

function renderBlock(block: ContentBlock, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="mt-8 text-xl font-bold text-slate-900">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mt-6 text-lg font-semibold text-slate-900">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol key={i} className="mt-4 space-y-4">
          {block.items.map((item, idx) => (
            <li key={item.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                {idx + 1}
              </span>
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    default:
      return (
        <p key={i} className="mt-3 leading-relaxed text-slate-600">
          {block.text}
        </p>
      );
  }
}
