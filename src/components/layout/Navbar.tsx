"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/BrandMark";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { openSearchPalette } from "@/lib/search-events";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <BrandMark className="h-4 w-4" />
          </span>
          {SITE.shortName}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <SearchTrigger className="w-56" />
          <Link href="/generador-qr">
            <Button size="sm">Generador QR</Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => openSearchPalette()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Buscar herramientas"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/generador-qr" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full" size="sm">
                Generador QR
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
