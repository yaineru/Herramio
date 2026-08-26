"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, Star, User, X } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { BrandMark } from "@/components/BrandMark";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { openSearchPalette } from "@/lib/search-events";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { NavAuthState } from "@/lib/auth/nav-state";
import { AccountMenu } from "@/components/layout/AccountMenu";

const SCROLL_THRESHOLD = 8;

export function Navbar({ authState }: { authState: NavAuthState }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function handleScroll() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setScrolled(window.scrollY > SCROLL_THRESHOLD);
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white/85 backdrop-blur transition-[border-color,box-shadow] duration-200",
        scrolled ? "border-slate-200 shadow-sm shadow-slate-900/[0.03]" : "border-slate-200/80",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[height] duration-200 sm:px-6",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <BrandMark className="h-4 w-4" />
          </span>
          {SITE.shortName}
        </Link>

        {/* xl, not lg: measured at 1024px the logo + links + search +
            auth buttons need 1160px, so switching the desktop bar on at
            lg (1024) made every page scroll sideways. xl (1280) is the
            first width where the full bar fits. */}
        <nav className="hidden items-center gap-1 xl:flex">
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

        <div className="ml-auto hidden items-center gap-2 xl:flex">
          <SearchTrigger className="w-56" />
          <Link
            href="/favoritos"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Favoritos y recientes"
          >
            <Star className="h-5 w-5" />
          </Link>
          <MagneticButton>
            <Link href="/generador-qr" onClick={() => AnalyticsEvents.ctaClicked("navbar_generador_qr")}>
              <Button size="sm">Generador QR</Button>
            </Link>
          </MagneticButton>
          {authState.isAuthenticated ? (
            <AccountMenu authState={authState} />
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/iniciar-sesion"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Iniciar sesión
              </Link>
              <Link href="/registro">
                <Button size="sm" variant="outline">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/favoritos"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 xl:hidden"
          aria-label="Favoritos y recientes"
        >
          <Star className="h-5 w-5" />
        </Link>

        <button
          type="button"
          onClick={() => openSearchPalette()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 xl:hidden"
          aria-label="Buscar herramientas"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 xl:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 xl:hidden">
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
            <Link
              href="/generador-qr"
              onClick={() => {
                setOpen(false);
                AnalyticsEvents.ctaClicked("navbar_mobile_generador_qr");
              }}
              className="mt-2"
            >
              <Button className="w-full" size="sm">
                Generador QR
              </Button>
            </Link>
            <div className="mt-2 border-t border-slate-200 pt-2">
              {authState.isAuthenticated ? (
                <Link
                  href="/cuenta"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4 w-4" />
                  Mi cuenta
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {authState.planLabel}
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/iniciar-sesion"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-600 hover:bg-slate-100"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
