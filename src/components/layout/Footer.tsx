import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <BrandMark className="h-4 w-4" />
              </span>
              {SITE.shortName}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500">{SITE.tagline}</p>
          </div>

          <FooterColumn title="Herramientas" links={FOOTER_LINKS.herramientas} />
          <FooterColumn title="Empresa" links={FOOTER_LINKS.empresa} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        {/* slate-500: slate-400 at this size measures 2.63:1 on white, well below WCAG AA. */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} {SITE.name} — Herramientas útiles para tu día a día.</p>
          <p>Diseñado para resolver tareas rápidas sin fricción.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            {/* inline-flex + min-h-6: a footer link list is not running
                prose, so it does not get WCAG 2.2's inline-target
                exemption. At 17px tall these were awkward to tap on a
                320px screen; the padding lifts them past the 24px floor
                without changing how the list looks. */}
            <Link
              href={link.href}
              className="inline-flex min-h-6 items-center py-0.5 text-sm text-slate-500 hover:text-slate-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
