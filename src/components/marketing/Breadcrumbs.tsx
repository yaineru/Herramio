import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ href: "/", label: "Inicio" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE.url}${item.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {all.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
          {i === all.length - 1 ? (
            <span className="font-medium text-slate-700">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-slate-700">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
